import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerCustomCheckableItemModel} from '../model';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export type PowerCustomCheckableItemHandler = (
  app: PowerApp,
  params: PowerCustomCheckableItemHandlerParams,
) => Promise<API.PowerCustomCheckableItem.HookReturn>;

export interface PowerCustomCheckableItemParams {
  name: string;
}

interface PowerCustomCheckableItemHandlerParams {
  type: 'power-custom-checkable-item';
  params: PowerCustomCheckableItemParams;
  body: API.PowerCustomCheckableItem.HookParams & {
    source: API.PowerApp.Source;
  };
}

export const powerCustomCheckableItemHandler: PowerCustomCheckableItemHandler = async function (
  app: PowerApp,
  {
    type,
    params,
    body: {
      source: {token, url, installation, organization, team, version},
      token: operationToken,
      inputs = {},
      context: {url: requestUrl},
    },
  },
) {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    PowerCustomCheckableItemModel
  >({
    type,
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
    return {};
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerCustomCheckableItem.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts(type, storage);

    responseData = await change({
      context,
      inputs,
      url: requestUrl,
    });
  }

  return responseData || {};
};

function getPowerCustomCheckableItemChange({
  name,
}: PowerCustomCheckableItemParams): (
  definition: PowerAppVersion.Definition,
) =>
  | PowerAppVersion.PowerCustomCheckableItem.Change<GeneralDeclareWithInputs>
  | undefined {
  return ({contributions: {powerCustomCheckableItems = {}} = {}}) =>
    powerCustomCheckableItems[name]?.['processor'];
}

function getPowerCustomCheckableItemMigrations({
  name,
}: PowerCustomCheckableItemParams): (
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
