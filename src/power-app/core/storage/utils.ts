import {IDBAdapter} from '../db';
import {Model} from '../model';

import {StorageObject} from './storage';

export interface ActionStorage<
  TModel extends Model,
  TKey extends keyof TModel = keyof TModel
> {
  get: StorageObject<TModel>['get'];
  set(...args: [TModel] | [TKey, TModel[TKey]]): Promise<void>;
  merge(...args: Parameters<StorageObject<TModel>['merge']>): Promise<void>;
}

export function getActionStorage<TModel extends Model>(
  storageObject: StorageObject<TModel>,
  db: IDBAdapter,
): ActionStorage<TModel> {
  let get = storageObject.get.bind(storageObject);

  async function set(...args: any[]): Promise<void> {
    storageObject.set.apply(storageObject, args);
    await db.setStorage(storageObject);
  }

  async function merge(
    storage: Parameters<StorageObject<TModel>['merge']>[0],
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
