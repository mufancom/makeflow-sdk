import {API} from '@makeflow/types';

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
  type: 'initialize' | 'change' | 'dispose';
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
  payload: API.PowerGlance.DisposeHookParams & {
    clock: undefined;
    resources: undefined;
    configs: undefined;
  } & {
    powerGlanceConfigs: undefined;
  };
}
