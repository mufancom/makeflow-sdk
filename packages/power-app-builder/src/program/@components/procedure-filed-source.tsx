import {ProcedureFieldSource as ProcedureFieldSourceTypes} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

export const ProcedureFieldSource: FC<{
  value: ProcedureFieldSourceTypes.Definition;
  onChange(value: ProcedureFieldSourceTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {name, displayName} = config;

  let onPartChange = (
    part: Partial<ProcedureFieldSourceTypes.Definition>,
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
          onChange={({target: {value}}) =>
            onPartChange({
              name: value as ProcedureFieldSourceTypes.Name,
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
      <span style={{opacity: name ? 0.6 : 0}}>
        Tip: Fields request url will be{' '}
        <b>[HookBaseURL]/procedure-field/{name}</b>
      </span>
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
