import {PowerApp, PowerNode as PowerNodeTypes} from '@makeflow/types';
import React, {FC} from 'react';

import {PowerNode, SettingTabs} from '../@components';

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
    <SettingTabs<PowerNodeTypes.Definition>
      primaryKey="name"
      component={PowerNode}
      values={state.contributions?.powerNodes}
      onChange={powerNodes => setContributions({powerNodes})}
    />
  );
};

export default Wrapper;
