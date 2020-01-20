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

export interface PowerGlanceEventParams {
  name: string;
  type: Exclude<keyof PowerAppVersion.PowerGlance.Definition, 'migrations'>;
}

export type PowerGlanceEventObject<
  TPowerGlanceEventObject extends _PowerGlanceEventObject = _PowerGlanceEventObject
> = {
  params: PowerGlanceEventParams;
} & TPowerGlanceEventObject;

export interface PowerGlanceInitializeEventObject {
  payload: API.PowerGlance.InitializeHookParams;
}

export interface PowerGlanceUpdateEventObject {
  payload: API.PowerGlance.UpdateHookParams;
}

export interface PowerGlanceDisposeEventObject {
  // TODO (boen): types
  payload: API.PowerGlance.UpdateHookParams;
}
