import {API as APITypes} from '@makeflow/types';
import _ from 'lodash';

import {API} from '../../api';
import {PowerApp} from '../../app';
import {PowerGlanceModel} from '../model';
import {PowerGlanceEvent, PowerGlanceEventParams} from '../serve';
import {GeneralDeclare, PowerAppVersion} from '../types';
import {getChangeAndMigrations} from '../utils';

export async function powerGlanceHandler(
  app: PowerApp,
  event: PowerGlanceEvent['eventObject'],
  response: PowerGlanceEvent['response'],
): Promise<void> {
  let {
    params,
    payload: {
      token: operationToken,
      source: {token, url, installation, organization, team, version},
      clock = 0,
      resources = [],
      powerGlanceConfigs = {},
    },
  } = event;

  let storage = await app.dbAdapter.getStorage<PowerGlanceModel>({
    type: 'power-glance',
    operationToken,
  });

  let result = getChangeAndMigrations(
    version,
    storage.version,
    app.definitions,
    getPowerGlanceChange(params),
    getPowerGlanceMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  if (storage.created) {
    if (params.type === 'change') {
      let prevClock = Number(storage.getField('clock'));

      if (prevClock + 1 !== clock) {
        let api = new API({url});

        api.setOperationToken(operationToken);

        //  reinitialize
        try {
          let result = await api.initializePowerGlance();

          clock = result.clock;
          resources = result.resources;

          powerGlanceConfigs = result.powerGlanceConfigs;
        } catch (error) {
          response({});
          return;
        }
      }

      storage.setField('clock', clock);
      storage.setField('configs', powerGlanceConfigs);
    }

    if (migrations.length) {
      let storageField = storage.getField('storage') ?? {};

      for (let migration of migrations) {
        storageField = migration(storageField);
      }

      storage.set(storageField);
    }
  } else {
    storage.create({
      type: 'power-glance',
      token,
      url,
      installation,
      organization,
      team,
      version,
      operationToken,
      clock,
      disposed: undefined,
      configs: powerGlanceConfigs,
      storage: {},
    });
  }

  storage.setField('disposed', params.type === 'dispose');

  storage.upgrade(version);

  await app.dbAdapter.setStorage(storage);

  let responseData: APITypes.PowerGlance.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('powerGlances', storage);

    responseData = await change({
      context,
      resources,
    });
  }

  response(responseData || {});
}

function getPowerGlanceChange({
  name,
  type,
}: PowerGlanceEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerGlance.Change<GeneralDeclare> | undefined {
  return ({contributions: {powerGlances = {}} = {}}) => {
    let powerGlance = powerGlances[name];

    if (!powerGlance) {
      return undefined;
    }

    return powerGlance[type];
  };
}

function getPowerGlanceMigrations({
  name,
}: PowerGlanceEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerGlances?.[name]?.migrations?.[type],
      ),
    );
}
