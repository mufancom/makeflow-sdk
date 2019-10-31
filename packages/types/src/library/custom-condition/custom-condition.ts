import {CompositeValueDescriptor} from '../value';

export type OperatorName =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'in'
  | '!in'
  | 'includes'
  | '!includes';

export type Type =
  | 'unknown'
  | 'string'
  | 'string[]'
  | 'number'
  | 'number[]'
  | 'boolean'
  | 'user'
  | 'user[]'
  | 'general-user'
  | 'general-user[]'
  | 'tag'
  | 'tag[]'
  | 'procedure'
  | 'procedure[]'
  | 'task-stage'
  | 'task-stage[]';

export interface OperatorDefinition {
  name: OperatorName;
  displayName: string;
  left: Type;
  right: Type;
  compare(x: CompositeValueDescriptor, y: CompositeValueDescriptor): boolean;
}

export interface IOperant {
  type: Type;
}

export interface VariableOperant extends IOperant {
  variable: string;
}

export interface ValueOperant extends IOperant {
  value: CompositeValueDescriptor;
}

export type Operant = VariableOperant | ValueOperant;

export interface Condition {
  operator: OperatorName;
  left: Operant;
  right: Operant;
}

export type LogicalAndConditionGroup = Condition[];

export type LogicalOrConditionGroup = LogicalAndConditionGroup[];

export type EvaluateResolver = (variable: string) => CompositeValueDescriptor;
