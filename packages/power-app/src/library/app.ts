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
  ContextTypeToBasicMapping,
  ContextTypeToModel,
  CustomDeclareDict,
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
  getActionStorage,
  handlerCatcher,
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

export type MatchContextsFilter<
  TType extends ContextType
> = ContextTypeToBasicMapping[TType] extends [infer TModel, any]
  ? TModel extends Model
    ? Partial<TModel>
    : never
  : never;

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

    let storageObjects: StorageObject<
      any,
      TStorage
    >[] = await db.getStorageObjects<Exclude<Model, UserModel>, TStorage>({
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

  async getStorageObjectContexts<TContextType extends ContextType, TStorage>(
    type: TContextType,
    storageObject: StorageObject<ContextTypeToModel<TContextType>, TStorage>,
    options: {
      matchedUser?: ActionStorage<UserModel, TStorage>;
    } = {},
  ): Promise<Context<TContextType>[]> {
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
        installation: storageObject.getField('installation')!,
        users: storageObject.getField('users') ?? [],
        configs: storageObject.getField('configs') ?? {},
        resources: storageObject.getField('resources') ?? {
          tags: {},
          procedures: {},
        },
      };

      return [context] as Context<TContextType>[];
    }

    // #endregion installation

    let installationStorageObject = await this.dbAdapter.getStorageObject<
      InstallationModel
    >({
      type: 'installation',
      installation: storageObject.getField('installation')!,
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
        if (
          !assertStorageObjectType<StorageObject<PowerItemModel, TStorage>>(
            'power-item',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'powerItems'> = {
          ...initialBasicContext,
          type: 'power-item',
          operationToken: storageObject.getField('operationToken')!,
        };
        return [context] as Context<TContextType>[];
      }
      case 'powerNodes': {
        if (
          !assertStorageObjectType<StorageObject<PowerNodeModel, TStorage>>(
            'power-node',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'powerNodes'> = {
          ...initialBasicContext,
          type: 'power-node',
          operationToken: storageObject.getField('operationToken')!,
        };
        return [context] as Context<TContextType>[];
      }
      case 'powerCustomCheckableItems': {
        if (
          !assertStorageObjectType<StorageObject<PowerItemModel, TStorage>>(
            'power-custom-checkable-item',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'powerCustomCheckableItems'> = {
          ...initialBasicContext,
          type: 'power-custom-checkable-item',
          operationToken: storageObject.getField('operationToken')!,
        };
        return [context] as Context<TContextType>[];
      }
      case 'powerGlances': {
        if (
          !assertStorageObjectType<StorageObject<PowerGlanceModel, TStorage>>(
            'power-glance',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'powerGlances'> = {
          type: 'power-glance',
          operationToken: storageObject.getField('operationToken')!,
          ...initialBasicContext,
          powerGlanceConfigs: storageObject.getField('configs')!,
        };

        return [context] as Context<TContextType>[];
      }
      case 'pages': {
        if (
          !assertStorageObjectType<StorageObject<PageModel, TStorage>>(
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
    let users = await this.dbAdapter.getStorageObjects<UserModel, TStorage>({
      type: 'user',
      ...(filter as any),
    });

    return users.map(user =>
      getActionStorage<UserModel, TStorage>(this.dbAdapter, user),
    );
  }

  async getOrCreateUserStorage<TStorage>(
    source: APITypes.PowerApp.Source,
    id: UserId,
  ): Promise<ActionStorage<UserModel, TStorage>> {
    let db = this.dbAdapter;

    let identity: ModelIdentity<UserModel> = {type: 'user', id};

    let storage = await db.getStorageObject<UserModel, TStorage>(identity);

    if (!storage) {
      storage = await db.createStorageObject<UserModel, TStorage>({
        type: 'user',
        id,
        ...source,
        storage: {},
      });
    }

    return getActionStorage<UserModel, TStorage>(db, storage);
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
      .on('permission', handlerCatcher(this, permissionHandler))
      .on('power-item', handlerCatcher(this, powerItemHandler))
      .on('power-node', handlerCatcher(this, powerNodeHandler))
      .on('power-glance', handlerCatcher(this, powerGlanceHandler))
      .on(
        'power-custom-checkable-item',
        handlerCatcher(this, powerCustomCheckableItemHandler),
      )
      .on('page', handlerCatcher(this, pageHandler));

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
