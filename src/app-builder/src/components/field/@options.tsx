import {Field as FieldTypes} from '@makeflow/types';
import {Form, Switch} from 'antd';
import React, {FC} from 'react';

interface OptionsProps<
  TDefinition extends FieldTypes.BaseFieldTypesDefinition
> {
  options: TDefinition['options'];
  onChange(options: TDefinition['options']): void;
}

const InputBaseFieldOptions: FC<OptionsProps<
  FieldTypes.InputBaseFieldTypesDefinition
>> = ({options: {secret}, onChange}) => (
  <Form.Item label="输入时不可见 (密码类型)">
    <Switch checked={secret} onChange={secret => onChange({secret})} />
  </Form.Item>
);

const BaseFieldOptionsDict: {[key: string]: FC<OptionsProps<any>>} = {
  input: InputBaseFieldOptions,
  'input-array': InputBaseFieldOptions,
};

export function getOptions(
  base: FieldTypes.BaseFieldType,
): FC<OptionsProps<FieldTypes.InputBaseFieldTypesDefinition>> | undefined {
  return BaseFieldOptionsDict[base];
}
