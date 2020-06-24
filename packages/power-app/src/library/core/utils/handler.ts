import {Events} from '../serve';
import {IPowerApp} from '../types';

import {errorLog} from './log';

export function handlerCatcher<TEvent extends Events>(
  app: IPowerApp,
  handler: (...args: any[]) => Promise<void>,
): (event: TEvent['eventObject'], response: TEvent['response']) => void {
  return (event, response) => {
    handler(app, event, response).catch(error => {
      errorLog(error);
      response({});
    });
  };
}
