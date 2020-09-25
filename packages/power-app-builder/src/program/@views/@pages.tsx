import {PowerApp, PowerAppPage} from '@makeflow/types';
import React, {FC} from 'react';

import {Page, SettingTabs} from '../@components';

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
    <SettingTabs<PowerAppPage.Definition>
      primaryKey="name"
      component={Page}
      values={state.contributions?.pages}
      onChange={pages => setContributions({pages})}
    />
  );
};

export default Wrapper;
