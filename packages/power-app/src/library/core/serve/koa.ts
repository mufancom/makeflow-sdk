import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import Router, {RouterContext} from 'koa-router';
import _ from 'lodash';

import {
  Events,
  InstallationEvent,
  PageEvent,
  PermissionEvent,
  PowerCustomCheckableItemEvent,
  PowerGlanceEvent,
  PowerItemEvent,
  PowerNodeEvent,
} from './events';
import {
  AbstractServeAdapter,
  ServeOptions,
  isPowerGlanceEventParams,
  isPowerItemOrPowerNodeEventParams,
} from './serve';

export class KoaAdapter extends AbstractServeAdapter {
  private app = new Koa();

  constructor(
    readonly sourceToken?: string,
    readonly options: ServeOptions = {},
  ) {
    super(sourceToken, options);

    let {path} = this.options;

    let prefix = path !== '/' ? path : undefined;

    let router = new Router<unknown>({prefix});

    router
      .all('*', async (context, next) => {
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

        if (!isPowerItemOrPowerNodeEventParams(params)) {
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
      .post('/power-node/:name/:type/:action?', context => {
        let {
          params,
          request: {body},
        } = context;

        if (!isPowerItemOrPowerNodeEventParams(params)) {
          return;
        }

        this.emit<PowerNodeEvent>(
          'power-node',
          {
            params,
            payload: body,
          },
          getResponse<PowerNodeEvent>(context),
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
      .post('/power-custom-checkable-item/:name', context => {
        let {
          params,
          request: {body},
        } = context;

        this.emit<PowerCustomCheckableItemEvent>(
          'power-custom-checkable-item',
          {
            payload: body,
            params,
          },
          getResponse<PowerCustomCheckableItemEvent>(context),
        );
      })
      .post('/page/:name/:type', context => {
        let {
          params,
          request: {body},
        } = context;

        this.emit<PageEvent>(
          'page',
          {
            payload: body,
            params,
          },
          getResponse<PageEvent>(context),
        );
      });

    this.app
      .use(
        bodyParser({
          onerror: (_, context) => context.throw('body parse error', 422),
        }),
      )
      .use(router.routes());
  }

  serve(): void {
    let {port, host} = this.options;

    this.app.listen(port, host);
  }

  middleware(): Koa.Middleware {
    return mount(this.app);
  }
}

function getResponse<TEvent extends Events>(
  context: RouterContext,
): TEvent['response'] {
  let response!: TEvent['response'];
  context.body = new Promise(resolve => (response = resolve));
  return response;
}
