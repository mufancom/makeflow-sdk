import {EventEmitter} from 'events';

import {PowerAppVersionDefinition} from '../../app';
import {PowerApp} from '../../types';

export type EventType = InstallationEventType | 'power-item:hook';

export type InstallationEventType = 'installation:activate';

export interface INetAdapter extends NetAdapter {}

abstract class NetAdapter extends EventEmitter {
  constructor(protected definition: PowerAppVersionDefinition) {
    super();
  }

  abstract serve(): void;

  on(
    event: 'installation:activate',
    listener: (params: PowerApp.InstallationActivateHookParams) => void,
  ): this;
  on(event: 'power-item:hook', listener: (...args: any[]) => void): this;
  on(event: EventType, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  emit(event: EventType, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const AbstractNetAdapter = NetAdapter;
