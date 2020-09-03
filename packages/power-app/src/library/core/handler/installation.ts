import {User} from '@makeflow/types';

import type {PowerApp} from '../../app';
import {TeamId} from '../../types/namespace';
import {InstallationModel} from '../model';
import {InstallationEvent} from '../serve';
import {StorageObject} from '../storage';
import {getChangeAndMigrations} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export async function installationHandler(
  app: PowerApp,
  event: InstallationEvent['eventObject'],
  response: InstallationEvent['response'],
): Promise<void> {
  let {
    payload: {
      source: {
        token,
        url,
        installation: originalInstallation,
        version,
        organization: originalOrganization,
        team: originalTeam,
      },
    },
    type,
  } = event;

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

  let installationId = installation.id;

  let installationStorage: StorageObject<InstallationModel, any> | undefined;

  switch (event.type) {
    case 'activate':
    case 'update': {
      let {configs, resources, users, accessToken} = event.payload;

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
    return;
  }

  let result = getChangeAndMigrations(
    version,
    undefined,
    app.definitions,
    getInstallationChange(type),
  );

  if (!result?.change) {
    response({});
    return;
  }

  let [context] = await app.getStorageObjectContexts(
    'installation',
    installationStorage,
  );

  let changeResult =
    (await result.change({
      context,
    })) || {};

  response(changeResult);
}

function getInstallationChange(
  type: InstallationEvent['eventObject']['type'],
): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change<GeneralDeclare> | undefined {
  return ({installation}) => installation?.[type];
}
