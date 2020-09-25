import {GlanceReport} from '@makeflow/types';
import {Button, Card, Form, Input, Slider} from 'antd';
import React, {FC} from 'react';

import {SubFormItem} from './common';
import {Element} from './element';
import {ReportIconTypeSelect} from './select';
import {SettingTabsWithoutTitle} from './tabs';

export const Report: FC<{
  value: GlanceReport.Definition;
  onChange(value: GlanceReport.Definition | undefined): void;
}> = ({value, onChange}) => {
  let config = value;

  let {
    name,
    title,
    description,
    icon,
    elements,
    defaultGlanceLayout,
    layout,
  } = config;

  let onPartChange = (part: Partial<GlanceReport.Definition>): void => {
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
              name: value as GlanceReport.Name,
            })
          }
        />
      </Form.Item>
      <Form.Item label="Title" required>
        <Input
          placeholder="title"
          value={title}
          onChange={({target: {value}}): void =>
            onPartChange({
              title: value,
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

      <Form.Item label="Icon">
        <ReportIconTypeSelect
          placeholder="icon"
          value={icon}
          onChange={(value: GlanceReport.IconName) =>
            onPartChange({
              icon: value,
            })
          }
        ></ReportIconTypeSelect>
      </Form.Item>

      <Form.Item label="Elements" required>
        <SettingTabsWithoutTitle<GlanceReport.ElementDefinition>
          prefix="element"
          component={Element}
          values={elements}
          onChange={elements => onPartChange({elements})}
        ></SettingTabsWithoutTitle>
      </Form.Item>
      <Form.Item label="Default Glance Layout">
        <SubFormItem>
          Colspan
          <Slider
            value={defaultGlanceLayout?.colspan}
            min={1}
            max={4}
            onChange={(colspan: number) =>
              onPartChange({
                defaultGlanceLayout: {
                  ...defaultGlanceLayout,
                  colspan: Number(colspan),
                },
              })
            }
          />
        </SubFormItem>
        <SubFormItem>
          Rowspan
          <Slider
            value={defaultGlanceLayout?.rowspan}
            min={1}
            onChange={(rowspan: number) =>
              onPartChange({
                defaultGlanceLayout: {
                  ...defaultGlanceLayout,
                  rowspan: Number(rowspan),
                },
              })
            }
          />
        </SubFormItem>
      </Form.Item>
      <Form.Item label="Layout" required>
        <SubFormItem required>
          Columns
          <Input
            placeholder="columns"
            value={layout?.columns}
            onChange={({target: {value}}): void =>
              onPartChange({
                layout: {...layout, columns: value},
              })
            }
          />
        </SubFormItem>

        <SubFormItem required>
          Rows
          <Input
            placeholder="rows"
            value={layout?.rows}
            onChange={({target: {value}}): void =>
              onPartChange({
                layout: {...layout, rows: value},
              })
            }
          />
        </SubFormItem>

        <SubFormItem>
          Padding
          <Input
            placeholder="padding"
            value={layout?.padding}
            onChange={({target: {value}}): void =>
              onPartChange({
                layout: {...layout, padding: value},
              })
            }
          />
        </SubFormItem>

        <SubFormItem>
          Margin
          <Input
            placeholder="margin"
            value={layout?.margin}
            onChange={({target: {value}}): void =>
              onPartChange({
                layout: {...layout, margin: value},
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
