import {API as APITypes} from '@makeflow/types';
import Koa from 'koa';
import _ from 'lodash';
import {
  compare,
  intersects,
  lt,
  minVersion,
  satisfies,
  validRange,
} from 'semver';
import {Constructor} from 'tslang';

import {API} from './api';
import {
  IDBAdapter,
  INetAdapter,
  IStorageObject,
  Installation,
  InstallationEvent,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  MongoAdapter,
  MongoOptions,
  NetAdapterOptions,
  PermissionEvent,
  PowerAppVersion,
  PowerCustomCheckableItem,
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
  PowerGlance,
  PowerGlanceEvent,
  PowerGlanceEventParams,
  PowerItem,
  PowerItemEvent,
  PowerItemEventParams,
  getActionStorage,
} from './core';

export interface PowerAppOptions {
  source?: Partial<APITypes.PowerApp.Source>;
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

interface PowerAppVersionInfo {
  range: string;
  definition: PowerAppVersion.Definition;
}

export class PowerApp {
  private definitions: PowerAppVersionInfo[] = [];

  private netAdapter!: INetAdapter;
  private dbAdapter!: IDBAdapter;

  private api!: API;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  version(range: string, definition: PowerAppVersion.Definition): void {
    if (!validRange(range)) {
      throw Error('版本范围格式错误');
    }

    this.definitions.push({
      range,
      definition,
    });
  }

  serve(options?: NetAdapterOptions): void {
    this.start(options);
  }

  koa(options?: NetAdapterOptions): void {
    this.start(options, KoaAdapter);
  }

  koaWith(koa: Koa, options?: NetAdapterOptions): void {
    this.start(options, KoaAdapter, koa);
  }

  express(options?: NetAdapterOptions): void {
    this.start(options);
  }

  hapi(options?: NetAdapterOptions): void {
    this.start(options);
  }

  private initialize(): void {
    let {db, source} = this.options;

    this.api = new API(source);

    switch (db?.type) {
      case 'mongo':
        this.dbAdapter = new MongoAdapter(db.options);
        break;
      case 'lowdb':
        this.dbAdapter = new LowdbAdapter(db.options);
        break;
      default:
        this.dbAdapter = new LowdbAdapter({});
        break;
    }
  }

  private start(
    options: NetAdapterOptions = {},
    Adapter: Constructor<INetAdapter> = KoaAdapter,
    app?: Koa,
  ): void {
    if (!this.checkVersionsQualified()) {
      return;
    }

    this.netAdapter = new Adapter(this.options.source?.token, options, app);

    this.netAdapter
      .on('installation', this.handleInstallation)
      .on('permission', this.handlePermission)
      .on('power-item', this.handlePowerItemChange)
      .on('power-glance', this.handlePowerGlanceChange)
      .on(
        'power-custom-checkable-item',
        this.handlePowerCustomCheckableItemChange,
      )
      .serve();
  }

