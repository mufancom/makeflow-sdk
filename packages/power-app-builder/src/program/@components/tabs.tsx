import {
  GlanceReport,
  PowerApp,
  PowerAppConfig,
  PowerAppDataSource,
  PowerAppInput,
  PowerAppPage,
  PowerAppProcedureField,
  PowerCustomCheckableItem,
  PowerGlance,
  PowerItem,
  PowerNode,
} from '@makeflow/types';
import {Button, Tabs} from 'antd';
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
  | PowerNode.Definition
  | PowerNode.ActionDefinition
  | PowerItem.PowerItemFieldDefinition
  | PowerApp.DefinitionTagResource
  | PowerApp.DefinitionProcedureResource
  | PowerAppProcedureField.FieldBaseDefinition
  | GlanceReport.Definition
  | PowerAppPage.Definition
  | PowerAppDataSource.Definition;

export interface TabsProps<TValueType extends ValueType = ValueType> {
  primaryKey: keyof TValueType | undefined;
  displayKey?: 'displayName' | 'title' | 'name';
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
  displayKey = 'displayName',
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
            let newValues = primaryKey
              ? _.uniqBy(
                  [...values, {[primaryKey]: '', [displayKey]: ''} as any],
                  primaryKey,
                )
              : [...values, {[displayKey]: ''} as any];

            onChange(newValues);

            setActive(
              `${
                primaryKey
                  ? newValues.findIndex(value => !value[primaryKey])
                  : newValues.length - 1
              }`,
            );
          }}
        >
          Add New
        </Button>
      }
      onChange={k => setActive(k)}
    >
      {values.map((value, index) => (
        <TabPane tab={(value as any)[displayKey] || 'New'} key={`${index}`}>
          <ValueComponent
            value={value}
            onChange={getOnItemChange(index)}
          ></ValueComponent>
        </TabPane>
      ))}
    </Tabs>
  );
}

type ValueTypeWithoutTitle = GlanceReport.ElementDefinition;

export interface TabsPropsWithoutTitle<
  TValueType extends ValueTypeWithoutTitle = ValueTypeWithoutTitle
> {
  prefix: string;
  component: FC<{
    value: TValueType;
    onChange(value: TValueType | undefined): void;
  }>;
  values: TValueType[] | undefined;
  onChange(values: TValueType[]): void;
}

export function SettingTabsWithoutTitle<
  TValueType extends ValueTypeWithoutTitle
>({
  component: ValueComponent,
  prefix,
  values = [],
  onChange,
}: TabsPropsWithoutTitle<TValueType>): ReactElement {
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
            let newValues = _.uniq([...values, {} as TValueType]);

            onChange(newValues);

            setActive(`${newValues.length - 1}`);
          }}
        >
          Add New
        </Button>
      }
      onChange={k => setActive(k)}
    >
      {values.map((value, index) => (
        <TabPane tab={`${prefix}${index + 1}`} key={`${index}`}>
          <ValueComponent
            value={value}
            onChange={getOnItemChange(index)}
          ></ValueComponent>
        </TabPane>
      ))}
    </Tabs>
  );
}
