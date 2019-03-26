export interface PowerApp {
  /**
   * @pattern ^[\w\d]+(-[\w\d]+)*$
   */
  name: string;
  description?: string;
  /**
   * @pattern ^https?://.+$
   */
  homePageURL?: string;
  configs?: PowerAppConfigEntryDefinition[];
  fields?: PowerAppFieldDefinition[];
  powerItems?: PowerItemDefinition[];
  powerTags?: PowerTagDefinition[];
}

/////////////////////////////
// Config Entry Definition //
/////////////////////////////

interface PowerAppConfigEntryDefinition {
  name: string;
  displayName: string;
  description?: string;
}

//////////////////////
// Field Definition //
//////////////////////

type PowerAppFieldDefinition =
  | PowerAppTextFieldDefinition
  | PowerAppOptionsFieldDefinition;

interface PowerAppTextFieldDefinition {
  name: string;
  displayName: string;
  type: 'text';
}

interface PowerAppOptionsFieldDefinition {
  name: string;
  displayName: string;
  type: 'select' | 'radio';
  options: PowerAppSelectAlikeFieldOptions[] | PowerAppFieldDataSourceOptions;
}

interface PowerAppSelectAlikeFieldOptions {
  text: string;
  value: string;
}

interface PowerAppFieldDataSourceOptions {
  url: string;
  inputs?: PowerAppInputDefinition[];
}

///////////////////////////
// Power Item Definition //
///////////////////////////

interface PowerItemDefinition {
  name: string;
  displayName: string;
  description?: string;
  hookBaseURL: string;
  inputs?: PowerAppInputDefinition[];
  type?: 'indicator' | 'checkable';
}

//////////////////////////
// Power Tag Definition //
//////////////////////////

interface PowerTagDefinition {
  name: string;
  displayName: string;
  description?: string;
  hookBaseURL: string;
  inputs?: PowerAppInputDefinition[];
}

////////////
// Common //
////////////

type PowerAppInputDefinition =
  | PowerItemConfigurableInputDefinition
  | PowerItemBoundInputDefinition;

interface PowerItemConfigurableInputDefinition {
  name: string;
  displayName: string;
}

interface PowerItemBoundInputDefinition {
  name: string;
  displayName: string;
  bind: PowerItemBound;
}

type PowerItemBound = PowerItemAppBound | PowerItemResourceBound;

interface PowerItemAppBound {
  type: 'app';
  configName: string;
}

interface PowerItemResourceBound {
  type: 'resource';
  getter: string;
}
