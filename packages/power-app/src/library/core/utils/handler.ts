import {PowerAppRoute} from '@makeflow/power-app-server-adapter';

import {PowerApp} from '../../app';
import {ContextType} from '../context';

import {errorLog} from './log';

export function handlerCatcher(
  app: PowerApp,
  handler: (app: PowerApp, params: any) => Promise<any>,
): PowerAppRoute<ContextType, any, any, any>['handler'] {
  return async params => {
    try {
      let result = await handler(app, params);
      return result;
    } catch (error) {
      errorLog(error);
      return {};
    }
  };
}
