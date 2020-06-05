```ts
const app = new PowerApp();

app.version<{
  // Not required types declare

  installation: {
    storage: {};
    configs: {
      password: string;
    };
  };

  powerItems: {
    'awesome-item': {
      storage: {
        times: number;
      };
      inputs: {
        user: string;
      };
    };
  };

  powerGlances: {
    'awesome-glance': {
      storage: {
        glanceName: string;
      };
    };
  };

  powerCustomCheckableItems: {
    'awesome-checkable-item': {
      storage: {};
      inputs: {};
    };
  };

  pages: {
    'awesome-page': {
      storage: {};
    };
  };
}>('0.1.0', {
  installation: {
    activate({context: {configs}}) {
      configs.password; // ✔
      configs.a; // ❌
    },
  },
  contributions: {
    powerItems: {
      'awesome-item': {
        activate({context: {configs, storage, source, api}, inputs}) {
          configs.password; // ✔
          storage.get('times'); // ✔
          storage.get('other'); // ❌

          inputs.user; // ✔
          inputs.other; // ❌
        },
      },
    },
    powerNodes: {
      'awesome-node': {
        activate({context: {storage}, inputs}) {
          console.log(inputs);

          storage.get('any'); // ✔

          return {
            description: 'didi ...',
          };
        },
      },
    },
    powerGlances: {
      'awesome-glance': {
        initialize({
          context: {storage, configs, powerGlanceConfig},
          resources,
        }) {
          console.log(configs, powerGlanceConfig, resources);

          let glanceName = storage.get('glanceName'); // ✔;

          storage.get('other'); // ❌

          return {
            dataSet: [{name: glanceName as any, data: {}}],
          };
        },
      },
    },
    powerCustomCheckableItems: {
      'awesome-checkable-item': {
        processor({context: {storage}, url, inputs}) {
          console.log(url, inputs);

          storage.get('never'); // storage declare is `{}` ❌
        },
      },
    },
    pages: {
      'awesome-page': {
        request({context: {userStorage, storage}}) {
          if (userStorage.get('admin')) {
            return {
              location: 'https://www.makeflow.com',
            };
          }

          return {
            error: {
              code: 'permission denied',
              message: 'Oh, 404 ~',
            },
          };
        },
      },
    },
  },
});

const _ = async (): Promise<void> => {
  // get user

  let userStorages = await app.geUserStorages({
    id: 'userId' as any,
    storage: {
      a: 1,
    },
  });

  // get contextIterable

  for await (let {
    configs,
    powerGlanceConfig,
    ...rest
  } of app.getContextIterable('powerGlances', {})) {
    // something ...
  }

  // get contexts

  let pageContexts = await app.getContexts('pages', {
    storage: {
      tag: 'abc123',
    },
  });

  for (let {source, api, configs, storage, userStorage} of pageContexts) {
    // something ...
  }
};

// middle

app.koa('/koa');
app.express('/express');
```
