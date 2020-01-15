import {PowerApp} from '../../types';

import {AbstractStorageObject} from './storage';

export type InstallationDoc = {
  type: 'installation';
} & Partial<PowerApp.PermissionGrantHookParams> &
  PowerApp.InstallationActivateHookParams;

export type InstallationStorage = InstallationDoc;

export class Installation extends AbstractStorageObject<
  InstallationDoc,
  InstallationStorage
> {
  protected extractDocToStorage(doc: InstallationDoc): InstallationStorage {
    return doc;
  }

  protected mergeStorageToDoc(
    doc: InstallationDoc,
    storage: Partial<InstallationStorage>,
  ): InstallationDoc {
    return {...doc, ...storage};
  }
}
