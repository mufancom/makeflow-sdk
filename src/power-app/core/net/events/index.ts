import {InstallationEvent} from './installation';
import {PermissionEvent} from './permission';
import {PowerItemEvent} from './power-item';

export * from './installation';
export * from './permission';
export * from './power-item';

export type Events = InstallationEvent | PermissionEvent | PowerItemEvent;

export type EventType = Events['type'];
