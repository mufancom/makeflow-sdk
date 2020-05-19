import {API} from '@makeflow/types';
import {OperationTokenToken} from '@makeflow/types-nominal';
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
  | PowerGlanceModel
  | PowerCustomCheckableItemModel;

export type Definition =
  | InstallationDefinition
  | PowerItemDefinition
  | PowerGlanceDefinition
  | PowerCustomCheckableItemDefinition;

type __Definition<
  TModel,
  TPrimaryField extends
    | Exclude<keyof TModel, keyof IModel<string>>
    | 'installation'
> = TModel extends IModel<infer Type>
  ? {
      type: Type;
      primaryField: TPrimaryField;
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
};

export type ModelToDefinition<TModel extends Model> = ModelTypeToDefinition<
  TModel['type']
>;
