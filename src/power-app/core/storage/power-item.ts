import {Dict} from 'tslang';

import {AbstractStorageObject} from './storage';

export interface PowerItemDoc {
  type: 'power-item';
  token: string;
  storage: Dict<any>;
}

export type PowerItemStorage = PowerItemDoc['storage'];

export class PowerItem extends AbstractStorageObject<
  PowerItemDoc,
  PowerItemStorage
> {
  protected extractDocToStorage(doc: PowerItemDoc): PowerItemStorage {
    return doc.storage;
  }

  protected mergeStorageToDoc(
    doc: PowerItemDoc,
    storage: PowerItemStorage,
  ): PowerItemDoc {
    return {
      ...doc,
      storage,
    };
  }
}
