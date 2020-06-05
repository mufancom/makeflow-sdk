import {PowerApp} from '../../app';
import {InstallationModel} from '../model';
import {InstallationEvent} from '../serve';
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

  if (!installation) {
    return;
  }

  let responseData = {};

  let installationStorage = await app.dbAdapter.getStorage<InstallationModel>({
    type: 'installation',
    installation,
  });

  switch (event.type) {
    case 'activate':
    case 'update': {
      // 等待 #3158
      let {configs, resources, users} = event.payload as any;

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

  let ret =
    (await result.change({
      context,
    })) ?? {};

  response({...ret, ...responseData});
}

function getInstallationChange(
  type: InstallationEvent['eventObject']['type'],
): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Installation.Change<GeneralDeclare> | undefined {
  return ({installation}) => installation?.[type];
}
