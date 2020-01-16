import {EventEmitter} from 'events';

import {PowerAppVersionDefinition} from '../../app';

import {EventType, Events} from './events';

export interface INetAdapter extends NetAdapter {}

abstract class NetAdapter extends EventEmitter {
  constructor (protected definition: PowerAppVersionDefinition) {
    super();
  }

  abstract serve (): void;

  // on (
  //   event: '',
  //   listener: (params: PowerApp.InstallationActivateHookParams) => void,
  // ): this;
  // on (event: 'power-item:hook', listener: () => void): this;
  on<TT extends TEventObject['type'], TEventObject extends Events> (
    event: TT,
    listener: (event: TEventObject['eventObjects']) => void,
  ): this {
    return super.on(event, listener);
  }

  emit (event: EventType, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
}

export const AbstractNetAdapter = NetAdapter;
