import {
  PowerAppConfig,
  PowerAppInput,
  PowerCustomCheckableItem,
  PowerGlance,
  PowerItem,
} from '@makeflow/types';
import {PowerAppProcedureFieldDefinition} from '@makeflow/types/procedure';
import {Button, Icon, Tabs} from 'antd';
import _ from 'lodash';
import React, {FC, ReactElement, useState} from 'react';

const {TabPane} = Tabs;

type ValueType =
  | PowerAppConfig.Definition
  | PowerItem.Definition
  | PowerGlance.Definition
  | PowerCustomCheckableItem.Definition
  | PowerAppInput.Definition
  | PowerItem.ActionDefinition
  | PowerAppProcedureFieldDefinition;

export interface TabsProps<TValueType extends ValueType = ValueType> {
  primaryKey: keyof TValueType;
  component: FC<{
    value: TValueType;
    onChange(value: TValueType | undefined): void;
  }>;
  values: TValueType[] | undefined;
  onChange(values: TValueType[]): void;
}

export function SettingTabs<TValueType extends ValueType>({
  component: ValueComponent,
  primaryKey,
  values = [],
  onChange,
}: TabsProps<TValueType>): ReactElement {
  const [_active, setActive] = useState('0');

  let active = `${Math.min(values.length - 1, +_active)}`;

  function getOnItemChange(index: number): (value: TValueType) => void {
    let _values: TValueType[] = JSON.parse(JSON.stringify(values));

    return value => {
      _values.splice(index, 1, value);
      onChange(_.compact(_values));
    };
  }

  return (
    <Tabs
      activeKey={active}
      type="card"
      className="tabs"
      tabBarExtraContent={
        <Button
          type="dashed"
          onClick={() => {
            let newValues = _.uniqBy(
              [...values, {[primaryKey]: '', displayName: ''} as TValueType],
              primaryKey,
            );

            onChange(newValues);

            setActive(`${newValues.findIndex(value => !value[primaryKey])}`);
          }}
        >
          <Icon type="plus"></Icon>
        </Button>
      }
      onChange={k => setActive(k)}
    >
      {values.map((value, index) => (
        <TabPane tab={value.displayName || '新建'} key={`${index}`}>
          <ValueComponent
            value={value}
            onChange={getOnItemChange(index)}
          ></ValueComponent>
        </TabPane>
      ))}
    </Tabs>
  );
}
