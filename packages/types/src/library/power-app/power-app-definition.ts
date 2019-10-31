import {Nominal} from 'tslang';

import {AccessControlPermission} from '../permission';
import {ProcedureDefinitionRevisionData} from '../procedure';
import {TagVariable} from '../tag';

import {
  PowerAppProcedureFieldDefinition,
  PowerGlanceDefinition,
  PowerItemDefinition,
} from './contributions';
import {PowerAppId} from './power-app';
import {PowerAppConfigDefinition} from './power-app-config';

export type PowerAppDefinitionId = Nominal<string, 'power-app-definition-id'>;

export interface PowerAppDefinition extends PowerAppDefinitionData {
  id: PowerAppDefinitionId;
  powerApp: PowerAppId;
}

export interface PowerAppDefinitionData {
  /**
   * @pattern ^[\w\d]+(-[\w\d]+)*$
   */
  name: string;
  /**
   * @pattern ^v\d+\.\d+\.\d+$
   */
  version: string;
  displayName: string;
  description?: string;
  /**
   * @pattern ^https?://.+$
   */
  homePageURL?: string;
  /**
   * @pattern ^https?://.+$
   */
  hookBaseURL?: string;
  configs: PowerAppConfigDefinition[];
  permissions?: AccessControlPermission[];
  contributions?: PowerAppDefinitionContributions;
  resources?: PowerAppDefinitionResources;
}

/////////////////
// Contributes //
/////////////////

export interface PowerAppDefinitionContributions {
  procedureFields?: PowerAppProcedureFieldDefinition[];
  powerItems?: PowerItemDefinition[];
  powerGlances?: PowerGlanceDefinition[];
}

///////////////
// Resources //
///////////////

export interface PowerAppDefinitionResources {
  tags?: PowerAppDefinitionTagResource[];
  procedures?: PowerAppDefinitionProcedureResource[];
}

export type PowerAppDefinitionResource =
  | PowerAppDefinitionTagResource
  | PowerAppDefinitionProcedureResource;

export type PowerAppDefinitionResourceName = Nominal<
  string,
  'power-app-definition-resource-name'
>;

export interface PowerAppDefinitionTagResource {
  name: PowerAppDefinitionResourceName;
  displayName: string;
  color: string;
  variables?: TagVariable[];
  abstract?: boolean;
  super?: PowerAppDefinitionResourceName;
}

export interface PowerAppDefinitionProcedureResource {
  name: PowerAppDefinitionResourceName;
  displayName: string;
  revision: ProcedureDefinitionRevisionData;
}
