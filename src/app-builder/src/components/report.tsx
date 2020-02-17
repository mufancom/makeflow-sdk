import {GlanceReport} from '@makeflow/types';
import {Card, Form, Icon, Input, Slider, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {SubFormItem} from './common';
import {Element} from './element';
import {ReportIconTypeSelect} from './select';
import {SettingTabsWithoutTitle} from './tabs';

export const Report: FC<{
  value: GlanceReport.Definition;
  onChange(value: GlanceReport.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

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
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}报表`}>
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此报表">
          <Icon
            type="delete"
            key="delete"
            onClick={() => onChange(undefined)}
          />
        </Tooltip>,
      ]}
    >
      {!fold ? (
        <>
          <Form.Item label="名称 (英文)" required>
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
          <Form.Item label="标题" required>
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

          <Form.Item label="描述">
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

          <Form.Item label="图标">
            <ReportIconTypeSelect
              placeholder="icon"
              value={icon}
              onChange={value =>
                onPartChange({
                  icon: value as GlanceReport.IconName,
                })
              }
            ></ReportIconTypeSelect>
          </Form.Item>

          <Form.Item label="元素 (elements)" required>
            <SettingTabsWithoutTitle<GlanceReport.ElementDefinition>
              prefix="元素"
              component={Element}
              values={elements}
              onChange={elements => onPartChange({elements})}
            ></SettingTabsWithoutTitle>
          </Form.Item>
          <Form.Item label="默认概览布局">
            <SubFormItem>
              列 (colspan)
              <Slider
                value={defaultGlanceLayout?.colspan}
                min={1}
                max={4}
                onChange={colspan =>
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
              行 (rowspan)
              <Slider
                value={defaultGlanceLayout?.rowspan}
                min={1}
                onChange={rowspan =>
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
          <Form.Item label="外观 (layout)" required>
            <SubFormItem required>
              列 (columns)
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
              行 (rows)
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
              内边距 (padding)
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
              外边距 (margin)
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
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
