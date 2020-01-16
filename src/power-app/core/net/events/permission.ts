import {PowerApp} from '../../../types';

export interface PermissionEvent {
  type: 'permission';
  eventObjects: PermissionGrantEventObject | PermissionRevokeEventObject;
}

export interface PermissionGrantEventObject {
  type: 'grant';
  payload: PowerApp.PermissionGrantHookParams;
}

export interface PermissionRevokeEventObject {
  type: 'revoke';
  payload: PowerApp.PermissionRevokeHookParams;
}
