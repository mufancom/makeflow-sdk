import {API} from '@makeflow/types';
import {OperationTokenToken, UserId} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

export interface IModel<
  TType extends string,
  TStorage extends Dict<any> = Dict<any>
> extends API.PowerApp.Source {
  type: TType;
  storage: TStorage | undefined;
}

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
    | Exclude<keyof TModel, keyof IModel<string>>
    | 'installation'
> = TModel extends IModel<infer Type>
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
        Exclude<keyof TModel, keyof IModel<string>>,
        TPrimaryField
      >[];
    }
  : never;

// installation

export interface InstallationModel extends IModel<'installation'> {
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
  extends IModel<TType> {
  resourceToken: OperationTokenToken;
}

// power-item

export interface PowerItemModel extends IPowerAppResourceModel<'power-item'> {}

export type PowerItemDefinition = __Definition<PowerItemModel, 'resourceToken'>;

// power-node

export interface PowerNodeModel extends IPowerAppResourceModel<'power-node'> {}

export type PowerNodeDefinition = __Definition<PowerNodeModel, 'resourceToken'>;

// power-glance

export interface PowerGlanceModel
  extends IPowerAppResourceModel<'power-glance'> {
  clock: number;
  disposed: boolean | undefined;
}

export type PowerGlanceDefinition = __Definition<
  PowerGlanceModel,
  'resourceToken'
>;

// power-custom-checkable-item

export interface PowerCustomCheckableItemModel
  extends IPowerAppResourceModel<'power-custom-checkable-item'> {}

export type PowerCustomCheckableItemDefinition = __Definition<
  PowerCustomCheckableItemModel,
  'resourceToken'
>;

// page

export interface PageModel extends IPowerAppResourceModel<'page'> {}

export type PageDefinition = __Definition<PageModel, 'resourceToken'>;

// user

/**
 * User 对于整个 APP 都是唯一的，不同的 installation 共享
 *
 * 以下字段仅初次记录，不会更新: [ installation | team | version ]
 */
export interface UserModel extends IModel<'user'> {
  id: UserId;
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
    allowedFields: ['accessToken', 'configs', 'resources'],
  },
  'power-item': {
    type: 'power-item',
    primaryField: 'resourceToken',
    allowedFields: [],
  },
  'power-node': {
    type: 'power-node',
    primaryField: 'resourceToken',
    allowedFields: [],
  },
  'power-glance': {
    type: 'power-glance',
    primaryField: 'resourceToken',
    allowedFields: ['clock', 'disposed'],
  },
  'power-custom-checkable-item': {
    type: 'power-custom-checkable-item',
    primaryField: 'resourceToken',
    allowedFields: [],
  },
  page: {
    type: 'page',
    primaryField: 'resourceToken',
    allowedFields: [],
  },
  user: {
    type: 'user',
    primaryField: 'id',
    allowedFields: [],
  },
};

export type ModelToDefinition<TModel extends Model> = ModelTypeToDefinition<
  TModel['type']
>;
