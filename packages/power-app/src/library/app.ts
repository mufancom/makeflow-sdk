import {
  AdapterServeOptions,
  PowerAppAdapter,
} from '@makeflow/power-app-server-adapter';
import {API as APITypes} from '@makeflow/types';
import {AppInstallationId, UserId} from '@makeflow/types-nominal';
import _ from 'lodash';
import {validRange} from 'semver';
import {Dict} from 'tslang';

import {API} from './api';
import {
  BasicContext,
  Context,
  ContextType,
  ContextTypeToBasicMapping,
  ContextTypeToModel,
  CustomDeclareDict,
  DataSourceModel,
  FieldSourceModel,
  IDBAdapter,
  InstallationModel,
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
  StorageObject,
  UserModel,
  buildRoutes,
  getActionStorage,
  getInstallationResourceId,
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
    value?: any;
  };
}

export type PowerAppSource = Partial<
  Pick<APITypes.PowerApp.Source, 'url' | 'token'>
>;

export interface PowerAppOptions {
  source?: PowerAppSource | PowerAppSource[];
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

export class PowerApp {
  definitions: PowerAppVersionInfo[] = [];

  dbAdapter!: IDBAdapter;

  constructor(readonly options: PowerAppOptions = {}) {
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

  serve(adapter: PowerAppAdapter<any>, path?: string): void {
    this.buildAdapter(adapter).serve({path});
  }

  middleware<TMiddleware>(
    adapter: PowerAppAdapter<TMiddleware>,
    options?: AdapterServeOptions,
  ): TMiddleware {
    return this.buildAdapter<TMiddleware>(adapter).middleware(options);
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

    let installationId = storageObject.source.installation.id;

    let installationStorageObject:
      | StorageObject<InstallationModel, any>
      | undefined;

    if (
      type === 'installation' &&
      assertStorageObjectType<StorageObject<InstallationModel, TStorage>>(
        'installation',
        storageObject,
      )
    ) {
      installationStorageObject = storageObject;
    } else {
      installationStorageObject = await this.dbAdapter.getStorageObject<
        InstallationModel
      >({
        type: 'installation',
        id: installationId,
      });
    }

    if (!installationStorageObject) {
      throw Error('未匹配到安装信息');
    }

    let initialBasicContext: Omit<
      BasicContext<any, any, any>,
      keyof ModelIdentity<Model>
    > = {
      powerApp: this,
      api,
      installationStorage: getActionStorage(db, installationStorageObject),
      storage: getActionStorage(db, storageObject),
      source: storageObject.source,
      configs: installationStorageObject.getField('configs'),
    };

    api.setAccessToken(installationStorageObject.getField('accessToken'));

    if (assertModelWithOperationToken(storageObject)) {
      api.setOperationToken(storageObject.getField('operationToken'));
    }

    let contexts: Context<ContextType>[] = [];

    switch (type) {
      case 'installation': {
        if (
          !assertStorageObjectType<StorageObject<InstallationModel, TStorage>>(
            'installation',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'installation'> = {
          ...initialBasicContext,
          type: 'installation',
          id: installationId,
          users: storageObject.getField('users') ?? [],
          resources: storageObject.getField('resources') ?? {
            tags: {},
            procedures: {},
          },
          disabled: !!storageObject.getField('disabled'),
        };

        contexts = [context];
        break;
      }
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
            installationId,
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
          value: options?.['data-source']?.value,
        };

        contexts = [context];
        break;
      }

      case 'field-source': {
        if (
          !assertStorageObjectType<StorageObject<FieldSourceModel, TStorage>>(
            'field-source',
            storageObject,
          )
        ) {
          return [];
        }

        let context: Context<'field-source'> = {
          ...initialBasicContext,
          type: 'field-source',
          id: storageObject.getField('id')!,
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

  private buildAdapter<TMiddleware>(
    adapter: PowerAppAdapter<any>,
  ): ReturnType<PowerAppAdapter<TMiddleware>> {
    return adapter({
      sources: _.compact(_.castArray(this.options.source)),
      routes: buildRoutes(this),
    });
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
