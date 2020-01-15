import {OperationTokenToken} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

import {CompositeValueDescriptor} from './value';

import {PowerApp} from './power-app';

export namespace PowerItem {
  ///////////
  // Hooks //
  ///////////

  // activate hook //

  interface ActivateHookParams {
    source: PowerApp.Source;
    token: OperationTokenToken;
    inputs: Dict<unknown>;
    configs: Dict<unknown>;
  }

  // update hook //

  interface UpdateHookParams {
    source: PowerApp.Source;
    token: OperationTokenToken;
    inputs: Dict<unknown>;
    configs: Dict<unknown>;
  }

  // deactivate hook //

  interface DeactivateHookParams {
    source: PowerApp.Source;
    token: OperationTokenToken;
  }

  // action hook //

  interface ActionHookParams {
    source: PowerApp.Source;
    token: OperationTokenToken;
    inputs: Dict<unknown>;
    configs: Dict<unknown>;
  }

  ///

  interface HookReturn {
    description?: string;
    stage?: Stage;
    outputs?: Dict<CompositeValueDescriptor>;
  }

  ///////////////
  // Non-hooks //
  ///////////////

  // update //

  interface UpdateParams {
    token: string;
    description?: string;
    stage?: Stage;
    outputs?: Dict<CompositeValueDescriptor>;
  }

  type UpdateReturn = void;

  ///////////
  // Types //
  ///////////

  type Stage = 'none' | 'done';
}
