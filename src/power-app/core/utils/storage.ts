import {IDBAdapter} from '../db';
import {Model} from '../model';
import {ActionStorage, StorageObject} from '../storage';

export function getActionStorage<TModel extends Model>(
  storageObject: StorageObject<TModel>,
  db: IDBAdapter,
): ActionStorage<TModel> {
  let get = storageObject.get.bind(storageObject);

  function getField(key: any): any {
    return storageObject.getField(key);
  }

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
    getField,
    set,
    merge,
  };
}
