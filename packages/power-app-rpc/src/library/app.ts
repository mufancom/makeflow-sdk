import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';
import socketIO from 'socket.io-client';

const RPC_URL_DEFAULT = 'https://www.makeflow.com/';

export const rpcAdapter: PowerAppAdapter<() => void> = ({
  routes,
  sources,
}: PowerAppAdapterDefinition) => {
  let pathTypeToRouteMap = new Map(routes.map(route => [route.path[0], route]));

  function buildServer(): void {
    let sockets = sources.map(({url = RPC_URL_DEFAULT, token}) => {
      return socketIO(url, {
        path: '/power-app/ws',
        transports: ['websocket'],
        query: {
          token,
        },
      });
    });

    for (let socket of sockets) {
      socket.on(
        'power-app:rpc',
        async (
          {paths, body}: {paths: string[]; body: unknown},
          response: (res: {data?: unknown; error?: unknown}) => void,
        ) => {
          try {
            let type = paths[0];

            if (!pathTypeToRouteMap.has(type)) {
              throw Error('Unknown request type');
            }

            let {handler, path} = pathTypeToRouteMap.get(type)!;

            let params = path.reduce<any>((params: any, path, index) => {
              if (typeof path === 'string') {
                return params;
              }

              let value = paths[index];

              if (!path.optional && value === undefined) {
                throw Error('Unqualified path');
              }

              params[path.name] = value;

              return params;
            }, {});

            let {data, error} = await handler({
              type,
              params,
              body,
            });

            response({data, error});
          } catch (error) {
            response({error});
          }
        },
      );
    }
  }

  return {
    middleware() {
      return buildServer;
    },
    serve() {
      buildServer();
    },
  };
};
