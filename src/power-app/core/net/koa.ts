import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router, {RouterContext} from 'koa-router';
import _ from 'lodash';

import {PowerAppVersion} from '../version';

import {
  Events,
  InstallationEvent,
  PermissionEvent,
  PowerItemEvent,
} from './events';
import {AbstractNetAdapter} from './net';

interface PowerItemRequestParams {
  name: string;
  type: Exclude<keyof PowerAppVersion.PowerItem.Definition, 'migrations'>;
  action: string | undefined;
}

export class KoaAdapter extends AbstractNetAdapter {
  private app = new Koa();

  constructor(public definition: PowerAppVersion.Definition) {
    super(definition);

    let router = new Router<unknown>({prefix: '/api/mf'});

    router
      .all('*', async (context, next) => {
        // TODO (boen):
        console.info(context.path);

        await next();

        context.body = await context.body;
      })
      .post('/installation/:type', this.handleInstallationRequest)
      .post('/permission/:type', this.handPermissionRequest)
      .post('/power-item/:name/:type/:actions?', this.handlePowerItemRequest);

    this.app
      .use(
        bodyParser({
          onerror: (_, context) => context.throw('body parse error', 422),
        }),
      )
      .use(router.routes());
  }

  serve(): void {
    this.app.listen(9001);
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

    if (!isPowerItemRequestParams(params)) {
      return;
    }

    let {
      contributions: {powerItems = {}},
    } = this.definition;

    let {name, type, action} = params;

    let powerItem = powerItems[name];

    if (!powerItem) {
      return;
    }

    let change =
      type === 'action' ? powerItem.action?.[action!] : powerItem[type];

    if (!change) {
      return;
    }

    // TODO (boen): check body data validity
    let payload = body;

    this.emitEvent<PowerItemEvent>(
      'power-item',
      {
        type,
        payload,
        change,
      } as PowerItemEvent['eventObject'],
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

function isPowerItemRequestParams(
  params: any,
): params is PowerItemRequestParams {
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
