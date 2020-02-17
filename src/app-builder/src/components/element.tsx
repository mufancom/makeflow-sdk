import {GlanceData, GlanceReport} from '@makeflow/types';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, ReactNode, useState} from 'react';

import {SubFormItem} from './common';
import {ElementTypeSelect} from './select';

export const Element: FC<{
  value: GlanceReport.ElementDefinition;
  onChange(value: GlanceReport.ElementDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

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
  }

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}元素`}>
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此元素">
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
          <Form.Item label="类型" required>
            <ElementTypeSelect
              value={type}
              onChange={value =>
                onPartChange({
                  type: value as GlanceReport.ElementType,
                })
              }
            ></ElementTypeSelect>
          </Form.Item>
          <Form.Item label="数据集名称 (dataName)">
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

          <Form.Item label="布局 (gird)" required>
            <SubFormItem>
              列 (column)
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
              行 (row)
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
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};

function TextLineOptions(
  options: GlanceReport.TextLineElementOptions,
  onChange: (options: GlanceReport.TextLineElementOptions) => void,
): ReactNode {
  let {title} = options || {};

  return (
    <Form.Item label="标题" required>
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
      <Form.Item label="标题">
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
      <Form.Item label="单位">
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
