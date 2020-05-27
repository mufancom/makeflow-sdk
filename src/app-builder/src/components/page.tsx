import {PowerAppPage} from '@makeflow/types';
import {Card, Form, Icon, Input,  Switch, Tooltip} from 'antd';
import React, {FC, useState} from 'react';


export const Page: FC<{
  value: PowerAppPage.Definition;
  onChange(value: PowerAppPage.Definition | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let definition = value;

  let {
    displayName,
    name,
    description,
    url,
    icon,
    shortcut
  } = definition;

  let onPartChange = (part: Partial<PowerAppPage.Definition>): void => {
    onChange({
      ...definition,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}超级页面`}>
          <Icon type={fold ? 'down' : 'up'} onClick={() => setFold(!fold)} />
        </Tooltip>,
        <Tooltip placement="top" title="删除此超级页面">
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
                  name: value as PowerAppPage.Name,
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

          <Form.Item label="页面地址" required>
            <Input
              placeholder="url"
              value={url}
              onChange={({target: {value}}) =>
                onPartChange({
                  url: value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="描述">
            <Input
              placeholder="description"
              value={description}
              onChange={({target: {value}}) =>
                onPartChange({
                  description: value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="图标（仅移动端展示使用）">
            <Input
              placeholder="暂只支持以 http(s) 开头的网络资源地址"
              value={icon}
              onChange={({target: {value}}) =>
                onPartChange({
                  icon: value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="开启快捷访问">
            <Switch
              title="桌面端将列入 tab 栏中,移动端将列入快捷入口"
              checked={shortcut}
              onChange={shortcut => onPartChange({shortcut})}
            />
          </Form.Item>
        </>
      ) : (
        '已折叠'
      )}
    </Card>
  );
};
