import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router, {RouterContext} from 'koa-router';
import _ from 'lodash';

import {
  Events,
  InstallationEvent,
  PermissionEvent,
  PowerGlanceEvent,
  PowerGlanceEventParams,
  PowerItemEvent,
  PowerItemEventParams,
} from './events';
import {AbstractNetAdapter} from './net';

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
      .post('/installation/:type', this.handleInstallationRequest)
      .post('/permission/:type', this.handPermissionRequest)
      .post('/power-item/:name/:type/:action?', this.handlePowerItemRequest)
      .post('/power-glance/:name/:type', this.handlePowerGlanceRequest);

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

  private emitEvent<TEvent extends Events>(
    type: TEvent['type'],
    event: TEvent['eventObject'],
    context: RouterContext,
  ): void {
    let response = getResponse<TEvent>(context);

    let existedListeners = this.emit<TEvent>(type, event, response);

    if (!existedListeners) {
      response({});
    }
  }

  private handPermissionRequest = async (
    context: RouterContext,
  ): Promise<void> => {
    let {
      params: {type},
      request: {body},
    } = context;

    // TODO (boen): check body data validity
    let payload = body;

    this.emitEvent<PermissionEvent>(
      'permission',
      {
        type,
        payload,
      },
      context,
    );
  };

  private handleInstallationRequest = (context: RouterContext): void => {
    let {
      params: {type},
      request: {body},
    } = context;

    // TODO (boen): check body data validity
    let payload = body;

    this.emitEvent<InstallationEvent>(
      'installation',
      {
        type,
        payload,
      },
      context,
    );
  };

  private handlePowerItemRequest = async (
    context: RouterContext,
  ): Promise<void> => {
    let {
      params,
      request: {body},
    } = context;

    if (!isPowerItemEventParams(params)) {
      return;
    }

    // TODO (boen): check body data validity
    let payload = body;

    this.emitEvent<PowerItemEvent>(
      'power-item',
      {
        payload,
        params,
      },
      context,
    );
  };

  private handlePowerGlanceRequest = async (
    context: RouterContext,
  ): Promise<void> => {
    let {
      params,
      request: {body},
    } = context;

    if (!isPowerGlanceEventParams(params)) {
      return;
    }

    // TODO (boen): check body data validity
    let payload = body;

    this.emitEvent<PowerGlanceEvent>(
      'power-glance',
      {
        payload,
        params,
      },
      context,
    );
  };
}

function getResponse<TEvent extends Events>(
  context: RouterContext,
): TEvent['response'] {
  let response!: TEvent['response'];
  context.body = new Promise(resolve => (response = resolve));
  return response;
}

function isPowerItemEventParams(params: any): params is PowerItemEventParams {
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

function isPowerGlanceEventParams(
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
