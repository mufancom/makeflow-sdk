import {Plugin, server} from '@hapi/hapi';
import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';

export const hapiAdapter: PowerAppAdapter<Plugin<any>> = ({
  routes,
}: PowerAppAdapterDefinition) => {
  function buildPlugin(): Plugin<any> {
    return {
      name: '@makeflow/power-app-hapi',
      register(server) {
        for (let {type, path, method, handler} of routes) {
          server.route({
            method: method === 'get' ? 'GET' : 'POST',
            path: [
              '',
              ...path.map(segment =>
                typeof segment === 'string'
                  ? segment
                  : `{${segment.name}${segment.optional ? '?' : ''}}`,
              ),
            ].join('/'),
            handler: async ({params, payload}, h) => {
              let {data, error} = await handler({
                type,
                body: payload,
                params,
              });

              if (error) {
                return h.response(error.msg).code(error.status);
              }

              return h.response(data);
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
