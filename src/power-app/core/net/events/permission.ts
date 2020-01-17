import {API} from '@makeflow/types';
import {Dict} from 'tslang';

export interface PermissionEvent {
  type: 'permission';
  eventObject: PermissionGrantEventObject | PermissionRevokeEventObject;
  response(data: Dict<unknown>): void;
}

export interface PermissionGrantEventObject {
  type: 'grant';
  payload: API.PowerApp.PermissionGrantHookParams;
}

export interface PermissionRevokeEventObject {
  type: 'revoke';
  payload: API.PowerApp.PermissionRevokeHookParams;
}
