# Makeflow PowerApp Hapi Adapter - WIP

```ts
const powerApp = new PowerApp();

// middleware
powerApp.middleware(hapiAdapter);

// server
powerApp.serve(hapiAdapter, {
  host: 'http://localhost',
  port: 3000,
});
```
