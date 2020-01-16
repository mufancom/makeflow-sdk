import {PowerItem} from '../../../types';
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
