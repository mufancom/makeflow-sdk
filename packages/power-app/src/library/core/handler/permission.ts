import type {PowerApp} from '../../app';
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
  let db = app.dbAdapter;

  let storage = await db.getStorageObject<InstallationModel>({
    type: 'installation',
    installation,
  });

  if (storage) {
    await db.upgradeStorageObject(storage.version, storage.identity, {
      accessToken,
    });
  }

  response({});
}
