import {IDBAdapter} from '../db';
import {Model} from '../model';
import {ActionStorage, StorageObject} from '../storage';

export function getActionStorage<TModel extends Model, TStorage>(
  storageObject: StorageObject<TModel>,
  db: IDBAdapter,
): ActionStorage<TModel, TStorage> {
  let get = storageObject.get.bind(storageObject);

  async function set(...args: any[]): Promise<void> {
    storageObject.set.apply(storageObject, args);
    await db.setStorage(storageObject);
  }

  async function merge(storage: any): Promise<void> {
    storageObject.merge(storage);
    await db.setStorage(storageObject);
  }

  return {
    get,
    set,
    merge,
  };
}
