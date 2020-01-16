import {PowerApp} from '../../../types';

export interface InstallationEvent {
  type: 'installation';
  eventObjects:
    | InstallationActivateEventObject
    | InstallationDeactivateEventObject
    | InstallationUpdateEventObject;
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
