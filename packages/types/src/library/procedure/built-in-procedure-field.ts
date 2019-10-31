import {IProcedureFieldDefinition} from './procedure-field';

export type BuiltInProcedureFieldType =
  | 'text'
  | 'password'
  | 'select'
  | 'radio'
  | 'user'
  | 'team'
  | 'team-array'
  | 'procedure-array'
  | 'tag-array'
  | 'file';

export type BuiltInProcedureFieldDefinition = IProcedureFieldDefinition & {
  type: BuiltInProcedureFieldType;
};
