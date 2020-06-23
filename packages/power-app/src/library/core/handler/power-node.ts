import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PowerNodeEvent, PowerNodeEventParams} from '../serve';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../types';
import {getChangeAndMigrations, runMigrations} from '../utils';

export async function powerNodeHandler(
  app: PowerApp,
  {
    params,
    payload: {
      token: operationToken,
      source: {token, url, installation, organization, team, version},
      inputs = {},
    },
  }: PowerNodeEvent['eventObject'],
  response: PowerNodeEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  let storage = await db.createOrUpgradeStorageObject({
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

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerNode.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('powerNodes', storage);

    responseData = await change({
      context,
      inputs,
    });
  }

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

    return type === 'action' ? powerNode.actions?.[action!] : powerNode[type];
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
