import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations, runMigrations} from '../utils';

export async function powerCustomCheckableItemHandler(
  app: PowerApp,
  {
    params,
    payload: {
      source: {token, url, installation, organization, team, version},
      token: operationToken,
      inputs = {},
      context: {url: requestUrl},
    },
  }: PowerCustomCheckableItemEvent['eventObject'],
  response: PowerCustomCheckableItemEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  let storage = await db.createOrUpgradeStorageObject({
    type: 'power-custom-checkable-item',
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
    storage.version,
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
      'powerCustomCheckableItems',
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
