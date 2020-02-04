import {Dict} from 'tslang';

import {AbstractStorageObject} from './storage';

export interface PowerItemDoc {
  type: 'power-item';
  version: string;
  token: string;
  storage: Dict<any>;
}

export type PowerItemStorage = PowerItemDoc['storage'];

export class PowerItem extends AbstractStorageObject<
  PowerItemDoc,
  PowerItemStorage
> {
  version = this.originalDoc?.version;

  setVersion(version: string): void {
    if (!this.doc) {
      return;
    }

    this.doc.version = version;
  }

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
