import type {PowerApp} from '../../app';
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
      source: {token, url, installation, version, organization, team},
    },
    type,
  } = event;

  let installationStorage: StorageObject<InstallationModel, any> | undefined;

  switch (event.type) {
    case 'activate':
    case 'update': {
      let {configs, resources, users, accessToken} = event.payload;

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
        disabled: false,
      });

      installationStorage = result.value;

      break;
    }
    case 'deactivate': {
      await app.dbAdapter.upgradeStorageObject<InstallationModel, any>(
        version,
        {
          type: 'installation',
          installation,
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
