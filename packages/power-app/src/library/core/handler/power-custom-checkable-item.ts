import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerCustomCheckableItemModel} from '../model';
import {
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export async function powerCustomCheckableItemHandler(
  app: PowerApp,
  {
    params,
    payload: {
      source: {
        token,
        url,
        installation: originalInstallation,
        organization: originalOrganization,
        team: originalTeam,
        version,
      },
      token: operationToken,
      inputs = {},
      context: {url: requestUrl},
    },
  }: PowerCustomCheckableItemEvent['eventObject'],
  response: PowerCustomCheckableItemEvent['response'],
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
    PowerCustomCheckableItemModel
  >({
    type: 'power-custom-checkable-item',
    id: operationToken,
    token,
    url,
    installation,
    organization,
    team,
    version,
    operationToken,
    storage: {},
  });

  let result = getChangeAndMigrations(
    version,
    savedVersion,
    app.definitions,
    getPowerCustomCheckableItemChange(params),
    getPowerCustomCheckableItemMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerCustomCheckableItem.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts(
      'power-custom-checkable-item',
      storage,
    );

    responseData = await change({
      context,
      inputs,
      url: requestUrl,
    });
  }

  response(responseData || {});
}

function getPowerCustomCheckableItemChange({
  name,
}: PowerCustomCheckableItemEventParams): (
  definition: PowerAppVersion.Definition,
) =>
  | PowerAppVersion.PowerCustomCheckableItem.Change<GeneralDeclareWithInputs>
  | undefined {
  return ({contributions: {powerCustomCheckableItems = {}} = {}}) =>
    powerCustomCheckableItems[name]?.['processor'];
}

function getPowerCustomCheckableItemMigrations({
  name,
}: PowerCustomCheckableItemEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerCustomCheckableItems?.[name]
            ?.migrations?.[type],
      ),
    );
}
