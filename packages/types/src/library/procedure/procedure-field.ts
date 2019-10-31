import {
  BaseFieldType,
  ExtendedFieldDefinition,
  FieldDefinition,
} from '../field';

export type ProcedureFieldIconName =
  | 'text'
  | 'password'
  | 'select'
  | 'radio'
  | 'user'
  | 'team'
  | 'procedure'
  | 'tag'
  | 'file';

export type IProcedureFieldDefinition = __ProcedureFieldDefinition<
  FieldDefinition & {
    displayName: string;
    icon: ProcedureFieldIconName;
    initialData?: unknown;
  }
>;

interface ProcedureFieldDefinitionBasePartial<TBaseType extends BaseFieldType> {
  base: TBaseType;
}

type __ProcedureFieldDefinition<
  TDefinition
> = TDefinition extends ProcedureFieldDefinitionBasePartial<infer TBaseType>
  ? TDefinition & {
      initialData?: Extract<ExtendedFieldDefinition, {base: TBaseType}>['data'];
    }
  : never;
