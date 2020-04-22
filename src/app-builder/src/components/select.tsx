import {PowerAppConfig, ProcedureField} from '@makeflow/types';
import {Select} from 'antd';
import {SelectProps} from 'antd/lib/select';
import React, {FC} from 'react';

const {Option} = Select;

export const BuiltInProcedureFieldSelect: FC<SelectProps<
  ProcedureField.BuiltInProcedureFieldType
>> = props => {
  const types: ProcedureField.BuiltInProcedureFieldType[] = [
    'date',
    'select',
    'select-array',
    'radio',
    'user',
    'team',
    'team-array',
    'procedure-array',
    'tag-array',
    'file',
    'file-array',
    'link',
    'text',
    'text-array',
    'password',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const ConfigFieldTypeSelect: FC<SelectProps> = props => {
  const types: PowerAppConfig.ConfigFieldType[] = [
    'text',
    'password',
    'select',
    'radio',
    'user',
    'team',
    'team-array',
    'procedure-array',
    'tag-array',
    'file',
    'date',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const FieldTypeSelect: FC<SelectProps> = props => {
  const types = [
    'input',
    'input-array',
    'date',
    'select',
    'select-array',
    'radio',
    'user',
    'team',
    'team-array',
    'procedure-array',
    'tag-array',
    'file',
    'file-array',
    'link',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const FieldIconTypeSelect: FC<SelectProps> = props => {
  const types = [
    'text',
    'password',
    'date',
    'select',
    'radio',
    'user',
    'team',
    'procedure',
    'tag',
    'file',
    'link',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const ReportIconTypeSelect: FC<SelectProps> = props => {
  const types = [
    'chart-bar',
    'chart-pie',
    'star',
    'in-progress',
    'chart-line',
    'chart-area',
    'bug',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const ElementTypeSelect: FC<SelectProps> = props => {
  const types = [
    'number',
    'text-line',
    'number-per-user',
    'chart',
    'chart-per-user',
  ];

  return (
    <Select defaultValue="text" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};
