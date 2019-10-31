export type CompositeValueDescriptor =
  | ValueDescriptor
  | ValueDescriptor[]
  | undefined;

export type ValueDescriptor =
  | PrimitiveValueDescriptor
  | NonPrimitiveValueDescriptor;

export type PrimitiveValueDescriptor = string | number | boolean;

export type NonPrimitiveValueDescriptor =
  | MakeflowTypes.SyncableRefType
  | RawValueDescriptor<object>
  | FileValueDescriptor;

export interface RawValueDescriptor<T extends object> {
  type: 'raw';
  value: T;
}

export interface FileValueDescriptor {
  type: 'file';
  id: MakeflowTypes.FileId;
}

export type ValueDescriptorBuildSourceType = string | number | boolean | object;

export type __ValueDescriptorType<
  T extends ValueDescriptorBuildSourceType | undefined
> = T extends MakeflowTypes.ISyncableObject
  ? MakeflowTypes.SyncableRef<T>
  : T extends object
  ? RawValueDescriptor<T>
  : T;

export type __ArrayValueDescriptorType<
  T extends ValueDescriptorBuildSourceType[]
> = {
  [TIndex in keyof T]: TIndex extends number
    ? __ValueDescriptorType<T[TIndex]>
    : number;
};
