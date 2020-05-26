import _ from 'lodash';

import {PowerNodeModel} from '../model';
import {PowerNodeEvent, PowerNodeEventParams} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function powerNodeHandler(
  app: IPowerApp,
  event: PowerNodeEvent['eventObject'],
  response: PowerNodeEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: resourceToken,
    source: {token, url, installation, organization, team, version},
    inputs = {},
    configs = {},
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerNodeModel>({
    type: 'power-node',
    token,
  });

  let result = getChangeAndMigrations<PowerAppVersion.PowerNode.Change>(
    version,
    storage.version,
    app.definitions,
    getPowerNodeChange(params),
    getPowerNodeMigrations(params),
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
      type: 'power-node',
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

  let responseData: PowerAppVersion.PowerNode.ChangeResponseData | void;

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

function getPowerNodeChange({
  name,
  type,
  action,
}: PowerNodeEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.PowerNode.Change | undefined {
  return ({contributions: {powerNodes = {}} = {}}) => {
    let powerNode = powerNodes[name];

    if (!powerNode) {
      return undefined;
    }

    return type === 'action' ? powerNode.action?.[action!] : powerNode[type];
  };
}

function getPowerNodeMigrations({
  name,
}: PowerNodeEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.powerNodes?.[name]?.migrations?.[type],
      ),
    );
}
