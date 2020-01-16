import {PowerApp} from '../../../types';

export interface InstallationEvent {
  type: 'installation';
  eventObject:
    | InstallationActivateEventObject
    | InstallationDeactivateEventObject
    | InstallationUpdateEventObject;
  response(data: PowerApp.InstallationUpdateHookReturn): void;
}

export interface InstallationActivateEventObject {
  type: 'activate';
  payload: PowerApp.InstallationActivateHookParams;
}

export interface InstallationDeactivateEventObject {
  type: 'deactivate';
  payload: PowerApp.InstallationDeactivateHookParams;
}

export interface InstallationUpdateEventObject {
  type: 'update';
  payload: PowerApp.InstallationUpdateHookParams;
}
