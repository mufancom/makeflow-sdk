import _ from 'lodash';

import {Model, PowerGlanceModel} from '../model';
import {
  PowerCustomCheckableItemEventParams,
  PowerGlanceEvent,
  PowerGlanceEventParams,
  PowerItemEventParams,
} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function powerGlanceHandler(
  app: IPowerApp,
  event: PowerGlanceEvent['eventObject'],
  response: PowerGlanceEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: resourceToken,
    source: {token, url, installation, organization, team, version},
    clock = 0,
    resources = [],
    configs = {},
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerGlanceModel>({
    type: 'power-glance',
    token,
  });

  let result = getChangeAndMigrations<PowerAppVersion.PowerGlance.Change>(
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

  let actionStorage = getActionStorage(storage, app.dbAdapter);

  let api = await app.generateAPI(storage);

  if (storage.created) {
    if (params.type === 'change') {
      let prevClock = Number(storage.getField('clock'));

      if (prevClock + 1 !== clock) {
        //  reinitialize
        try {
          let result = await api.initializePowerGlance();

          clock = result.clock;
          resources = result.resources;
          configs = result.configs;
        } catch (error) {
          response({});
          return;
        }
      }

      storage.setField('clock', clock);
    }

    for (let migration of migrations) {
      await migration(actionStorage);
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
      resourceToken,
      clock,
      disposed: undefined,
      storage: {},
    });
  }

  let responseData: PowerAppVersion.PowerGlance.ChangeResponseData | void;

  if (change) {
    responseData = await change({
      storage: actionStorage,
      api,
      resources,
      configs,
    });
  }

  storage.setField('disposed', params.type === 'dispose');
  storage.upgrade(version);

  await app.dbAdapter.setStorage(storage);

  response(responseData || {});
}

function getPowerGlanceChange({
  name,
  type,
}: PowerGlanceEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerGlance.Change | undefined {
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
}:
  | PowerItemEventParams
  | PowerGlanceEventParams
  | PowerCustomCheckableItemEventParams): (
  type: keyof PowerAppVersion.Migrations<Model>,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction<Model>[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerGlances?.[name]?.migrations?.[type],
      ),
    );
}
