import {EventEmitter} from 'events';

import {PowerAppVersion} from '../version';

import {Events} from './events';

export interface INetAdapter extends NetAdapter {}

abstract class NetAdapter extends EventEmitter {
  constructor(protected definition: PowerAppVersion.Definition) {
    super();
  }

  abstract serve(): void;

  on<TEvent extends Events>(
    type: TEvent['type'],
    listener: (
      event: TEvent['eventObject'],
      response: TEvent['response'],
    ) => void,
  ): this {
    return super.on(type, listener);
  }

  emit<TEvent extends Events>(
    type: TEvent['type'],
    event: TEvent['eventObject'],
    response: TEvent['response'],
  ): boolean {
    return super.emit(type, event, response);
  }
}

export const AbstractNetAdapter = NetAdapter;
