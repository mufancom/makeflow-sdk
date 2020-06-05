import {API} from '@makeflow/types';

export interface InstallationEvent {
  type: 'installation';
  eventObject:
    | InstallationActivateEventObject
    | InstallationDeactivateEventObject
    | InstallationUpdateEventObject;
  response(
    // 等主分支合了 types 类型
    data: API.PowerApp.InstallationUpdateHookReturn & {
      description?: string | false;
    },
  ): void;
}

export interface InstallationActivateEventObject {
  type: 'activate';
  payload: API.PowerApp.InstallationActivateHookParams;
}

export interface InstallationDeactivateEventObject {
  type: 'deactivate';
  payload: API.PowerApp.InstallationDeactivateHookParams;
}

export interface InstallationUpdateEventObject {
  type: 'update';
  payload: API.PowerApp.InstallationUpdateHookParams;
}
