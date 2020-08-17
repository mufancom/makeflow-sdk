import express, {Express, Response, Router} from 'express';
import _ from 'lodash';

import {
  DataSourceEvent,
  Events,
  InstallationEvent,
  PageEvent,
  PowerCustomCheckableItemEvent,
  PowerGlanceEvent,
  PowerItemEvent,
  PowerNodeEvent,
} from './events';
import {
  AbstractServeAdapter,
  ServeOptions,
  isPageEventParams,
  isPowerCustomCheckableEventParams,
  isPowerGlanceEventParams,
  isPowerItemOrPowerNodeEventParams,
} from './serve';

const EXPRESS_DEFAULT_PORT = 3000;

declare module 'express/index' {
  interface Response {
    bodyPromise: Promise<any>;
  }
}

export class ExpressAdapter extends AbstractServeAdapter {
  private app = express();

  constructor(
    readonly sourceToken?: string,
    readonly options: ServeOptions = {},
  ) {
    super(sourceToken, options);

    let {path = '/'} = this.options;

    let router = Router();

    router
      .all('*', async (request, response: Response, next) => {
        if (!this.authenticate(request.body?.source)) {
          response.status(416).send('authenticate failed');
          return;
        }

        await next();

        response.send(await response.bodyPromise);
      })
      .post(
        '/installation/:type',
        ({body, params: {type}}, response: Response) => {
          this.emit<InstallationEvent>(
            'installation',
            {
              type: type as InstallationEvent['eventObject']['type'],
              payload: body,
            },
            getResponse<InstallationEvent>(response),
          );
        },
      )
      .post(
        '/power-item/:name/:type/:action?',
        ({body, params}, response: Response) => {
          if (!isPowerItemOrPowerNodeEventParams(params)) {
            return;
          }

          this.emit<PowerItemEvent>(
            'power-item',
            {
              params,
              payload: body,
            },
            getResponse<PowerItemEvent>(response),
          );
        },
      )
      .post(
        '/power-node/:name/:type/:action?',
        ({body, params}, response: Response) => {
          if (!isPowerItemOrPowerNodeEventParams(params)) {
            return;
          }

          this.emit<PowerNodeEvent>(
            'power-node',
            {
              params,
              payload: body,
            },
            getResponse<PowerNodeEvent>(response),
          );
        },
      )
      .post(
        '/power-glance/:name/:type',
        ({body, params}, response: Response) => {
          if (!isPowerGlanceEventParams(params)) {
            return;
          }

          this.emit<PowerGlanceEvent>(
            'power-glance',
            {
              payload: body,
              params,
            },
            getResponse<PowerGlanceEvent>(response),
          );
        },
      )
      .post(
        '/power-custom-checkable-item/:name',
        ({body, params}, response: Response) => {
          if (!isPowerCustomCheckableEventParams(params)) {
            return;
          }

          this.emit<PowerCustomCheckableItemEvent>(
            'power-custom-checkable-item',
            {
              payload: body,
              params,
            },
            getResponse<PowerCustomCheckableItemEvent>(response),
          );
        },
      )
      .post('/page/:name/:type', ({body, params}, response: Response) => {
        if (!isPageEventParams(params)) {
          return;
        }

        this.emit<PageEvent>(
          'page',
          {
            payload: body,
            params,
          },
          getResponse<PageEvent>(response),
        );
      })
      .post(
        '/data-source/:name/:type',
        ({body, params}, response: Response) => {
          if (!isPageEventParams(params)) {
            return;
          }

          this.emit<DataSourceEvent>(
            'data-source',
            {
              payload: body,
              params,
            },
            getResponse<DataSourceEvent>(response),
          );
        },
      );

    this.app.use(express.json()).use(path, router);
  }

  serve(): void {
    let {port = EXPRESS_DEFAULT_PORT, host} = this.options;

    this.app.listen(port, host!);
  }

  middleware(): Express {
    return this.app;
  }
}

function getResponse<TEvent extends Events>(
  expressResponse: Response,
): TEvent['response'] {
  let response!: TEvent['response'];
  expressResponse.bodyPromise = new Promise(resolve => (response = resolve));
  return response;
}
