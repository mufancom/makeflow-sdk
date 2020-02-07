import {
  PowerApp,
  PowerAppConfig,
  PowerCustomCheckableItem as PowerCustomCheckableItemTypes,
  PowerGlance as PowerGlanceTypes,
  PowerItem as PowerItemTypes,
} from '@makeflow/types';
import {PowerAppProcedureFieldDefinition} from '@makeflow/types/procedure';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Icon,
  Input,
  Layout,
  Row,
  notification,
} from 'antd';
import _ from 'lodash';
import React, {FC, useState} from 'react';

import './App.css';
import {
  AppField,
  Config,
  PowerCustomCheckableItem,
  PowerGlance,
  PowerItem,
  Setting,
  SettingTabs,
  Start,
} from './components';
import {permissionData} from './permission';

const {Header, Footer, Content} = Layout;

export const App: FC = () => {
  const [toShowSetting, setToShowSetting] = useState<boolean>(false);

  const [state, setState] = useState<PowerApp.RawDefinition>(
    {} as PowerApp.RawDefinition,
  );

  handleLeave(state);

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
    <Layout className="app">
      <Header className="header">
        Power App 定义工具
        {localStorage.WIP ? (
          <Icon type="setting" onClick={() => setToShowSetting(true)}></Icon>
        ) : (
          undefined
        )}
      </Header>

      <Start onChange={importedDefinition => setState(importedDefinition)} />

      {localStorage.WIP ? (
        <Setting visible={toShowSetting} setVisible={setToShowSetting} />
      ) : (
        undefined
      )}

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
              <Form.Item label="资源包">暂未开放</Form.Item>
              <Form.Item style={{textAlign: 'center'}}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() => exportDefinition(state)}
                >
                  导出定义
                </Button>
                &nbsp;
                <Button size="large" onClick={() => copyToClipBoard(state)}>
                  复制
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Content>
      <Footer>
        © 2020 成都木帆科技有限公司
        <Button
          type="link"
          onClick={() => window.open('https://makeflow.com', '_blank')}
        >
          makeflow
        </Button>
      </Footer>
    </Layout>
  );
};

function handleLeave(definition: PowerApp.RawDefinition): void {
  window.onbeforeunload = () => {
    if (_.isEmpty(definition)) {
      return undefined;
    }

    return 'handled';
  };
}

function exportDefinition(definition: PowerApp.RawDefinition): void {
  let anchor = document.createElement('a');

  anchor.download = `${definition.displayName}.json`;
  anchor.href = URL.createObjectURL(
    new Blob([JSON.stringify(definition, undefined, 2)], {type: 'text/plain'}),
  );
  anchor.click();

  URL.revokeObjectURL(anchor.href);
}

function copyToClipBoard(definition: PowerApp.RawDefinition): void {
  let textarea = document.createElement('textarea');

  textarea.setAttribute('readonly', 'readonly');
  textarea.value = JSON.stringify(definition, undefined, 2);

  document.body.appendChild(textarea);

  textarea.setSelectionRange(0, textarea.value.length);
  textarea.select();

  if (document.execCommand('copy')) {
    document.execCommand('copy');

    notification.open({
      message: '复制完成',
      description: '已复制到剪贴板',
    });
  } else {
    notification.open({
      message: '复制失败',
      description: '请使用导出',
    });
  }

  document.body.removeChild(textarea);
}
