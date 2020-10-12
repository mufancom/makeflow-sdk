import {
  Field,
  GlanceReport,
  PowerAppConfig,
  ProcedureField,
} from '@makeflow/types';
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
    'search-select',
    'radio',
    'user',
    'user-array',
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
    'textarea',
    'table',
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

export const ConfigFieldTypeSelect: FC<SelectProps<
  PowerAppConfig.ConfigFieldType
>> = props => {
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

export const FieldTypeSelect: FC<SelectProps<Field.BaseFieldType>> = props => {
  const types: Field.BaseFieldType[] = [
    'input',
    'input-array',
    'date',
    'select',
    'select-array',
    'radio',
    'user',
    'user-array',
    'team',
    'team-array',
    'procedure-array',
    'tag-array',
    'file',
    'file-array',
    'link',
    'table',
    'textarea',
  ];

  return (
    <Select defaultValue="input" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const FieldIconTypeSelect: FC<SelectProps<
  ProcedureField.IconName
>> = props => {
  const types: ProcedureField.IconName[] = [
    'text',
    'password',
    'textarea',
    'date',
    'select',
    'search',
    'radio',
    'user',
    'team',
    'procedure',
    'tag',
    'file',
    'link',
    'table',
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

export const ReportIconTypeSelect: FC<SelectProps<
  GlanceReport.IconName
>> = props => {
  const types: GlanceReport.IconName[] = [
    'chart-bar',
    'chart-pie',
    'star',
    'in-progress',
    'chart-line',
    'chart-area',
    'bug',
    'table',
  ];

  return (
    <Select defaultValue="star" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};

export const ElementTypeSelect: FC<SelectProps<
  GlanceReport.ElementType
>> = props => {
  const types: GlanceReport.ElementType[] = [
    'number',
    'text-line',
    'number-per-user',
    'chart',
    'chart-per-user',
    'table',
  ];

  return (
    <Select defaultValue="number" {...props}>
      {types.map(type => (
        <Option key={type} value={type}>
          {type}
        </Option>
      ))}
    </Select>
  );
};
