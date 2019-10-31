import {FieldDefinition} from '../../field';

export type PowerAppConfigFieldType =
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

export type PowerAppConfigFieldDefinition = FieldDefinition & {
  type: PowerAppConfigFieldType;
};

export interface IPowerAppConfigDefinitionFieldOptions<
  TType extends PowerAppConfigFieldType,
  TData = never
> {
  type: TType;
  data?: TData;
}
