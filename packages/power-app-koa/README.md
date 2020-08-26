# Makeflow PowerApp Koa Adapter

```ts
// middleware
powerApp.middleware(koaAdapter, '/makeflow');

// server
powerApp.serve(koaAdapter, {
  host: 'http://localhost',
  port: 8080,
  path: '/makeflow',
});
```
