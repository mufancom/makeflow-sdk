import {PowerAppInput, PowerItem} from '@makeflow/types';
import {Button, Card, Form, Icon, Input, Table, Tooltip} from 'antd';
import _ from 'lodash';
import React, {FC, ReactElement, useState} from 'react';

export const PowerItemAction: FC<{
  value: PowerItem.ActionDefinition;
  onChange(value: PowerItem.ActionDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {displayName, name, inputs, target} = config;

  let onPartChange = (part: Partial<PowerItem.ActionDefinition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}操作`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此内容">
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
                  name: value as PowerItem.ActionName,
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
          <Form.Item label="目标网页 (target)">
            <Input
              placeholder="target"
              value={target}
              onChange={({target: {value}}) =>
                onPartChange({
                  target: value,
                })
              }
            />
          </Form.Item>
          <Form.Item label="输入 (inputs)">
            <PowerAppInputOptions
              value={inputs}
              onChange={inputs => {
                onPartChange({
                  inputs,
                });
              }}
            ></PowerAppInputOptions>
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};

function PowerAppInputOptions({
  value = [],
  onChange,
}: {
  value: PowerAppInput.Options[] | undefined;
  onChange(value: PowerAppInput.Options[]): void;
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
            name: '新建输入' as PowerAppInput.Name,
            type: 'value',
            value: '',
          });

          onChange(dataSource);
        }}
        type="primary"
        style={{marginBottom: 16}}
      >
        新增一行输入
      </Button>
      <Table<PowerAppInput.Options>
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
                    name: value as PowerAppInput.Name,
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
                    type: 'value',
                    value,
                  }),
                )}
              />
            ),
          },
          {
            title: '表达式',
            dataIndex: 'expression',
            render: (text, input, index) => (
              <Input
                placeholder="expression 与 value 互斥"
                value={text}
                onChange={handlerChange(({target: {value}}) =>
                  dataSource.splice(index, 1, {
                    name: input.name,
                    type: 'expression',
                    expression: value,
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
