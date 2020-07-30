# Makeflow PowerApp Koa Adapter

```ts
const powerApp = new PowerApp();

powerApp.middleware(koaAdapter('/makeflow'));

powerApp.serve(
  koaAdapter({
    host: 'http://localhost',
    port: 8080,
    path: '/makeflow',
  }),
);
```
