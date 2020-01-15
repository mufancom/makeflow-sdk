import {
  IDBAdapter,
  INetAdapter,
  IStorageObject,
  KoaAdapter,
  MongoAdapter,
  PowerItem,
} from './core';
import {PowerAppSchema} from './schema';

export interface PowerAppVersionDefinition {
  ancestor: string;
  contributions: PowerAppVersionDefinitionContributions;
}

export interface PowerAppVersionDefinitionContributions {
  powerItems?: {
    [key in string]: PowerAppVersionDefinitionPowerItem;
  };
}

export interface PowerAppVersionDefinitionMigrations {
  up(data: any): any;
  down(data: any): any;
}

type MakeflowApi = never;

export type ActionStorage<TStorageObject extends IStorageObject> = Pick<
  TStorageObject,
  'get' | 'set'
>;

export interface PowerItemChange {
  storage: ActionStorage<PowerItem>;
  api: MakeflowApi;
  inputs: any[];
  configs: any[];
}

export interface PowerItemChangeResponse {
  description?: string;
  stage?: 'none' | 'done';
  outputs?: object;
}

export interface PowerAppVersionDefinitionPowerItem {
  migrations?: PowerAppVersionDefinitionMigrations;
  actions?: {
    [key in string]: (
      change: PowerItemChange,
    ) => PowerItemChangeResponse | void;
  };
  activate?(change: PowerItemChange): PowerItemChangeResponse | void;
  update?(change: PowerItemChange): PowerItemChangeResponse | void;
  deactivate?(change: PowerItemChange): PowerItemChangeResponse | void;
}

export class PowerApp {
  private versionDefinition!: PowerAppVersionDefinition;
  private netAdapter!: INetAdapter;
  private dbAdapter!: IDBAdapter;

  constructor(_schema?: PowerAppSchema) {
    this.dbAdapter = new MongoAdapter({
      uri: `mongodb://localhost:27017`,
      name: 'makeflow-power-app',
    });
  }

  version(_v: any, versionDefinition: PowerAppVersionDefinition): void {
    this.versionDefinition = versionDefinition;
  }

  serve(): void {
    this.koa();
  }

  koa(): void {
    this.netAdapter = new KoaAdapter(this.versionDefinition);
    this.start();
  }

  express(): void {}

  hapi(): void {}

  private start(): void {
    this.netAdapter.on('power-item:hook', async (hook, body, resolve) => {
      let api = {};

      let {token, inputs, configs} = body;

      let storage = await this.dbAdapter.getStorage({
        type: 'power-item',
        token,
      });

      let response = hook({
        storage: {
          set: storage.set.bind(storage),
          get: storage.get.bind(storage),
        },
        api,
        inputs,
        configs,
      });

      await this.dbAdapter.setStorage(storage);

      resolve(response);
    });

    this.netAdapter.serve();
  }
}

let app = new PowerApp();

app.version('1.0.0', {
  ancestor: '0.0.0',
  contributions: {
    powerItems: {
      six: {
        activate({storage, api, inputs, configs}) {
          console.log({storage, api, inputs, configs});

          storage.get();

          return {
            stage: 'done',
          };
        },
        actions: {
          create() {
            return {
              stage: 'none',
            };
          },
        },
      },
    },
  },
});

app.serve();

console.info('http://localhost:3000');
