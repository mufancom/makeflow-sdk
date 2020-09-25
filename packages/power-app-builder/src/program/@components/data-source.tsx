import {PowerAppDataSource} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

import {PowerAppInputOptions} from './power-action';

export const DateSource: FC<{
  value: PowerAppDataSource.Definition;
  onChange(value: PowerAppDataSource.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {name, inputs} = config;

  let onPartChange = (part: Partial<PowerAppDataSource.Definition>): void => {
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
              name: value as PowerAppDataSource.Name,
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
