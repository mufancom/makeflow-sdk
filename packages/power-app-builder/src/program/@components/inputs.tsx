import {PowerAppInput} from '@makeflow/types';
import {Button, Card, Form, Input, Radio} from 'antd';
import React, {FC, useState} from 'react';

export const Inputs: FC<{
  value: PowerAppInput.Definition;
  onChange(value: PowerAppInput.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {displayName, name, bind, default: defaultValue} = config;

  const [useBind, setUseBind] = useState(
    bind ? true : defaultValue ? false : undefined,
  );

  bind = bind || {type: 'value', value: ''};
  defaultValue = defaultValue || {type: 'value', value: ''};

  let onPartChange = (part: Partial<PowerAppInput.Definition>): void => {
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
              name: value as PowerAppInput.Name,
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
      <Form.Item label="Bind Type">
        <Radio.Group
          value={useBind}
          onChange={({target: {value}}) => {
            setUseBind(value);

            if (value === undefined) {
              onPartChange({
                bind: undefined,
                default: undefined,
              });
            } else if (value) {
              onPartChange({
                default: undefined,
              });
            } else {
              onPartChange({
                bind: undefined,
              });
            }
          }}
        >
          <Radio.Button value={undefined}>none</Radio.Button>
          <Radio.Button value={false}>default</Radio.Button>
          <Radio.Button value={true}>bind</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {useBind === false ? (
        <>
          <Form.Item label="Data Type">
            <Radio.Group
              value={defaultValue?.type === 'expression'}
              onChange={({target: {value}}) => {
                onPartChange({
                  default: value
                    ? {type: 'expression', expression: ''}
                    : {type: 'value', value: ''},
                });
              }}
            >
              <Radio.Button value={false}>value</Radio.Button>
              <Radio.Button value={true}>expression</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Value or Expression">
            <Input
              placeholder="default"
              value={
                'value' in defaultValue
                  ? String(defaultValue.value)
                  : 'variable' in defaultValue
                  ? defaultValue?.variable
                  : defaultValue?.expression
              }
              onChange={({target: {value}}) =>
                onPartChange({
                  default:
                    'value' in defaultValue!
                      ? {
                          type: 'value',
                          value,
                        }
                      : {
                          type: 'expression',
                          expression: value,
                        },
                })
              }
            />
          </Form.Item>
        </>
      ) : undefined}

      {useBind === true ? (
        <>
          <Form.Item label="Data Type">
            <Radio.Group
              value={bind?.type === 'expression'}
              onChange={({target: {value}}) => {
                onPartChange({
                  bind: value
                    ? {type: 'expression', expression: ''}
                    : {type: 'value', value: ''},
                });
              }}
            >
              <Radio.Button value={false}>value</Radio.Button>
              <Radio.Button value={true}>expression</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Value or Expression">
            <Input
              placeholder="bind"
              value={
                'value' in bind
                  ? String(bind.value)
                  : 'variable' in bind
                  ? bind?.variable
                  : bind?.expression
              }
              onChange={({target: {value}}) =>
                onPartChange({
                  bind:
                    'value' in bind!
                      ? {
                          type: 'value',
                          value,
                        }
                      : {
                          type: 'expression',
                          expression: value,
                        },
                })
              }
            />
          </Form.Item>
        </>
      ) : undefined}

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
