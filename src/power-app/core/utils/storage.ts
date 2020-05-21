import {IDBAdapter} from '../db';
import {Model} from '../model';
import {ActionStorage, StorageObject} from '../storage';

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
