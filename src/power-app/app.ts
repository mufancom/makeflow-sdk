import {
  IDBAdapter,
  INetAdapter,
  InstallationEvent,
  KoaAdapter,
  MongoAdapter,
  PermissionEvent,
  PowerAppVersion,
  PowerItemEvent,
} from './core';
import {PowerAppSchema} from './schema';

export class PowerApp {
  private versionDefinition!: PowerAppVersion.Definition;
  private netAdapter!: INetAdapter;
  private dbAdapter!: IDBAdapter;

  constructor(_schema?: PowerAppSchema) {
    this.dbAdapter = new MongoAdapter({
      uri: `mongodb://mongo:27017`,
      name: 'makeflow-power-app',
    });
  }

  version(_v: any, versionDefinition: PowerAppVersion.Definition): void {
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
    this.netAdapter
      .on('installation', this.handleInstallation)
      .on('permission', this.handlePermission)
      .on('power-item', this.handlePowerItemChange)
      .serve();
  }

  private handleInstallation = async (
    event: InstallationEvent['eventObject'],
    response: InstallationEvent['response'],
  ): Promise<void> => {
    let responseData = {};

    let installationStorage = await this.dbAdapter.getStorage({
      type: 'installation',
      ...event.payload,
    });

    switch (event.type) {
      case 'activate':
        installationStorage.create({type: 'installation', ...event.payload});
        break;
      case 'update':
        installationStorage.merge(event.payload);

        responseData = {
          granted: !!installationStorage.get('accessToken'),
        };

        break;
      case 'deactivate':
        installationStorage.delete();
        break;
    }

    await this.dbAdapter.setStorage(installationStorage);

    response(responseData);
  };

  private handlePermission = async (
    event: PermissionEvent['eventObject'],
    response: PermissionEvent['response'],
  ): Promise<void> => {
    let installationStorage = await this.dbAdapter.getStorage({
      type: 'installation',
      ...event.payload,
    });

    switch (event.type) {
      case 'grant':
        installationStorage.set('accessToken', event.payload.accessToken);
        break;
      case 'revoke':
        installationStorage.set('accessToken', undefined);
        break;
    }

    await this.dbAdapter.setStorage(installationStorage);

    response({});
  };

  private handlePowerItemChange = async (
    event: PowerItemEvent['eventObject'],
    response: PowerItemEvent['response'],
  ): Promise<void> => {
    let {change, payload} = event;

    // TODO (boen): api
    let api;

    let {token} = payload;

    let storage = await this.dbAdapter.getStorage({
      type: 'power-item',
      token,
    });

    let inputs = 'inputs' in payload ? payload.inputs : {};
    let configs = 'configs' in payload ? payload.configs : {};

    storage.create({
      type: 'power-item',
      token: payload.token,
      storage: {},
    });

    let responseData = change({
      storage: storage.getActionStorage(),
      api,
      inputs,
      configs,
    });

    await this.dbAdapter.setStorage(storage);

    response(responseData ? responseData : {});
  };
}

let app = new PowerApp();

app.version('1.0.0', {
  ancestor: '0.0.0',
  contributions: {
    powerItems: {
      'basic-job': {
        activate({storage, configs}) {
          storage.set(configs);
        },
        update({storage}) {
          storage.merge({a: 888});

          return {
            description: 'done',
          };
        },
        deactivate() {
          return {
            description: 'none',
          };
        },
      },
    },
  },
});

app.serve();

console.info('http://localhost:9001');
