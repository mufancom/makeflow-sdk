import {PowerApp, Procedure as ProcedureTypes} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

const {TextArea} = Input;

export const Procedure: FC<{
  value: PowerApp.DefinitionProcedureResource;
  onChange(value: PowerApp.DefinitionProcedureResource | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {displayName, name, revision} = config;

  let onPartChange = (
    part: Partial<PowerApp.DefinitionProcedureResource>,
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

      <Form.Item label="Procedure Definition" required>
        <TextArea
          value={JSON.stringify(revision)}
          placeholder="Please paste the process definition, it is recommended to use the makeflow process editor"
          rows={4}
          onChange={({target: {value}}) =>
            onPartChange({
              revision: getRevision(value),
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

function getRevision(value: string): ProcedureTypes.Definition | undefined {
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}
