import {InstallationEvent} from './installation';
import {PageEvent} from './page';
import {PowerCustomCheckableItemEvent} from './power-custom-checkable-item';
import {PowerGlanceEvent} from './power-glance';
import {PowerItemEvent} from './power-item';
import {PowerNodeEvent} from './power-node';

export * from './installation';
export * from './power-item';
export * from './power-node';
export * from './power-glance';
export * from './power-custom-checkable-item';
export * from './page';

export type Events =
  | InstallationEvent
  | PowerItemEvent
  | PowerNodeEvent
  | PowerGlanceEvent
  | PowerCustomCheckableItemEvent
  | PageEvent;

export type EventType = Events['type'];

export type EventResponse = Events['response'];
