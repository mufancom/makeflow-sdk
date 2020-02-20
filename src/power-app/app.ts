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
  ActionStorage,
  IDBAdapter,
  INetAdapter,
  InstallationEvent,
  InstallationModel,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  Model,
  MongoAdapter,
  MongoOptions,
  NetAdapterOptions,
  PermissionEvent,
  PowerAppVersion,
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
  PowerCustomCheckableItemModel,
  PowerGlanceEvent,
  PowerGlanceEventParams,
  PowerGlanceModel,
  PowerItemEvent,
  PowerItemEventParams,
  PowerItemModel,
  StorageObject,
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

  api!: API;

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

  async emitChanges<TModel extends Model = Model>(
    type: TModel['type'],
    storage: TModel['storage'],
    change: (params: {
      storage: ActionStorage<TModel>;
      api: API;
    }) => Promise<void>,
  ): Promise<void> {
    let db = this.dbAdapter;
    let api = this.api;

    let storages: StorageObject<TModel>[] = await db.getStorageObjectsByStorage<
      TModel
    >({
      type,
      storage,
    });

    for (let storage of storages) {
      await change({storage: getActionStorage(storage, db), api});
    }
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

    let installationStorage = await this.dbAdapter.getStorage<
      InstallationModel
    >({
      type: 'installation',
      installation: payload.installation,
    });

    let prevConfigs = installationStorage.get('configs');
    let nextConfigs = 'configs' in payload ? payload.configs : {};

    let {
      team,
      configs,
      resources,
      source,
      organization,
      installation,
      // TODO (boen): waiting makeflow app version
      version = '0.1.0',
    } = event.payload as any;

    switch (event.type) {
      case 'activate':
      case 'update': {
        if (installationStorage.created) {
          installationStorage
            .setField('configs', configs)
            .setField('resources', resources);
        } else {
          installationStorage.create({
            type: 'installation',
            team,
            configs,
            resources,
            source,
            organization,
            installation,
            version,
            storage: {},
          });
        }

        responseData = {
          granted: !!installationStorage.get('accessToken'),
        };

        break;
      }
    }

    installationStorage.upgrade(version);

    await this.dbAdapter.setStorage(installationStorage);

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
    let {installation, accessToken} = event.payload;

    let installationStorage = await this.dbAdapter.getStorage<
      InstallationModel
    >({
      type: 'installation',
      installation,
    });

    if (!installationStorage.created) {
      response(responseData);
      return;
    }

    installationStorage.setField('accessToken', accessToken);
    this.api.setAccessToken(accessToken);

    await this.dbAdapter.setStorage(installationStorage);

    response(responseData);
  };

  private handlePowerItemChange = async (
    event: PowerItemEvent['eventObject'],
    response: PowerItemEvent['response'],
  ): Promise<void> => {
    let {params, payload} = event;

    let {
      token,
      source,
      organization,
      installation,
      inputs = {},
      configs = {},
      // TODO (boen): waiting makeflow app version
      version = '0.1.0',
    } = payload as any;

    let storage = await this.dbAdapter.getStorage<PowerItemModel>({
      type: 'power-item',
      token,
    });

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
        source,
        organization,
        installation,
        token,
        version,
        storage: {},
      });
    }

    let responseData: PowerAppVersion.PowerItem.ChangeResponseData | void;

    if (change) {
      this.api.setSource(source);
      this.api.setResourceToken(token);

      responseData = await change({
        storage: actionStorage,
        api: this.api,
        inputs,
        configs,
      });
    }

    storage.upgrade(version);

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
      source,
      organization,
      installation,
      clock,
      resources = [],
      configs = {},
      // TODO (boen): waiting makeflow app version
      version = '0.1.0',
    } = payload as any;

    let storage = await this.dbAdapter.getStorage<PowerGlanceModel>({
      type: 'power-glance',
      token,
    });

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
        let prevClock = Number(storage.getField('clock'));

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

        storage.setField('clock', clock);
      }

      for (let migration of migrations) {
        await migration(actionStorage);
      }
    } else {
      storage.create({
        type: 'power-glance',
        source,
        organization,
        installation,
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

    storage.setField('disposed', params.type === 'dispose');
    storage.upgrade(version);

    await this.dbAdapter.setStorage(storage);

    response(responseData || {});
  };

  private handlePowerCustomCheckableItemChange = async (
    event: PowerCustomCheckableItemEvent['eventObject'],
    response: PowerCustomCheckableItemEvent['response'],
  ): Promise<void> => {
    let {params, payload} = event;

    let {
      token,
      source,
      organization,
      installation,
      inputs = {},
      configs = {},
      context,
      // TODO (boen): waiting makeflow app version
      version = '0.1.0',
    } = payload as any;

    let storage = await this.dbAdapter.getStorage<
      PowerCustomCheckableItemModel
    >({
      type: 'power-custom-checkable-item',
      token,
    });

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
        source,
        organization,
        installation,
        token,
        version,
        storage: {},
      });
    }

    let responseData: PowerAppVersion.PowerCustomCheckableItem.ChangeResponseData | void;

    if (change) {
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

    storage.upgrade(version);

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
  type: keyof PowerAppVersion.Migrations<Model>,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction<Model>[] {
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
    type: keyof PowerAppVersion.Migrations<Model>,
    definitions: PowerAppVersion.Definition[],
  ) => PowerAppVersion.MigrationFunction<Model>[],
):
  | {
      change: TChange | undefined;
      migrations: PowerAppVersion.MigrationFunction<Model>[];
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
