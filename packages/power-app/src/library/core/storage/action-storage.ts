import {API} from '@makeflow/types';
import {Dict} from 'tslang';
import * as v from 'villa';

import {IDBAdapter} from '../db';
import {Model, ModelIdentity} from '../model';
import {getStorageLockKey} from '../utils';

import {StorageObject} from './storage';

export function getActionStorage<TModel extends Model, TStorage>(
  db: IDBAdapter,
  storageObject: StorageObject<TModel>,
): ActionStorage<TModel, TStorage> {
  return new ActionStorage(db, storageObject);
}

function lock(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): void {
  let fn: Function = target[propertyKey];

  descriptor.value = async function (
    this: ActionStorage<any, any>,
    ...args: any[]
  ) {
    return v.lock(getStorageLockKey(this.identity), fn.bind(this, ...args));
  };
}

export class ActionStorage<
  TModel extends Model,
  TStorage extends Dict<any> = Dict<any>
> {
  get identity(): ModelIdentity<TModel> {
    return this.storageObject.identity;
  }

  get source(): API.PowerApp.Source {
    return this.storageObject.source;
  }

  constructor(
    private db: IDBAdapter,
    private storageObject: StorageObject<TModel>,
  ) {}

  get<TTStorage extends Dict<any> = TStorage>(): TTStorage;
  get<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(key: TKey): TTStorage[TKey];
  get<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(key?: TKey | undefined): TTStorage | TTStorage[TKey] | undefined {
    let storage = this.storageObject.storage as TTStorage | undefined;

    if (!storage) {
      return undefined;
    }

    if (typeof key === 'undefined') {
      return storage;
    }

    return storage[key];
  }

  @lock
  async setStorage<TTStorage extends Dict<any> = TStorage>(
    storage: TTStorage,
  ): Promise<void> {
    await this.db.setStorage(this.storageObject.identity, storage);
  }

  // field

  @lock
  async rename(path: string, newPath: string): Promise<void> {
    await this.db.rename(this.storageObject.identity, path, newPath);
  }

  @lock
  async inc(path: string, size: number): Promise<void> {
    await this.db.inc(this.storageObject.identity, path, size);
  }

  @lock
  async mul(path: string, size: number): Promise<void> {
    await this.db.mul(this.storageObject.identity, path, size);
  }

  @lock
  async set(path: string, value: any): Promise<void> {
    await this.db.set(this.storageObject.identity, path, value);
  }

  @lock
  async unset(path: string): Promise<void> {
    await this.db.unset(this.storageObject.identity, path);
  }

  // array field

  /**
   *
   * @param path
   * @param size
   * 1. [ 0 = empty_array ]
   * 2. [ +? = the_first_?_items ]
   * 3. [ -? = the_last_?_items ]
   */
  @lock
  async slice(path: string, size: number): Promise<void> {
    await this.db.slice(this.storageObject.identity, path, size);
  }

  @lock
  async shift(path: string): Promise<void> {
    await this.db.shift(this.storageObject.identity, path);
  }

  @lock
  async unshift(path: string, value: any): Promise<void> {
    await this.db.unshift(this.storageObject.identity, path, value);
  }

  @lock
  async pop(path: string): Promise<void> {
    await this.db.pop(this.storageObject.identity, path);
  }

  @lock
  async push<TValue>(path: string, ...value: TValue[]): Promise<void> {
    await this.db.push(this.storageObject.identity, path, ...value);
  }
}
