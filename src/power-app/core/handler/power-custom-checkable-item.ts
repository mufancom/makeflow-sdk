import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PowerCustomCheckableItemModel} from '../model';
import {
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations} from '../utils';

export async function powerCustomCheckableItemHandler(
  app: PowerApp,
  event: PowerCustomCheckableItemEvent['eventObject'],
  response: PowerCustomCheckableItemEvent['response'],
): Promise<void> {
  let {
    params,
    payload: {
      source,
      token: operationToken,
      inputs = {},
      context: {url: requestUrl},
    },
  } = event;

  let {token, url, installation, organization, team, version} = source;

  let storage = await app.dbAdapter.getStorage<PowerCustomCheckableItemModel>({
    type: 'power-custom-checkable-item',
    operationToken,
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

  if (storage.created) {
    if (migrations.length) {
      let storageField = storage.getField('storage') ?? {};

      for (let migration of migrations) {
        migration(storageField);
      }

      storage.set(storageField);
    }
  } else {
    storage.create({
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
  }

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

  storage.upgrade(version);

  await app.dbAdapter.setStorage(storage);

  response(responseData || {});
}

function getPowerCustomCheckableItemChange({
  name,
}: PowerCustomCheckableItemEventParams): (
  definition: PowerAppVersion.Definition,
) =>
  | PowerAppVersion.PowerCustomCheckableItem.Change<GeneralDeclareWithInputs>
  | undefined {
  return ({contributions: {powerCustomCheckableItems = {}} = {}}) => {
    let checkableItem = powerCustomCheckableItems[name];

    if (!checkableItem) {
      return undefined;
    }

    return typeof checkableItem === 'function'
      ? checkableItem
      : checkableItem['processor'];
  };
}

function getPowerCustomCheckableItemMigrations({
  name,
}: PowerCustomCheckableItemEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(definition => {
        let powerCustomCheckableItem =
          definition.contributions?.powerCustomCheckableItems?.[name];

        if (typeof powerCustomCheckableItem === 'function') {
          return undefined;
        }

        return powerCustomCheckableItem?.migrations?.[type];
      }),
    );
}
