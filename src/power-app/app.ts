import {API as APITypes} from '@makeflow/types';
import _ from 'lodash';
import {
  intersects,
  lt,
  minVersion,
  rcompare,
  satisfies,
  validRange,
} from 'semver';
import {Constructor} from 'tslang';

import {
  API,
  IDBAdapter,
  INetAdapter,
  IStorageObject,
  InstallationEvent,
  KoaAdapter,
  LowdbAdapter,
  LowdbOptions,
  MongoAdapter,
  MongoOptions,
  NetAdapterOptions,
  PermissionEvent,
  PowerAppVersion,
  PowerGlance,
  PowerGlanceDoc,
  PowerGlanceEvent,
  PowerGlanceEventParams,
  PowerItem,
  PowerItemEvent,
  PowerItemEventParams,
  mergeOriginalDoc,
} from './core';

export interface PowerAppOptions {
  source?: Partial<APITypes.PowerApp.Source>;
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

interface PowerAppVersionInfo {
  range: string;
  definition: PowerAppVersion.Definition;
}

export class PowerApp {
  private definitions: PowerAppVersionInfo[] = [];

  private netAdapter!: INetAdapter;
  private dbAdapter!: IDBAdapter;

  private api!: API;

  constructor(private options: PowerAppOptions = {}) {
    this.initialize();
  }

  version(range: string, definition: PowerAppVersion.Definition): void {
    if (!validRange(range)) {
      throw Error('版本范围格式错误');
    }

    this.definitions.push({
      range,
      definition,
    });
  }

  serve(options?: NetAdapterOptions): void {
    this.start(options);
  }

  koa(options?: NetAdapterOptions): void {
    this.start(options, KoaAdapter);
  }

  express(options?: NetAdapterOptions): void {
    this.start(options);
  }

  hapi(options?: NetAdapterOptions): void {
    this.start(options);
  }

  private initialize(): void {
    let {db, source} = this.options;

    this.api = new API(source);

    switch (db?.type) {
      case 'mongo':
        this.dbAdapter = new MongoAdapter(db.options);
        break;
      case 'lowdb':
        this.dbAdapter = new LowdbAdapter(db.options);
        break;
      default:
        this.dbAdapter = new LowdbAdapter({});
        break;
    }
  }

  private start(
    options?: NetAdapterOptions,
    Adapter: Constructor<INetAdapter> = KoaAdapter,
  ): void {
    if (!this.checkVersionsQualified()) {
      return;
    }

    this.netAdapter = new Adapter(this.options.source?.token, options);

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
        ({range: ra}, {range: rb}) => !_.isEqual(ra, rb) && intersects(ra, rb),
      );

      if (intersectionDefinitions.length) {
        throw Error('版本定义有交集');
      }

      this.definitions = definitions.sort(({range: ra}, {range: rb}) =>
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
    let {params, payload} = event;

    let {token, source} = payload;

    let storage = (await this.dbAdapter.getStorage({
      type: 'power-item',
      token,
    })) as PowerItem;

    let result = getChangeAndMigrations<PowerAppVersion.PowerItem.Change>(
      // TODO (boen): version where come from
      (payload as any).version,
      storage.get('version'),
      this.definitions,
      getPowerItemChange(params),
      getMigrations(params),
    );

    if (!result) {
      return;
    }

    let inputs = 'inputs' in payload ? payload.inputs : {};
    let configs = 'configs' in payload ? payload.configs : {};

    let {change, migrations} = result;

    if (params.type === 'activate') {
      storage.create({
        type: 'power-item',
        token: payload.token,
        version: '1.0.0',
        storage: {},
      });
    } else {
      for (let migration of migrations) {
        migration(storage.getActionStorage());
      }
    }

    let responseData = change({
      storage: storage.getActionStorage(),
      api: this.api,
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
    let {params, payload} = event;

    let {token, clock} = payload;

    let storage = (await this.dbAdapter.getStorage({
      type: 'power-glance',
      token,
    })) as PowerGlance;

    let result = getChangeAndMigrations<PowerAppVersion.PowerGlance.Change>(
      // TODO (boen): version where come from
      (payload as any).version,
      storage.get('version'),
      this.definitions,
      getPowerGlanceChange(params),
      getMigrations(params),
    );

    if (!result) {
      return;
    }

    let {change, migrations} = result;

    if (params.type === 'initialize') {
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

      for (let migration of migrations) {
        migration(storage.getActionStorage());
      }
    }

    let responseData = change({
      storage: storage.getActionStorage(),
      api: this.api,
      resources: payload.resources,
      configs: payload.configs,
    });

    await this.dbAdapter.setStorage(storage);

    response(responseData ? responseData : {});
  };
}

function matchVersionInfoIndex(
  version: string,
  infos: PowerAppVersionInfo[],
  initialIndex = infos.length,
): number {
  for (let index = initialIndex - 1; index >= 0; index--) {
    let {range} = infos[index];

    if (satisfies(version, range)) {
      return index;
    }
  }

  throw Error('没有匹配的版本');
}

function getPowerItemChange({
  name,
  type,
  action,
}: PowerItemEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerItem.Change | undefined {
  return ({contributions: {powerItems = {}}}) => {
    let powerItem = powerItems[name];

    if (!powerItem) {
      return undefined;
    }

    return type === 'action' ? powerItem.action?.[action!] : powerItem[type];
  };
}

function getPowerGlanceChange({
  name,
  type,
}: PowerGlanceEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerGlance.Change | undefined {
  return ({contributions: {powerGlances = {}}}) => {
    let powerGlance = powerGlances[name];

    if (!powerGlance) {
      return undefined;
    }

    return powerGlance[type];
  };
}

function getMigrations({
  name,
}: PowerItemEventParams | PowerGlanceEventParams): (
  type: keyof PowerAppVersion.Migrations<IStorageObject>,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction<IStorageObject>[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions.powerItems?.[name]?.migrations?.[type],
      ),
    );
}

function getChangeAndMigrations<TChange extends PowerAppVersion.Changes>(
  comingVersion: string | undefined,
  savedVersion: string | undefined,
  infos: PowerAppVersionInfo[],
  getChange: (definition: PowerAppVersion.Definition) => TChange | undefined,
  getMigrations: (
    type: keyof PowerAppVersion.Migrations<IStorageObject>,
    definitions: PowerAppVersion.Definition[],
  ) => PowerAppVersion.MigrationFunction<IStorageObject>[],
):
  | {
      change: TChange;
      migrations: PowerAppVersion.MigrationFunction<IStorageObject>[];
    }
  | undefined {
  if (!comingVersion || !savedVersion) {
    return undefined;
  }

  let index = matchVersionInfoIndex(comingVersion, infos);

  let {range, definition} = infos[index];

  let change = getChange(definition);

  if (!change) {
    return undefined;
  }

  if (satisfies(savedVersion, range)) {
    return {
      change,
      migrations: [],
    };
  }

  return {
    change,
    migrations: lt(comingVersion, savedVersion)
      ? getMigrations(
          'down',
          _.reverse(
            _.slice(infos, index, matchVersionInfoIndex(savedVersion, infos)),
          ).map(info => info.definition),
        )
      : getMigrations(
          'up',
          _.slice(
            infos,
            matchVersionInfoIndex(savedVersion, infos, index) + 1,
            index + 1,
          ).map(info => info.definition),
        ),
  };
}

let app = new PowerApp({
  source: {
    token: '',
  },
});

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
