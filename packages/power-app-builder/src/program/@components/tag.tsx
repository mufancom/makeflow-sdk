import {PowerApp} from '@makeflow/types';
import {Button, Card, Form, Icon, Input, Switch, Table, Tooltip} from 'antd';
import _ from 'lodash';
import React, {FC, ReactElement, useState} from 'react';
import {BlockPicker} from 'react-color';

const DEFAULT_TAG_COLOR_DICT = {
  blue: '#296dff',
  cyan: '#32cdec',
  teal: '#00a19a',
  'light-green': '#81cb5f',
  lime: '#b6ac19',
  amber: '#ffae11',
  orange: '#fb7b45',
  red: '#fc471e',
  purple: '#a12fb5',
  'deep-purple': '#673ab7',
  indigo: '#3949ab',
  gray: '#9ba0ab',
};

const DEFAULT_TAG_COLORS = Object.values(DEFAULT_TAG_COLOR_DICT);

export const Tag: FC<{
  value: PowerApp.DefinitionTagResource;
  onChange(value: PowerApp.DefinitionTagResource | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {
    displayName,
    name,
    color = '#296dff',
    variables,
    abstract,
    super: superTag,
  } = config;

  let onPartChange = (part: Partial<PowerApp.DefinitionTagResource>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}标签`}>
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此标签">
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
                  name: value as PowerApp.DefinitionResourceName,
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
          <Form.Item label="颜色" required>
            <BlockPicker
              triangle="hide"
              width="80%"
              colors={DEFAULT_TAG_COLORS}
              color={color}
              onChange={({hex}) => onPartChange({color: hex})}
            ></BlockPicker>
          </Form.Item>
          <Form.Item label="携带变量">
            <TagVariables
              value={variables}
              onChange={variables =>
                onPartChange({
                  variables,
                })
              }
            ></TagVariables>
          </Form.Item>
          <Form.Item label="抽象标签">
            <Switch
              title="是否是抽象标签"
              checked={abstract}
              onChange={abstract => onPartChange({abstract})}
            />
          </Form.Item>
          <Form.Item label="父标签">
            <Input
              placeholder="super"
              value={superTag}
              onChange={({target: {value}}): void =>
                onPartChange({
                  super: value as PowerApp.DefinitionResourceName,
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

function TagVariables({
  value = [],
  onChange,
}: {
  value: PowerApp.TagVariable[] | undefined;
  onChange(value: PowerApp.TagVariable[]): void;
}): ReactElement {
  let dataSource = _.cloneDeep(value);

  function handlerChange(
    fn: (event: React.ChangeEvent<HTMLInputElement>) => void,
  ): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return event => {
      fn.call(undefined, event);
      onChange(dataSource);
    };
  }

  return (
    <>
      <Button
        onClick={() => {
          dataSource.push({
            name: '新增变量内容',
            value: '',
          });

          onChange(dataSource);
        }}
        type="primary"
        style={{marginBottom: 16}}
      >
        新增一行输入
      </Button>
      <Table<PowerApp.TagVariable>
        rowKey={input => String(_.findIndex(dataSource, input))}
        size="small"
        pagination={false}
        bordered
        dataSource={dataSource}
        columns={[
          {
            title: '名称',
            dataIndex: 'name',
            render: (text, input, index) => (
              <Input
                placeholder="name"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  dataSource.splice(index, 1, {
                    ...input,
                    name: value,
                  }),
                )}
              />
            ),
          },
          {
            title: '值',
            dataIndex: 'value',
            render: (text, input, index) => (
              <Input
                placeholder="value"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  dataSource.splice(index, 1, {
                    name: input.name,
                    value,
                  }),
                )}
              />
            ),
          },
          {
            title: '操作',
            render: (_text, _input, index) => (
              <Button
                type="link"
                onClick={() => {
                  dataSource.splice(index, 1);
                  onChange(dataSource);
                }}
              >
                删除
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
