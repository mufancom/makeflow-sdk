import {Dict} from 'tslang';

import {AbstractStorageObject} from './storage';

export interface PowerGlanceDoc {
  type: 'power-glance';
  version: string;
  token: string;
  clock: number;
  disposed: boolean | undefined;
  storage: Dict<any>;
}

export type PowerGlanceStorage = PowerGlanceDoc['storage'];

export class PowerGlance extends AbstractStorageObject<
  PowerGlanceDoc,
  PowerGlanceStorage
> {
  version = this.originalDoc?.version;

  clock = this.originalDoc?.clock;

  setDisposed(disposed: boolean): void {
    if (!this.doc) {
      return;
    }

    this.doc.disposed = disposed;
  }

  setVersion(version: string): void {
    if (!this.doc) {
      return;
    }

    this.doc.version = version;
  }

  setClock(clock: number): void {
    if (!this.doc) {
      return;
    }

    this.doc.clock = clock;
  }

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
