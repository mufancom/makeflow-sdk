import {PowerAppInput, PowerItem as PowerItemTypes} from '@makeflow/types';
import {Card, Form, Icon, Input, Radio, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {ItemField} from './field';
import {Inputs} from './inputs';
import {PowerItemAction} from './power-item-action';
import {SettingTabs} from './tabs';

export const PowerItem: FC<{
  value: PowerItemTypes.Definition;
  onChange(value: PowerItemTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value;

  let {
    displayName,
    name,
    description,
    type,
    inputs = [],
    actions = [],
    fields = [],
  } = definition;

  let onPartChange = (part: Partial<PowerItemTypes.Definition>): void => {
    onChange({
      ...definition,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}超级项`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此超级项">
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
                  name: value as PowerItemTypes.Name,
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
          <Form.Item label="类型">
            <Radio.Group
              defaultValue="checkable"
              value={type}
              onChange={({target: {value}}) =>
                onPartChange({
                  type: value,
                })
              }
            >
              <Radio.Button value="indicator">提示项</Radio.Button>
              <Radio.Button value="checkable">检查项</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="输入 (inputs)">
            <SettingTabs<PowerAppInput.Definition>
              primaryKey="name"
              component={Inputs}
              values={inputs}
              onChange={inputs => onPartChange({inputs})}
            ></SettingTabs>
          </Form.Item>
          <Form.Item label="超级项字段 (fields)">
            <SettingTabs<PowerItemTypes.PowerItemFieldDefinition>
              primaryKey={undefined}
              component={ItemField}
              values={fields}
              onChange={fields => {
                onPartChange({
                  fields,
                });
              }}
            ></SettingTabs>
          </Form.Item>
          <Form.Item label="可执行操作 (actions)">
            <SettingTabs<PowerItemTypes.ActionDefinition>
              primaryKey="name"
              component={PowerItemAction}
              values={actions}
              onChange={actions => {
                onPartChange({
                  actions,
                });
              }}
            ></SettingTabs>
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
