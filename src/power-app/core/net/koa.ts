import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router, {RouterContext} from 'koa-router';
import _ from 'lodash';

import {
  Events,
  InstallationEvent,
  PermissionEvent,
  PowerGlanceEvent,
  PowerItemEvent,
} from './events';
import {
  AbstractNetAdapter,
  isPowerGlanceEventParams,
  isPowerItemEventParams,
} from './net';

export class KoaAdapter extends AbstractNetAdapter {
  private app = new Koa();

  constructor(...args: any[]) {
    super(...args);

    let {prefix} = this.options;

    prefix = prefix !== '/' ? prefix : undefined;

    let router = new Router<unknown>({prefix});

    router
      .all('*', async (context, next) => {
        console.info(context.path);

        if (!this.authenticate(context.request.body?.source)) {
          context.throw('authenticate failed', 416);
          return;
        }

        await next();

        context.body = await context.body;
      })
      .post('/installation/:type', context => {
        let {
          params: {type},
          request: {body},
        } = context;

        this.emit<InstallationEvent>(
          'installation',
          {
            type,
            payload: body,
          },
          getResponse<InstallationEvent>(context),
        );
      })
      .post('/permission/:type', context => {
        let {
          params: {type},
          request: {body},
        } = context;

        this.emit<PermissionEvent>(
          'permission',
          {
            type,
            payload: body,
          },
          getResponse<PermissionEvent>(context),
        );
      })
      .post('/power-item/:name/:type/:action?', context => {
        let {
          params,
          request: {body},
        } = context;

        if (!isPowerItemEventParams(params)) {
          return;
        }

        this.emit<PowerItemEvent>(
          'power-item',
          {
            params,
            payload: body,
          },
          getResponse<PowerItemEvent>(context),
        );
      })
      .post('/power-glance/:name/:type', context => {
        let {
          params,
          request: {body},
        } = context;

        if (!isPowerGlanceEventParams(params)) {
          return;
        }

        this.emit<PowerGlanceEvent>(
          'power-glance',
          {
            payload: body,
            params,
          },
          getResponse<PowerGlanceEvent>(context),
        );
      })

    this.app
      .use(
        bodyParser({
          onerror: (_, context) => context.throw('body parse error', 422),
        }),
      )
      .use(router.routes());
  }

  serve(): void {
    let {port} = this.options;

    this.app.listen(port);
  }
}

function getResponse<TEvent extends Events>(
  context: RouterContext,
): TEvent['response'] {
  let response!: TEvent['response'];
  context.body = new Promise(resolve => (response = resolve));
  return response;
}
