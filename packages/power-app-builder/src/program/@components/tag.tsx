import {PowerApp} from '@makeflow/types';
import {Button, Card, Form, Input, Switch, Table} from 'antd';
import _ from 'lodash';
import React, {FC, ReactElement} from 'react';
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
    <Card>
      <Form.Item label="Name" required>
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
      <Form.Item label="DisplayName" required>
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
      <Form.Item label="Color" required>
        <BlockPicker
          triangle="hide"
          width="80%"
          colors={DEFAULT_TAG_COLORS}
          color={color}
          onChange={({hex}) => onPartChange({color: hex})}
        ></BlockPicker>
      </Form.Item>
      <Form.Item label="Variables">
        <TagVariables
          value={variables}
          onChange={variables =>
            onPartChange({
              variables,
            })
          }
        ></TagVariables>
      </Form.Item>
      <Form.Item label="Abstract Setting">
        <Switch
          title="Abstract"
          checked={abstract}
          onChange={abstract => onPartChange({abstract})}
        />
      </Form.Item>
      <Form.Item label="Super tag">
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
            name: 'New',
            value: '',
          });

          onChange(dataSource);
        }}
        type="primary"
        style={{marginBottom: 16}}
      >
        Add New
      </Button>
      <Table<PowerApp.TagVariable>
        rowKey={input => String(_.findIndex(dataSource, input))}
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
                    name: value,
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
                    value,
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
