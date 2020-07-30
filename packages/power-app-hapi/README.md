# Makeflow PowerApp Hapi Adapter - WIP

```ts
const powerApp = new PowerApp();

powerApp.middleware(hapiAdapter);

powerApp.serve(hapiAdapter, {
  host: 'http://localhost',
  port: 3000,
});
```
