import {PowerAppPage} from '@makeflow/types';
import {Button, Card, Form, Input, Switch} from 'antd';
import React, {FC} from 'react';

export const Page: FC<{
  value: PowerAppPage.Definition;
  onChange(value: PowerAppPage.Definition | undefined): void;
}> = ({value, onChange}) => {
  let definition = value;

  let {displayName, name, description, icon, pinned} = definition;

  let onPartChange = (part: Partial<PowerAppPage.Definition>): void => {
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
              name: value as PowerAppPage.Name,
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

      <Form.Item label="Icon">
        <Input
          placeholder="image url start with http(s) .."
          value={icon}
          onChange={({target: {value}}) =>
            onPartChange({
              icon: value,
            })
          }
        />
      </Form.Item>

      <Form.Item label="Pinned">
        <Switch
          title="Pinned in Tabs"
          checked={pinned}
          onChange={pinned => onPartChange({pinned})}
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
