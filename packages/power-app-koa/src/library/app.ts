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
}: PowerAppAdapterDefinition) => {
  function buildApp(path?: string): Koa {
    let app = new Koa();

    let prefix = path !== '/' ? path : undefined;

    let router = new Router<unknown>({prefix});

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
        async context => {
          let {
            params,
            request: {body},
          } = context;

          let {data, error} = await handler({
            type,
            params,
            body,
          });

          if (error) {
            context.throw(error.status, new Error(error.msg));
          } else {
            context.body = data;
          }
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
