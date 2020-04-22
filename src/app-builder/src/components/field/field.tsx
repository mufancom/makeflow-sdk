import {
  Field as FieldTypes,
  PowerAppInput,
  PowerAppProcedureField,
  PowerItem,
  ProcedureField,
  Value,
} from '@makeflow/types';
import {Card, Form, Icon, Input, Radio, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

import {Inputs} from '../inputs';
import {
  BuiltInProcedureFieldSelect,
  FieldIconTypeSelect,
  FieldTypeSelect,
} from '../select';
import {SettingTabs} from '../tabs';

import {getBaseFieldData, getBuiltInProcedureFieldData} from './@data';
import {getOptions} from './@options';

type DataType = 'initialData' | 'data' | 'dataSource' | undefined;

export const AppField: FC<{
  value: PowerAppProcedureField.FieldBaseDefinition;
  onChange(value: PowerAppProcedureField.FieldBaseDefinition | undefined): void;
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

  let Data = getBaseFieldData(base);

  let onPartChange = (
    part: Partial<PowerAppProcedureField.FieldBaseDefinition>,
  ): void => {
    onChange({
      ...definition,
      ...part,
    } as PowerAppProcedureField.FieldBaseDefinition);
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
                  type: value as PowerAppProcedureField.Type,
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
                  icon: value as ProcedureField.IconName,
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
                    onChange={newData =>
                      onPartChange({
                        data: {...data, ...newData},
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
                    onChange={newInitialData =>
                      onPartChange({
                        initialData: {...initialData, ...newInitialData},
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
  const [buildIn, setBuildIn] = useState(!('definition' in value));

  return (
    <>
      <Form.Item label="字段数据">
        <Radio.Group
          value={buildIn}
          onChange={({target: {value}}) => {
            setBuildIn(value);
          }}
        >
          <Radio.Button value={true}>内建字段</Radio.Button>
          <Radio.Button value={false}>自定义字段</Radio.Button>
        </Radio.Group>
      </Form.Item>
      {buildIn ? (
        <ItemBuildInField
          value={value as PowerItem.PowerItemBuiltInFieldDefinition}
          onChange={onChange}
        />
      ) : (
        <ItemCustomField
          value={value as PowerItem.PowerItemCustomFieldDefinition}
          onChange={onChange}
        />
      )}
    </>
  );
};

const ItemBuildInField: FC<{
  value: PowerItem.PowerItemBuiltInFieldDefinition;
  onChange(value: PowerItem.PowerItemBuiltInFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  const [valueType, setValueType] = useState<Value.ResolvableType | undefined>(
    undefined,
  );

  let definition = value;

  let {
    type,
    displayName,
    readOnly,
    required,
    output,
    initialValue,
    data,
  } = definition;

  const [useData, setUseData] = useState<DataType>(data ? 'data' : undefined);

  let Data = getBuiltInProcedureFieldData(type);

  let onPartChange = (
    part: Partial<PowerItem.PowerItemFieldDefinition>,
  ): void => {
    onChange({
      ...definition,
      ...part,
    } as PowerItem.PowerItemBuiltInFieldDefinition);
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

          <Form.Item label="是否只读">
            <Radio.Group
              value={!!readOnly}
              onChange={({target: {value}}) =>
                onPartChange({
                  readOnly: value,
                })
              }
            >
              <Radio.Button value={false}>可填写</Radio.Button>
              <Radio.Button value={true}>只读</Radio.Button>
            </Radio.Group>
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

          <Form.Item label="字段类型" required>
            <BuiltInProcedureFieldSelect
              placeholder="type"
              value={type}
              onChange={type =>
                onPartChange({
                  type,
                })
              }
            ></BuiltInProcedureFieldSelect>
          </Form.Item>

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
                      });
                    }
                  }}
                >
                  <Radio.Button value={undefined}>不添加</Radio.Button>
                  <Radio.Button value="data">固定数据</Radio.Button>
                </Radio.Group>
              </Form.Item>

              {useData === 'data'
                ? Data.map((DataItem, index) => (
                    <DataItem
                      key={index}
                      value={(data as any) ?? {}}
                      onChange={newData =>
                        onPartChange({
                          data: {...((data as any) ?? {}), ...newData},
                        })
                      }
                    ></DataItem>
                  ))
                : undefined}
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
                    ? value === 'expression'
                      ? {type: 'expression', expression: ''}
                      : {type: 'value', value: ''}
                    : undefined,
                });
              }}
            >
              <Radio.Button value={undefined}>不添加</Radio.Button>
              <Radio.Button value="value">值</Radio.Button>
              <Radio.Button value="expression">表达式</Radio.Button>
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

            {initialValue?.type === 'expression' ? (
              <Input
                placeholder="initialValue"
                value={initialValue.expression}
                onChange={({target: {value}}) =>
                  onPartChange({
                    initialValue: {
                      type: 'expression',
                      expression: value,
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

export const ItemCustomField: FC<{
  value: PowerItem.PowerItemCustomFieldDefinition;
  onChange(value: PowerItem.PowerItemCustomFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  const [custom, setCustom] = useState(typeof value.definition === 'object');

  const [valueType, setValueType] = useState<Value.ResolvableType | undefined>(
    undefined,
  );

  let definition = value;

  let {
    definition: def,
    displayName,
    readOnly,
    required,
    output,
    initialValue,
  } = definition;

  let onPartChange = (
    part: Partial<PowerItem.PowerItemCustomFieldDefinition>,
  ): void => {
    onChange({
      ...definition,
      ...part,
    } as PowerItem.PowerItemCustomFieldDefinition);
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

          <Form.Item label="是否只读">
            <Radio.Group
              value={!!readOnly}
              onChange={({target: {value}}) =>
                onPartChange({
                  readOnly: value,
                })
              }
            >
              <Radio.Button value={false}>可填写</Radio.Button>
              <Radio.Button value={true}>只读</Radio.Button>
            </Radio.Group>
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

          <Form.Item label="自定义类型">
            <Radio.Group
              value={!!custom}
              onChange={({target: {value}}) => setCustom(value)}
            >
              <Radio.Button value={false}>基础字段类型</Radio.Button>
              <Radio.Button value={true}>自定义字段类型</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {custom ? (
            <ItemCustomFieldBaseDefinition
              value={def as PowerItem.FieldBaseDefinition}
              onChange={value =>
                onPartChange({
                  definition: value,
                })
              }
            />
          ) : (
            <Form.Item label="基础字段类型" required>
              <FieldTypeSelect
                placeholder="base"
                value={def as string}
                onChange={value =>
                  onPartChange({
                    definition: value as FieldTypes.BaseFieldType,
                  })
                }
              ></FieldTypeSelect>
            </Form.Item>
          )}

          <Form.Item label="初始值 (initialValue)">
            <Radio.Group
              value={valueType}
              onChange={({target: {value}}) => {
                setValueType(value);

                onPartChange({
                  initialValue: value
                    ? value === 'expression'
                      ? {type: 'expression', expression: ''}
                      : {type: 'value', value: ''}
                    : undefined,
                });
              }}
            >
              <Radio.Button value={undefined}>不添加</Radio.Button>
              <Radio.Button value="value">值</Radio.Button>
              <Radio.Button value="expression">表达式</Radio.Button>
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

            {initialValue?.type === 'expression' ? (
              <Input
                placeholder="initialValue"
                value={initialValue.expression}
                onChange={({target: {value}}) =>
                  onPartChange({
                    initialValue: {
                      type: 'expression',
                      expression: value,
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

const ItemCustomFieldBaseDefinition: FC<{
  value: PowerItem.FieldBaseDefinition;
  onChange(value: PowerItem.FieldBaseDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value ?? {};

  let {base, options, data, dataSource} = definition;

  const [useData, setUseData] = useState<DataType>(
    data ? 'data' : dataSource ? 'dataSource' : undefined,
  );

  let Options = getOptions(base);

  let Data = getBaseFieldData(base);

  let onPartChange = (part: Partial<PowerItem.FieldBaseDefinition>): void => {
    onChange({
      ...definition,
      ...part,
    } as PowerItem.FieldBaseDefinition);
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
                    onChange={newData =>
                      onPartChange({
                        data: {...newData, ...data},
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
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
