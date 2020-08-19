import {API as APITypes} from '@makeflow/types';
import _ from 'lodash';

import {API} from '../../api';
import type {PowerApp} from '../../app';
import {PowerGlanceModel} from '../model';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export type PowerGlanceHandler = (
  app: PowerApp,
  params: PowerGlanceHandlerParams,
) => Promise<APITypes.PowerGlance.HookReturn>;

type PowerGlanceHandlerParams<
  TPowerGlanceHandlerParams extends _PowerGlanceHandlerParams = _PowerGlanceHandlerParams
> = {
  type: 'power-glance';
  params: PowerGlanceParams;
} & TPowerGlanceHandlerParams;

export interface PowerGlanceParams {
  name: string;
  type: 'initialize' | 'change' | 'dispose';
}

type _PowerGlanceHandlerParams =
  | PowerGlanceInitializeHandlerParams
  | PowerGlanceUpdateHandlerParams
  | PowerGlanceDisposeHandlerParams;

export interface PowerGlanceInitializeHandlerParams {
  body: APITypes.PowerGlance.InitializeHookParams;
}

export interface PowerGlanceUpdateHandlerParams {
  body: APITypes.PowerGlance.UpdateHookParams;
}

export interface PowerGlanceDisposeHandlerParams {
  body: APITypes.PowerGlance.DisposeHookParams & {
    clock: undefined;
    resources: undefined;
    configs: undefined;
  } & {
    powerGlanceConfigs: undefined;
  };
}

export const powerGlanceHandler: PowerGlanceHandler = async function (
  app: PowerApp,
  {
    type,
    params,
    body: {
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
  },
) {
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
    type,
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
    return {};
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
          return {};
        }
      }
    }

    storage = await db.upgradeStorageObject(version, storage.identity, {
      disposed: params.type === 'dispose',
      configs: powerGlanceConfigs,
      clock,
    });

    await runMigrations(db, storage, migrations);
  } else {
    storage = await db.createStorageObject<PowerGlanceModel>({
      type,
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
    let [context] = await app.getStorageObjectContexts(type, storage);

    responseData = await change({
      context,
      resources,
    });
  }

  return responseData || {};
};

function getPowerGlanceChange({
  name,
  type,
}: PowerGlanceParams): (
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
}: PowerGlanceParams): (
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
