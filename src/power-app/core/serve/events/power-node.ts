import {API} from '@makeflow/types';

import {PowerAppVersion} from '../../types';

export interface PowerNodeEvent {
  type: 'power-node';
  eventObject: PowerNodeEventObject;
  response(data: API.PowerNode.HookReturn): void;
}

type _PowerNodeEventObject =
  | PowerNodeActivateEventObject
  | PowerNodeDeactivateEventObject
  | PowerNodeUpdateEventObject
  | PowerNodeActionEventObject;

export interface PowerNodeEventParams {
  name: string;
  type: Exclude<keyof PowerAppVersion.PowerNode.Definition<any>, 'migrations'>;
  action: string | undefined;
}

export type PowerNodeEventObject<
  TPowerNodeEventObject extends _PowerNodeEventObject = _PowerNodeEventObject
> = {
  params: PowerNodeEventParams;
} & TPowerNodeEventObject;

export interface PowerNodeActivateEventObject {
  payload: API.PowerNode.ActivateHookParams;
}

export interface PowerNodeDeactivateEventObject {
  payload: API.PowerNode.DeactivateHookParams & {
    inputs: undefined;
    configs: undefined;
  };
}

export interface PowerNodeUpdateEventObject {
  payload: API.PowerNode.UpdateHookParams;
}

export interface PowerNodeActionEventObject {
  payload: API.PowerNode.ActionHookParams;
}
