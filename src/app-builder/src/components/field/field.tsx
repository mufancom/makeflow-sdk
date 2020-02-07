import {Field as FieldTypes, PowerAppInput, Procedure} from '@makeflow/types';
import {PowerAppProcedureFieldType} from '@makeflow/types/procedure';
import {Card, Form, Icon, Input, Radio, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {FieldIconTypeSelect, FieldTypeSelect} from '../field-type-select';
import {Inputs} from '../inputs';
import {SettingTabs} from '../tabs';

import {getData} from './@data';
import {getOptions} from './@options';

export const Field: FC<{
  value: Procedure.PowerAppProcedureFieldDefinition;
  onChange(value: Procedure.PowerAppProcedureFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value;

  let {
    type,
    base,
    options,
    displayName,
    icon,
    initialData,
    data,
    dataSource,
  } = definition;

  const [useData, setUseData] = useState(
    data ? true : initialData ? false : undefined,
  );

  let Options = getOptions(base);

  let Data = getData(base);

  let onPartChange = (
    part: Partial<Procedure.PowerAppProcedureFieldDefinition>,
  ): void => {
    onChange({
      ...definition,
      ...part,
    } as Procedure.PowerAppProcedureFieldDefinition);
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}字段`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此字段">
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
          <Form.Item label="自定义类型 (英文)" required>
            <Input
              placeholder="type"
              value={type}
              onChange={({target: {value}}) =>
                onPartChange({
                  type: value as PowerAppProcedureFieldType,
                })
              }
            />
          </Form.Item>

          <Form.Item label="展示名称 (别名)" required>
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

          <Form.Item label="基础字段类型" required>
            <FieldTypeSelect
              placeholder="base"
              value={base}
              onChange={value =>
                onPartChange({
                  base: value as FieldTypes.BaseFieldType,
                })
              }
            ></FieldTypeSelect>
          </Form.Item>
          <Form.Item label="字段图标" required>
            <FieldIconTypeSelect
              placeholder="icon"
              value={icon}
              onChange={value =>
                onPartChange({
                  icon: value as Procedure.ProcedureFieldIconName,
                })
              }
            ></FieldIconTypeSelect>
          </Form.Item>

          {Options ? (
            <Options
              options={options ?? {}}
              onChange={options =>
                onPartChange({
                  options,
                })
              }
            ></Options>
          ) : (
            undefined
          )}

          <Form.Item label="预设数据">
            <Radio.Group
              value={useData}
              onChange={({target: {value}}) => setUseData(value)}
            >
              <Radio.Button value={undefined}>不添加</Radio.Button>
              <Radio.Button value={false}>默认数据</Radio.Button>
              <Radio.Button value={true}>固定数据</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {Data
            ? useData === true
              ? Data.map(DataItem => (
                  <DataItem
                    value={data ?? {}}
                    onChange={data =>
                      onPartChange({
                        data,
                      })
                    }
                  ></DataItem>
                ))
              : useData === false
              ? Data.map(DataItem => (
                  <DataItem
                    value={initialData ?? {}}
                    onChange={initialData =>
                      onPartChange({
                        initialData,
                      })
                    }
                  ></DataItem>
                ))
              : undefined
            : undefined}

          <Form.Item label="数据源-地址" required>
            <Input
              placeholder="url"
              value={dataSource?.url}
              onChange={({target: {value}}) =>
                onPartChange({
                  dataSource: {
                    ...dataSource,
                    url: value,
                  },
                })
              }
            />
          </Form.Item>
          <Form.Item label="数据源-输入 (inputs)">
            <SettingTabs<PowerAppInput.Definition>
              primaryKey="name"
              component={Inputs}
              values={dataSource?.inputs ?? []}
              onChange={inputs =>
                onPartChange({
                  dataSource: {url: dataSource?.url ?? '', inputs},
                })
              }
            ></SettingTabs>
            <Input
              placeholder="url"
              value={dataSource?.url}
              onChange={({target: {value}}) =>
                onPartChange({
                  dataSource: {
                    ...dataSource,
                    url: value,
                  },
                })
              }
            />
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
