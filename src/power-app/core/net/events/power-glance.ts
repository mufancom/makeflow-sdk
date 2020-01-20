import {API} from '@makeflow/types';

import {PowerAppVersion} from '../../version';

export interface PowerGlanceEvent {
  type: 'power-glance';
  eventObject: PowerGlanceEventObject;
  response(data: API.PowerGlance.HookReturn): void;
}

type _PowerGlanceEventObject =
  | PowerGlanceInitializeEventObject
  | PowerGlanceUpdateEventObject
  | PowerGlanceDisposeEventObject;

export type PowerGlanceEventObject<
  TPowerGlanceEventObject extends _PowerGlanceEventObject = _PowerGlanceEventObject
> = {
  change: PowerAppVersion.PowerGlance.Change;
} & TPowerGlanceEventObject;

export interface PowerGlanceInitializeEventObject {
  type: 'initialize';
  payload: API.PowerGlance.InitializeHookParams;
}

export interface PowerGlanceUpdateEventObject {
  type: 'update';
  payload: API.PowerGlance.UpdateHookParams;
}

export interface PowerGlanceDisposeEventObject {
  type: 'dispose';
  // TODO (boen): types
  payload: API.PowerGlance.UpdateHookParams;
}
