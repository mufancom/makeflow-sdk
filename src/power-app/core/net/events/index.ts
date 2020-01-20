import {InstallationEvent} from './installation';
import {PermissionEvent} from './permission';
import {PowerGlanceEvent} from './power-glance';
import {PowerItemEvent} from './power-item';

export * from './installation';
export * from './permission';
export * from './power-item';
export * from './power-glance';

export type Events =
  | InstallationEvent
  | PermissionEvent
  | PowerItemEvent
  | PowerGlanceEvent;

export type EventType = Events['type'];

export type EventResponse = Events['response'];
