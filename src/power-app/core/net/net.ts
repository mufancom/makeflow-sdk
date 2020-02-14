import {EventEmitter} from 'events';

import {API} from '@makeflow/types';
import _ from 'lodash';

import {Events, PowerGlanceEventParams, PowerItemEventParams} from './events';

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
    let existedListeners = super.emit(type, event, response);

    if (!existedListeners) {
      response({});
    }

    return existedListeners;
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

export function isPowerItemEventParams(
  params: any,
): params is PowerItemEventParams {
  let {type, action} = Object(params);

  switch (type) {
    case 'activate':
    case 'update':
    case 'deactivate':
      return true;
    case 'action':
      return !!action;
    default:
      return false;
  }
}

export function isPowerGlanceEventParams(
  params: any,
): params is PowerGlanceEventParams {
  let {type} = Object(params);

  switch (type) {
    case 'initialize':
    case 'change':
    case 'dispose':
      return true;
    default:
      return false;
  }
}

export const AbstractNetAdapter = NetAdapter;
