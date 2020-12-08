import {Field as FieldTypes} from '@makeflow/types';
import {Form, Switch} from 'antd';
import React, {FC} from 'react';

interface OptionsProps<TDefinition extends FieldTypes.BaseFieldTypes> {
  options: TDefinition['options'];
  onChange(options: TDefinition['options']): void;
}

const InputBaseFieldOptions: FC<OptionsProps<
  FieldTypes.InputBaseFieldTypes
>> = ({options: {secret}, onChange}) => (
  <Form.Item label="Secret Mode">
    <Switch checked={secret} onChange={secret => onChange({secret})} />
  </Form.Item>
);

const SelectBaseFieldOptions: FC<OptionsProps<
  FieldTypes.SelectBaseFieldTypes
>> = ({options: {searchable}, onChange}) => (
  <Form.Item label="Searchable">
    <Switch
      checked={searchable}
      onChange={searchable => onChange({searchable})}
    />
  </Form.Item>
);

const BaseFieldOptionsDict: {
  [key in FieldTypes.BaseFieldType]: FC<OptionsProps<any>> | undefined;
} = {
  input: InputBaseFieldOptions,
  'input-array': InputBaseFieldOptions,
  select: SelectBaseFieldOptions,
  date: undefined,
  file: undefined,
  'file-array': undefined,
  link: undefined,
  'procedure-array': undefined,
  radio: undefined,
  'select-array': undefined,
  table: undefined,
  'tag-array': undefined,
  team: undefined,
  'team-array': undefined,
  textarea: undefined,
  user: undefined,
  'user-array': undefined,
  'cascading-select': undefined,
  location: undefined,
};

export function getOptions(
  base: FieldTypes.BaseFieldType,
): FC<OptionsProps<FieldTypes.InputBaseFieldTypes>> | undefined {
  return BaseFieldOptionsDict[base];
}
