# Makeflow PowerApp Hapi Adapter

```ts
const powerApp = new PowerApp();

// hapi plugin
powerApp.middleware(hapiAdapter);

// server
powerApp.serve(hapiAdapter, {
  host: 'http://localhost',
  port: 3000,
});
```
