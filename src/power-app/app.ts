import _ from 'lodash';
import {intersects, minVersion, rcompare, validRange} from 'semver';
import {Constructor} from 'tslang';

import {
  IDBAdapter,
  INetAdapter,
  InstallationEvent,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  MongoAdapter,
  MongoOptions,
  PermissionEvent,
  PowerAppVersion,
  PowerGlanceDoc,
  PowerGlanceEvent,
  PowerItemEvent,
  mergeOriginalDoc,
} from './core';

const PowerAppDBAdapterDict = {
  mongo: MongoAdapter,
  lowdb: LowdbAdapter,
};

export interface PowerAppOptions {
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

export class PowerApp {
  private definitions: {
    version: string;
    definition: PowerAppVersion.Definition;
  }[] = [];
  private netAdapter!: INetAdapter;
  private dbAdapter!: IDBAdapter;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  version(version: string, definition: PowerAppVersion.Definition): void {
    if (!validRange(version)) {
      throw Error('版本范围格式错误');
    }

    this.definitions.push({
      version,
      definition,
    });
  }

  serve(): void {
    this.start();
  }

  koa(): void {
    this.start(KoaAdapter);
  }

  express(): void {
    this.start(KoaAdapter);
  }

  hapi(): void {
    this.start(KoaAdapter);
  }

  private initialize(): void {
    let {
      db = {
        type: 'lowdb',
        options: {},
      },
    } = this.options;

    this.dbAdapter = new PowerAppDBAdapterDict[db.type](db.options as any);
  }

  private start(Adapter: Constructor<INetAdapter> = KoaAdapter): void {
    if (!this.checkVersionsQualified()) {
      return;
    }

    let latestDefinition = this.definitions[0];

    this.netAdapter = new Adapter(latestDefinition);

    this.netAdapter
      .on('installation', this.handleInstallation)
      .on('permission', this.handlePermission)
      .on('power-item', this.handlePowerItemChange)
      .on('power-glance', this.handlePowerGlanceChange)
      .serve();
  }

  private checkVersionsQualified(): boolean {
    try {
      let definitions = _.clone(this.definitions);

      let intersectionDefinitions = _.intersectionWith(
        definitions,
        definitions,
        ({version: va}, {version: vb}) =>
          !_.isEqual(va, vb) && intersects(va, vb),
      );

      if (intersectionDefinitions.length) {
        throw Error('版本定义有交集');
      }

      this.definitions = definitions.sort(({version: ra}, {version: rb}) =>
        rcompare(minVersion(ra)!, minVersion(rb)!),
      );
    } catch (error) {
      console.error(error);
      return false;
    }

    return true;
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
    let {type, change, payload} = event;

    // TODO (boen): api
    let api;

    let {token} = payload;

    let storage = await this.dbAdapter.getStorage({
      type: 'power-item',
      token,
    });

    let inputs = 'inputs' in payload ? payload.inputs : {};
    let configs = 'configs' in payload ? payload.configs : {};

    if (type === 'activate') {
      storage.create({
        type: 'power-item',
        token: payload.token,
        version: '1.0.0',
        storage: {},
      });
    }

    let responseData = change({
      storage: storage.getActionStorage(),
      api,
      inputs,
      configs,
    });

    await this.dbAdapter.setStorage(storage);

    response(responseData ? responseData : {});
  };

  private handlePowerGlanceChange = async (
    event: PowerGlanceEvent['eventObject'],
    response: PowerGlanceEvent['response'],
  ): Promise<void> => {
    let {type, change, payload} = event;

    // TODO (boen): api
    let api;

    let {token, clock} = payload;

    let storage = await this.dbAdapter.getStorage({
      type: 'power-glance',
      token,
    });

    if (type === 'initialize') {
      storage.create({
        type: 'power-glance',
        token: payload.token,
        clock,
        version: '1.0.0',
        storage: {},
      });
    } else {
      let prevClock = (storage.originalDoc as PowerGlanceDoc)?.['clock'];

      if (prevClock + 1 !== clock) {
        // TODO reinitialize
        response({});
        return;
      }

      storage = mergeOriginalDoc(storage, {clock});
    }

    let resources = 'resources' in payload ? payload.resources : [];
    let configs = 'configs' in payload ? payload.configs : {};

    let responseData = change({
      storage: storage.getActionStorage(),
      api,
      resources,
      configs,
    });

    await this.dbAdapter.setStorage(storage);

    response(responseData ? responseData : {});
  };
}

let app = new PowerApp();

app.version('1.0.0', {
  contributions: {
    powerItems: {
      'basic-job': {
        activate({storage, configs}) {
          storage.set(configs);
        },
        update({storage}) {
          storage.merge({boen: 666});

          return {
            description: 'done',
          };
        },
        deactivate({storage}) {
          storage.set(Date.now(), 'hello');

          return {
            description: 'none',
          };
        },
      },
    },
    powerGlances: {
      'job-glance': {
        change({storage}) {
          storage.set(Date.now(), 'hello');
        },
      },
    },
  },
});

app.serve();

console.info('http://localhost:9001');
