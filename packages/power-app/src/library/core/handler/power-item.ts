import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PowerItemEvent, PowerItemEventParams} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations, runMigrations} from '../utils';

export async function powerItemHandler(
  app: PowerApp,
  {
    params,
    payload: {
      token: operationToken,
      source: {token, url, installation, organization, team, version},
      inputs = {},
    },
  }: PowerItemEvent['eventObject'],
  response: PowerItemEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject({
    type: 'power-item',
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
    let [context] = await app.getStorageObjectContexts('powerItems', storage);

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
