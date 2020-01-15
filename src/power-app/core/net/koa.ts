import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router, {RouterContext} from 'koa-router';
import _ from 'lodash';

import {PowerAppVersionDefinition} from '../../app';

import {AbstractNetAdapter} from './net';

interface PowerItemRequestParams {
  name: string;
  type: string;
  action: string | undefined;
}

export class KoaAdapter extends AbstractNetAdapter {
  private app = new Koa();

  constructor(public definition: PowerAppVersionDefinition) {
    super(definition);

    let router = new Router<unknown>();

    router.post('/power-item/:name/:type/:action?', this.onPowerItemRequest);

    this.app.use(
      bodyParser({
        onerror: (_, ctx) => ctx.throw('body parse error', 422),
      }),
    );

    this.app.use(router.routes());
  }

  serve(): void {
    this.app.listen(3000);
  }

  private onPowerItemRequest = async (ctx: RouterContext): Promise<void> => {
    let {
      params,
      request: {body},
    } = ctx;

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

    let hook =
      type === 'action'
        ? powerItem.actions?.[action!]
        : (powerItem as any)[type];

    if (!hook) {
      return;
    }

    ctx.body = await new Promise(resolve => {
      let existedListeners = this.emit('power-item:hook', hook, body, resolve);

      if (!existedListeners) {
        resolve({});
      }
    });
  };
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
