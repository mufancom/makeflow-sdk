import {Plugin} from '@hapi/hapi';
import {API as APITypes} from '@makeflow/types';
import {AppInstallationId, UserId} from '@makeflow/types-nominal';
import {Express} from 'express';
import Koa from 'koa';
import _ from 'lodash';
import {validRange} from 'semver';
import {Constructor, Dict} from 'tslang';

import {API} from './api';
import {
  BasicContext,
  Context,
  ContextType,
  ContextTypeToBasicMapping,
  ContextTypeToModel,
  CustomDeclareDict,
  DataSourceModel,
  ExpressAdapter,
  HapiAdapter,
  IDBAdapter,
  IServeAdapter,
  InstallationModel,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  Model,
  ModelIdentity,
  ModelWithOperationToken,
  MongoAdapter,
  MongoOptions,
  PageModel,
  PowerAppVersion,
  PowerAppVersionInfo,
  PowerGlanceModel,
  PowerItemModel,
  PowerNodeModel,
  ServeOptions,
  StorageObject,
  UserModel,
  checkVersionsQualified,
  dataSourceHandler,
  getActionStorage,
  getInstallationResourceId,
  handlerCatcher,
  installationHandler,
  pageHandler,
  powerCustomCheckableItemHandler,
  powerGlanceHandler,
  powerItemHandler,
  powerNodeHandler,
} from './core';

export type MatchContextsFilter<
  TType extends ContextType
> = ContextTypeToBasicMapping[TType] extends [infer TModel, any]
  ? TModel extends Model
    ? Partial<TModel>
    : never
  : never;

export interface GetStorageObjectContextsOptions {
  page?: {
    user?: {
      id: UserId;
      username?: string;
    };
    path?: string;
  };
  'data-source'?: {
    search?: string;
  };
}

export type PowerAppSource = Partial<
  Pick<APITypes.PowerApp.Source, 'url' | 'token'>
>;

export interface PowerAppOptions {
  source?: PowerAppSource;
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

export class PowerApp {
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

    let storageObjects = await db.getStorageObjects<
      ContextTypeToModel<TContextType>,
      TStorage
    >({
      type,
      ...(filter as any),
    });

