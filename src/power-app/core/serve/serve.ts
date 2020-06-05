import {EventEmitter} from 'events';

import {API} from '@makeflow/types';
import _ from 'lodash';

import {
  Events,
  PageEventParams,
  PowerCustomCheckableItemEventParams,
  PowerGlanceEventParams,
  PowerItemEventParams,
} from './events';

export interface IServeAdapter extends ServeAdapter {}

export interface ServeOptions {
  host?: string;
  path?: string;
  port?: number;
}

abstract class ServeAdapter extends EventEmitter {
  constructor(
    readonly sourceToken?: string,
    readonly options: ServeOptions = {},
  ) {
    super();
  }

  abstract serve(): void;

  abstract middleware(): any;

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
    let token = this.sourceToken;

    if (!token) {
      return true;
    }

    if (!source) {
      return false;
    }

    return _.isEqual(token, source.token);
  }
}

export function isPowerItemOrPowerNodeEventParams(
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

export function isPowerCustomCheckableEventParams(
  params: any,
): params is PowerCustomCheckableItemEventParams {
  let {name} = Object(params);

  return !!name;
}

export function isPageEventParams(params: any): params is PageEventParams {
  let {type, name} = Object(params);

  switch (type) {
    case 'request':
      return !!name;
    default:
      return false;
  }
}

export const AbstractServeAdapter = ServeAdapter;
