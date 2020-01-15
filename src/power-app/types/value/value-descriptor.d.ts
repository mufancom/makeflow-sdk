import {
  AppInstallationRef,
  FileId,
  ProcedureRef,
  TagRef,
  TaskRef,
  TeamRef,
  UserRef,
} from '@makeflow/types-nominal';

export type CompositeValueDescriptor =
  | ValueDescriptor
  | (ValueDescriptor | undefined)[]
  | undefined;

export type ValueDescriptor =
  | PrimitiveValueDescriptor
  | NonPrimitiveValueDescriptor;

export type PrimitiveValueDescriptor = string | number | boolean;

export type NonPrimitiveValueDescriptor =
  | TaskRef
  | UserRef
  | TeamRef
  | TagRef
  | AppInstallationRef
  | ProcedureRef
  | RawValueDescriptor<object>
  | FileValueDescriptor;

export interface RawValueDescriptor<T extends object> {
  type: 'raw';
  value: T;
}

export interface FileValueDescriptor {
  type: 'file';
  id: FileId;
}
