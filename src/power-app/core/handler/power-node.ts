import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PowerNodeModel} from '../model';
import {PowerNodeEvent, PowerNodeEventParams} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations} from '../utils';

export async function powerNodeHandler(
  app: PowerApp,
  event: PowerNodeEvent['eventObject'],
  response: PowerNodeEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: operationToken,
    source: {token, url, installation, organization, team, version},
    inputs = {},
  } = payload;

  let storage = await app.dbAdapter.getStorage<PowerNodeModel>({
    type: 'power-node',
    token,
  });

  let result = getChangeAndMigrations(
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
      type: 'power-node',
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

  let responseData: API.PowerNode.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('powerNodes', storage);

    responseData = await change({
      context,
      inputs,
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
) => PowerAppVersion.PowerNode.Change<GeneralDeclareWithInputs> | undefined {
  return ({contributions: {powerNodes = {}} = {}}) => {
    let powerNode = powerNodes[name];

    if (!powerNode) {
      return undefined;
    }

    return type === 'actions' ? powerNode.actions?.[action!] : powerNode[type];
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
