import {PowerApp, PowerAppConfig} from '@makeflow/types';
import React, {FC} from 'react';

import {Config, SettingTabs} from '../@components';

const Wrapper: FC<{
  state: PowerApp.RawDefinition;
  setState(state: PowerApp.RawDefinition): void;
}> = ({state, setState}) => {
  return (
    <SettingTabs<PowerAppConfig.Definition>
      primaryKey="name"
      component={Config}
      values={state.configs}
      onChange={configs => setState({...state, configs})}
    />
  );
};

export default Wrapper;
