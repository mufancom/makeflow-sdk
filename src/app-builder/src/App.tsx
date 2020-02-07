import {
  PowerApp,
  PowerAppConfig,
  PowerCustomCheckableItem as PowerCustomCheckableItemTypes,
  PowerGlance as PowerGlanceTypes,
  PowerItem as PowerItemTypes,
} from '@makeflow/types';
import {PowerAppProcedureFieldDefinition} from '@makeflow/types/procedure';
import {Button, Checkbox, Col, Form, Input, Layout, Row} from 'antd';
import {FormComponentProps} from 'antd/lib/form';
import React, {FC, forwardRef, useState} from 'react';

import './App.css';
import {
  AppField,
  Config,
  PowerCustomCheckableItem,
  PowerGlance,
  PowerItem,
  SettingTabs,
} from './components';
import {permissionData} from './permission';

const {Header, Footer, Content} = Layout;

const _App: FC<FormComponentProps> = ({form: {getFieldsValue}}, ref) => {
  let definition: PowerApp.DenominalizedRawDefinition = {
    name: 'beautiful-orange',
    version: '0.1.100',
    displayName: '美橙暖通',
    description: 'Power app for 美橙暖通',
    hookBaseURL: 'http://localhost:9001/api/mf',
    permissions: ['task:create', 'task:update'],
    configs: [
      {
        name: 'job-team',
        displayName: '创建售后任务所属团队',
        required: true,
        field: 'team',
      },
      {
        name: 'job-procedure',
        displayName: '售后任务对应流程',
        required: true,
        field: 'procedure-array',
      },
    ],
    contributions: {
      procedureFields: [
        {
          type: 'product',
          base: 'select',
          icon: 'select',
          displayName: '维修内容',
          dataSource: {
            url: 'http://localhost:9001/api/mf/content/product',
          },
        },
        {
          type: 'duration',
          base: 'select',
          icon: 'select',
          displayName: '保修时长',
          dataSource: {
            url: 'http://localhost:9001/api/mf/content/duration',
          },
        },
      ],
      powerItems: [
        {
          name: 'create-job',
          displayName: '自动创建售后任务',
          fields: [
            {
              base: 'select',
              required: true,
              displayName: '保修时长',
              output: 'job:duration',
              dataSource: {
                url: 'http://localhost:9001/api/mf/content/duration',
              },
            },
          ],
          inputs: [
            {
              name: 'job:content',
              displayName: '派工内容',
              bind: {
                type: 'variable',
                variable: 'job:content',
              },
            },
            {
              name: 'job:address',
              displayName: '派工地址',
              bind: {
                type: 'variable',
                variable: 'job:address',
              },
            },
            {
              name: 'job:date',
              displayName: '派工时间',
              bind: {
                type: 'variable',
                variable: 'job:date',
              },
            },
            {
              name: 'job:duration',
              displayName: '保修时长',
              bind: {
                type: 'variable',
                variable: 'job:duration',
              },
            },
            {
              name: 'task',
              displayName: '任务id',
              bind: {
                type: 'variable',
                variable: 'task:id',
              },
            },
            {
              name: 'user',
              displayName: '任务负责人',
              bind: {
                type: 'variable',
                variable: 'task:assignee',
              },
            },
          ],
          type: 'checkable',
          actions: [
            {
              name: 'create',
              displayName: '创建维修任务',
            },
          ],
        },
        {
          name: 'basic-contract',
          displayName: '合同基本信息',
          type: 'checkable',
          inputs: [
            {
              name: 'contract:num',
              displayName: '合同编号',
              bind: {
                type: 'variable',
                variable: 'contract:num',
              },
            },
            {
              name: 'contract:date',
              displayName: '签订日期',
              bind: {
                type: 'variable',
                variable: 'contract:date',
              },
            },
            {
              name: 'contract:room',
              displayName: '房号（地址）',
              bind: {
                type: 'variable',
                variable: 'contract:room',
              },
            },
            {
              name: 'contract:name',
              displayName: '业主姓名',
              bind: {
                type: 'variable',
                variable: 'contract:name',
              },
            },
            {
              name: 'contract:phone',
              displayName: '业主电话',
              bind: {
                type: 'variable',
                variable: 'contract:phone',
              },
            },
            {
              name: 'contract:content',
              displayName: '安装设备或内容',
              bind: {
                type: 'variable',
                variable: 'contract:content',
              },
            },
            {
              name: 'contract:payType',
              displayName: '付款方式',
              bind: {
                type: 'variable',
                variable: 'contract:payType',
              },
            },
            {
              name: 'contract:budget',
              displayName: '预算金额',
              bind: {
                type: 'variable',
                variable: 'contract:budget',
              },
            },
            {
              name: 'contract:deposit',
              displayName: '定金',
              bind: {
                type: 'variable',
                variable: 'contract:deposit',
              },
            },
            {
              name: 'contract:staging',
              displayName: '付款金额',
              bind: {
                type: 'variable',
                variable: 'contract:staging',
              },
            },
            {
              name: 'contract:other',
              displayName: '其他合同事项',
              bind: {
                type: 'variable',
                variable: 'contract:other',
              },
            },
            {
              name: 'contract:manager',
              displayName: '客户经理',
              bind: {
                type: 'variable',
                variable: 'contract:manager',
              },
            },
            {
              name: 'source:type',
              displayName: '信息来源-类型',
              bind: {
                type: 'variable',
                variable: 'source:type',
              },
            },
            {
              name: 'source:company',
              displayName: '信息来源-公司',
              bind: {
                type: 'variable',
                variable: 'source:company',
              },
            },
            {
              name: 'source:personal',
              displayName: '信息来源-个人',
              bind: {
                type: 'variable',
                variable: 'source:personal',
              },
            },
          ],
          fields: [
            {
              base: 'input',
              required: true,
              displayName: '合同编号',
              output: 'contract:num',
            },
            {
              base: 'date',
              required: true,
              displayName: '签订日期',
              output: 'contract:date',
            },
            {
              base: 'input',
              required: true,
              displayName: '房号（地址）',
              output: 'contract:room',
            },
            {
              base: 'input',
              required: true,
              displayName: '业主姓名',
              output: 'contract:name',
            },
            {
              base: 'input',
              required: true,
              displayName: '业主电话',
              output: 'contract:phone',
            },
            {
              base: 'select-array',
              required: true,
              displayName: '安装设备或内容',
              output: 'contract:content',
              data: {
                prefix: '设备',
              },
              dataSource: {
                url: 'http://localhost:9001/api/mf/content/product',
              },
            },
            {
              base: 'select',
              required: true,
              displayName: '付款方式',
              output: 'contract:payType',
              data: {
                candidates: [
                  {
                    text: '分期付款',
                    value: 'staging',
                  },
                  {
                    text: '一次性付款',
                    value: 'full',
                  },
                ],
              },
            },
            {
              base: 'input',
              required: true,
              displayName: '预算金额',
              output: 'contract:budget',
            },
            {
              base: 'input',
              required: false,
              displayName: '定金',
              output: 'contract:deposit',
            },
            {
              base: 'input-array',
              required: true,
              displayName: '付款金额',
              output: 'contract:staging',
              data: {
                prefix: '期数',
              },
            },
            {
              base: 'input-array',
              required: false,
              displayName: '其他合同事项',
              output: 'contract:other',
              data: {
                prefix: '事项',
              },
            },
            {
              base: 'input',
              required: true,
              displayName: '客户经理',
              output: 'contract:manager',
            },
            {
              base: 'select',
              required: true,
              displayName: '信息来源-类型',
              output: 'source:type',
              data: {
                candidates: [
                  {
                    text: '个人',
                    value: 'personal',
                  },
                  {
                    text: '公司',
                    value: 'company',
                  },
                ],
              },
            },
            {
              base: 'input',
              required: false,
              displayName: '信息来源-公司',
              output: 'source:company',
            },
            {
              base: 'input',
              required: false,
              displayName: '信息来源-个人',
              output: 'source:personal',
            },
          ],
        },
        {
          name: 'pay-contract',
          displayName: '合同收款信息',
          type: 'checkable',
          inputs: [
            {
              name: 'money:staging',
              displayName: '收款金额',
              bind: {
                type: 'variable',
                variable: 'money:staging',
              },
            },
            {
              name: 'money:detail',
              displayName: '收款明细',
              bind: {
                type: 'variable',
                variable: 'money:detail',
              },
            },
            {
              name: 'money:other',
              displayName: '其他收费',
              bind: {
                type: 'variable',
                variable: 'money:other',
              },
            },
            {
              name: 'money:settle',
              displayName: '结清',
              bind: {
                type: 'variable',
                variable: 'money:settle',
              },
            },
            {
              name: 'money:notes',
              displayName: '收款备注',
              bind: {
                type: 'variable',
                variable: 'money:notes',
              },
            },
          ],
          fields: [
            {
              base: 'input-array',
              required: true,
              displayName: '收款金额',
              output: 'money:staging',
              data: {
                prefix: '期数',
              },
            },
            {
              base: 'input-array',
              required: false,
              displayName: '收款明细',
              output: 'money:detail',
              data: {
                prefix: '明细',
              },
            },
            {
              base: 'input-array',
              required: false,
              displayName: '其他收费',
              output: 'money:other',
              data: {
                prefix: '款项',
              },
            },
            {
              base: 'radio',
              required: false,
              displayName: '结清',
              output: 'money:settle',
              data: {
                candidates: [
                  {
                    text: '结清',
                    value: true,
                  },
                  {
                    text: '未结清',
                    value: false,
                  },
                ],
              },
            },
            {
              base: 'input',
              required: false,
              displayName: '收款备注',
              output: 'money:notes',
            },
          ],
        },
        {
          name: 'basic-job',
          displayName: '派工基本信息',
          type: 'checkable',
          inputs: [
            {
              name: 'job:content',
              displayName: '派工内容',
              bind: {
                type: 'variable',
                variable: 'job:content',
              },
            },
            {
              name: 'job:address',
              displayName: '派工地址',
              bind: {
                type: 'variable',
                variable: 'job:address',
              },
            },
            {
              name: 'job:date',
              displayName: '派工时间',
              bind: {
                type: 'variable',
                variable: 'job:date',
              },
            },
          ],
          fields: [
            {
              base: 'select-array',
              required: true,
              displayName: '派工内容',
              output: 'job:content',
              data: {
                prefix: '设备',
              },
              dataSource: {
                url: 'http://localhost:9001/api/mf/content/product',
              },
            },
            {
              base: 'input',
              required: true,
              displayName: '派工地址',
              output: 'job:address',
            },
            {
              base: 'date',
              required: false,
              displayName: '派工时间',
              output: 'job:date',
              data: {
                showTime: true,
              },
            },
          ],
        },
      ],
      powerGlances: [
        {
          name: 'job-glance',
          displayName: ' 派工概览',
          configs: [
            {
              name: 'displayName',
              displayName: '超级概览别名',
              description:
                '便于在 power app 主页中区分概览，建议设置与概览同名',
              required: true,
            },
          ],
          inputs: [
            {
              name: 'stage',
              displayName: '任务状态',
              bind: {
                type: 'variable',
                variable: 'task:stage',
              },
            },
            {
              name: 'nodes',
              displayName: '节点信息',
              bind: {
                type: 'variable',
                variable: 'task:nodes',
              },
            },
            {
              name: 'startedAt',
              displayName: '开始时间',
              bind: {
                type: 'variable',
                variable: 'task:started-at',
              },
            },
            {
              name: 'completedAt',
              displayName: '完成时间',
              bind: {
                type: 'variable',
                variable: 'task:completed-at',
              },
            },
            {
              name: 'numericId',
              displayName: '任务编号',
              bind: {
                type: 'variable',
                variable: 'task:numeric-id',
              },
            },
            {
              name: 'job:content',
              displayName: '派工内容',
              bind: {
                type: 'variable',
                variable: 'job:content',
              },
            },
            {
              name: 'job:address',
              displayName: '派工地址',
              bind: {
                type: 'variable',
                variable: 'job:address',
              },
            },
            {
              name: 'job:date',
              displayName: '派工时间',
              bind: {
                type: 'variable',
                variable: 'job:date',
              },
            },
          ],
        },
        {
          name: 'contract-glance',
          displayName: ' 合同概览',
          configs: [
            {
              name: 'displayName',
              displayName: '超级概览别名',
              description:
                '便于在 power app 主页中区分概览，建议设置与概览同名',
              required: true,
            },
          ],
          inputs: [
            {
              name: 'contract:num',
              displayName: '合同编号',
              bind: {
                type: 'variable',
                variable: 'contract:num',
              },
            },
            {
              name: 'contract:date',
              displayName: '签订日期',
              bind: {
                type: 'variable',
                variable: 'contract:date',
              },
            },
            {
              name: 'contract:room',
              displayName: '房号（地址）',
              bind: {
                type: 'variable',
                variable: 'contract:room',
              },
            },
            {
              name: 'contract:name',
              displayName: '业主姓名',
              bind: {
                type: 'variable',
                variable: 'contract:name',
              },
            },
            {
              name: 'contract:phone',
              displayName: '业主电话',
              bind: {
                type: 'variable',
                variable: 'contract:phone',
              },
            },
            {
              name: 'contract:content',
              displayName: '安装设备或内容',
              bind: {
                type: 'variable',
                variable: 'contract:content',
              },
            },
            {
              name: 'contract:payType',
              displayName: '付款方式',
              bind: {
                type: 'variable',
                variable: 'contract:payType',
              },
            },
            {
              name: 'contract:budget',
              displayName: '预算金额',
              bind: {
                type: 'variable',
                variable: 'contract:budget',
              },
            },
            {
              name: 'contract:deposit',
              displayName: '定金',
              bind: {
                type: 'variable',
                variable: 'contract:deposit',
              },
            },
            {
              name: 'contract:staging',
              displayName: '付款金额',
              bind: {
                type: 'variable',
                variable: 'contract:staging',
              },
            },
            {
              name: 'contract:other',
              displayName: '其他合同事项',
              bind: {
                type: 'variable',
                variable: 'contract:other',
              },
            },
            {
              name: 'contract:manager',
              displayName: '客户经理',
              bind: {
                type: 'variable',
                variable: 'contract:manager',
              },
            },
            {
              name: 'source:type',
              displayName: '信息来源-类型',
              bind: {
                type: 'variable',
                variable: 'source:type',
              },
            },
            {
              name: 'source:company',
              displayName: '信息来源-公司',
              bind: {
                type: 'variable',
                variable: 'source:company',
              },
            },
            {
              name: 'source:personal',
              displayName: '信息来源-个人',
              bind: {
                type: 'variable',
                variable: 'source:personal',
              },
            },
            {
              name: 'money:staging',
              displayName: '收款金额',
              bind: {
                type: 'variable',
                variable: 'money:staging',
              },
            },
            {
              name: 'money:detail',
              displayName: '收款明细',
              bind: {
                type: 'variable',
                variable: 'money:detail',
              },
            },
            {
              name: 'money:other',
              displayName: '其他收费',
              bind: {
                type: 'variable',
                variable: 'money:other',
              },
            },
            {
              name: 'money:settle',
              displayName: '结清',
              bind: {
                type: 'variable',
                variable: 'money:settle',
              },
            },
            {
              name: 'money:notes',
              displayName: '收款备注',
              bind: {
                type: 'variable',
                variable: 'money:notes',
              },
            },
            {
              name: 'returnRate',
              displayName: '返点比例',
              bind: {
                type: 'variable',
                variable: 'returnRate',
              },
            },
            {
              name: 'returnFirst',
              displayName: '一期返点额度',
              bind: {
                type: 'variable',
                variable: 'returnFirst',
              },
            },
            {
              name: 'returnFirstDate',
              displayName: '一期返点时间',
              bind: {
                type: 'variable',
                variable: 'returnFirstDate',
              },
            },
            {
              name: 'returnNextDate',
              displayName: '二期返点时间',
              bind: {
                type: 'variable',
                variable: 'returnNextDate',
              },
            },
          ],
        },
      ],
    },
  };

  // definition = {} as any;

  const [state, setState] = useState<PowerApp.RawDefinition>(
    definition as PowerApp.RawDefinition,
  );

  function setContributions(
    partContributions: Partial<PowerApp.RawDefinition['contributions']>,
  ): void {
    let contributions: PowerApp.RawDefinition['contributions'] = {
      ...state.contributions,
      ...partContributions,
    };

    setState({...state, contributions});
  }

  return (
    <Layout className="app" ref={ref}>
      <Header className="header">Power App 定义工具</Header>
      <Content>
        <Row>
          <Col
            className="main"
            style={{backgroundColor: '#fff'}}
            xs={24}
            md={{span: 18, offset: 3}}
            xl={{span: 14, offset: 5}}
          >
            <Form layout="horizontal" labelAlign="left">
              <Form.Item label="名称 (英文)" required>
                <Input
                  value={state.name}
                  placeholder="name"
                  onChange={({target: {value}}) =>
                    setState({...state, name: value})
                  }
                />
              </Form.Item>
              <Form.Item label="版本号" required>
                <Input
                  value={state.version}
                  placeholder="version"
                  onChange={({target: {value}}) =>
                    setState({...state, version: value})
                  }
                />
              </Form.Item>
              <Form.Item label="展示名称 (别名)" required>
                <Input
                  value={state.displayName}
                  placeholder="displayName"
                  onChange={({target: {value}}) =>
                    setState({...state, displayName: value})
                  }
                />
              </Form.Item>
              <Form.Item label="描述">
                <Input
                  value={state.description}
                  placeholder="description"
                  onChange={({target: {value}}) =>
                    setState({...state, description: value})
                  }
                />
              </Form.Item>
              <Form.Item label="官网主页">
                <Input
                  value={state.homePageURL}
                  placeholder="homePageURL"
                  onChange={({target: {value}}) =>
                    setState({...state, homePageURL: value})
                  }
                />
              </Form.Item>
              <Form.Item label="服务器地址">
                <Input
                  value={state.hookBaseURL}
                  placeholder="hookBaseURL"
                  onChange={({target: {value}}) =>
                    setState({...state, hookBaseURL: value})
                  }
                />
              </Form.Item>
              <Form.Item label="所需权限">
                <Checkbox.Group
                  value={state.permissions}
                  options={permissionData}
                  onChange={values =>
                    setState({
                      ...state,
                      permissions: values as any,
                    })
                  }
                />
              </Form.Item>
              <Form.Item label="应用配置参数">
                <SettingTabs<PowerAppConfig.Definition>
                  primaryKey="name"
                  component={Config}
                  values={state.configs}
                  onChange={configs => setState({...state, configs})}
                />
              </Form.Item>
              <Form.Item label="自定义字段">
                <SettingTabs<PowerAppProcedureFieldDefinition>
                  primaryKey="type"
                  component={AppField}
                  values={state.contributions?.procedureFields}
                  onChange={procedureFields =>
                    setContributions({procedureFields})
                  }
                />
              </Form.Item>
              <Form.Item label="超级流程项">
                <SettingTabs<PowerItemTypes.Definition>
                  primaryKey="name"
                  component={PowerItem}
                  values={state.contributions?.powerItems}
                  onChange={powerItems => setContributions({powerItems})}
                />
              </Form.Item>
              <Form.Item label="超级概览">
                <SettingTabs<PowerGlanceTypes.Definition>
                  primaryKey="name"
                  component={PowerGlance}
                  values={state.contributions?.powerGlances}
                  onChange={powerGlances => setContributions({powerGlances})}
                />
              </Form.Item>
              <Form.Item label="超级自定义检查项">
                <SettingTabs<PowerCustomCheckableItemTypes.Definition>
                  primaryKey="name"
                  component={PowerCustomCheckableItem}
                  values={state.contributions?.powerCustomCheckableItems}
                  onChange={powerCustomCheckableItems =>
                    setContributions({powerCustomCheckableItems})
                  }
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  onClick={() => console.info(getFieldsValue())}
                >
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
      <Footer>© 2020 成都木帆科技有限公司</Footer>
    </Layout>
  );
};

export default Form.create()(forwardRef(_App));
