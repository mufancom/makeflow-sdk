import {PowerApp} from '@makeflow/types';
import {BackTop, Breadcrumb, Button, Layout, Menu, notification} from 'antd';
import _ from 'lodash';
import React, {FC, useState} from 'react';
import {v4 as uuid} from 'uuid';

import './@app.css';

import {Start} from './@components';
import {Components} from './@views';

const {Content, Footer, Sider} = Layout;

type TabType = keyof typeof Components;

export const App: FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState<TabType>('Basic');
  const [state, setState] = useState<PowerApp.RawDefinition>(
    {} as PowerApp.RawDefinition,
  );

  const Component = Components[active];

  handleLeave(state);

  return (
    <Layout style={{minHeight: '100vh'}}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="light"
      >
        <div className="logo" style={{margin: '24px 0', overflow: 'hidden'}}>
          <Button type="link">PowerApp Builder V2.0</Button>
        </div>
        <Menu
          defaultSelectedKeys={['Basic']}
          mode="inline"
          onSelect={({key}) => setActive(`${key}` as TabType)}
        >
          <Menu.Item key="Basic">Basic</Menu.Item>
          <Menu.Item key="Configs">Configs</Menu.Item>
          <Menu.Item key="Fields">Fields</Menu.Item>
          <Menu.Item key="Pages">Pages</Menu.Item>
          <Menu.Item key="PowerItems">PowerItems</Menu.Item>
          <Menu.Item key="PowerNodes">PowerNodes</Menu.Item>
          <Menu.Item key="PowerGlances">PowerGlances</Menu.Item>
          <Menu.Item key="PowerCustomCheckableItems">
            PowerCustomCheckableItems
          </Menu.Item>
          <Menu.Item key="DataSources">DataSources</Menu.Item>
          <Menu.Item key="Resources">Resources</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{margin: '0 16px', maxWidth: 1200}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <Breadcrumb style={{margin: '16px 0', flex: 1}}>
              <Breadcrumb.Item>PowerApp</Breadcrumb.Item>
              <Breadcrumb.Item>{active}</Breadcrumb.Item>
            </Breadcrumb>
            <Button onClick={() => copyToClipBoard(state)}>
              Copy Definition
            </Button>
            &nbsp;
            <Button
              style={{marginRight: 24}}
              type="primary"
              onClick={() => exportDefinition(state)}
            >
              Export Definition
            </Button>
          </div>
          <div style={{padding: 24, minHeight: 360}}>
            <Component state={state} setState={setState} />
          </div>
        </Content>
        <Footer style={{textAlign: 'center'}}>
          © 2020 Chengdu Mufan Technology Co.Ltd.
          <Button
            type="link"
            onClick={() => window.open('https://www.makeflow.com', '_blank')}
          >
            Makeflow
          </Button>
        </Footer>
      </Layout>
      <Start onChange={importedDefinition => setState(importedDefinition)} />
      <BackTop />
    </Layout>
  );
};

// utils

/**
 * 格式化 definition
 */
function formatDefinition(
  definition: PowerApp.RawDefinition,
): PowerApp.RawDefinition {
  let powerItem = definition.contributions?.powerItems;

  if (powerItem?.length) {
    definition.contributions!.powerItems = powerItem.map(item => {
      let fields = item.fields;

      // 添加 uuid

      if (fields?.length) {
        item.fields = fields.map(({id, ...rest}) => ({
          ...rest,
          id: id ?? uuid(),
        }));
      }

      // 清空未填的 action target

      let actions = item.actions;

      if (actions?.length) {
        item.actions = actions.map(({target, ...rest}) => ({
          ...rest,
          target: target || undefined,
        }));
      }

      return item;
    });
  }

  return definition;
}

function handleLeave(definition: PowerApp.RawDefinition): void {
  window.onbeforeunload = () => {
    if (_.isEmpty(definition)) {
      return undefined;
    }

    return 'handled';
  };
}

function exportDefinition(definition: PowerApp.RawDefinition): void {
  definition = formatDefinition(definition);

  let anchor = document.createElement('a');

  anchor.download = `${definition.displayName}.json`;
  anchor.href = URL.createObjectURL(
    new Blob([JSON.stringify(definition, undefined, 2)], {type: 'text/plain'}),
  );
  anchor.click();

  URL.revokeObjectURL(anchor.href);
}

function copyToClipBoard(definition: PowerApp.RawDefinition): void {
  definition = formatDefinition(definition);

  let textarea = document.createElement('textarea');

  textarea.setAttribute('readonly', 'readonly');
  textarea.value = JSON.stringify(definition, undefined, 2);

  document.body.appendChild(textarea);

  textarea.setSelectionRange(0, textarea.value.length);
  textarea.select();

  if (document.execCommand('copy')) {
    document.execCommand('copy');

    notification.open({
      message: '😀',
      description: 'Copy Succeeded !',
    });
  } else {
    notification.open({
      message: '😥',
      description: 'Copy Failed ! Please use Export',
    });
  }

  document.body.removeChild(textarea);
}
