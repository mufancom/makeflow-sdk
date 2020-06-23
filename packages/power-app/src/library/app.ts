import {Plugin} from '@hapi/hapi';
import {API as APITypes} from '@makeflow/types';
import {UserId} from '@makeflow/types-nominal';
import {Express} from 'express';
import Koa from 'koa';
import _ from 'lodash';
import {validRange} from 'semver';
import {Constructor, Dict} from 'tslang';

import {API} from './api';
import {
  ActionStorage,
  BasicContext,
  Context,
  ContextType,
  ContextTypeToModel,
  CustomDeclareDict,
  ExpressAdapter,
  HapiAdapter,
  IDBAdapter,
  IPowerApp,
  IServeAdapter,
  InstallationEvent,
  InstallationModel,
  KoaAdapter,
  LowdbAdapter,
  MatchContextsFilter,
  Model,
  ModelWithOperationToken,
  MongoAdapter,
  PageEvent,
  PageModel,
  PermissionEvent,
  PowerAppOptions,
  PowerAppVersion,
  PowerAppVersionInfo,
  PowerCustomCheckableItemEvent,
  PowerGlanceEvent,
  PowerGlanceModel,
  PowerItemEvent,
  PowerNodeEvent,
  ServeOptions,
  StorageObject,
  UserModel,
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

const CONTEXT_TYPE_TO_MODEL_TYPE_DICT: {
  [key in ContextType]: Model['type'];
} = {
  installation: 'installation',
  powerItems: 'power-item',
  powerNodes: 'power-node',
  powerCustomCheckableItems: 'power-custom-checkable-item',
  powerGlances: 'power-glance',
  pages: 'page',
};

export class PowerApp implements IPowerApp {
  definitions: PowerAppVersionInfo[] = [];

  dbAdapter!: IDBAdapter;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  version(range: string, definition: PowerAppVersion.Definition<{}>): void;
  version<TCustomDeclareDict extends Partial<CustomDeclareDict>>(
    range: string,
    definition: PowerAppVersion.Definition<TCustomDeclareDict>,
  ): void;
  version(range: string, definition: PowerAppVersion.Definition): void {
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

  koa(path?: ServeOptions['path']): Koa.Middleware {
    return this.buildServeAdapter(KoaAdapter, {path}).middleware();
  }

  express(path?: ServeOptions['path']): Express {
    return this.buildServeAdapter(ExpressAdapter, {path}).middleware();
  }

  hapi<T>(): Plugin<T> {
    return this.buildServeAdapter(HapiAdapter, {}).middleware();
  }

  async *getContextIterable<
    TContextType extends ContextType,
    TStorage = Dict<any>,
    TConfigs = Dict<any>
  >(
    type: TContextType,
    filter: MatchContextsFilter<TContextType>,
  ): AsyncGenerator<Context<TContextType, TStorage, TConfigs>> {
    let db = this.dbAdapter;

    let storageObjects: StorageObject<any>[] = await db.getStorageObjects<
      Exclude<Model, UserModel>
    >({
      type: CONTEXT_TYPE_TO_MODEL_TYPE_DICT[type],
      ...(filter as any),
    });

    for (let storageObject of storageObjects) {
      let contexts = await this.getStorageObjectContexts(type, storageObject);

      for (let context of contexts) {
        yield context as Context<TContextType, TStorage, TConfigs>;
      }
    }
  }

  async getContexts<
    TContextType extends ContextType,
    TStorage = Dict<any>,
    TConfigs = Dict<any>
  >(
    type: TContextType,
    filter: MatchContextsFilter<TContextType>,
  ): Promise<Context<TContextType, TStorage, TConfigs>[]> {
    let contexts = [];

    for await (let context of this.getContextIterable<
      TContextType,
      TStorage,
      TConfigs
    >(type, filter)) {
      contexts.push(context);
    }

    return contexts;
  }

  async getStorageObjectContexts<TContextType extends ContextType>(
    type: TContextType,
    storageObject: StorageObject<ContextTypeToModel<TContextType>>,
    options: {
      matchedUser?: ActionStorage<UserModel>;
    } = {},
  ): Promise<Context<TContextType>[]> {
    let db = this.dbAdapter;

    let api = new API(storageObject.source);

    let initialBasicContext: BasicContext<any, any, any> = {
      api,
      storage: getActionStorage(db, storageObject),
      source: storageObject.source,
      configs: {},
    };

    function assertStorageObjectType<T extends StorageObject<any>>(
      type: Model['type'],
      storageObject: StorageObject<any>,
    ): storageObject is T {
      return storageObject.type === type;
    }

    if (type === 'installation') {
      if (
        !assertStorageObjectType<StorageObject<InstallationModel>>(
          'installation',
          storageObject,
        )
      ) {
        return [];
      }

      api.setAccessToken(storageObject.getField('accessToken'));

      let context: Context<'installation'> = {
        ...initialBasicContext,
        users: storageObject.getField('users') ?? [],
        configs: storageObject.getField('configs') ?? {},
        resources: storageObject.getField('resources') ?? {
          tags: {},
          procedures: {},
        },
      };

      return [context] as Context<TContextType>[];
    }

    let installationStorageObject = await this.dbAdapter.getStorageObject<
      InstallationModel
    >({
      type: 'installation',
      installation: storageObject.getField('installation'),
    });

    api.setAccessToken(installationStorageObject?.getField('accessToken'));

    if (assertModelWithOperationToken(storageObject)) {
      api.setOperationToken(storageObject.getField('operationToken'));
    }

    initialBasicContext.configs = installationStorageObject?.getField(
      'configs',
    );

    switch (type) {
      case 'powerItems': {
        let context: Context<'powerItems'> = initialBasicContext;
        return [context] as Context<TContextType>[];
      }
      case 'powerNodes': {
        let context: Context<'powerNodes'> = initialBasicContext;
        return [context] as Context<TContextType>[];
      }
      case 'powerCustomCheckableItems': {
        let context: Context<'powerCustomCheckableItems'> = initialBasicContext;
        return [context] as Context<TContextType>[];
      }
      case 'powerGlances': {
        if (
          !assertStorageObjectType<StorageObject<PowerGlanceModel>>(
            'power-glance',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'powerGlances'> = {
          ...initialBasicContext,
          powerGlanceConfigs: storageObject.getField('configs')!,
        };

        return [context] as Context<TContextType>[];
      }
      case 'pages': {
        if (
          !assertStorageObjectType<StorageObject<PageModel>>(
            'page',
            storageObject,
          )
        ) {
          return [];
        }

        if (options.matchedUser) {
          return [
            {
              ...initialBasicContext,
              userStorage: options.matchedUser,
            },
          ] as Context<TContextType>[];
        }

        let userStorages = await this.getUserStorages({
          installation: storageObject.getField('installation'),
        });

        return userStorages.map(userStorage => ({
          ...initialBasicContext,
          userStorage,
        })) as Context<TContextType>[];
      }
      default:
        return [];
    }
  }

  async getUserStorages<TStorage>(
    filter: Partial<UserModel> & {storage?: Partial<TStorage>},
  ): Promise<ActionStorage<UserModel, TStorage>[]> {
    let users = await this.dbAdapter.getStorageObjects<UserModel>({
      type: 'user',
      ...(filter as any),
    });

    return users.map(user =>
      getActionStorage<UserModel, TStorage>(this.dbAdapter, user),
    );
  }

  async createUserStorage<TStorage>(
    source: APITypes.PowerApp.Source,
    id: UserId,
  ): Promise<ActionStorage<UserModel, TStorage>> {
    let storage = await this.dbAdapter.createStorageObject({
      type: 'user',
      id,
      ...source,
      storage: {},
    });

    return getActionStorage(this.dbAdapter, storage);
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

function assertModelWithOperationToken(
  storageObject: StorageObject<any>,
): storageObject is StorageObject<ModelWithOperationToken> {
  return !!storageObject.getField('operationToken');
}
