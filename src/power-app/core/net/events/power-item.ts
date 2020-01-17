import {API} from '@makeflow/types';

import {PowerAppVersion} from '../../version';

export interface PowerItemEvent {
  type: 'power-item';
  eventObject: PowerItemEventObject;
  response(data: PowerAppVersion.PowerItem.ChangeResponseData): void;
}

type _PowerItemEventObject =
  | PowerItemActivateEventObject
  | PowerItemDeactivateEventObject
  | PowerItemUpdateEventObject
  | PowerItemActionEventObject;

export type PowerItemEventObject<
  TPowerItemEventObject extends _PowerItemEventObject = _PowerItemEventObject
> = {
  change: PowerAppVersion.PowerItem.PowerItemChange;
} & TPowerItemEventObject;

export interface PowerItemActivateEventObject {
  type: 'activate';
  payload: API.PowerItem.ActivateHookParams;
}

export interface PowerItemDeactivateEventObject {
  type: 'deactivate';
  payload: API.PowerItem.DeactivateHookParams;
}

export interface PowerItemUpdateEventObject {
  type: 'update';
  payload: API.PowerItem.UpdateHookParams;
}

export interface PowerItemActionEventObject {
  type: 'action';
  payload: API.PowerItem.ActionHookParams;
}
