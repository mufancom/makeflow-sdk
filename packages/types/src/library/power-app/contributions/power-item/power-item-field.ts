import {
  BaseFieldType,
  ExtendedFieldDefinition,
  FieldDefinition,
} from '../../../field';
import {ResolvableValue} from '../../../value';
import {PowerAppDataSourceOptions} from '../../power-app-data-source';

export type PowerItemFieldDefinition = __PowerItemFieldDefinition<
  FieldDefinition & {
    displayName: string;
    initialValue?: ResolvableValue;
    required?: boolean;
    output?: string;
    data?: unknown;
    dataSource?: PowerAppDataSourceOptions;
  }
>;

interface PowerItemFieldDefinitionBasePartial<TBaseType extends BaseFieldType> {
  base: TBaseType;
}

type __PowerItemFieldDefinition<
  TDefinition
> = TDefinition extends PowerItemFieldDefinitionBasePartial<infer TBaseType>
  ? TDefinition & {
      data?: Extract<ExtendedFieldDefinition, {base: TBaseType}>['data'];
    }
  : never;
