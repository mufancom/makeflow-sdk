import {CompositeValueDescriptor} from './value-descriptor';

export type Resolvable = Value | Variable;

export type ResolvableType = Resolvable['type'];

export interface Value {
  type: 'value';
  value: CompositeValueDescriptor;
}

export interface Variable {
  type: 'variable';
  variable: string;
}
