import {PowerItem} from '../../../types';

export interface PowerItemEvent {
  type: 'power-item';
  eventObjects:
    | PowerItemActivateEventObject
    | PowerItemDeactivateEventObject
    | PowerItemUpdateEventObject
    | PowerItemActionEventObject;
}

export interface PowerItemActivateEventObject {
  type: 'activate';
  payload: PowerItem.ActivateHookParams;
}

export interface PowerItemDeactivateEventObject {
  type: 'deactivate';
  payload: PowerItem.DeactivateHookParams;
}

export interface PowerItemUpdateEventObject {
  type: 'update';
  payload: PowerItem.UpdateHookParams;
}

export interface PowerItemActionEventObject {
  type: 'action';
  payload: PowerItem.ActionHookParams;
}
