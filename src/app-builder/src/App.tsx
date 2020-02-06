import {
  PowerApp,
  PowerAppConfig,
  PowerCustomCheckableItem as PowerCustomCheckableItemTypes,
  PowerGlance as PowerGlanceTypes,
  PowerItem as PowerItemTypes,
} from '@makeflow/types';
import {Button, Checkbox, Col, Form, Input, Layout, Row} from 'antd';
import {FormComponentProps} from 'antd/lib/form';
import React, {FC, forwardRef, useState} from 'react';

import './App.css';
import {
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
      powerItems: [
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
          actions: [
            {
              name: 'ac1',
              displayName: '指令1',
              inputs: [
                {
                  name: 'aa',
                  type: 'value',
                  value: '666',
                },
                {
                  name: '88',
                  type: 'variable',
                  variable: '777',
                },
              ],
            },
          ],
        },
      ],
    },
  };

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
                <Input placeholder="name" />
              </Form.Item>
              <Form.Item label="版本号" required>
                <Input placeholder="version" />
              </Form.Item>
              <Form.Item label="展示名称 (别名)" required>
                <Input placeholder="displayName" />
              </Form.Item>
              <Form.Item label="描述">
                <Input placeholder="description" />
              </Form.Item>
              <Form.Item label="官网主页">
                <Input placeholder="homePageURL" />
              </Form.Item>
              <Form.Item label="服务器地址">
                <Input placeholder="hookBaseURL" />
              </Form.Item>
              <Form.Item label="所需权限">
                <Checkbox.Group
                  options={permissionData}
                  defaultValue={['Apple']}
                />
              </Form.Item>
              <Form.Item label="应用配置参数">
                <SettingTabs<PowerAppConfig.Definition>
                  component={Config}
                  values={state.configs}
                  onChange={configs => setState({...state, configs})}
                />
              </Form.Item>
              <Form.Item label="自定义字段">
                {/* <Field value={state.contributions?.procedureFields}></Field> */}
              </Form.Item>
              <Form.Item label="超级流程项">
                <SettingTabs<PowerItemTypes.Definition>
                  component={PowerItem}
                  values={state.contributions?.powerItems}
                  onChange={powerItems => setContributions({powerItems})}
                />
              </Form.Item>
              <Form.Item label="超级概览">
                <SettingTabs<PowerGlanceTypes.Definition>
                  component={PowerGlance}
                  values={state.contributions?.powerGlances}
                  onChange={powerGlances => setContributions({powerGlances})}
                />
              </Form.Item>
              <Form.Item label="超级自定义检查项">
                <SettingTabs<PowerCustomCheckableItemTypes.Definition>
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
