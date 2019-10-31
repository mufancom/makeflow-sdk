// tslint:disable-next-line: no-implicit-dependencies
import {RawDraftContentState} from 'draft-js';

import {CustomCondition} from '../custom-condition';
import {
  PowerAppInputOptions,
  PowerAppProcedureFieldDefinition,
  PowerItemActionDefinition,
  PowerItemFieldDefinition,
  PowerItemName,
} from '../power-app';
import {ResolvableValue} from '../value';

import {BuiltInProcedureFieldType} from './built-in-procedure-field';

export interface ProcedureDefinitionRevisionData {
  options: ProcedureDefinitionOptions;
  branches: ProcedureBranchDefinition[];
  form?: ProcedureFormDefinition;
  roles?: ProcedureRole[];
}

export const DEFAULT_PROCEDURE_NODE_APPROVAL = false;
export const DEFAULT_PROCEDURE_NODE_ASSIGNMENT = 'none' as 'none';
export const DEFAULT_PROCEDURE_NODE_ACTIVE_BEFORE_START = false;

export interface ProcedureDefinitionSyncable {
  revision: number;
  procedure: MakeflowTypes.ProcedureId;
  branches: ProcedureBranchDefinition[];
  options: ProcedureDefinitionOptions;
  form?: ProcedureFormDefinition;
  roles?: ProcedureRole[];
}

// # types

export type ProcedureNodeAssignment =
  | 'none'
  | 'node-owner'
  | MakeflowTypes.ProcedureRoleId;

export interface ProcedureDefinitionOptions {
  description: string | boolean;
  tags?: MakeflowTypes.TagId[];
}

// # role

export interface ProcedureRole {
  id: MakeflowTypes.ProcedureRoleId;
  displayName: string;
}

// ## branching

// ### branch

export interface ProcedureBranchOptions {
  condition?: CustomCondition.LogicalOrConditionGroup;
}

export type ProcedureNodeDefinition =
  | ProcedureBranchesNodeDefinition
  | ProcedureItemsNodeDefinition;

export type ProcedureNodeType = ProcedureNodeDefinition['type'];

export interface ProcedureBranchDefinition {
  id: MakeflowTypes.ProcedureBranchDefinitionId;
  options: ProcedureBranchOptions;
  nodes: ProcedureNodeDefinition[];
}

// ### branches node

export interface ProcedureBranchesNodeDefinition {
  type: 'branches';
  branches: ProcedureBranchDefinition[];
}

// ### items node

export interface ProcedureItemsNodeOptions {
  displayName?: string;
  assignment?: ProcedureNodeAssignment;
  approval?: boolean;
  condition?: CustomCondition.LogicalOrConditionGroup;
  /**
   *  是否忽略对任务是否在进行中的影响
   */
  independent?: boolean;
}

export interface ProcedureItemsNodeDefinition {
  type: 'items';
  id: MakeflowTypes.ProcedureItemsNodeDefinitionId;
  options: ProcedureItemsNodeOptions;
  items: ProcedureItemDefinition[];
  entityMap?: any;
}

// ## items

export type ProcedureItemType = 'indicator' | 'checkable';

export interface ProcedureItemPowerOptions {
  appInstallation: MakeflowTypes.AppInstallationId;
  name: PowerItemName;
  inputs: PowerAppInputOptions[];
  type?: ProcedureItemType;
  fields?: ProcedureDefinitionFieldOptions[];
  actions?: PowerItemActionDefinition[];
}

export interface ProcedureItemOptions {
  name?: string;
  type: ProcedureItemType;
  power?: ProcedureItemPowerOptions;
  description?: RawDraftContentState;
  fields?: ProcedureDefinitionFieldOptions[];
  condition?: CustomCondition.LogicalOrConditionGroup;
}

export interface ProcedureItemDefinitionContent {
  text: string;
  inlineStyleRanges: any[];
  entityRanges: any[];
}

export interface ProcedureItemDefinition {
  id: MakeflowTypes.ProcedureItemDefinitionId;
  options: ProcedureItemOptions;
  content: ProcedureItemDefinitionContent;
}

export interface ProcedureFormOptions {
  displayName?: string;
}

export interface ProcedureFormDefinition {
  fields: ProcedureDefinitionFieldOptions[];
  options?: ProcedureFormOptions;
}

// ## Procedure Field

export interface ProcedureDefinitionFieldOptions {
  id: MakeflowTypes.ProcedureDefinitionFieldId;
  displayName: string;
  definition:
    | BuiltInProcedureFieldType
    | ProcedureDefinitionPowerAppProcedureFieldDefinition;
  readOnly?: boolean;
  required?: boolean;
  /**
   * Output variable name.
   */
  output?: string;
  initialValue?: ResolvableValue;
  data?: unknown;
  dataSourceInputs?: PowerAppInputOptions[];
}

export type ProcedureDefinitionPowerAppProcedureFieldDefinition = (
  | PowerAppProcedureFieldDefinition
  | PowerItemFieldDefinition) & {
  appInstallation: MakeflowTypes.AppInstallationId;
};
