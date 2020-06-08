import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PowerItemModel} from '../model';
import {PowerItemEvent, PowerItemEventParams} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations} from '../utils';

export async function powerItemHandler(
  app: PowerApp,
  event: PowerItemEvent['eventObject'],
  response: PowerItemEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: operationToken,
    source: {token, url, installation, organization, team, version},
    inputs = {},
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerItemModel>({
    type: 'power-item',
    token,
  });

  let result = getChangeAndMigrations(
    version,
    storage.version,
    app.definitions,
    getPowerItemChange(params),
    getPowerItemMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  if (storage.created) {
    if (migrations.length) {
      let storageField = storage.getField('storage') ?? {};

      for (let migration of migrations) {
        storageField = migration(storageField);
      }

      storage.set(storageField);
    }
  } else {
    storage.create({
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
  }

  let responseData: API.PowerItem.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('powerItems', storage);

    responseData = await change({
      context,
      inputs,
    });
  }

  storage.upgrade(version);

  await app.dbAdapter.setStorage(storage);

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
