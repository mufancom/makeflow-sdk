import {GlanceData, GlanceReport} from '@makeflow/types';
import {Button, Card, Form, Input} from 'antd';
import React, {FC, ReactNode} from 'react';

import {SubFormItem} from './common';
import {ElementTypeSelect} from './select';

export const Element: FC<{
  value: GlanceReport.ElementDefinition;
  onChange(value: GlanceReport.ElementDefinition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {type, dataName, gird} = config;

  let onPartChange = (part: Partial<GlanceReport.ElementDefinition>): void => {
    onChange({
      ...config,
      ...part,
    } as any);
  };

  let Options: ReactNode = <></>;

  if (config.type === 'text-line') {
    Options = TextLineOptions(config.options, options =>
      onPartChange({options}),
    );
  } else if (config.type === 'number' || config.type === 'number-per-user') {
    Options = NumberOptions(config.options, options => onPartChange({options}));
  } else {
    if (!config.options) {
      onPartChange({options: {}});
    }
  }

  return (
    <Card>
      <Form.Item label="Element Type" required>
        <ElementTypeSelect
          value={type}
          onChange={(value: GlanceReport.ElementType) =>
            onPartChange({
              type: value,
            })
          }
        ></ElementTypeSelect>
      </Form.Item>
      <Form.Item label="DataName">
        <Input
          placeholder="dataName"
          value={dataName}
          onChange={({target: {value}}): void =>
            onPartChange({
              dataName: value as GlanceData.DataName,
            })
          }
        />
      </Form.Item>
      {Options}

      <Form.Item label="Gird" required>
        <SubFormItem>
          Column
          <Input
            placeholder="column"
            value={gird?.column}
            onChange={({target: {value}}): void =>
              onPartChange({
                gird: {...gird, column: value},
              })
            }
          />
        </SubFormItem>

        <SubFormItem required>
          Row
          <Input
            placeholder="row"
            value={gird?.row}
            onChange={({target: {value}}): void =>
              onPartChange({
                gird: {...gird, row: value},
              })
            }
          />
        </SubFormItem>
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

function TextLineOptions(
  options: GlanceReport.TextLineElementOptions,
  onChange: (options: GlanceReport.TextLineElementOptions) => void,
): ReactNode {
  let {title} = options || {};

  return (
    <Form.Item label="Title" required>
      <Input
        placeholder="options.title"
        value={title}
        onChange={({target: {value}}): void =>
          onChange({
            ...options,
            title: value,
          })
        }
      />
    </Form.Item>
  );
}

function NumberOptions(
  options:
    | GlanceReport.NumberElementOptions
    | GlanceReport.NumberPerUserElementOptions,
  onChange: (
    options:
      | GlanceReport.NumberElementOptions
      | GlanceReport.NumberPerUserElementOptions,
  ) => void,
): ReactNode {
  let {title, unit} = options || {};

  return (
    <>
      <Form.Item label="Title">
        <Input
          placeholder="options.title"
          value={title}
          onChange={({target: {value}}): void =>
            onChange({
              ...options,
              title: value,
            })
          }
        />
      </Form.Item>
      <Form.Item label="Unit">
        <Input
          placeholder="options.unit"
          value={unit}
          onChange={({target: {value}}): void =>
            onChange({
              ...options,
              unit: value,
            })
          }
        />
      </Form.Item>
    </>
  );
}
