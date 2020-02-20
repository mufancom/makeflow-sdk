import {Dict} from 'tslang';

import {AbstractStorageObject} from './storage';

export interface PowerCustomCheckableItemDoc {
  type: 'power-custom-checkable-item';
  version: string;
  token: string;
  storage: Dict<any>;
}

export type PowerCustomCheckableItemStorage = PowerCustomCheckableItemDoc['storage'];

export class PowerCustomCheckableItem extends AbstractStorageObject<
  PowerCustomCheckableItemDoc,
  PowerCustomCheckableItemStorage
> {
  token = this.originalDoc?.token;

  version = this.originalDoc?.version;

  setVersion(version: string): void {
    if (!this.doc) {
      return;
    }

    this.doc.version = version;
  }

  extractDocToStorage(
    doc: PowerCustomCheckableItemDoc,
  ): PowerCustomCheckableItemStorage {
    return doc.storage;
  }

  mergeStorageToDoc(
    doc: PowerCustomCheckableItemDoc,
    storage: PowerCustomCheckableItemStorage,
  ): PowerCustomCheckableItemDoc {
    return {
      ...doc,
      storage,
    };
  }
}
