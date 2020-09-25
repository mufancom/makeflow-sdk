import {PowerApp, PowerAppDataSource} from '@makeflow/types';
import React, {FC} from 'react';

import {DateSource, SettingTabs} from '../@components';

const Wrapper: FC<{
  state: PowerApp.RawDefinition;
  setState(state: PowerApp.RawDefinition): void;
}> = ({state, setState}) => {
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
    <SettingTabs<PowerAppDataSource.Definition>
      primaryKey="name"
      displayKey="name"
      component={DateSource}
      values={state.contributions?.dataSources}
      onChange={dataSources => setContributions({dataSources})}
    />
  );
};

export default Wrapper;
