import {PowerAppInput} from '@makeflow/types';
import {Card, Form, Icon, Input, Radio, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

export const Inputs: FC<{
  value: PowerAppInput.Definition;
  onChange(value: PowerAppInput.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {displayName, name, bind, default: defaultValue} = config;

  const [useBind, setUseBind] = useState(
    bind ? true : defaultValue ? false : undefined,
  );

  bind = bind || {type: 'value', value: ''};
  defaultValue = defaultValue || {type: 'value', value: ''};

  let onPartChange = (part: Partial<PowerAppInput.Definition>): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}内容`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此内容">
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
              onChange={({target: {value}}) =>
                onPartChange({
                  name: value as PowerAppInput.Name,
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
          <Form.Item label="数据绑定方式">
            <Radio.Group
              value={useBind}
              onChange={({target: {value}}) => {
                setUseBind(value);

                if (value === undefined) {
                  onPartChange({
                    bind: undefined,
                    default: undefined,
                  });
                }
              }}
            >
              <Radio.Button value={undefined}>不绑定</Radio.Button>
              <Radio.Button value={false}>默认值</Radio.Button>
              <Radio.Button value={true}>强制绑定</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {useBind === false ? (
            <>
              <Form.Item label="数据类型">
                <Radio.Group
                  value={defaultValue?.type === 'variable'}
                  onChange={({target: {value}}) => {
                    onPartChange({
                      default: value
                        ? {type: 'variable', variable: ''}
                        : {type: 'value', value: ''},
                    });
                  }}
                >
                  <Radio.Button value={false}>值</Radio.Button>
                  <Radio.Button value={true}>变量</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="数据值或变量名">
                <Input
                  placeholder="default"
                  value={
                    'value' in defaultValue
                      ? String(defaultValue.value)
                      : defaultValue?.variable
                  }
                  onChange={({target: {value}}) =>
                    onPartChange({
                      default:
                        'value' in defaultValue!
                          ? {
                              type: 'value',
                              value,
                            }
                          : {
                              type: 'variable',
                              variable: value,
                            },
                    })
                  }
                />
              </Form.Item>
            </>
          ) : (
            undefined
          )}

          {useBind === true ? (
            <>
              <Form.Item label="数据类型">
                <Radio.Group
                  value={bind?.type === 'variable'}
                  onChange={({target: {value}}) => {
                    onPartChange({
                      bind: value
                        ? {type: 'variable', variable: ''}
                        : {type: 'value', value: ''},
                    });
                  }}
                >
                  <Radio.Button value={false}>值</Radio.Button>
                  <Radio.Button value={true}>变量</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Form.Item label="数据值或变量名">
                <Input
                  placeholder="bind"
                  value={'value' in bind ? String(bind.value) : bind?.variable}
                  onChange={({target: {value}}) =>
                    onPartChange({
                      bind:
                        'value' in bind!
                          ? {
                              type: 'value',
                              value,
                            }
                          : {
                              type: 'variable',
                              variable: value,
                            },
                    })
                  }
                />
              </Form.Item>
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
