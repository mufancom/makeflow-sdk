import {
  PowerAppProcedureFieldDefinition,
  PowerAppProcedureFieldType,
} from '../power-app';

import {
  BuiltInProcedureFieldDefinition,
  BuiltInProcedureFieldType,
} from './built-in-procedure-field';

export type ProcedureFieldType =
  | BuiltInProcedureFieldType
  | PowerAppProcedureFieldType;

export type ProcedureFieldDefinition =
  | BuiltInProcedureFieldDefinition
  | PowerAppProcedureFieldDefinition;
