import {PowerAppConfig} from '@makeflow/types';
import {Button, Card, Form, Input, Radio} from 'antd';
import React, {FC} from 'react';

import {ConfigFieldTypeSelect} from './select';

export const Config: FC<{
  value: PowerAppConfig.Definition;
  onChange(value: PowerAppConfig.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {required, displayName, name, description, field} = config;

  let onPartChange = (part: Partial<PowerAppConfig.Definition>): void => {
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
              name: value as PowerAppConfig.Name,
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
        <ConfigFieldTypeSelect
          placeholder="type"
          // field?: ConfigFieldType | ConfigFieldOptions 暂只支持 ConfigFieldType;
          value={field as PowerAppConfig.ConfigFieldType}
          onChange={(value: PowerAppConfig.ConfigFieldType) =>
            onPartChange({
              field: value,
            })
          }
        ></ConfigFieldTypeSelect>
      </Form.Item>

      <Form.Item label="Required">
        <Radio.Group
          defaultValue="checkable"
          value={required}
          onChange={({target: {value}}) =>
            onPartChange({
              required: value,
            })
          }
        >
          <Radio.Button value={true}>required</Radio.Button>
          <Radio.Button value={false}>optional</Radio.Button>
        </Radio.Group>
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
