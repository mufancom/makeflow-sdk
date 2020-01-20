import {Dict} from 'tslang';

import {AbstractStorageObject} from './storage';

export interface PowerGlanceDoc {
  type: 'power-glance';
  version: string;
  token: string;
  clock: number;
  storage: Dict<any>;
}

export type PowerGlanceStorage = PowerGlanceDoc['storage'];

export class PowerGlance extends AbstractStorageObject<
  PowerGlanceDoc,
  PowerGlanceStorage
> {
  protected extractDocToStorage(doc: PowerGlanceDoc): PowerGlanceStorage {
    return doc.storage;
  }

  protected mergeStorageToDoc(
    doc: PowerGlanceDoc,
    storage: PowerGlanceStorage,
  ): PowerGlanceDoc {
    return {
      ...doc,
      storage,
    };
  }
}
