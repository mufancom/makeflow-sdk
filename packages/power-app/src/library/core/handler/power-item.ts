import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerItemModel} from '../model';
import {PowerItemEvent, PowerItemEventParams} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export async function powerItemHandler(
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
      inputs = {},
    },
  }: PowerItemEvent['eventObject'],
  response: PowerItemEvent['response'],
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

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    PowerItemModel
  >({
    type: 'power-item',
    id: operationToken,
    token,
    url,
    installation,
    organization,
    team,
    operationToken,
    version,
    storage: {},
  });

  let result = getChangeAndMigrations(
    version,
    savedVersion,
    app.definitions,
    getPowerItemChange(params),
    getPowerItemMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerItem.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('power-item', storage);

    responseData = await change({
      context,
      inputs,
    });
  }

  response(responseData || {});
}

function getPowerItemChange({
  name,
  type,
  action,
}: PowerItemEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerItem.Change<GeneralDeclareWithInputs> | undefined {
  return ({contributions: {powerItems = {}} = {}}) => {
    let powerItem = powerItems[name];

    if (!powerItem) {
      return undefined;
    }

    return type === 'action' ? powerItem.actions?.[action!] : powerItem[type];
  };
}

function getPowerItemMigrations({
  name,
}: PowerItemEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerItems?.[name]?.migrations?.[type],
      ),
    );
}
