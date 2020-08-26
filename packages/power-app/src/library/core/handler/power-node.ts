import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerNodeModel} from '../model';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export type PowerNodeHandler = (
  app: PowerApp,
  params: PowerNodeHandlerParams,
) => Promise<API.PowerNode.HookReturn>;

type PowerNodeHandlerParams<
  TPowerNodeHandlerParams extends _PowerNodeHandlerParams = _PowerNodeHandlerParams
> = {
  type: 'power-node';
  params: PowerNodeParams;
} & TPowerNodeHandlerParams;

export interface PowerNodeParams {
  name: string;
  type: 'activate' | 'update' | 'deactivate' | 'action';
  action: string | undefined;
}

type _PowerNodeHandlerParams =
  | PowerNodeActivateHandlerParams
  | PowerNodeDeactivateHandlerParams
  | PowerNodeUpdateHandlerParams
  | PowerNodeActionHandlerParams;

export interface PowerNodeActivateHandlerParams {
  body: API.PowerNode.ActivateHookParams;
}

export interface PowerNodeDeactivateHandlerParams {
  body: API.PowerNode.DeactivateHookParams & {
    inputs: undefined;
    configs: undefined;
  };
}

export interface PowerNodeUpdateHandlerParams {
  body: API.PowerNode.UpdateHookParams;
}

export interface PowerNodeActionHandlerParams {
  body: API.PowerNode.ActionHookParams;
}

export const powerNodeHandler: PowerNodeHandler = async function (
  app: PowerApp,
  {
    type,
    params,
    body: {
      token: operationToken,
      source: {token, url, installation, organization, team, version},
      inputs = {},
    },
  },
) {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    PowerNodeModel
  >({
    type,
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
    return {};
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerNode.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts(type, storage);

    responseData = await change({
      context,
      inputs,
    });
  }

  return responseData || {};
};

function getPowerNodeChange({
  name,
  type,
  action,
}: PowerNodeParams): (
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
}: PowerNodeParams): (
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
