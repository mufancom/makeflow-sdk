import _ from 'lodash';

import {Model, PowerItemModel} from '../model';
import {PowerItemEvent, PowerItemEventParams} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function powerItemHandler(
  app: IPowerApp,
  event: PowerItemEvent['eventObject'],
  response: PowerItemEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: resourceToken,
    source: {token, url, installation, organization, team, version},
    inputs = {},
    configs = {},
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerItemModel>({
    type: 'power-item',
    token,
  });

  let result = getChangeAndMigrations<PowerAppVersion.PowerItem.Change>(
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

  let actionStorage = getActionStorage(storage, app.dbAdapter);

  if (storage.created) {
    for (let migration of migrations) {
      await migration(actionStorage);
    }
  } else {
    storage.create({
      type: 'power-item',
      token,
      url,
      installation,
      organization,
      team,
      resourceToken,
      version,
      storage: {},
    });
  }

  let responseData: PowerAppVersion.PowerItem.ChangeResponseData | void;

  if (change) {
    let api = await app.generateAPI(storage);

    responseData = await change({
      storage: actionStorage,
      api,
      inputs,
      configs,
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
) => PowerAppVersion.PowerItem.Change | undefined {
  return ({contributions: {powerItems = {}} = {}}) => {
    let powerItem = powerItems[name];

    if (!powerItem) {
      return undefined;
    }

    return type === 'action' ? powerItem.action?.[action!] : powerItem[type];
  };
}

function getPowerItemMigrations({
  name,
}: PowerItemEventParams): (
  type: keyof PowerAppVersion.Migrations<Model>,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction<Model>[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerItems?.[name]?.migrations?.[type],
      ),
    );
}
