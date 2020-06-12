import {PowerApp} from '../../app';
import {InstallationModel} from '../model';
import {PermissionEvent} from '../serve';

export async function permissionHandler(
  app: PowerApp,
  {
    payload: {
      source: {installation},
      accessToken,
    },
  }: PermissionEvent['eventObject'],
  response: PermissionEvent['response'],
): Promise<void> {
  let installationStorage = await app.dbAdapter.getStorage<InstallationModel>({
    type: 'installation',
    installation,
  });

  if (installationStorage.created) {
    installationStorage.setField('accessToken', accessToken);

    await app.dbAdapter.setStorage(installationStorage);
  }

  response({});
}
