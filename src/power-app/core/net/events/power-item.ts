import {API} from '@makeflow/types';

import {PowerAppVersion} from '../../version';

export interface PowerItemEvent {
  type: 'power-item';
  eventObject: PowerItemEventObject;
  response(data: API.PowerItem.HookReturn): void;
}

type _PowerItemEventObject =
  | PowerItemActivateEventObject
  | PowerItemDeactivateEventObject
  | PowerItemUpdateEventObject
  | PowerItemActionEventObject;

export interface PowerItemEventParams {
  name: string;
  type: Exclude<keyof PowerAppVersion.PowerItem.Definition, 'migrations'>;
  action: string | undefined;
}

export type PowerItemEventObject<
  TPowerItemEventObject extends _PowerItemEventObject = _PowerItemEventObject
> = {
  params: PowerItemEventParams;
} & TPowerItemEventObject;

export interface PowerItemActivateEventObject {
  payload: API.PowerItem.ActivateHookParams;
}

export interface PowerItemDeactivateEventObject {
  payload: API.PowerItem.DeactivateHookParams;
}

export interface PowerItemUpdateEventObject {
  payload: API.PowerItem.UpdateHookParams;
}

export interface PowerItemActionEventObject {
  payload: API.PowerItem.ActionHookParams;
}
