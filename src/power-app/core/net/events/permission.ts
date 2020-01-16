import {Dict} from 'tslang';

import {PowerApp} from '../../../types';

export interface PermissionEvent {
  type: 'permission';
  eventObject: PermissionGrantEventObject | PermissionRevokeEventObject;
  response(data: Dict<unknown>): void;
}

export interface PermissionGrantEventObject {
  type: 'grant';
  payload: PowerApp.PermissionGrantHookParams;
}

export interface PermissionRevokeEventObject {
  type: 'revoke';
  payload: PowerApp.PermissionRevokeHookParams;
}
