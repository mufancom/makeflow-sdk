import {API} from '@makeflow/types';
import _ from 'lodash';

import type {PowerApp} from '../../app';
import {PowerItemModel} from '../model';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export type PowerItemHandler = (
  app: PowerApp,
  params: PowerItemHandlerParams,
) => Promise<API.PowerItem.HookReturn>;

type PowerItemHandlerParams<
  TPowerItemHandlerParams extends _PowerItemHandlerParams = _PowerItemHandlerParams
> = {
  type: 'power-item';
  params: PowerItemParams;
} & TPowerItemHandlerParams;

interface PowerItemParams {
  name: string;
  type: 'activate' | 'update' | 'deactivate' | 'action';
  action: string | undefined;
}

type _PowerItemHandlerParams =
  | PowerItemActivateHandlerParams
  | PowerItemDeactivateHandlerParams
  | PowerItemUpdateHandlerParams
  | PowerItemActionHandlerParams;

interface PowerItemActivateHandlerParams {
  body: API.PowerItem.ActivateHookParams;
}

interface PowerItemDeactivateHandlerParams {
  body: API.PowerItem.DeactivateHookParams & {
    inputs: undefined;
    configs: undefined;
  };
}

interface PowerItemUpdateHandlerParams {
  body: API.PowerItem.UpdateHookParams;
}

interface PowerItemActionHandlerParams {
  body: API.PowerItem.ActionHookParams;
}

export const powerItemHandler: PowerItemHandler = async function (
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
    PowerItemModel
  >({
    type,
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
    getPowerItemChange(params),
    getPowerItemMigrations(params),
  );

  if (!result) {
    return {};
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerItem.HookReturn | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts(type, storage);

    responseData = await change({
      context,
      inputs,
    });
  }

  return responseData || {};
};

function getPowerItemChange({
  name,
  type,
  action,
}: PowerItemParams): (
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
}: PowerItemParams): (
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
