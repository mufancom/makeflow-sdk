import {PowerAppRoute} from '@makeflow/power-app-server-adapter';

import {PowerApp} from '../../app';
import {ContextType} from '../context';

import {errorLog} from './log';

export function handlerCatcher(
  app: PowerApp,
  handler: (app: PowerApp, data: any) => Promise<any>,
): PowerAppRoute<ContextType, any, any, any>['handler'] {
  return async data => {
    try {
      let result = await handler(app, data);
      return result;
    } catch (error) {
      errorLog(error);
      return {};
    }
  };
}
