import {PowerAppInput, PowerItem as PowerItemTypes} from '@makeflow/types';
import {Button, Card, Form, Input, Radio} from 'antd';
import React, {FC} from 'react';

import {ItemField} from './field';
import {Inputs} from './inputs';
import {PowerItemAction} from './power-action';
import {SettingTabs} from './tabs';

export const PowerItem: FC<{
  value: PowerItemTypes.Definition;
  onChange(value: PowerItemTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  let definition = value;

  let {
    displayName,
    name,
    description,
    type,
    inputs = [],
    actions = [],
    fields = [],
  } = definition;

  let onPartChange = (part: Partial<PowerItemTypes.Definition>): void => {
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
              name: value as PowerItemTypes.Name,
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
      <Form.Item label="Type">
        <Radio.Group
          defaultValue="checkable"
          value={type}
          onChange={({target: {value}}) =>
            onPartChange({
              type: value,
            })
          }
        >
          <Radio.Button value="indicator">Indicator</Radio.Button>
          <Radio.Button value="checkable">Checkable</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label="Inputs">
        <SettingTabs<PowerAppInput.Definition>
          primaryKey="name"
          component={Inputs}
          values={inputs}
          onChange={inputs => onPartChange({inputs})}
        />
      </Form.Item>
      <Form.Item label="Fields">
        <SettingTabs<PowerItemTypes.PowerItemFieldDefinition>
          primaryKey={undefined}
          component={ItemField}
          values={fields}
          onChange={fields => {
            onPartChange({
              fields,
            });
          }}
        />
      </Form.Item>
      <Form.Item label="Actions">
        <SettingTabs<PowerItemTypes.ActionDefinition>
          primaryKey="name"
          component={PowerItemAction}
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
