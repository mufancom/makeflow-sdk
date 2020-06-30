import {PowerApp} from '../../app';
import {Events} from '../serve';

import {errorLog} from './log';

export function handlerCatcher<TEvent extends Events>(
  app: PowerApp,
  handler: (...args: any[]) => Promise<void>,
): (event: TEvent['eventObject'], response: TEvent['response']) => void {
  return (event, response) => {
    handler(app, event, response).catch(error => {
      errorLog(error);
      response({});
    });
  };
}
