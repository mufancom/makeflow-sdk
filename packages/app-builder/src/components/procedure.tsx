import {PowerApp, Procedure as ProcedureTypes} from '@makeflow/types';
import {Card, Form, Icon, Input, Tooltip} from 'antd';
import React, {FC, useState} from 'react';

const {TextArea} = Input;

export const Procedure: FC<{
  value: PowerApp.DefinitionProcedureResource;
  onChange(value: PowerApp.DefinitionProcedureResource | undefined): void;
}> = ({value, onChange}) => {
  const [fold, setFold] = useState(false);

  let config = value;

  let {displayName, name, revision} = config;

  let onPartChange = (
    part: Partial<PowerApp.DefinitionProcedureResource>,
  ): void => {
    onChange({
      ...config,
      ...part,
    });
  };

  return (
    <Card
      actions={[
        <Tooltip placement="top" title={`${fold ? '展开' : '折叠'}流程`}>
          <Icon
            type={fold ? 'down' : 'up'}
            onClick={(): void => setFold(!fold)}
          />
        </Tooltip>,
        <Tooltip placement="top" title="删除此流程">
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
              onChange={({target: {value}}): void =>
                onPartChange({
                  name: value as PowerApp.DefinitionResourceName,
                })
              }
            />
          </Form.Item>
          <Form.Item label="展示名称 (别名)" required>
            <Input
              placeholder="displayName"
              value={displayName}
              onChange={({target: {value}}): void =>
                onPartChange({
                  displayName: value,
                })
              }
            />
          </Form.Item>

          <Form.Item label="流程定义" required>
            <TextArea
              value={JSON.stringify(revision)}
              placeholder="请粘贴流程定义，建议使用 makeflow 流程编辑器"
              rows={4}
              onChange={({target: {value}}) =>
                onPartChange({
                  revision: getRevision(value),
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

function getRevision(value: string): ProcedureTypes.Definition | undefined {
  try {
    return JSON.parse(value);
  } catch (error) {
    return undefined;
  }
}
