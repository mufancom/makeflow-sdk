import {Field as FieldTypes, Procedure} from '@makeflow/types';
import {PowerAppProcedureFieldType} from '@makeflow/types/procedure';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {FieldIconTypeSelect, FieldTypeSelect} from '../field-type-select';

import {getOptions} from './@options';

export const Field: FC<{
  value: Procedure.PowerAppProcedureFieldDefinition;
  onChange(value: Procedure.PowerAppProcedureFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value;

  let {
    type,
    base,
    options,
    displayName,
    icon,
    // initialData,
    // data,
    // dataSource,
  } = definition;

  let Options = getOptions(base);

  let onPartChange = (
    part: Partial<Procedure.PowerAppProcedureFieldDefinition>,
  ): void => {
    onChange({
      ...definition,
      // ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}字段`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此字段">
          <Icon
            type="delete"
            key="delete"
            onClick={() => onChange(undefined)}
          />
        </Tooltip>,
      ]}
    >
      {!fold ? (
        <>
          <Form.Item label="自定义类型 (英文)" required>
            <Input
              placeholder="type"
              value={type}
              onChange={({target: {value}}) =>
                onPartChange({
                  type: value as PowerAppProcedureFieldType,
                })
              }
            />
          </Form.Item>

          <Form.Item label="展示名称 (别名)" required>
            <Input
              placeholder="displayName"
              value={displayName}
              onChange={({target: {value}}) =>
                onPartChange({
                  displayName: value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="基础字段类型" required>
            <FieldTypeSelect
              placeholder="base"
              value={base}
              onChange={value =>
                onPartChange({
                  base: value as FieldTypes.BaseFieldType,
                })
              }
            ></FieldTypeSelect>
          </Form.Item>
          <Form.Item label="字段图标" required>
            <FieldIconTypeSelect
              placeholder="icon"
              value={icon}
              onChange={value =>
                onPartChange({
                  icon: value as Procedure.ProcedureFieldIconName,
                })
              }
            ></FieldIconTypeSelect>
          </Form.Item>
          {Options ? (
            <Options
              options={options ?? {}}
              onChange={options =>
                onPartChange({
                  options,
                })
              }
            ></Options>
          ) : (
            undefined
          )}
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
