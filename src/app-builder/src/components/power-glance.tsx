import {
  PowerAppConfig,
  PowerAppInput,
  PowerGlance as PowerGlanceTypes,
} from '@makeflow/types';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {Config} from './config';
import {Inputs} from './inputs';
import {SettingTabs} from './tabs';

export const PowerGlance: FC<{
  value: PowerGlanceTypes.Definition;
  onChange(value: PowerGlanceTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {displayName, name, description, inputs = [], configs = []} = config;

  let onPartChange = (part: Partial<PowerGlanceTypes.Definition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}设置`}>
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此超级概览">
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
              onChange={({target: {value}}): void =>
                onPartChange({
                  name: value as PowerGlanceTypes.Name,
                })
              }
            />
          </Form.Item>
          <Form.Item label="展示名称 (别名)" required>
            <Input
              placeholder="displayName"
              value={displayName}
              onChange={({target: {value}}): void =>
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
              onChange={({target: {value}}): void =>
                onPartChange({
                  description: value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="输入 (inputs)">
            <SettingTabs<PowerAppInput.Definition>
              component={Inputs}
              values={inputs}
              onChange={inputs => onPartChange({inputs})}
            ></SettingTabs>
          </Form.Item>
          <Form.Item label="配置 (configs)">
            <SettingTabs<PowerAppConfig.Definition>
              component={Config}
              values={configs}
              onChange={configs => onPartChange({configs})}
            ></SettingTabs>
          </Form.Item>
          <Form.Item label="报表 (reports)">暂未开放</Form.Item>
          <Form.Item label="匹配源 (matcher)">暂未开放</Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
