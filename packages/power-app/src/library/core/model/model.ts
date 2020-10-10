import {API, User} from '@makeflow/types';
import {
  AppInstallationId,
  OperationTokenToken,
  UserId,
} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

export type BasicModel<
  TType extends string,
  TId extends string,
  TStorage extends Dict<any> = Dict<any>
> = API.PowerApp.Source & {
  type: TType;
  id: TId;
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
  | UserModel
  | DataSourceModel
  | FieldSourceModel;

export type Definition =
  | InstallationDefinition
  | PowerItemDefinition
  | PowerNodeDefinition
  | PowerGlanceDefinition
  | PowerCustomCheckableItemDefinition
  | PageDefinition
  | UserDefinition
  | DataSourceDefinition
  | FieldSourceDefinition;

type __Definition<TModel> = TModel extends BasicModel<infer Type, string>
  ? {
      type: Type;
      /**
       * 允许更新的字段
       */
      allowedFields?: Exclude<keyof TModel, keyof BasicModel<string, string>>[];
    }
  : never;

// installation

export interface InstallationModel
  extends BasicModel<'installation', AppInstallationId> {
  configs: Dict<unknown>;
  resources: API.PowerApp.ResourcesMapping;
  users: User.TeamUserInfo[];
  accessToken?: string | undefined;
  disabled?: boolean;
}

export type InstallationDefinition = __Definition<InstallationModel>;

export interface IPowerAppResourceModel<TType extends string>
  extends BasicModel<TType, OperationTokenToken> {
  operationToken: OperationTokenToken;
}

// power-item

export interface PowerItemModel extends IPowerAppResourceModel<'power-item'> {}

export type PowerItemDefinition = __Definition<PowerItemModel>;

// power-node

export interface PowerNodeModel extends IPowerAppResourceModel<'power-node'> {}

export type PowerNodeDefinition = __Definition<PowerNodeModel>;

// power-glance

export interface PowerGlanceModel
  extends IPowerAppResourceModel<'power-glance'> {
  configs: Dict<any>;
  clock: number;
  disposed: boolean | undefined;
}

export type PowerGlanceDefinition = __Definition<PowerGlanceModel>;

// power-custom-checkable-item

export interface PowerCustomCheckableItemModel
  extends IPowerAppResourceModel<'power-custom-checkable-item'> {}

export type PowerCustomCheckableItemDefinition = __Definition<
  PowerCustomCheckableItemModel
>;

// page

export interface PageModel extends BasicModel<'page', string> {}

export type PageDefinition = __Definition<PageModel>;

// user

export interface UserModel extends BasicModel<'user', string> {
  userId: UserId;
  username: string | undefined;
}

export type UserDefinition = __Definition<UserModel>;

// data-source

export interface DataSourceModel extends BasicModel<'data-source', string> {
  id: string;
}

export type DataSourceDefinition = __Definition<DataSourceModel>;

// field-source

export interface FieldSourceModel extends BasicModel<'field-source', string> {
  id: string;
}

export type FieldSourceDefinition = __Definition<FieldSourceModel>;

type ModelTypeToDefinition<TType extends Model['type']> = Extract<
  Definition,
  {type: TType}
>;

export const typeToModelDefinitionDict: {
  [TKey in Model['type']]: ModelTypeToDefinition<TKey>;
} = {
  installation: {
    type: 'installation',
    allowedFields: ['accessToken', 'configs', 'resources', 'users', 'disabled'],
  },
  'power-item': {
    type: 'power-item',
  },
  'power-node': {
    type: 'power-node',
  },
  'power-glance': {
    type: 'power-glance',
    allowedFields: ['clock', 'disposed', 'configs'],
  },
  'power-custom-checkable-item': {
    type: 'power-custom-checkable-item',
  },
  page: {
    type: 'page',
  },
  user: {
    type: 'user',
    allowedFields: ['username'],
  },
  'data-source': {
    type: 'data-source',
  },
  'field-source': {
    type: 'field-source',
  },
};

export type ModelToDefinition<TModel extends Model> = ModelTypeToDefinition<
  TModel['type']
>;

export type ModelIdentity<TModel extends Model> = Pick<TModel, 'type' | 'id'>;