  private checkVersionsQualified(): boolean {
    try {
      let definitions = _.clone(this.definitions);

      let intersectionDefinitions = _.intersectionWith(
        definitions,
        definitions,
        ({range: ra}, {range: rb}) => !_.isEqual(ra, rb) && intersects(ra, rb),
      );

      if (intersectionDefinitions.length) {
        throw Error('版本定义有交集');
      }

      this.definitions = definitions.sort(({range: ra}, {range: rb}) =>
        compare(minVersion(ra)!, minVersion(rb)!),
      );
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
  }

  private handleInstallation = async (
    event: InstallationEvent['eventObject'],
    response: InstallationEvent['response'],
  ): Promise<void> => {
    let responseData = {};

    let {payload, type} = event;

    let installationStorage = await this.dbAdapter.getStorage<Installation>({
      type: 'installation',
      installation: payload.installation,
    });

    let prevConfigs = installationStorage.get('configs');
    let nextConfigs = 'configs' in payload ? payload.configs : {};

    switch (event.type) {
      case 'activate':
      case 'update': {
        if (installationStorage.created) {
          installationStorage.merge(event.payload);
        } else {
          installationStorage.create({
            type: 'installation',
            ...event.payload,
          });
        }

        responseData = {
          granted: !!installationStorage.get('accessToken'),
        };

        break;
      }
    }

    await this.dbAdapter.setStorage(installationStorage);

    // TODO (boen): version where come from
    let version = (payload as any).version ?? '0.1.0';

    let result = getChangeAndMigrations<PowerAppVersion.Installation.Change>(
      version,
      undefined,
      this.definitions,
      getInstallationChange({type}),
    );

    if (result?.change) {
      this.api.setSource(payload.source);
      this.api.setAccessToken(installationStorage.get('accessToken'));

      await result.change({
        api: this.api,
        prevConfigs,
        nextConfigs,
      });
    }

    response(responseData);
  };

  private handlePermission = async (
    event: PermissionEvent['eventObject'],
    response: PermissionEvent['response'],
  ): Promise<void> => {
    let responseData = {};

    let installationStorage = await this.dbAdapter.getStorage<Installation>({
      type: 'installation',
      ...event.payload,
    });

    if (!installationStorage.created) {
      response(responseData);
      return;
    }

    switch (event.type) {
      case 'grant': {
        let accessToken = event.payload.accessToken;

        installationStorage.set('accessToken', accessToken);
        this.api.setAccessToken(accessToken);
        break;
      }
      case 'revoke':
        installationStorage.set('accessToken', undefined);
        this.api.setAccessToken(undefined);
        break;
    }

    await this.dbAdapter.setStorage(installationStorage);

    response(responseData);
  };

  private handlePowerItemChange = async (
    event: PowerItemEvent['eventObject'],
    response: PowerItemEvent['response'],
  ): Promise<void> => {
    let {params, payload} = event;

    let {token, source} = payload;

    let storage = await this.dbAdapter.getStorage<PowerItem>({
      type: 'power-item',
      token,
    });

    // TODO (boen): version where come from
    let version = (payload as any).version ?? '0.1.0';

    let result = getChangeAndMigrations<PowerAppVersion.PowerItem.Change>(
      version,
      storage.version,
      this.definitions,
      getPowerItemChange(params),
      getMigrations(params),
    );

    if (!result) {
      return;
    }

    let {change, migrations} = result;

    let actionStorage = getActionStorage(storage, this.dbAdapter);

    if (storage.created) {
      for (let migration of migrations) {
        await migration(actionStorage);
      }
    } else {
      storage.create({
        type: 'power-item',
        token: payload.token,
        version,
        storage: {},
      });
    }

    let responseData: PowerAppVersion.PowerItem.ChangeResponseData | void;

    if (change) {
      let inputs = 'inputs' in payload ? payload.inputs : {};
      let configs = 'configs' in payload ? payload.configs : {};

      this.api.setSource(source);
      this.api.setResourceToken(token);

      responseData = await change({
        storage: actionStorage,
        api: this.api,
        inputs,
        configs,
      });
    }

    storage.setVersion(version);

    await this.dbAdapter.setStorage(storage);

    response(responseData || {});
  };

  private handlePowerGlanceChange = async (
    event: PowerGlanceEvent['eventObject'],
    response: PowerGlanceEvent['response'],
  ): Promise<void> => {
    let {params, payload} = event;

    let {
      token,
      clock,
      source,
      resources = [],
      configs = {},
    } = payload as APITypes.PowerGlance.UpdateHookParams;

    let storage = await this.dbAdapter.getStorage<PowerGlance>({
      type: 'power-glance',
      token,
    });

    // TODO (boen): version where come from
    let version = (payload as any).version ?? '0.1.0';

    let result = getChangeAndMigrations<PowerAppVersion.PowerGlance.Change>(
      version,
      storage.version,
      this.definitions,
      getPowerGlanceChange(params),
      getMigrations(params),
    );

    if (!result) {
      return;
    }

    let {change, migrations} = result;

    let actionStorage = getActionStorage(storage, this.dbAdapter);

    this.api.setSource(source);
    this.api.setResourceToken(token);

    if (storage.created) {
      if (params.type === 'change') {
        let prevClock = Number(storage.clock);

        if (prevClock + 1 !== clock) {
          //  reinitialize
          try {
            let result = await this.api.initializePowerGlance();

            clock = result.clock;
            resources = result.resources;
            configs = result.configs;
          } catch (error) {
            response({});
            return;
          }
        }

        storage.setClock(clock);
      }

      for (let migration of migrations) {
        await migration(actionStorage);
      }
    } else {
      storage.create({
        type: 'power-glance',
        token: payload.token,
        clock,
        version,
        disposed: undefined,
        storage: {},
      });
    }

    let responseData: PowerAppVersion.PowerGlance.ChangeResponseData | void;

    if (change) {
      responseData = await change({
        storage: actionStorage,
        api: this.api,
        resources,
        configs,
      });
    }

    storage.setDisposed(params.type === 'dispose');
    storage.setVersion(version);

    await this.dbAdapter.setStorage(storage);

    response(responseData || {});
  };

  private handlePowerCustomCheckableItemChange = async (
    event: PowerCustomCheckableItemEvent['eventObject'],
    response: PowerCustomCheckableItemEvent['response'],
  ): Promise<void> => {
    let {params, payload} = event;

    let {token, source} = payload;

    let storage = await this.dbAdapter.getStorage<PowerCustomCheckableItem>({
      type: 'power-custom-checkable-item',
      token,
    });

    // TODO (boen): version where come from
    let version = (payload as any).version ?? '0.1.0';

    let result = getChangeAndMigrations<
      PowerAppVersion.PowerCustomCheckableItem.Change
    >(
      version,
      storage.version,
      this.definitions,
      getPowerCustomCheckableItemChange(params),
      getMigrations(params),
    );

    if (!result) {
      return;
    }

    let {change, migrations} = result;

    let actionStorage = getActionStorage(storage, this.dbAdapter);

    if (storage.created) {
      for (let migration of migrations) {
        await migration(actionStorage);
      }
    } else {
      storage.create({
        type: 'power-custom-checkable-item',
        token: payload.token,
        version,
        storage: {},
      });
    }

    let responseData: PowerAppVersion.PowerCustomCheckableItem.ChangeResponseData | void;

    if (change) {
      let {inputs, context, configs = {}} = payload;

      this.api.setSource(source);
      this.api.setResourceToken(token);

      responseData = await change({
        storage: actionStorage,
        api: this.api,
        context,
        inputs,
        configs,
      });
    }

    storage.setVersion(version);

    await this.dbAdapter.setStorage(storage);

    response(responseData || {});
  };
}

function matchVersionInfoIndex(
  version: string,
  infos: PowerAppVersionInfo[],
  initialIndex = infos.length - 1,
): number {
  for (let index = initialIndex; index >= 0; index--) {
    let {range} = infos[index];

    if (satisfies(version, range)) {
      return index;
    }
  }

  throw Error('没有匹配的版本');
}

function getInstallationChange({
  type,
}: Pick<InstallationEvent['eventObject'], 'type'>): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change | undefined {
  return ({installation}) => installation?.[type];
}

function getPowerItemChange({
  name,
  type,
  action,
}: PowerItemEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerItem.Change | undefined {
  return ({contributions: {powerItems = {}}}) => {
    let powerItem = powerItems[name];

    if (!powerItem) {
      return undefined;
    }

    return type === 'action' ? powerItem.action?.[action!] : powerItem[type];
  };
}

function getPowerGlanceChange({
  name,
  type,
}: PowerGlanceEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerGlance.Change | undefined {
  return ({contributions: {powerGlances = {}}}) => {
    let powerGlance = powerGlances[name];

    if (!powerGlance) {
      return undefined;
    }

    return powerGlance[type];
  };
}

function getPowerCustomCheckableItemChange({
  name,
}: PowerCustomCheckableItemEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerCustomCheckableItem.Change | undefined {
  return ({contributions: {powerCustomCheckableItems = {}}}) => {
    let checkableItem = powerCustomCheckableItems[name];

    if (!checkableItem) {
      return undefined;
    }

    return typeof checkableItem === 'function'
      ? checkableItem
      : checkableItem['processor'];
  };
}

function getMigrations({
  name,
}:
  | PowerItemEventParams
  | PowerGlanceEventParams
  | PowerCustomCheckableItemEventParams): (
  type: keyof PowerAppVersion.Migrations<IStorageObject>,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction<IStorageObject>[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions.powerItems?.[name]?.migrations?.[type],
      ),
    );
}

function getChangeAndMigrations<TChange extends PowerAppVersion.Changes>(
  comingVersion: string | undefined,
  savedVersion: string | undefined,
  infos: PowerAppVersionInfo[],
  getChange: (definition: PowerAppVersion.Definition) => TChange | undefined,
  getMigrations?: (
    type: keyof PowerAppVersion.Migrations<IStorageObject>,
    definitions: PowerAppVersion.Definition[],
  ) => PowerAppVersion.MigrationFunction<IStorageObject>[],
):
  | {
      change: TChange | undefined;
      migrations: PowerAppVersion.MigrationFunction<IStorageObject>[];
    }
  | undefined {
  if (!comingVersion) {
    return undefined;
  }

  let index = matchVersionInfoIndex(comingVersion, infos);

  let {range, definition} = infos[index];

  let change = getChange(definition);

  if (!savedVersion || !getMigrations || satisfies(savedVersion, range)) {
    return {
      change,
      migrations: [],
    };
  }

  return {
    change,
    migrations: lt(comingVersion, savedVersion)
      ? getMigrations(
          'down',
          _.reverse(
            _.slice(
              infos,
              index + 1,
              matchVersionInfoIndex(savedVersion, infos) + 1,
            ),
          ).map(info => info.definition),
        )
      : getMigrations(
          'up',
          _.slice(
            infos,
            matchVersionInfoIndex(savedVersion, infos, index) + 1,
            index + 1,
          ).map(info => info.definition),
        ),
  };
}
