import {API} from '@makeflow/types';
import {OperationTokenToken, UserId} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

type __Model<
  TType extends string,
  TStorage extends Dict<any> = Dict<any>
> = API.PowerApp.Source & {
  type: TType;
  storage: TStorage | undefined;
};

export type ModelWithOperationToken = Extract<
  Model,
  {operationToken: OperationTokenToken}
>;

export type Model =
  | InstallationModel
  | PowerItemModel
  | PowerNodeModel
  | PowerGlanceModel
  | PowerCustomCheckableItemModel
  | PageModel
  | UserModel;

export type Definition =
  | InstallationDefinition
  | PowerItemDefinition
  | PowerNodeDefinition
  | PowerGlanceDefinition
  | PowerCustomCheckableItemDefinition
  | PageDefinition
  | UserDefinition;

type __Definition<
  TModel,
  TPrimaryField extends
    | Exclude<keyof TModel, keyof __Model<string>>
    | 'installation'
> = TModel extends __Model<infer Type>
  ? {
      type: Type;
      /**
       * 查询时的主要条件
       */
      primaryField: TPrimaryField;
      /**
       * 允许更新的字段
       */
      allowedFields: Exclude<
        Exclude<keyof TModel, keyof __Model<string>>,
        TPrimaryField
      >[];
    }
  : never;

// installation

export interface InstallationModel extends __Model<'installation'> {
  configs: Dict<unknown>;
  resources: API.PowerApp.ResourcesMapping;
  users: API.PowerApp.UserInfo[];
  accessToken?: string | undefined;
}

export type InstallationDefinition = __Definition<
  InstallationModel,
  'installation'
>;

export interface IPowerAppResourceModel<TType extends string>
  extends __Model<TType> {
  operationToken: OperationTokenToken;
}

// power-item

export interface PowerItemModel extends IPowerAppResourceModel<'power-item'> {}

export type PowerItemDefinition = __Definition<
  PowerItemModel,
  'operationToken'
>;

// power-node

export interface PowerNodeModel extends IPowerAppResourceModel<'power-node'> {}

export type PowerNodeDefinition = __Definition<
  PowerNodeModel,
  'operationToken'
>;

// power-glance

export interface PowerGlanceModel
  extends IPowerAppResourceModel<'power-glance'> {
  configs: Dict<any>;
  clock: number;
  disposed: boolean | undefined;
}

export type PowerGlanceDefinition = __Definition<
  PowerGlanceModel,
  'operationToken'
>;

// power-custom-checkable-item

export interface PowerCustomCheckableItemModel
  extends IPowerAppResourceModel<'power-custom-checkable-item'> {}

export type PowerCustomCheckableItemDefinition = __Definition<
  PowerCustomCheckableItemModel,
  'operationToken'
>;

// page

export interface PageModel extends __Model<'page'> {
  id: string;
}

export type PageDefinition = __Definition<PageModel, 'id'>;

// user

/**
 * User 对于同一个 installation 是唯一的
 */
export interface UserModel extends __Model<'user'> {
  id: UserId;
  username: string | undefined;
}

export type UserDefinition = __Definition<UserModel, 'id'>;

type ModelTypeToDefinition<TType extends Model['type']> = Extract<
  Definition,
  {type: TType}
>;

export const typeToModelDefinitionDict: {
  [TKey in Model['type']]: ModelTypeToDefinition<TKey>;
} = {
  installation: {
    type: 'installation',
    primaryField: 'installation',
    allowedFields: ['accessToken', 'configs', 'resources', 'users'],
  },
  'power-item': {
    type: 'power-item',
    primaryField: 'operationToken',
    allowedFields: [],
  },
  'power-node': {
    type: 'power-node',
    primaryField: 'operationToken',
    allowedFields: [],
  },
  'power-glance': {
    type: 'power-glance',
    primaryField: 'operationToken',
    allowedFields: ['clock', 'disposed', 'configs'],
  },
  'power-custom-checkable-item': {
    type: 'power-custom-checkable-item',
    primaryField: 'operationToken',
    allowedFields: [],
  },
  page: {
    type: 'page',
    primaryField: 'id',
    allowedFields: [],
  },
  user: {
    type: 'user',
    primaryField: 'id',
    allowedFields: ['username'],
  },
};

export type ModelToDefinition<TModel extends Model> = ModelTypeToDefinition<
  TModel['type']
>;

export type ModelIdentity<TModel extends Model> = ModelToDefinition<
  TModel
> extends {primaryField: infer TPrimaryField}
  ? TPrimaryField extends keyof TModel
    ? Pick<TModel, 'type' | TPrimaryField>
    : never
  : never;
