import _ from 'lodash';

import {PowerCustomCheckableItemModel} from '../model';
import {
  PowerCustomCheckableItemEvent,
  PowerCustomCheckableItemEventParams,
} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function powerCustomCheckableItemHandler(
  app: IPowerApp,
  event: PowerCustomCheckableItemEvent['eventObject'],
  response: PowerCustomCheckableItemEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: resourceToken,
    source: {token, url, installation, organization, team, version},
    inputs = {},
    configs = {},
    context,
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerCustomCheckableItemModel>({
    type: 'power-custom-checkable-item',
    resourceToken,
  });

  let result = getChangeAndMigrations<
    PowerAppVersion.PowerCustomCheckableItem.Change
  >(
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

  let actionStorage = getActionStorage(storage, app.dbAdapter);

  if (storage.created) {
    for (let migration of migrations) {
      await migration(actionStorage);
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
      resourceToken,
      storage: {},
    });
  }

  let responseData: PowerAppVersion.PowerCustomCheckableItem.ChangeResponseData | void;

  if (change) {
    let api = await app.generateAPI(storage);

    responseData = await change({
      storage: actionStorage,
      api,
      context,
      inputs,
      configs,
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
) => PowerAppVersion.PowerCustomCheckableItem.Change | undefined {
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