    for (let storageObject of storageObjects) {
      let contexts = await this.getStorageObjectContexts(type, storageObject);

      for (let context of contexts) {
        yield context;
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

  async getStorageObjectContexts<TContextType extends ContextType, TStorage>(
    type: TContextType,
    storageObject: StorageObject<ContextTypeToModel<TContextType>, TStorage>,
    options?: GetStorageObjectContextsOptions,
  ): Promise<Context<TContextType, TStorage>[]> {
    let db = this.dbAdapter;

    let api = new API(storageObject.source);

    let initialBasicContext: Omit<
      BasicContext<any, any, any>,
      keyof ModelIdentity<Model>
    > = {
      api,
      storage: getActionStorage(db, storageObject),
      source: storageObject.source,
      configs: {},
    };

    let appInstallationId = storageObject.getField('id')! as AppInstallationId;

    // #region installation

    if (type === 'installation') {
      if (
        !assertStorageObjectType<StorageObject<InstallationModel, TStorage>>(
          'installation',
          storageObject,
        )
      ) {
        return [];
      }

      api.setAccessToken(storageObject.getField('accessToken'));

      let context: Context<'installation'> = {
        ...initialBasicContext,
        type: 'installation',
        id: appInstallationId,
        users: storageObject.getField('users') ?? [],
        configs: storageObject.getField('configs') ?? {},
        resources: storageObject.getField('resources') ?? {
          tags: {},
          procedures: {},
        },
        disabled: !!storageObject.getField('disabled'),
      };

      return [context] as Context<TContextType>[];
    }

    // #endregion installation

    let installationStorageObject = await this.dbAdapter.getStorageObject<
      InstallationModel
    >({
      type: 'installation',
      id: appInstallationId,
    });

    if (!installationStorageObject) {
      throw Error('未匹配到安装信息');
    }

    api.setAccessToken(installationStorageObject.getField('accessToken'));

    if (assertModelWithOperationToken(storageObject)) {
      api.setOperationToken(storageObject.getField('operationToken'));
    }

    initialBasicContext.configs = installationStorageObject.getField('configs');

    let contexts: Context<ContextType>[] = [];

    switch (type) {
      case 'power-item': {
        if (
          !assertStorageObjectType<StorageObject<PowerItemModel, TStorage>>(
            'power-item',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'power-item'> = {
          ...initialBasicContext,
          type: 'power-item',
          id: storageObject.getField('operationToken')!,
        };

        contexts = [context];
        break;
      }
      case 'power-node': {
        if (
          !assertStorageObjectType<StorageObject<PowerNodeModel, TStorage>>(
            'power-node',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'power-node'> = {
          ...initialBasicContext,
          type: 'power-node',
          id: storageObject.getField('operationToken')!,
        };

        contexts = [context];
        break;
      }
      case 'power-custom-checkable-item': {
        if (
          !assertStorageObjectType<StorageObject<PowerItemModel, TStorage>>(
            'power-custom-checkable-item',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'power-custom-checkable-item'> = {
          ...initialBasicContext,
          type: 'power-custom-checkable-item',
          id: storageObject.getField('operationToken')!,
        };

        contexts = [context];
        break;
      }
      case 'power-glance': {
        if (
          !assertStorageObjectType<StorageObject<PowerGlanceModel, TStorage>>(
            'power-glance',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'power-glance'> = {
          ...initialBasicContext,
          type: 'power-glance',
          id: storageObject.getField('operationToken')!,
          powerGlanceConfigs: storageObject.getField('configs')!,
        };

        contexts = [context];
        break;
      }
      case 'page': {
        if (
          !assertStorageObjectType<StorageObject<PageModel, TStorage>>(
            'page',
            storageObject,
          )
        ) {
          return [];
        }

        let pageOptions = options?.page;

        if (pageOptions?.user) {
          let userModelId = getInstallationResourceId(
            appInstallationId,
            pageOptions.user.id,
          );

          let userStorage = await db.getStorageObject<UserModel>({
            type: 'user',
            id: userModelId,
          });

          if (!userStorage) {
            let {value} = await db.createOrUpgradeStorageObject<UserModel>({
              type: 'user',
              id: userModelId,
              userId: pageOptions.user.id,
              username: pageOptions.user.username,
              storage: {},
              ...storageObject.source,
            });

            userStorage = value;
          }

          let context: Context<'page'> = {
            ...initialBasicContext,
            type: 'page',
            id: storageObject.getField('id')!,
            userStorage: getActionStorage(db, userStorage),
            user: {
              id: userStorage.getField('userId')!,
              username: userStorage.getField('username') ?? '',
            },
            path: pageOptions.path,
          };

          contexts = [context];
          break;
        }

        let users = await this.dbAdapter.getStorageObjects<UserModel, TStorage>(
          {
            type: 'user',
            installation: storageObject.getField('installation'),
          },
        );

        users.map(user =>
          getActionStorage<UserModel, TStorage>(this.dbAdapter, user),
        );

        contexts = users.map(
          (user): Context<'page'> => ({
            ...initialBasicContext,
            type: 'page',
            id: storageObject.getField('id')!,
            userStorage: getActionStorage<UserModel, TStorage>(
              this.dbAdapter,
              user,
            ),
            user: {
              id: user.getField('userId')!,
              username: user.getField('username') ?? '',
            },
            path: pageOptions?.path,
          }),
        );

        break;
      }
      case 'user': {
        if (
          !assertStorageObjectType<StorageObject<UserModel, TStorage>>(
            'user',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'user'> = {
          ...initialBasicContext,
          type: 'user',
          id: storageObject.getField('id')!,
          username: storageObject.getField('username'),
        };

        contexts = [context];
        break;
      }
      case 'data-source': {
        if (
          !assertStorageObjectType<StorageObject<DataSourceModel, TStorage>>(
            'data-source',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'data-source'> = {
          ...initialBasicContext,
          type: 'data-source',
          id: storageObject.getField('id')!,
          search: options?.['data-source']?.search,
        };

        contexts = [context];
        break;
      }
    }

    return contexts as Context<TContextType>[];
  }

  async getOrCreateUserContext<TStorage>(
    source: APITypes.PowerApp.Source,
    {
      id: userId,
      username,
      installation,
    }: {
      id: UserId;
      installation: AppInstallationId;
      username?: string;
    },
  ): Promise<Context<'user', TStorage>> {
    let userModelId = getInstallationResourceId(installation, userId);

    let contexts = await this.getContexts<'user', TStorage>('user', {
      type: 'user',
      id: userModelId,
    });

    if (contexts.length) {
      return contexts[0];
    }

    let storage = await this.dbAdapter.createStorageObject<UserModel, TStorage>(
      {
        ...source,
        type: 'user',
        id: userModelId,
        userId,
        username,
        storage: {},
      },
    );

    contexts = await this.getStorageObjectContexts<'user', TStorage>(
      'user',
      storage,
    );

    return contexts[0];
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
      .on('installation', handlerCatcher(this, installationHandler))
      .on('power-item', handlerCatcher(this, powerItemHandler))
      .on('power-node', handlerCatcher(this, powerNodeHandler))
      .on('power-glance', handlerCatcher(this, powerGlanceHandler))
      .on(
        'power-custom-checkable-item',
        handlerCatcher(this, powerCustomCheckableItemHandler),
      )
      .on('page', handlerCatcher(this, pageHandler))
      .on('data-source', handlerCatcher(this, dataSourceHandler));

    return serveAdapter;
  }

  private checkVersionsQualified(): void {
    this.definitions = checkVersionsQualified(this.definitions);
  }
}

function assertModelWithOperationToken<TStorage>(
  storageObject: StorageObject<any, TStorage>,
): storageObject is StorageObject<ModelWithOperationToken, TStorage> {
  return !!storageObject.getField('operationToken');
}

function assertStorageObjectType<T extends StorageObject<any, any>>(
  type: Model['type'],
  storageObject: StorageObject<any, any>,
): storageObject is T {
  return storageObject.type === type;
}
