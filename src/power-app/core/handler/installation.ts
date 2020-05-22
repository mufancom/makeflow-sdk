import {API} from '@makeflow/types';

import {InstallationModel} from '../model';
import {InstallationEvent} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function installationHandler(
  app: IPowerApp,
  event: InstallationEvent['eventObject'],
  response: InstallationEvent['response'],
): Promise<void> {
  let responseData = {};

  let {payload, type} = event;

  let {token, url, installation, version, organization, team} = payload.source;

  if (!installation) {
    return;
  }

  let installationStorage = await app.dbAdapter.getStorage<InstallationModel>({
    type: 'installation',
    installation,
  });

  switch (event.type) {
    case 'activate':
    case 'update': {
      let {configs, resources, users} = event.payload;

      if (installationStorage.created) {
        installationStorage
          .setField('configs', configs)
          .setField('resources', resources)
          .setField('users', users);
      } else {
        installationStorage.create({
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
      }

      responseData = {
        granted: !!installationStorage.getField('accessToken'),
      };

      break;
    }
  }

  installationStorage.upgrade(version);

  await app.dbAdapter.setStorage(installationStorage);

  let result = getChangeAndMigrations<PowerAppVersion.Installation.Change>(
    version,
    undefined,
    app.definitions,
    getInstallationChange({type}),
  );

  if (result?.change) {
    let api = await app.generateAPI(installationStorage);

    await result.change({
      api,
      configs: installationStorage.getField('configs') ?? {},
      storage: getActionStorage(installationStorage, app.dbAdapter),
      resources: installationStorage.getField('resources'),
      users: installationStorage.getField('users'),
      rawParams: payload as API.PowerApp.InstallationActivateHookParams,
    });
  }

  response(responseData);
}

function getInstallationChange({
  type,
}: Pick<InstallationEvent['eventObject'], 'type'>): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change | undefined {
  return ({installation}) => installation?.[type];
}
