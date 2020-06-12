import {PowerAppConfig} from '@makeflow/types';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {ConfigFieldTypeSelect} from './select';

export const Config: FC<{
  value: PowerAppConfig.Definition;
  onChange(value: PowerAppConfig.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {required, displayName, name, description, field} = config;

  let onPartChange = (part: Partial<PowerAppConfig.Definition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      className={required ? 'required' : ''}
      actions={[
        <Tooltip
          placement="top"
          title={`${required ? '取消' : '设置为'}安装前必填`}
        >
          <Icon
            type="fire"
            theme={required ? 'filled' : 'outlined'}
            style={{color: '#009960'}}
            onClick={() =>
              onPartChange({
                required: !required,
              })
            }
          />
        </Tooltip>,
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}设置`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此设置">
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
          <Form.Item label="名称 (英文)" required>
            <Input
              placeholder="name"
              value={name}
              onChange={({target: {value}}) =>
                onPartChange({
                  name: value as PowerAppConfig.Name,
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
          <Form.Item label="描述">
            <Input
              placeholder="description"
              value={description}
              onChange={({target: {value}}) =>
                onPartChange({
                  description: value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="字段类型">
            <ConfigFieldTypeSelect
              placeholder="type"
              // field?: ConfigFieldType | ConfigFieldOptions 暂只支持 ConfigFieldType;
              value={field as string}
              onChange={value =>
                onPartChange({
                  field: value as PowerAppConfig.ConfigFieldType,
                })
              }
            ></ConfigFieldTypeSelect>
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
