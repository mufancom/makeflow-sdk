import {
  PowerApp,
  PowerAppConfig,
  PowerCustomCheckableItem as PowerCustomCheckableItemTypes,
  PowerGlance as PowerGlanceTypes,
  PowerItem as PowerItemTypes,
} from '@makeflow/types';
import {PowerAppProcedureFieldDefinition} from '@makeflow/types/procedure';
import {Button, Checkbox, Col, Form, Icon, Input, Layout, Row} from 'antd';
import {FormComponentProps} from 'antd/lib/form';
import _ from 'lodash';
import React, {FC, forwardRef, useState} from 'react';

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

const _App: FC<FormComponentProps> = ({form: {getFieldsValue}}, ref) => {
  const [toShowSetting, setToShowSetting] = useState<boolean>(false);

  const [state, setState] = useState<PowerApp.RawDefinition>(
    {} as PowerApp.RawDefinition,
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

  window.onbeforeunload = () => {
    if (_.isEmpty(state)) {
      return undefined;
    }

    return 'handled';
  };

  return (
    <Layout className="app" ref={ref}>
      <Header className="header">
        Power App 定义工具
        <Icon type="setting" onClick={() => setToShowSetting(true)}></Icon>
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
              <Form.Item>
                <Button type="primary" onClick={() => exportDefinition(state)}>
                  导出
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

function exportDefinition(definition: PowerApp.RawDefinition): void {
  let anchor = document.createElement('a');

  anchor.download = `${definition.displayName}.json`;
  anchor.href = URL.createObjectURL(
    new Blob([JSON.stringify(definition, undefined, 2)], {type: 'text/plain'}),
  );
  anchor.click();

  URL.revokeObjectURL(anchor.href);
}

export default Form.create()(forwardRef(_App));
