import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';
import express, {Express, Response, Router} from 'express';

const EXPRESS_DEFAULT_PORT = 3000;

declare module 'express/index' {
  interface Response {
    bodyPromise: Promise<any>;
  }
}

export const expressAdapter: PowerAppAdapter<Express> = ({
  routes,
  authenticate,
}: PowerAppAdapterDefinition) => {
  function buildApp(path = '/'): Express {
    let app = express();

    let router = Router();

    router.all('*', async (request, response: Response, next) => {
      if (authenticate && !authenticate(request.body)) {
        response.status(416).send();
        return;
      }

      await next();

      response.send(await response.bodyPromise);
    });

    for (let {type, paths, method, validator, handler} of routes) {
      router[method ?? 'post']?.(
        [
          '',
          ...paths.map(path =>
            typeof path === 'string'
              ? path
              : `:${path.name}${path.optional ? '?' : ''}`,
          ),
        ].join('/'),
        ({params, body}, response: Response) => {
          if (validator && !validator(params)) {
            return;
          }

          response.bodyPromise = handler({
            type,
            params,
            body,
          });
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
