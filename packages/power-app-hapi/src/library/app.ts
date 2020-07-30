import {Plugin, server} from '@hapi/hapi';
import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';

declare module '@hapi/hapi/index' {
  interface ResponseToolkit {
    bodyPromise: Promise<any>;
  }
}

export const hapiAdapter: PowerAppAdapter<Plugin<any>> = ({
  routes,
  authenticate,
}: PowerAppAdapterDefinition) => {
  function buildPlugin(): Plugin<any> {
    return {
      name: '@makeflow/power-app-hapi',
      register(server) {
        server.auth.scheme('source', () => ({
          authenticate: (_, h) => {
            return h.continue;
          },
          // TODO (boen): not work
          payload: (req, h) => {
            let payload = req.payload;

            if (authenticate && !authenticate(payload)) {
              h.unauthenticated(Error('authenticate failed'));
            }

            return h.authenticated({credentials: {}});
          },
          options: {
            payload: true,
          },
        }));

        server.auth.strategy('source', 'source');

        for (let {type, paths, method, validator, handler} of routes) {
          server.route({
            method: method === 'get' ? 'GET' : 'POST',
            path: [
              '',
              ...paths.map(path =>
                typeof path === 'string'
                  ? path
                  : `{${path.name}${path.optional ? '?' : ''}}`,
              ),
            ].join('/'),
            handler: async ({params, payload}, h) => {
              if (validator && !validator(params)) {
                return;
              }

              return h.response(
                await handler({
                  type,
                  body: payload,
                  params,
                }),
              );
            },
            options: {
              auth: {
                mode: 'required',
                payload: 'required',
                strategy: 'source',
              },
            },
          });
        }
      },
      multiple: true,
    };
  }

  return {
    middleware() {
      return buildPlugin();
    },
    serve({host, port} = {}) {
      let app = server({
        host,
        port,
      });

      app
        .register(buildPlugin())
        .then(() => app.start())
        .catch(console.error);
    },
  };
};
