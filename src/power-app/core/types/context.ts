import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {API} from '../../api';
import {
  InstallationModel,
  Model,
  PageModel,
  PowerCustomCheckableItemModel,
  PowerGlanceModel,
  PowerItemModel,
  PowerNodeModel,
  UserModel,
} from '../model';
import {ActionStorage} from '../storage';

export interface BasicContext<TModel extends Model, TStorage, TConfigs> {
  api: API;
  source: APITypes.PowerApp.Source;
  storage: ActionStorage<TModel, TStorage>;
  configs: TConfigs;
}

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
  powerItems: [PowerItemModel, {}];
  powerGlances: [
    PowerGlanceModel,
    {
      powerGlanceConfigs: Dict<any>;
    },
  ];
  powerNodes: [PowerNodeModel, {}];
  powerCustomCheckableItems: [PowerCustomCheckableItemModel, {}];
  pages: [
    PageModel,
    {
      userStorage: ActionStorage<UserModel>;
    },
  ];
};

export type __AssertContextTypeToBasicMapping<
  T extends {
    [key in string]: [Model, Dict<any>];
  } = ContextTypeToBasicMapping
> = T;
