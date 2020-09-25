import {PowerApp} from '@makeflow/types';
import React, {FC} from 'react';

import {Procedure, SettingTabs, SubFormItem, Tag} from '../@components';

const Wrapper: FC<{
  state: PowerApp.RawDefinition;
  setState(state: PowerApp.RawDefinition): void;
}> = ({state, setState}) => {
  function setResources(
    partResources: Partial<PowerApp.RawDefinition['resources']>,
  ): void {
    let resources: PowerApp.RawDefinition['resources'] = {
      ...state.resources,
      ...partResources,
    };

    setState({...state, resources});
  }

  return (
    <>
      <SubFormItem label="Tag">
        <SettingTabs<PowerApp.DefinitionTagResource>
          primaryKey="name"
          component={Tag}
          values={state.resources?.tags}
          onChange={tags => setResources({tags})}
        />
      </SubFormItem>
      <SubFormItem label=" Procedure">
        <SettingTabs<PowerApp.DefinitionProcedureResource>
          primaryKey="name"
          component={Procedure}
          values={state.resources?.procedures}
          onChange={procedures => setResources({procedures})}
        />
      </SubFormItem>
    </>
  );
};

export default Wrapper;
