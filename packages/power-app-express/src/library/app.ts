import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';
import express, {Express, Response, Router} from 'express';

const EXPRESS_DEFAULT_PORT = 3000;

export const expressAdapter: PowerAppAdapter<Express> = ({
  routes,
}: PowerAppAdapterDefinition) => {
  function buildApp(path = '/'): Express {
    let app = express();

    let router = Router();

    for (let {type, path, method, handler} of routes) {
      router[method ?? 'post']?.(
        [
          '',
          ...path.map(segment =>
            typeof segment === 'string'
              ? segment
              : `:${segment.name}${segment.optional ? '?' : ''}`,
          ),
        ].join('/'),
        async ({params, body}, response: Response) => {
          let {data, error} = await handler({
            type,
            params,
            body,
          });

          if (error) {
            response.status(error.status).send(error.msg);
          } else {
            response.send(data);
          }
        },
      );
    }

    app.use(express.json()).use(path, router);

    return app;
  }

  return {
    middleware(path) {
      return buildApp(typeof path === 'string' ? path : path?.path);
    },
    serve({host, port = EXPRESS_DEFAULT_PORT, path} = {}) {
      buildApp(path).listen(port, host!);
    },
  };
};
