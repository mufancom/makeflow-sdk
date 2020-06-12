///////////////////
// Prerequisites //
///////////////////

type Nominal<T, _> = T;

export type ProcedureItemType = 'indicator' | 'checkable';

export interface ProcedureSelectAlikeFieldOption {
  text: string;
  value: string;
}

//////////////////////
// Power App Schema //
//////////////////////

export interface PowerAppSchema {
  /**
   * @pattern ^[\w\d]+(-[\w\d]+)*$
   */
  name: string;
  displayName: string;
  description?: string;
  /**
   * @pattern ^https?://.+$
   */
  homePageURL?: string;
  configs?: PowerAppConfigDefinition[];
  fields?: PowerAppFieldDefinition[];
  powerItems?: PowerItemDefinition[];
  powerTags?: PowerTagDefinition[];
}

/////////////////////////////
// Config Entry Definition //
/////////////////////////////

export type PowerAppConfigName = Nominal<string, 'power-app-config-name'>;

export interface PowerAppConfigDefinition {
  name: PowerAppConfigName;
  displayName: string;
  description?: string;
}

//////////////////////
// Field Definition //
//////////////////////

export type PowerAppFieldName = Nominal<string, 'power-app-field-name'>;

export type PowerAppFieldDefinition =
  | PowerAppTextFieldDefinition
  | PowerAppOptionsFieldDefinition;

export interface PowerAppTextFieldDefinition {
  name: PowerAppFieldName;
  displayName: string;
  type: 'text';
}

export interface PowerAppOptionsFieldDefinition {
  name: PowerAppFieldName;
  displayName: string;
  type: 'select' | 'radio';
  options:
    | ProcedureSelectAlikeFieldOption[]
    | PowerAppFieldDataSourceDefinition;
}

export interface PowerAppFieldDataSourceDefinition {
  url: string;
  inputs?: PowerAppInputDefinition[];
}

///////////////////////////
// Power Item Definition //
///////////////////////////

export type PowerItemName = Nominal<string, 'power-item-name'>;

export interface PowerItemDefinition {
  name: PowerItemName;
  displayName: string;
  description?: string;
  hookBaseURL: string;
  inputs?: PowerAppInputDefinition[];
  type?: ProcedureItemType;
}

//////////////////////////
// Power Tag Definition //
//////////////////////////

export type PowerTagName = Nominal<string, 'power-tag-name'>;

export interface PowerTagDefinition {
  name: PowerTagName;
  displayName: string;
  description?: string;
  hookBaseURL: string;
  inputs?: PowerAppInputDefinition[];
}

////////////
// Common //
////////////

export type PowerAppInputName = Nominal<string, 'power-app-input-name'>;

export interface PowerAppInputDefinition {
  name: PowerAppInputName;
  displayName: string;
  bind?: PowerAppInputDefinitionInputOptions;
  default?: PowerAppInputDefinitionInputOptions;
}

export type PowerAppInputDefinitionInputOptions =
  | PowerAppInputDefinitionVariableInputOptions
  | PowerAppInputDefinitionValueInputOptions
  | PowerAppInputDefinitionAppConfigInputOptions
  | PowerAppInputDefinitionResourcePropertyInputOptions;

export interface PowerAppInputDefinitionVariableInputOptions {
  type: 'variable';
  variable: string;
}

export interface PowerAppInputDefinitionValueInputOptions {
  type: 'value';
  value: string;
}

export interface PowerAppInputDefinitionAppConfigInputOptions {
  type: 'app-config';
  configName: string;
}

export interface PowerAppInputDefinitionResourcePropertyInputOptions {
  type: 'resource-property';
  propertyName: string;
}
