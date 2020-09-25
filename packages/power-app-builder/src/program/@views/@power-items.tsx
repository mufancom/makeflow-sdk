import {PowerApp, PowerItem as PowerItemTypes} from '@makeflow/types';
import React, {FC} from 'react';

import {PowerItem, SettingTabs} from '../@components';

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
    <SettingTabs<PowerItemTypes.Definition>
      primaryKey="name"
      component={PowerItem}
      values={state.contributions?.powerItems}
      onChange={powerItems => setContributions({powerItems})}
    />
  );
};

export default Wrapper;
