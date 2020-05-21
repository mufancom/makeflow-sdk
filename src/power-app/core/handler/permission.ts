import {InstallationModel} from '../model';
import {PermissionEvent} from '../serve';
import {IPowerApp} from '../types';

export async function permissionHandler(
  app: IPowerApp,
  event: PermissionEvent['eventObject'],
  response: PermissionEvent['response'],
): Promise<void> {
  let responseData = {};
  let {
    source: {installation},
    accessToken,
  } = event.payload;

  let installationStorage = await app.dbAdapter.getStorage<InstallationModel>({
    type: 'installation',
    installation,
  });

  if (!installationStorage.created) {
    response(responseData);
    return;
  }

  installationStorage.setField('accessToken', accessToken);

  await app.dbAdapter.setStorage(installationStorage);

  response(responseData);
}
