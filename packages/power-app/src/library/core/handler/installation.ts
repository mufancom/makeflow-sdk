import {API} from '@makeflow/types';

import type {PowerApp} from '../../app';
import {InstallationModel} from '../model';
import {StorageObject} from '../storage';
import {getChangeAndMigrations} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export type InstallationHandler = (
  app: PowerApp,
  params: InstallationHandlerParams,
) => Promise<API.PowerApp.InstallationUpdateHookReturn>;

type InstallationHandlerParams<
  TInstallationHandlerParams extends _InstallationHandlerParams = _InstallationHandlerParams
> = {
  type: 'installation';
} & TInstallationHandlerParams;

type _InstallationHandlerParams =
  | InstallationActivateHandlerParams
  | InstallationDeactivateHandlerParams
  | InstallationUpdateHandlerParams;

export interface InstallationActivateHandlerParams {
  params: {
    type: 'activate';
  };
  body: API.PowerApp.InstallationActivateHookParams;
}

export interface InstallationDeactivateHandlerParams {
  params: {
    type: 'deactivate';
  };
  body: API.PowerApp.InstallationDeactivateHookParams;
}

export interface InstallationUpdateHandlerParams {
  params: {
    type: 'update';
  };
  body: API.PowerApp.InstallationUpdateHookParams;
}

export const installationHandler: InstallationHandler = async function (
  app: PowerApp,
  {params: {type}, body},
) {
  let {
    source: {token, url, installation, version, organization, team},
  } = body;

  let installationStorage: StorageObject<InstallationModel, any> | undefined;

  switch (type) {
    case 'activate':
    case 'update': {
      let {configs, resources, users, accessToken} = body as
        | InstallationActivateHandlerParams['body']
        | InstallationUpdateHandlerParams['body'];

      let result = await app.dbAdapter.createOrUpgradeStorageObject<
        InstallationModel
      >({
        type: 'installation',
        token,
        url,
        installation,
        version,
        organization,
        team,
        configs,
        resources,
        users,
        accessToken,
        storage: {},
      });

      installationStorage = result.value;

      break;
    }
  }

  if (!installationStorage) {
    return {};
  }

  let result = getChangeAndMigrations(
    version,
    undefined,
    app.definitions,
    getInstallationChange(type),
  );

  if (!result?.change) {
    return {};
  }

  let [context] = await app.getStorageObjectContexts(
    'installation',
    installationStorage,
  );

  let changeResult =
    (await result.change({
      context,
    })) || {};

  return changeResult;
};

function getInstallationChange(
  type: InstallationHandlerParams['params']['type'],
): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change<GeneralDeclare> | undefined {
  return ({installation}) => installation?.[type];
}
