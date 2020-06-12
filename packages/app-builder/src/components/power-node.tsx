import {PowerAppInput, PowerNode as PowerNodeTypes} from '@makeflow/types';
import {Card, Form, Icon, Input,  Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {Inputs} from './inputs';
import {PowerNodeAction} from './power-action';
import {SettingTabs} from './tabs';

export const PowerNode: FC<{
  value: PowerNodeTypes.Definition;
  onChange(value: PowerNodeTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value;

  let {
    displayName,
    name,
    description,
    inputs = [],
    actions = [],
  } = definition;

  let onPartChange = (part: Partial<PowerNodeTypes.Definition>): void => {
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
        <Tooltip placement="top" title="删除此超级节点">
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
                  name: value as PowerNodeTypes.Name,
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

          <Form.Item label="输入 (inputs)">
            <SettingTabs<PowerAppInput.Definition>
              primaryKey="name"
              component={Inputs}
              values={inputs}
              onChange={inputs => onPartChange({inputs})}
            />
          </Form.Item>

          <Form.Item label="可执行操作 (actions)">
            <SettingTabs<PowerNodeTypes.ActionDefinition>
              primaryKey="name"
              component={PowerNodeAction}
              values={actions}
              onChange={actions => {
                onPartChange({
                  actions,
                });
              }}
            />
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
