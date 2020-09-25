import {PowerCustomCheckableItem as PowerCustomCheckableItemTypes} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

export const PowerCustomCheckableItem: FC<{
  value: PowerCustomCheckableItemTypes.Definition;
  onChange(value: PowerCustomCheckableItemTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
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
    <Card>
      <Form.Item label="Name" required>
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
      <Form.Item label="Hostname" required>
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
      <Form.Item label="Description">
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
      <Form.Item label="Path">
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
      <Form.Item label="Inputs, split with ','">
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
