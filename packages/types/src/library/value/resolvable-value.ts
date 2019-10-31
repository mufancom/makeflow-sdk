import {CompositeValueDescriptor} from './value-descriptor';

export type ResolvableValue = Value | Variable;

export type ResolvableValueType = ResolvableValue['type'];

export interface Value {
  type: 'value';
  value: CompositeValueDescriptor;
}

export interface Variable {
  type: 'variable';
  variable: string;
}
