import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerNodeModel} from '../model';
import {PowerNodeEvent, PowerNodeEventParams} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export async function powerNodeHandler(
  app: PowerApp,
  {
    params,
    payload: {
      token: operationToken,
      source: {
        token,
        url,
        installation: originalInstallation,
        organization: originalOrganization,
        team: originalTeam,
        version,
      },
      inputs = {},
    },
  }: PowerNodeEvent['eventObject'],
  response: PowerNodeEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  // To fit the old version of Makeflow
  let organization =
    typeof originalOrganization === 'string'
      ? {id: originalOrganization}
      : originalOrganization;
  let team =
    typeof originalTeam === 'string'
      ? {id: originalTeam, abstract: false}
      : originalTeam;
  let installation =
    typeof originalInstallation === 'string'
      ? {id: originalInstallation}
      : originalInstallation;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    PowerNodeModel
  >({
    type: 'power-node',
    id: operationToken,
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
    let [context] = await app.getStorageObjectContexts('power-node', storage);

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
