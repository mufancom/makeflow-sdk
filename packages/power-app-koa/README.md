# Makeflow PowerApp Koa Adapter

```ts
powerApp.middleware(koaAdapter, '/makeflow');

powerApp.serve(koaAdapter, {
  host: 'http://localhost',
  port: 8080,
  path: '/makeflow',
});
```
