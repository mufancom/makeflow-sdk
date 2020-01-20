import {EventEmitter} from 'events';

import {API} from '@makeflow/types';
import _ from 'lodash';

import {Events} from './events';

export interface INetAdapter extends NetAdapter {}

export interface NetAdapterOptions {
  token?: string;
  port?: number;
  prefix?: string;
}

abstract class NetAdapter extends EventEmitter {
  constructor(readonly options?: NetAdapterOptions) {
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

  authenticate(source: API.PowerApp.Source | undefined): boolean {
    let token = this.options?.token;

    if (!token) {
      return true;
    }

    if (!source) {
      return false;
    }

    return _.isEqual(token, source.token);
  }
}

export const AbstractNetAdapter = NetAdapter;
