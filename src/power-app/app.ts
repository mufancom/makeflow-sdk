import Koa from 'koa';
import _ from 'lodash';
import {validRange} from 'semver';
import {Constructor} from 'tslang';

import {API, APISource} from './api';
import {
  ActionStorage,
  IDBAdapter,
  IPowerApp,
  IPowerAppResourceModel,
  IServeAdapter,
  IStorageTypes,
  InstallationEvent,
  InstallationModel,
  KoaAdapter,
  LowdbAdapter,
  Model,
  MongoAdapter,
  PageEvent,
  PermissionEvent,
  PowerAppOptions,
  PowerAppVersion,
  PowerAppVersionInfo,
  PowerCustomCheckableItemEvent,
  PowerGlanceEvent,
  PowerItemEvent,
  PowerNodeEvent,
  ServeOptions,
  StorageObject,
  checkVersionsQualified,
  getActionStorage,
  installationHandler,
  pageHandler,
  permissionHandler,
  powerCustomCheckableItemHandler,
  powerGlanceHandler,
  powerItemHandler,
  powerNodeHandler,
} from './core';

export interface MatchContextsOptions<TModel extends Model = Model> {
  storage: TModel['storage'];
}

export interface MatchContextsResult<TModel extends Model = Model> {
  storage: ActionStorage<TModel>;
  api: API;
}

export class PowerApp implements IPowerApp {
  definitions: PowerAppVersionInfo[] = [];

  dbAdapter!: IDBAdapter;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  getAPI(source?: APISource): API {
    let options = this.options;

    if (!source && !options.source?.url) {
      throw Error('初始化未传递 source 的情况下，`getAPI` 需要传入');
    }

    return new API(source ?? {url: options.source!.url!});
  }

  async generateAPI(storage: StorageObject<any>): Promise<API> {
    let api = new API(storage.source);

    switch (storage.type) {
      case 'installation': {
        api.setAccessToken(storage.getField('accessToken'));
        break;
      }
      case 'power-item':
      case 'power-node':
      case 'power-glance':
      case 'power-custom-checkable-item': {
        let storageWithResourceToken: StorageObject<IPowerAppResourceModel<
          any
        >> = storage;

        let installationStorage = await this.dbAdapter.getStorage<
          InstallationModel
        >({
          type: 'installation',
          installation: storage.getField('installation'),
        });

        api.setResourceToken(
          storageWithResourceToken.getField('resourceToken'),
        );
        api.setAccessToken(installationStorage.getField('accessToken'));

        break;
      }
    }
    return api;
  }

  version<TStorageTypes extends IStorageTypes = IStorageTypes>(
    range: string,
    definition: PowerAppVersion.Definition<TStorageTypes>,
  ): void {
    if (!validRange(range)) {
      throw Error('版本格式错误');
    }

    this.definitions.push({
      range,
      definition,
    });
  }

  serve(options?: ServeOptions): void {
    this.buildServeAdapter(KoaAdapter, options).serve();
  }

  koa(path: ServeOptions['path']): Koa.Middleware {
    return this.buildServeAdapter(KoaAdapter, {path}).middleware();
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
      .on('power-node', this.handlePowerNodeChange)
      .on('power-glance', this.handlePowerGlanceChange)
      .on(
        'power-custom-checkable-item',
        this.handlePowerCustomCheckableItemChange,
      )
      .on('page', this.handlePageChange);

    return serveAdapter;
  }

  private checkVersionsQualified(): void {
    this.definitions = checkVersionsQualified(this.definitions);
  }

  private handleInstallation = async (
    event: InstallationEvent['eventObject'],
    response: InstallationEvent['response'],
  ): Promise<void> => {
    await installationHandler(this, event, response);
  };

  private handlePermission = async (
    event: PermissionEvent['eventObject'],
    response: PermissionEvent['response'],
  ): Promise<void> => {
    await permissionHandler(this, event, response);
  };

  private handlePowerItemChange = async (
    event: PowerItemEvent['eventObject'],
    response: PowerItemEvent['response'],
  ): Promise<void> => {
    await powerItemHandler(this, event, response);
  };

  private handlePowerNodeChange = async (
    event: PowerNodeEvent['eventObject'],
    response: PowerNodeEvent['response'],
  ): Promise<void> => {
    await powerNodeHandler(this, event, response);
  };

  private handlePowerGlanceChange = async (
    event: PowerGlanceEvent['eventObject'],
    response: PowerGlanceEvent['response'],
  ): Promise<void> => {
    await powerGlanceHandler(this, event, response);
  };

  private handlePowerCustomCheckableItemChange = async (
    event: PowerCustomCheckableItemEvent['eventObject'],
    response: PowerCustomCheckableItemEvent['response'],
  ): Promise<void> => {
    await powerCustomCheckableItemHandler(this, event, response);
  };

  private handlePageChange = async (
    event: PageEvent['eventObject'],
    response: PageEvent['response'],
  ): Promise<void> => {
    await pageHandler(this, event, response);
  };
}
