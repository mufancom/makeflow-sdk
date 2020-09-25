import {PowerAppInput, PowerNode as PowerNodeTypes} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

import {Inputs} from './inputs';
import {PowerNodeAction} from './power-action';
import {SettingTabs} from './tabs';

export const PowerNode: FC<{
  value: PowerNodeTypes.Definition;
  onChange(value: PowerNodeTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  let definition = value;

  let {displayName, name, description, inputs = [], actions = []} = definition;

  let onPartChange = (part: Partial<PowerNodeTypes.Definition>): void => {
    onChange({
      ...definition,
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
              name: value as PowerNodeTypes.Name,
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
      <Form.Item label="Description">
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

      <Form.Item label="Inputs">
        <SettingTabs<PowerAppInput.Definition>
          primaryKey="name"
          component={Inputs}
          values={inputs}
          onChange={inputs => onPartChange({inputs})}
        />
      </Form.Item>

      <Form.Item label="Actions">
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
