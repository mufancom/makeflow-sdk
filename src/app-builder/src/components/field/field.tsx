import {
  Field as FieldTypes,
  PowerAppInput,
  PowerItem,
  Procedure,
  Value,
} from '@makeflow/types';
import {PowerAppProcedureFieldType} from '@makeflow/types/procedure';
import {Card, Form, Icon, Input, Radio, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {FieldIconTypeSelect, FieldTypeSelect} from '../field-type-select';
import {Inputs} from '../inputs';
import {SettingTabs} from '../tabs';

import {getData} from './@data';
import {getOptions} from './@options';

type DataType = 'initialData' | 'data' | 'dataSource' | undefined;

export const AppField: FC<{
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

  const [useData, setUseData] = useState<DataType>(
    data
      ? 'data'
      : initialData
      ? 'initialData'
      : dataSource
      ? 'dataSource'
      : undefined,
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

          {Data ? (
            <>
              <Form.Item label="字段数据">
                <Radio.Group
                  value={useData}
                  onChange={({target: {value}}) => {
                    setUseData(value);

                    if (value === undefined) {
                      onPartChange({
                        data: undefined,
                        initialData: undefined,
                        dataSource: undefined,
                      });
                    }
                  }}
                >
                  <Radio.Button value={undefined}>不添加</Radio.Button>
                  <Radio.Button value="initialData">默认数据</Radio.Button>
                  <Radio.Button value="data">固定数据</Radio.Button>
                  <Radio.Button value="dataSource">数据源</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {useData === 'data' ? (
                Data.map((DataItem, index) => (
                  <DataItem
                    key={index}
                    value={data ?? {}}
                    onChange={data =>
                      onPartChange({
                        data,
                        initialData: undefined,
                        dataSource: undefined,
                      })
                    }
                  ></DataItem>
                ))
              ) : useData === 'initialData' ? (
                Data.map((DataItem, index) => (
                  <DataItem
                    key={index}
                    value={initialData ?? {}}
                    onChange={initialData =>
                      onPartChange({
                        initialData,
                        data: undefined,
                        dataSource: undefined,
                      })
                    }
                  ></DataItem>
                ))
              ) : useData === 'dataSource' ? (
                <>
                  <Form.Item label="数据源地址" required>
                    <Input
                      placeholder="url"
                      value={dataSource?.url}
                      onChange={({target: {value}}) =>
                        onPartChange({
                          data: undefined,
                          initialData: undefined,
                          dataSource: {
                            ...dataSource,
                            url: value,
                          },
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="输入 (inputs)">
                    <SettingTabs<PowerAppInput.Definition>
                      primaryKey="name"
                      component={Inputs}
                      values={dataSource?.inputs ?? []}
                      onChange={inputs =>
                        onPartChange({
                          data: undefined,
                          initialData: undefined,
                          dataSource: {url: dataSource?.url ?? '', inputs},
                        })
                      }
                    ></SettingTabs>
                  </Form.Item>
                </>
              ) : (
                undefined
              )}
            </>
          ) : (
            undefined
          )}
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};

export const ItemField: FC<{
  value: PowerItem.PowerItemFieldDefinition;
  onChange(value: PowerItem.PowerItemFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  const [valueType, setValueType] = useState<Value.ResolvableType>('value');

  let definition = value;

  let {
    base,
    options,
    displayName,
    data,
    dataSource,
    required,
    output,
    initialValue,
  } = definition;

  const [useData, setUseData] = useState<DataType>(
    data ? 'data' : dataSource ? 'dataSource' : undefined,
  );

  let Options = getOptions(base);

  let Data = getData(base);

  let onPartChange = (
    part: Partial<PowerItem.PowerItemFieldDefinition>,
  ): void => {
    onChange({
      ...definition,
      ...part,
    } as PowerItem.PowerItemFieldDefinition);
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

          <Form.Item label="是否必填">
            <Radio.Group
              value={!!required}
              onChange={({target: {value}}) =>
                onPartChange({
                  required: value,
                })
              }
            >
              <Radio.Button value={false}>可选</Radio.Button>
              <Radio.Button value={true}>必填</Radio.Button>
            </Radio.Group>
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

          {Data ? (
            <>
              <Form.Item label="字段数据">
                <Radio.Group
                  value={useData}
                  onChange={({target: {value}}) => {
                    setUseData(value);

                    if (value === undefined) {
                      onPartChange({
                        data: undefined,
                        dataSource: undefined,
                      });
                    }
                  }}
                >
                  <Radio.Button value={undefined}>不添加</Radio.Button>
                  <Radio.Button value="data">固定数据</Radio.Button>
                  <Radio.Button value="dataSource">数据源</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {useData === 'data' ? (
                Data.map((DataItem, index) => (
                  <DataItem
                    key={index}
                    value={data ?? {}}
                    onChange={data =>
                      onPartChange({
                        data,
                        dataSource: undefined,
                      })
                    }
                  ></DataItem>
                ))
              ) : useData === 'dataSource' ? (
                <>
                  <Form.Item label="数据源地址" required>
                    <Input
                      placeholder="url"
                      value={dataSource?.url}
                      onChange={({target: {value}}) =>
                        onPartChange({
                          data: undefined,
                          dataSource: {
                            ...dataSource,
                            url: value,
                          },
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item label="输入 (inputs)">
                    <SettingTabs<PowerAppInput.Definition>
                      primaryKey="name"
                      component={Inputs}
                      values={dataSource?.inputs ?? []}
                      onChange={inputs =>
                        onPartChange({
                          data: undefined,
                          dataSource: {url: dataSource?.url ?? '', inputs},
                        })
                      }
                    ></SettingTabs>
                  </Form.Item>
                </>
              ) : (
                undefined
              )}
            </>
          ) : (
            undefined
          )}

          <Form.Item label="初始值 (initialValue)">
            <Radio.Group
              value={valueType}
              onChange={({target: {value}}) => {
                setValueType(value);

                onPartChange({
                  initialValue: value
                    ? value === 'variable'
                      ? {type: 'variable', variable: ''}
                      : {type: 'value', value: ''}
                    : undefined,
                });
              }}
            >
              <Radio.Button value={undefined}>不添加</Radio.Button>
              <Radio.Button value="value">值</Radio.Button>
              <Radio.Button value="variable">变量</Radio.Button>
            </Radio.Group>

            {initialValue?.type === 'value' ? (
              <Input
                placeholder="initialValue"
                value={String(initialValue.value)}
                onChange={({target: {value}}) =>
                  onPartChange({
                    initialValue: {
                      type: 'value',
                      value,
                    },
                  })
                }
              />
            ) : (
              undefined
            )}

            {initialValue?.type === 'variable' ? (
              <Input
                placeholder="initialValue"
                value={initialValue.variable}
                onChange={({target: {value}}) =>
                  onPartChange({
                    initialValue: {
                      type: 'variable',
                      variable: value,
                    },
                  })
                }
              />
            ) : (
              undefined
            )}
          </Form.Item>

          <Form.Item label="输出变量名 (output)">
            <Input
              placeholder="output"
              value={output}
              onChange={({target: {value}}) =>
                onPartChange({
                  output: value,
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
