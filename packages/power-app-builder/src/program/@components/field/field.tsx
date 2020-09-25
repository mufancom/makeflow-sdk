import {
  Field as FieldTypes,
  PowerAppDataSource,
  PowerAppInput,
  PowerAppProcedureField,
  PowerItem,
  ProcedureField,
  Value,
} from '@makeflow/types';
import {Button, Card, Form, Input, Radio} from 'antd';
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
    <Card>
      <Form.Item label="Custom Type" required>
        <Input
          placeholder="custom type"
          value={type}
          onChange={({target: {value}}) =>
            onPartChange({
              type: value as PowerAppProcedureField.Type,
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

      <Form.Item label="Icon" required>
        <FieldIconTypeSelect
          placeholder="icon"
          value={icon}
          onChange={(value: ProcedureField.IconName) =>
            onPartChange({
              icon: value,
            })
          }
        ></FieldIconTypeSelect>
      </Form.Item>

      <Form.Item label="Base Type" required>
        <FieldTypeSelect
          placeholder="base"
          value={base}
          onChange={(value: FieldTypes.BaseFieldType) =>
            onPartChange({
              base: value,
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
      ) : undefined}

      {Data ? (
        <>
          <Form.Item label="Field Data">
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
              <Radio.Button value={undefined}>none</Radio.Button>
              <Radio.Button value="initialData">initialData</Radio.Button>
              <Radio.Button value="data">data</Radio.Button>
              <Radio.Button value="dataSource">dataSource</Radio.Button>
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
              <Form.Item label="DataSource Name" required>
                <Input
                  placeholder="name"
                  value={dataSource?.name}
                  onChange={({target: {value}}) =>
                    onPartChange({
                      data: undefined,
                      initialData: undefined,
                      dataSource: {
                        ...dataSource,
                        name: value as PowerAppDataSource.Name,
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Inputs">
                <SettingTabs<PowerAppInput.Definition>
                  primaryKey="name"
                  component={Inputs}
                  values={dataSource?.inputs ?? []}
                  onChange={inputs =>
                    onPartChange({
                      data: undefined,
                      initialData: undefined,
                      dataSource: {
                        name:
                          dataSource?.name ?? ('' as PowerAppDataSource.Name),
                        inputs,
                      },
                    })
                  }
                ></SettingTabs>
              </Form.Item>
            </>
          ) : undefined}
        </>
      ) : undefined}
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

export const ItemField: FC<{
  value: PowerItem.PowerItemFieldDefinition;
  onChange(value: PowerItem.PowerItemFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
  const [buildIn, setBuildIn] = useState(!('definition' in value));

  return (
    <>
      <Form.Item label="Field Data">
        <Radio.Group
          value={buildIn}
          onChange={({target: {value}}) => {
            setBuildIn(value);
          }}
        >
          <Radio.Button value={true}>builtIn filed</Radio.Button>
          <Radio.Button value={false}>custom field</Radio.Button>
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
    <Card>
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

      <Form.Item label="ReadOnly">
        <Radio.Group
          value={!!readOnly}
          onChange={({target: {value}}) =>
            onPartChange({
              readOnly: value,
            })
          }
        >
          <Radio.Button value={false}>writeable</Radio.Button>
          <Radio.Button value={true}>readonly</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Required">
        <Radio.Group
          value={!!required}
          onChange={({target: {value}}) =>
            onPartChange({
              required: value,
            })
          }
        >
          <Radio.Button value={false}>optional</Radio.Button>
          <Radio.Button value={true}>required</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Field Type" required>
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
          <Form.Item label="Field Data">
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
              <Radio.Button value={undefined}>none</Radio.Button>
              <Radio.Button value="data">data</Radio.Button>
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
      ) : undefined}

      <Form.Item label="InitialValue">
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
          <Radio.Button value={undefined}>none</Radio.Button>
          <Radio.Button value="value">value</Radio.Button>
          <Radio.Button value="expression">expression</Radio.Button>
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
        ) : undefined}

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
        ) : undefined}

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
        ) : undefined}
      </Form.Item>

      <Form.Item label="Output">
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

export const ItemCustomField: FC<{
  value: PowerItem.PowerItemCustomFieldDefinition;
  onChange(value: PowerItem.PowerItemCustomFieldDefinition | undefined): void;
}> = ({value, onChange}) => {
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
    <Card>
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

      <Form.Item label="ReadOnly">
        <Radio.Group
          value={!!readOnly}
          onChange={({target: {value}}) =>
            onPartChange({
              readOnly: value,
            })
          }
        >
          <Radio.Button value={false}>writeable</Radio.Button>
          <Radio.Button value={true}>readonly</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Required">
        <Radio.Group
          value={!!required}
          onChange={({target: {value}}) =>
            onPartChange({
              required: value,
            })
          }
        >
          <Radio.Button value={false}>optional</Radio.Button>
          <Radio.Button value={true}>required</Radio.Button>
        </Radio.Group>
      </Form.Item>

      <Form.Item label="Custom">
        <Radio.Group
          value={!!custom}
          onChange={({target: {value}}) => {
            setCustom(value);
            onPartChange({
              definition: undefined,
            });
          }}
        >
          <Radio.Button value={false}>baseFieldType</Radio.Button>
          <Radio.Button value={true}>customFieldType</Radio.Button>
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
        <Form.Item label="BaseFieldType" required>
          <FieldTypeSelect
            placeholder="base"
            value={def as FieldTypes.BaseFieldType}
            onChange={(value: FieldTypes.BaseFieldType) =>
              onPartChange({
                definition: value,
              })
            }
          ></FieldTypeSelect>
        </Form.Item>
      )}

      <Form.Item label="InitialValue">
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
          <Radio.Button value={undefined}>none</Radio.Button>
          <Radio.Button value="value">value</Radio.Button>
          <Radio.Button value="expression">expression</Radio.Button>
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
        ) : undefined}

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
        ) : undefined}

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
        ) : undefined}
      </Form.Item>

      <Form.Item label="Output">
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

