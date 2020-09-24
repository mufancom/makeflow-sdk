import {API, User} from '@makeflow/types';

import type {PowerApp} from '../../app';
import {TeamId} from '../../types/namespace';
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
  {type, params: {type: hookType}, body},
) {
  let {
    source: {token, url, installation, version, organization, team},
  } = body;

  let installationId = installation.id;

  let installationStorage: StorageObject<InstallationModel, any> | undefined;

  switch (hookType) {
    case 'activate':
    case 'update': {
      let {configs, resources, users, accessToken} = body as
        | InstallationActivateHandlerParams['body']
        | InstallationUpdateHandlerParams['body'];

      // To fit the old version of Makeflow
      if (users.length) {
        users =
          typeof users[0].team === 'string'
            ? users.map(
                ({team, ...rest}): User.TeamUserInfo => {
                  return {
                    ...rest,
                    team: {
                      id: (team as unknown) as TeamId,
                      abstract: false,
                      displayName: '',
                    },
                  };
                },
              )
            : users;
      }

      let result = await app.dbAdapter.createOrUpgradeStorageObject<
        InstallationModel
      >({
        type: 'installation',
        id: installationId,
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
        disabled: false,
      });

      installationStorage = result.value;

      break;
    }
    case 'deactivate': {
      installationStorage = await app.dbAdapter.upgradeStorageObject<
        InstallationModel,
        any
      >(
        version,
        {
          type: 'installation',
          id: installationId,
        },
        {
          disabled: true,
        },
      );
    }
  }

  if (!installationStorage) {
    return {};
  }

  let result = getChangeAndMigrations(
    version,
    undefined,
    app.definitions,
    getInstallationChange(hookType),
  );

  if (!result?.change) {
    return {};
  }

  let [context] = await app.getStorageObjectContexts(type, installationStorage);

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
