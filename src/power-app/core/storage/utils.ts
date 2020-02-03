import {Constructor} from 'tslang';

import {IDBAdapter} from '../db';

import {ActionStorage, Docs, IStorageObject, Storages} from './storage';

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

export function getActionStorage<
  TStorageObject extends IStorageObject = IStorageObject,
  TStorage extends Storages = Storages
>(
  storageObject: TStorageObject,
  db: IDBAdapter,
): ActionStorage<TStorageObject> {
  let get = storageObject.get.bind(storageObject);

  async function set(storage: TStorage): Promise<void>;
  async function set<TKey extends keyof TStorage>(
    key: TKey,
    value: TStorage[TKey],
  ): Promise<void>;
  async function set(...args: any[]): Promise<void> {
    storageObject.set.apply(storageObject, args);
    await db.setStorage(storageObject);
  }

  async function merge(storage: Partial<TStorage>): Promise<void> {
    storageObject.merge(storage);
    await db.setStorage(storageObject);
  }

  return {
    get,
    set,
    merge,
  };
}