const ItemCustomFieldBaseDefinition: FC<{
  value: PowerItem.FieldBaseDefinition;
  onChange(value: PowerItem.FieldBaseDefinition | undefined): void;
}> = ({value, onChange}) => {
  let definition = value ?? {};

  let {base, options = {}, data = {}, dataSource} = definition;

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
    <Card>
      <Form.Item label="BaseFiledType" required>
        <FieldTypeSelect
          placeholder="base"
          value={base}
          onChange={(value: FieldTypes.BaseFieldType) =>
            onPartChange({
              base: value,
            })
          }
        ></FieldTypeSelect>
      </Form.Item>

      {Options ? (
        <Options
          options={options}
          onChange={options =>
            onPartChange({
              options,
            })
          }
        ></Options>
      ) : undefined}

      {Data ? (
        <>
          <Form.Item label="Filed Data">
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
              <Radio.Button value={undefined}>none</Radio.Button>
              <Radio.Button value="data">data</Radio.Button>
              <Radio.Button value="dataSource">dataSource</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {useData === 'data' ? (
            Data.map((DataItem, index) => (
              <DataItem
                key={index}
                value={data}
                onChange={newData => {
                  onPartChange({
                    data: {...data, ...newData},
                    dataSource: undefined,
                  });
                }}
              ></DataItem>
            ))
          ) : useData === 'dataSource' ? (
            <>
              <Form.Item label="DataSource Name" required>
                <Input
                  placeholder="name"
                  value={dataSource?.name}
                  onChange={({target: {value}}) =>
                    onPartChange({
                      data: undefined,
                      dataSource: {
                        ...dataSource,
                        name: value as PowerAppDataSource.Name,
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="Inputs">
                <SettingTabs<PowerAppInput.Definition>
                  primaryKey="name"
                  component={Inputs}
                  values={dataSource?.inputs ?? []}
                  onChange={inputs =>
                    onPartChange({
                      data: undefined,
                      dataSource: {
                        name:
                          dataSource?.name ?? ('' as PowerAppDataSource.Name),
                        inputs,
                      },
                    })
                  }
                ></SettingTabs>
              </Form.Item>
            </>
          ) : undefined}
        </>
      ) : undefined}
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
