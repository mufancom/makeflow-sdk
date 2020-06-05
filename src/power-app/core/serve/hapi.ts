import {Plugin, server} from '@hapi/hapi';
import _ from 'lodash';

import {
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
          authenticate: ({payload}, h) => {
            let source = (payload as any)?.source;

            if (!source || !adapter.authenticate(source)) {
              h.unauthenticated(Error('authenticate failed'));
            }

            return h.authenticated({credentials: source});
          },
        }));

        server.route({
          method: 'POST',
          path: '/installation/{type}',
          handler: ({params, payload}, h) => {
            adapter.emit<InstallationEvent>(
              'installation',
              {
                type: params.type,
                payload,
              } as InstallationEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/permission/{type}',
          handler: ({params, payload}, h) => {
            adapter.emit<PermissionEvent>(
              'permission',
              {
                type: params.type,
                payload,
              } as PermissionEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/power-item/{name}/{type}/{action}?',
          handler: ({params, payload}, h) => {
            if (!isPowerItemOrPowerNodeEventParams(params)) {
              return;
            }

            adapter.emit<PowerItemEvent>(
              'power-item',
              {
                params,
                payload,
              } as PowerItemEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/power-node/{name}/{type}/{action}?',
          handler: ({params, payload}, h) => {
            if (!isPowerItemOrPowerNodeEventParams(params)) {
              return;
            }

            adapter.emit<PowerNodeEvent>(
              'power-node',
              {
                params,
                payload,
              } as PowerNodeEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/power-glance/{name}/{type}',
          handler: ({params, payload}, h) => {
            if (!isPowerGlanceEventParams(params)) {
              return;
            }

            adapter.emit<PowerGlanceEvent>(
              'power-glance',
              {
                params,
                payload,
              } as PowerGlanceEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/power-custom-checkable-item/{name}',
          handler: ({params, payload}, h) => {
            if (!isPowerCustomCheckableEventParams(params)) {
              return;
            }

            adapter.emit<PowerCustomCheckableItemEvent>(
              'power-custom-checkable-item',
              {
                params,
                payload,
              } as PowerCustomCheckableItemEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });

        server.route({
          method: 'POST',
          path: '/page/{name}/{type}',
          handler: ({params, payload}, h) => {
            if (!isPageEventParams(params)) {
              return;
            }

            adapter.emit<PageEvent>(
              'page',
              {
                params,
                payload,
              } as PageEvent['eventObject'],
              h.response,
            );
          },
          options: {
            auth: 'source',
          },
        });
      },
      multiple: true,
    };
  };
}
