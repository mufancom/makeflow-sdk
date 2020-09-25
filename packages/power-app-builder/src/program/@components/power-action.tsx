import {PowerAppInput, PowerItem, PowerNode} from '@makeflow/types';
import {Button, Card, Form, Input, Table} from 'antd';
import {cloneDeep, findIndex} from 'lodash';
import React, {FC, ReactElement} from 'react';

export const PowerItemAction: FC<{
  value: PowerItem.ActionDefinition;
  onChange(value: PowerItem.ActionDefinition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {displayName, name, inputs, target} = config;

  let onPartChange = (part: Partial<PowerItem.ActionDefinition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card>
      <Form.Item label="Name" required>
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
      <Form.Item label="DisplayName" required>
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
      <Form.Item label="Target">
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
      <Form.Item label="Inputs">
        <PowerAppInputOptions
          value={inputs}
          onChange={inputs => {
            onPartChange({
              inputs,
            });
          }}
        ></PowerAppInputOptions>
      </Form.Item>
      <Button
        type="primary"
        onClick={() => onChange(undefined)}
        style={{float: 'right'}}
      >
        Delete
      </Button>
    </Card>
  );
};

export const PowerNodeAction: FC<{
  value: PowerNode.ActionDefinition;
  onChange(value: PowerNode.ActionDefinition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {displayName, name, inputs} = config;

  let onPartChange = (part: Partial<PowerNode.ActionDefinition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card>
      <Form.Item label="Name" required>
        <Input
          placeholder="name"
          value={name}
          onChange={({target: {value}}) =>
            onPartChange({
              name: value as PowerNode.ActionName,
            })
          }
        />
      </Form.Item>
      <Form.Item label="DisplayName" required>
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
      <Form.Item label="Inputs">
        <PowerAppInputOptions
          value={inputs}
          onChange={inputs => {
            onPartChange({
              inputs,
            });
          }}
        ></PowerAppInputOptions>
      </Form.Item>
      <Button
        type="primary"
        onClick={() => onChange(undefined)}
        style={{float: 'right'}}
      >
        Delete
      </Button>
    </Card>
  );
};

export function PowerAppInputOptions({
  value = [],
  onChange,
}: {
  value: PowerAppInput.Options[] | undefined;
  onChange(value: PowerAppInput.Options[]): void;
}): ReactElement {
  let dataSource = cloneDeep(value);

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
            name: 'New' as PowerAppInput.Name,
            type: 'value',
            value: '',
          });

          onChange(dataSource);
        }}
        type="primary"
        style={{marginBottom: 16}}
      >
        Add Row
      </Button>
      <Table<PowerAppInput.Options>
        rowKey={input => String(findIndex(dataSource, input))}
        size="small"
        pagination={false}
        bordered
        dataSource={dataSource}
        columns={[
          {
            title: 'Name',
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
            title: 'Value',
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
            title: 'Expression',
            dataIndex: 'expression',
            render: (text, input, index) => (
              <Input
                placeholder="Value and Expression are mutually exclusive"
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
            title: 'Actions',
            render: (_text, _input, index) => (
              <Button
                type="link"
                onClick={() => {
                  dataSource.splice(index, 1);
                  onChange(dataSource);
                }}
              >
                Delete
              </Button>
            ),
          },
        ]}
      />
    </>
  );
}
