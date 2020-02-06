import {PowerCustomCheckableItem as PowerCustomCheckableItemTypes} from '@makeflow/types';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

export const PowerCustomCheckableItem: FC<{
  value: PowerCustomCheckableItemTypes.Definition;
  onChange(value: PowerCustomCheckableItemTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {displayName, name, hostname, description, path, inputs = []} = config;

  let onPartChange = (
    part: Partial<PowerCustomCheckableItemTypes.Definition>,
  ): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip
          placement="top"
          title={`${fold ? '展开' : '折叠'}自定义检查项`}
        >
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此超级自定义检查项">
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
                  name: value as PowerCustomCheckableItemTypes.Name,
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
          <Form.Item label="请求地址 (hostname)" required>
            <Input
              placeholder="hostname"
              value={hostname}
              onChange={({target: {value}}): void =>
                onPartChange({
                  hostname: value,
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
          <Form.Item label="路径 (path)">
            <Input
              placeholder="path"
              value={path}
              onChange={({target: {value}}): void =>
                onPartChange({
                  path: value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="输入 (inputs - 用,分割)">
            <Input
              placeholder="abc,123"
              value={inputs.join(',')}
              onChange={({target: {value}}): void =>
                onPartChange({
                  inputs: value.split(','),
                })
              }
            />
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
