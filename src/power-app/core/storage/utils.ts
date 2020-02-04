import {IDBAdapter} from '../db';

import {ActionStorage, IStorageObject} from './storage';

export type ExtractDoc<
  TStorageObject extends IStorageObject
> = TStorageObject extends IStorageObject<infer R> ? R : never;

export type ExtractStorage<
  TStorageObject extends IStorageObject
> = TStorageObject extends IStorageObject<any, infer R> ? R : never;

export function getActionStorage<
  TStorageObject extends IStorageObject = IStorageObject
>(
  storageObject: TStorageObject,
  db: IDBAdapter,
): ActionStorage<TStorageObject> {
  let get = storageObject.get.bind(storageObject);

  async function set(...args: any[]): Promise<void> {
    storageObject.set.apply(storageObject, args);
    await db.setStorage(storageObject);
  }

  async function merge(
    storage: Parameters<TStorageObject['merge']>[0],
  ): Promise<void> {
    storageObject.merge(storage);
    await db.setStorage(storageObject);
  }

  return {
    get,
    set,
    merge,
  };
}
