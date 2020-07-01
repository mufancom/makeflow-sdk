import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {API} from '../api';
import {UserId} from '../types/namespace';

import {
  InstallationModel,
  Model,
  ModelIdentity,
  PageModel,
  PowerCustomCheckableItemModel,
  PowerGlanceModel,
  PowerItemModel,
  PowerNodeModel,
  UserModel,
} from './model';
import {ActionStorage} from './storage';

export type BasicContext<TModel extends Model, TStorage, TConfigs> = {
  api: API;
  source: APITypes.PowerApp.Source;
  storage: ActionStorage<TModel, TStorage>;
  configs: TConfigs;
} & ModelIdentity<TModel>;

export type Context<
  TType extends ContextType,
  TStorage = Dict<any>,
  TConfigs = Dict<any>
> = ContextTypeToBasicMapping[TType] extends [infer TModel, infer TContext]
  ? TModel extends Model
    ? TContext & BasicContext<TModel, TStorage, TConfigs>
    : never
  : never;

export type ContextTypeToModel<TType> = TType extends ContextType
  ? ContextTypeToBasicMapping[TType] extends [infer TModel, any]
    ? TModel
    : never
  : never;

export type ContextType = keyof ContextTypeToBasicMapping;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type ContextTypeToBasicMapping = {
  installation: [
    InstallationModel,
    {
      users: APITypes.PowerApp.UserInfo[];
      resources: APITypes.PowerApp.ResourcesMapping;
    },
  ];
  'power-item': [PowerItemModel, {}];
  'power-glance': [
    PowerGlanceModel,
    {
      powerGlanceConfigs: Dict<any>;
    },
  ];
  'power-node': [PowerNodeModel, {}];
  'power-custom-checkable-item': [PowerCustomCheckableItemModel, {}];
  page: [
    PageModel,
    {
      userStorage: ActionStorage<UserModel, any>;
      user: {
        id: UserId;
      };
      /**
       * e.g. `/a/b/c`
       */
      path: string | undefined;
    },
  ];
  user: [UserModel, {}];
};

export type __AssertContextTypeToBasicMapping<
  T extends {
    [key in string]: [Model, Dict<any>];
  } = ContextTypeToBasicMapping
> = T;
