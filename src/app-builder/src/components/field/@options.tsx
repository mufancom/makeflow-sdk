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
    />
  </Form.Item>
);
export const InputArrayBaseFieldOptions = InputBaseFieldOptions;

export const DateBaseFieldOptions = undefined;
export const SelectBaseFieldOptions = undefined;
export const SelectArrayBaseFieldOptions = undefined;
export const RadioBaseFieldOptions = undefined;
export const UserBaseFieldOptions = undefined;
export const TeamBaseFieldOptions = undefined;
export const TeamArrayBaseFieldOptions = undefined;
export const ProcedureArrayBaseFieldOptions = undefined;
export const TagArrayBaseFieldOptions = undefined;
export const FileBaseFieldOptions = undefined;
export const FileArrayBaseFieldOptions = undefined;
export const LinkBaseFieldOptions = undefined;

export function getOptions(
  base: FieldTypes.BaseFieldType,
): FC<OptionsProps<FieldTypes.InputBaseFieldTypesDefinition>> | undefined {
  switch (base) {
    case 'input':
      return InputBaseFieldOptions;
    case 'input-array':
      return InputArrayBaseFieldOptions;
    default:
      return undefined;
  }
}
