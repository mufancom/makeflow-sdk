import {
  PowerApp,
  ProcedureFieldSource as ProcedureFieldSourceTypes,
} from '@makeflow/types';
import React, {FC} from 'react';

import {ProcedureFieldSource, SettingTabs} from '../@components';

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
    <SettingTabs<ProcedureFieldSourceTypes.Definition>
      primaryKey="name"
      displayKey="displayName"
      component={ProcedureFieldSource}
      values={state.contributions?.procedureFieldSources}
      onChange={procedureFieldSources =>
        setContributions({procedureFieldSources})
      }
    />
  );
};

export default Wrapper;
