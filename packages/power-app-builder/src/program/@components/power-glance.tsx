import {
  GlanceReport,
  PowerAppConfig,
  PowerAppInput,
  PowerGlance as PowerGlanceTypes,
} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC} from 'react';

import {Config} from './config';
import {Inputs} from './inputs';
import {Report} from './report';
import {SettingTabs} from './tabs';

export const PowerGlance: FC<{
  value: PowerGlanceTypes.Definition;
  onChange(value: PowerGlanceTypes.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {
    displayName,
    name,
    description,
    inputs = [],
    configs = [],
    reports = [],
  } = config;

  let onPartChange = (part: Partial<PowerGlanceTypes.Definition>): void => {
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
              name: value as PowerGlanceTypes.Name,
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
      <Form.Item label="Inputs">
        <SettingTabs<PowerAppInput.Definition>
          primaryKey="name"
          component={Inputs}
          values={inputs}
          onChange={inputs => onPartChange({inputs})}
        ></SettingTabs>
      </Form.Item>
      <Form.Item label="Configs">
        <SettingTabs<PowerAppConfig.Definition>
          primaryKey="name"
          component={Config}
          values={configs}
          onChange={configs => onPartChange({configs})}
        ></SettingTabs>
      </Form.Item>
      <Form.Item label="Reports">
        <SettingTabs<GlanceReport.Definition>
          primaryKey="name"
          displayKey="title"
          component={Report}
          values={reports}
          onChange={reports => onPartChange({reports})}
        ></SettingTabs>
      </Form.Item>
      <Form.Item label="Matcher">Coming soon ..</Form.Item>
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
