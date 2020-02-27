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
  IServeAdapter,
  InstallationEvent,
  InstallationModel,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  Model,
  MongoAdapter,
  MongoOptions,
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
  ServeOptions,
  StorageObject,
  getActionStorage,
} from './core';

export interface PowerAppOptions {
  source?: Partial<APITypes.PowerApp.Source>;
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

export interface MatchContextsOptions<TModel extends Model = Model> {
  storage: TModel['storage'];
}

export interface MatchContextsResult<TModel extends Model = Model> {
  storage: ActionStorage<TModel>;
  api: API;
}

interface PowerAppVersionInfo {
  range: string;
  definition: PowerAppVersion.Definition;
}

export class PowerApp {
  private definitions: PowerAppVersionInfo[] = [];

  private dbAdapter!: IDBAdapter;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  getAPI(): API {
    return new API(this.options.source);
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

  serve(options?: ServeOptions): void {
    this.buildServeAdapter(KoaAdapter, options).serve();
  }

  koa(): Koa.Middleware {
    return this.buildServeAdapter(KoaAdapter).middleware();
  }

  express(): void {}

  hapi(): void {}

  async *getContextIterable<TModel extends Model>(
    type: TModel['type'],
    {storage}: MatchContextsOptions<TModel>,
  ): AsyncGenerator<MatchContextsResult<TModel>> {
    let db = this.dbAdapter;

    let storages: StorageObject<TModel>[] = await db.getStorageObjectsByStorage<
      TModel
    >({
      type,
      storage,
    });

    for (let storage of storages) {
      let api = await this.generateAPI(storage);
      yield {storage: getActionStorage(storage, db), api};
    }
  }

  async getContexts<TModel extends Model>(
    type: TModel['type'],
    options: MatchContextsOptions<TModel>,
  ): Promise<MatchContextsResult<TModel>[]> {
    let contexts = [];

    for await (let context of this.getContextIterable(type, options)) {
      contexts.push(context);
    }

    return contexts;
  }

  private initialize(): void {
    let {db} = this.options;

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

  private buildServeAdapter(
    Adapter: Constructor<IServeAdapter>,
    options?: ServeOptions,
  ): IServeAdapter {
    this.checkVersionsQualified();

    let serveAdapter = new Adapter(this.options.source?.token, options);

    serveAdapter
      .on('installation', this.handleInstallation)
      .on('permission', this.handlePermission)
      .on('power-item', this.handlePowerItemChange)
      .on('power-glance', this.handlePowerGlanceChange)
      .on(
        'power-custom-checkable-item',
        this.handlePowerCustomCheckableItemChange,
      );

    return serveAdapter;
  }

  private checkVersionsQualified(): void {
    let definitions = _.clone(this.definitions);

    if (!definitions.length) {
      throw Error('至少需要一个版本定义');
    }

    let intersectionDefinitions = _.intersectionWith(
      definitions,
      definitions,
      ({range: ra}, {range: rb}) => !_.isEqual(ra, rb) && intersects(ra, rb),
    );

    if (intersectionDefinitions.length) {
      throw Error('版本定义有交集');
    }

    definitions = definitions.sort(({range: ra}, {range: rb}) =>
      compare(minVersion(ra)!, minVersion(rb)!),
    );

    let headInfo = definitions[0];

    if (headInfo.definition.ancestor) {
      warning(`${headInfo.range} 不应该有 ancestor`);
    }

    for (let index = 1; index < definitions.length; index++) {
      let info = definitions[index];

      let ancestor = info.definition.ancestor;

      if (!ancestor) {
        warning(`${info.range} 未指定 ancestor`);
        continue;
      }

      if (ancestor !== definitions[index - 1].range) {
        warning(`${headInfo.range} 的 ancestor 不是前一个版本的版本号`);
      }
    }

    this.definitions = definitions;
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
          granted: !!installationStorage.getField('accessToken'),
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
      let api = await this.generateAPI(installationStorage);

      await result.change({
        api,
        configs,
        storage: getActionStorage(installationStorage, this.dbAdapter),
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
      let api = await this.generateAPI(storage);

      responseData = await change({
        storage: actionStorage,
        api,
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

    let api = await this.generateAPI(storage);

    if (storage.created) {
      if (params.type === 'change') {
        let prevClock = Number(storage.getField('clock'));

        if (prevClock + 1 !== clock) {
          //  reinitialize
          try {
            let result = await api.initializePowerGlance();

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
        api,
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
      let api = await this.generateAPI(storage);

      responseData = await change({
        storage: actionStorage,
        api,
        context,
        inputs,
        configs,
      });
    }

    storage.upgrade(version);

    await this.dbAdapter.setStorage(storage);

    response(responseData || {});
  };

  private async generateAPI(storage: StorageObject<any>): Promise<API> {
    let api = new API(storage.getField('source'));

    switch (storage.type) {
      case 'installation': {
        api.setAccessToken(storage.getField('accessToken'));
        break;
      }
      case 'power-item':
      case 'power-glance':
      case 'power-custom-checkable-item': {
        let storageWithToken = storage;

        let installationStorage = await this.dbAdapter.getStorage<
          InstallationModel
        >({
          type: 'installation',
          installation: storage.getField('installation'),
        });

        api.setResourceToken(storageWithToken.getField('token'));
        api.setAccessToken(installationStorage.getField('accessToken'));

        break;
      }
    }
    return api;
  }
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
  return ({contributions: {powerItems = {}} = {}}) => {
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
  return ({contributions: {powerGlances = {}} = {}}) => {
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
  return ({contributions: {powerCustomCheckableItems = {}} = {}}) => {
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
          definition.contributions?.powerItems?.[name]?.migrations?.[type],
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

function warning(message: string): void {
  console.warn(
    `[\x1b[34m makeflow-sdk \x1b[0m${new Date().toISOString()}]: \x1b[33m ${message} \x1b[0m`,
  );
}
