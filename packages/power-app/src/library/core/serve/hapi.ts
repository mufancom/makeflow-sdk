import {Plugin, ResponseToolkit, server} from '@hapi/hapi';
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
  isPageEventParams,
  isPowerCustomCheckableEventParams,
  isPowerGlanceEventParams,
  isPowerItemOrPowerNodeEventParams,
} from './serve';

declare module '@hapi/hapi/index' {
  interface ResponseToolkit {
    bodyPromise: Promise<any>;
  }
}

export class HapiAdapter extends AbstractServeAdapter {
  constructor(
    readonly sourceToken?: string,
    readonly options: ServeOptions = {},
  ) {
    super(sourceToken, options);
  }

  serve(): void {
    let {port, host} = this.options;

    let app = server({
      host,
      port,
    });

    app
      .register(this.getPlugin())
      .then(() => app.start())
      .catch(console.error);
  }

  middleware<T>(): Plugin<T> {
    return this.getPlugin();
  }

  private getPlugin = (): Plugin<any> => {
    let adapter = this;

    return {
      name: '@makeflow/sdk',
      register(server) {
        server.auth.scheme('source', () => ({
          authenticate: (_, h) => {
            return h.continue;
          },
          // TODO (boen): not work
          payload: (req, h) => {
            let payload = req.payload;

            let source = (payload as any)?.source;

            if (!source || !adapter.authenticate(source)) {
              h.unauthenticated(Error('authenticate failed'));
            }

            return h.authenticated({credentials: source});
          },
          options: {
            payload: true,
          },
        }));

        server.auth.strategy('source', 'source');

        server.route({
          method: 'POST',
          path: '/installation/{type}',
          handler: async ({params, payload}, h) => {
            adapter.emit<InstallationEvent>(
              'installation',
              {
                type: params.type,
                payload,
              } as InstallationEvent['eventObject'],
              getResponse<InstallationEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/permission/{type}',
          handler: async ({params, payload}, h) => {
            adapter.emit<PermissionEvent>(
              'permission',
              {
                type: params.type,
                payload,
              } as PermissionEvent['eventObject'],
              getResponse(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/power-item/{name}/{type}/{action?}',
          handler: async ({params, payload}, h) => {
            if (!isPowerItemOrPowerNodeEventParams(params)) {
              return;
            }

            adapter.emit<PowerItemEvent>(
              'power-item',
              {
                params,
                payload,
              } as PowerItemEvent['eventObject'],
              getResponse<PowerItemEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/power-node/{name}/{type}/{action?}',
          handler: async ({params, payload}, h) => {
            if (!isPowerItemOrPowerNodeEventParams(params)) {
              return;
            }

            adapter.emit<PowerNodeEvent>(
              'power-node',
              {
                params,
                payload,
              } as PowerNodeEvent['eventObject'],
              getResponse<PowerNodeEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/power-glance/{name}/{type}',
          handler: async ({params, payload}, h) => {
            if (!isPowerGlanceEventParams(params)) {
              return;
            }

            adapter.emit<PowerGlanceEvent>(
              'power-glance',
              {
                params,
                payload,
              } as PowerGlanceEvent['eventObject'],
              getResponse<PowerGlanceEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/power-custom-checkable-item/{name}',
          handler: async ({params, payload}, h) => {
            if (!isPowerCustomCheckableEventParams(params)) {
              return;
            }

            adapter.emit<PowerCustomCheckableItemEvent>(
              'power-custom-checkable-item',
              {
                params,
                payload,
              } as PowerCustomCheckableItemEvent['eventObject'],
              getResponse<PowerCustomCheckableItemEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });

        server.route({
          method: 'POST',
          path: '/page/{name}/{type}',
          handler: async ({params, payload}, h) => {
            if (!isPageEventParams(params)) {
              return;
            }

            adapter.emit<PageEvent>(
              'page',
              {
                params,
                payload,
              } as PageEvent['eventObject'],
              getResponse<PageEvent>(h),
            );

            return h.response(await h.bodyPromise);
          },
          options: {
            auth: {
              mode: 'required',
              payload: 'required',
              strategy: 'source',
            },
          },
        });
      },
      multiple: true,
    };
  };
}

function getResponse<TEvent extends Events>(
  h: ResponseToolkit,
): TEvent['response'] {
  let response!: TEvent['response'];
  h.bodyPromise = new Promise(resolve => (response = resolve));
  return response;
}
