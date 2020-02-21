import {API} from '@makeflow/types';
import {
  AppInstallationId,
  OperationTokenToken,
  OrganizationId,
  TeamId,
} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

export interface IModel<
  TType extends string,
  TStorage extends Dict<any> = Dict<any>
> {
  source: API.PowerApp.Source;
  type: TType;
  organization: OrganizationId;
  installation: AppInstallationId;
  version: string;
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
  team: TeamId;
  configs: Dict<unknown>;
  resources: API.PowerApp.ResourcesMapping;
  accessToken?: string | undefined;
}

export type InstallationDefinition = __Definition<
  InstallationModel,
  'installation'
>;

// power-item

export interface PowerItemModel extends IModel<'power-item'> {
  token: OperationTokenToken;
}

export type PowerItemDefinition = __Definition<PowerItemModel, 'token'>;

// power-glance

export interface PowerGlanceModel extends IModel<'power-glance'> {
  token: OperationTokenToken;
  clock: number;
  disposed: boolean | undefined;
}

export type PowerGlanceDefinition = __Definition<PowerGlanceModel, 'token'>;

// power-custom-checkable-item

export interface PowerCustomCheckableItemModel
  extends IModel<'power-custom-checkable-item'> {
  token: OperationTokenToken;
}

export type PowerCustomCheckableItemDefinition = __Definition<
  PowerCustomCheckableItemModel,
  'token'
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
    primaryField: 'token',
    allowedFields: [],
  },
  'power-glance': {
    type: 'power-glance',
    primaryField: 'token',
    allowedFields: ['clock', 'disposed'],
  },
  'power-custom-checkable-item': {
    type: 'power-custom-checkable-item',
    primaryField: 'token',
    allowedFields: [],
  },
};

export type ModelToDefinition<TModel extends Model> = ModelTypeToDefinition<
  TModel['type']
>;
