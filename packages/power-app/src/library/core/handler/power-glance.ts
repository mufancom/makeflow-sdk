import {API as APITypes} from '@makeflow/types';
import _ from 'lodash';

import {API} from '../../api';
import type {PowerApp} from '../../app';
import {PowerGlanceModel} from '../model';
import {PowerGlanceEvent, PowerGlanceEventParams} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export async function powerGlanceHandler(
  app: PowerApp,
  {
    params,
    payload: {
      token: operationToken,
      source: {
        token,
        url,
        installation: originalInstallation,
        organization: originalOrganization,
        team: originalTeam,
        version,
      },
      clock = 0,
      resources = [],
      powerGlanceConfigs = {},
    },
  }: PowerGlanceEvent['eventObject'],
  response: PowerGlanceEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  // To fit the old version of Makeflow
  let organization =
    typeof originalOrganization === 'string'
      ? {id: originalOrganization}
      : originalOrganization;
  let team =
    typeof originalTeam === 'string'
      ? {id: originalTeam, abstract: false}
      : originalTeam;
  let installation =
    typeof originalInstallation === 'string'
      ? {id: originalInstallation}
      : originalInstallation;

  let storage = await db.getStorageObject<PowerGlanceModel>({
    type: 'power-glance',
    id: operationToken,
  });

  let result = getChangeAndMigrations(
    version,
    storage?.version,
    app.definitions,
    getPowerGlanceChange(params),
    getPowerGlanceMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  if (storage) {
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
    }

    await db.upgradeStorageObject(version, storage.identity, {
      disposed: params.type === 'dispose',
      configs: powerGlanceConfigs,
      clock,
    });

    await runMigrations(db, storage, migrations);
  } else {
    storage = await db.createStorageObject<PowerGlanceModel>({
      type: 'power-glance',
      id: operationToken,
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

  let responseData: APITypes.PowerGlance.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('power-glance', storage);

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
