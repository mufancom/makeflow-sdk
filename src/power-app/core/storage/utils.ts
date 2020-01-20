import {Constructor} from 'tslang';

import {Docs, IStorageObject} from './storage';

export function mergeOriginalDoc<
  TDocs extends Docs,
  TStorageObject extends IStorageObject<TDocs> = IStorageObject<TDocs>
>(storage: TStorageObject, originalDoc: Partial<TDocs>): TStorageObject {
  if (!storage.originalDoc) {
    return storage;
  }

  let StorageObjectClass = ('constructor' in storage
    ? storage.constructor
    : undefined) as Constructor<TStorageObject>;

  if (!StorageObjectClass) {
    return storage;
  }

  return new StorageObjectClass({...storage.originalDoc, ...originalDoc});
}
