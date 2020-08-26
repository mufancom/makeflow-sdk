# Makeflow PowerApp Express Adapter

```ts
const powerApp = new PowerApp();

// middleware
powerApp.middleware(expressAdapter, '/makeflow');

// server
powerApp.serve(expressAdapter, {
  host: 'http://localhost',
  port: 3000,
  path: '/makeflow',
});
```
