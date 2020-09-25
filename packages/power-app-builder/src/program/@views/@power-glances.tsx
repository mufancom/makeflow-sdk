import {PowerApp, PowerGlance as PowerGlanceTypes} from '@makeflow/types';
import React, {FC} from 'react';

import {PowerGlance, SettingTabs} from '../@components';

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
    <SettingTabs<PowerGlanceTypes.Definition>
      primaryKey="name"
      component={PowerGlance}
      values={state.contributions?.powerGlances}
      onChange={powerGlances => setContributions({powerGlances})}
    />
  );
};

export default Wrapper;
