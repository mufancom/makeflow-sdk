import {EventEmitter} from 'events';

import {API} from '@makeflow/types';
import _ from 'lodash';

import {Events} from './events';

export interface INetAdapter extends NetAdapter {}

export interface NetAdapterOptions {
  port?: number;
  prefix?: string;
}

const DEFAULT_NET_OPTIONS: NetAdapterOptions = {
  prefix: '/',
  port: 3000,
};

abstract class NetAdapter extends EventEmitter {
  protected get options(): NetAdapterOptions {
    return this._options ?? DEFAULT_NET_OPTIONS;
  }

  constructor(
    readonly accessToken?: string,
    readonly _options?: NetAdapterOptions,
  ) {
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
    let token = this.accessToken;

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
