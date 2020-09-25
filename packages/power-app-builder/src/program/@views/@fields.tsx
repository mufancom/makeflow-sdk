import {PowerApp, PowerAppProcedureField} from '@makeflow/types';
import React, {FC} from 'react';

import {AppField, SettingTabs} from '../@components';

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
    <SettingTabs<PowerAppProcedureField.FieldBaseDefinition>
      primaryKey="type"
      component={AppField}
      values={state.contributions?.procedureFields}
      onChange={procedureFields => setContributions({procedureFields})}
    />
  );
};

export default Wrapper;
