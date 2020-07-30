import {
  PowerAppAdapter,
  PowerAppAdapterDefinition,
} from '@makeflow/power-app-server-adapter';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import mount from 'koa-mount';
import Router from 'koa-router';

export const koaAdapter: PowerAppAdapter<Koa.Middleware> = ({
  routes,
  authenticate,
}: PowerAppAdapterDefinition) => {
  function buildApp(path?: string): Koa {
    let app = new Koa();

    let prefix = path !== '/' ? path : undefined;

    let router = new Router<unknown>({prefix});

    router.all('(.*)', async (context, next) => {
      if (authenticate && !authenticate(context.request.body)) {
        context.throw(416);
        return;
      }

      await next();

      context.body = await context.body;
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
        context => {
          let {
            params,
            request: {body},
          } = context;

          if (validator && !validator(params)) {
            return;
          }

          context.body = handler({
            type,
            params,
            body,
          });
        },
      );
    }

    app
      .use(
        bodyParser({
          onerror: (error, context) => context.throw(422, error),
        }),
      )
      .use(router.routes());

    return app;
  }

  return {
    middleware(path) {
      return mount(buildApp(typeof path === 'string' ? path : path?.path));
    },
    serve({host, port, path} = {}) {
      buildApp(path).listen(port, host);
    },
  };
};
