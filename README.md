# Makeflow SDK

## Makeflow CLI

### Install

```bash
yarn global add @makeflow/cli
# or
npm install @makeflow/cli --global
```

### Usage

You can use `mf xxx` command in terminal to use Makeflow CLI. there are several subcommands in command `mf`.

```bash
mf --help
```

#### Subcommands

##### `login`

- Options:
  - `-u, --username <username>`: Username (mobile)
  - `-p, --password <password>`: Password

Most commands of Makeflow CLI are based on the premise that you have logged in to Makeflow. You can use `mf login` to log in to Makeflow.

```bash
mf login
# API https://www.makeflow.com/api/v1
# ? Username (mobile) > 18600000000
# ? Password > ******
# You have successfully logged in!
```

#### `publish`

You can use `mf publish power-app.json` to publish a power app to makeflow. The definition file `power-app.json` can be generated in [app-builder](https://makeflow.github.io/app-builder/).

#### `power-app`

There are a few subcommands to administer the published power apps in makeflow.

##### `set-logo`

- Options
  - `-n, --name <name>`: The name of the published power app
  - `-f, --file <file>`: The file path of the logo

You can use `mf power-app set-logo --name power-app-name --file logo-file-path.png` to set a logo (`logo-file-path.png`) to a published power app (`power-app-name`).

## Makeflow Power App

`@makeflow/power-app` is a package for more convenient to build power apps.

### Install

```bash
yarn add @makeflow/power-app
# or
npm install @makeflow/power-app --save
```

### Usage

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
          context: {storage, configs, powerGlanceConfigs},
          resources,
        }) {
          console.log(configs, powerGlanceConfigs, resources);

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
    powerGlanceConfigs,
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
