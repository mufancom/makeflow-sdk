import {PowerApp} from '../../app';
import {InstallationModel} from '../model';
import {InstallationEvent} from '../serve';
import {StorageObject} from '../storage';
import {GeneralDeclare, PowerAppVersion} from '../types';
import {getChangeAndMigrations} from '../utils';

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

  let responseData = {};

  let installationStorage: StorageObject<InstallationModel> | undefined;

  switch (event.type) {
    case 'activate':
    case 'update': {
      let {configs, resources, users} = event.payload;

      installationStorage = await app.dbAdapter.createOrUpgradeStorageObject({
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
        storage: {},
      });

      responseData = {
        granted: !!installationStorage.getField('accessToken'),
      };

      break;
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
    response(responseData);
    return;
  }

  let [context] = await app.getStorageObjectContexts(
    'installation',
    installationStorage,
  );

  let changeResult =
    (await result.change({
      context,
    })) ?? {};

  response({...changeResult, ...responseData});
}

function getInstallationChange(
  type: InstallationEvent['eventObject']['type'],
): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change<GeneralDeclare> | undefined {
  return ({installation}) => installation?.[type];
}
