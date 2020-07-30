# Makeflow PowerApp Express Adapter

```ts
const powerApp = new PowerApp();

powerApp.middleware(expressAdapter, '/makeflow');

powerApp.serve(expressAdapter, {
  host: 'http://localhost',
  port: 3000,
  path: '/makeflow',
});
```
