import {
  PowerApp,
  PowerCustomCheckableItem as PowerCustomCheckableItemTypes,
} from '@makeflow/types';
import React, {FC} from 'react';

import {PowerCustomCheckableItem, SettingTabs} from '../@components';

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
    <SettingTabs<PowerCustomCheckableItemTypes.Definition>
      primaryKey="name"
      component={PowerCustomCheckableItem}
      values={state.contributions?.powerCustomCheckableItems}
      onChange={powerCustomCheckableItems =>
        setContributions({powerCustomCheckableItems})
      }
    />
  );
};

export default Wrapper;
