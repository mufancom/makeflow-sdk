import {API} from '@makeflow/types';

import {AbstractStorageObject} from './storage';

export type InstallationDoc = {
  type: 'installation';
} & Partial<API.PowerApp.PermissionGrantHookParams> &
  API.PowerApp.InstallationActivateHookParams;

export type InstallationStorage = InstallationDoc;

export class Installation extends AbstractStorageObject<
  InstallationDoc,
  InstallationStorage
> {
  protected extractDocToStorage(doc: InstallationDoc): InstallationStorage {
    return doc;
  }

  protected mergeStorageToDoc(
    {source, organization, installation, team, ...rest}: InstallationDoc,
    storage: InstallationStorage,
  ): InstallationDoc {
    return {...rest, ...storage, source, organization, installation, team};
  }
}
