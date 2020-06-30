import {API} from '@makeflow/types';
import _ from 'lodash';
import {Dict} from 'tslang';
import * as v from 'villa';

import {IDBAdapter} from '../db';
import {Model, ModelIdentity} from '../model';
import {getStorageLockKey} from '../utils';

import {StorageObject} from './storage';

type Unshift<TTuple, TElement> = TTuple extends readonly any[]
  ? ((element: TElement, ...tuple: TTuple) => void) extends (
      ...elements: infer TElements
    ) => void
    ? TElements
    : never
  : never;

type SliceFirst<TTuple> = TTuple extends readonly []
  ? never
  : TTuple extends readonly any[]
  ? ((...tuple: TTuple) => void) extends (
      element: any,
      ...elements: infer TElements
    ) => void
    ? TElements
    : never
  : never;

type Path<TObject> = TObject extends object
  ? {
      [TKey in keyof TObject]:
        | [TKey]
        | (Path<TObject[TKey]> extends infer TPath
            ? TPath extends []
              ? never
              : Unshift<TPath, TKey>
            : never);
    }[keyof TObject]
  : [];

type __Property<TObject, TPath extends any[]> = number extends TPath['length']
  ? never
  : TPath extends []
  ? TObject
  : {
      [TKey in keyof TObject]-?: TKey extends TPath[0]
        ? __Property<NonNullable<TObject[TKey]>, SliceFirst<TPath>>
        : never;
    }[TPath[0]];

type Property<TObject, TPath extends Path<TObject>> = __Property<
  TObject,
  TPath
>;

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

export class ActionStorage<TModel extends Model, TStorage extends Dict<any>> {
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

  get(): TStorage | undefined;
  get<TPath extends keyof TStorage>(path: TPath): TStorage[TPath] | undefined;
  get<TPath extends Path<TStorage>>(
    path: TPath,
  ): Property<TStorage, TPath> | undefined;
  get(path?: any): any {
    let storage = this.storageObject.storage;

    return path ? _.cloneDeep(_.get(storage, flatPath(path))) : storage;
  }

  require(): NonNullable<TStorage>;
  require<TPath extends keyof TStorage>(
    path: TPath,
  ): NonNullable<TStorage[TPath]>;
  require<TPath extends Path<TStorage>>(
    path: TPath,
  ): NonNullable<Property<TStorage, TPath>>;
  require(path?: any): any {
    let value = this.get(path);

    if (value === undefined) {
      throw Error(`${path ?? 'storage'} is require but get undefined`);
    }

    return value;
  }

  // field

  async rename(path: keyof TStorage, newPath: string): Promise<void>;
  async rename(path: Path<TStorage>, newPath: string): Promise<void>;
  @lock
  async rename(path: any, newPath: string): Promise<void> {
    await this.db.rename(this.storageObject.identity, flatPath(path), newPath);
  }

  async inc(path: keyof TStorage, size: number): Promise<void>;
  async inc(path: Path<TStorage>, size: number): Promise<void>;
  @lock
  async inc(path: any, size: number): Promise<void> {
    await this.db.inc(this.storageObject.identity, flatPath(path), size);
  }

  async mul(path: keyof TStorage, size: number): Promise<void>;
  async mul(path: Path<TStorage>, size: number): Promise<void>;
  @lock
  async mul(path: any, size: number): Promise<void> {
    await this.db.mul(this.storageObject.identity, flatPath(path), size);
  }

  async set<TPath extends keyof TStorage>(
    path: TPath,
    value: TStorage[TPath],
  ): Promise<void>;
  async set<TPath extends Path<TStorage>>(
    path: TPath,
    value: Property<TStorage, TPath>,
  ): Promise<void>;
  @lock
  async set(path: any, value: any): Promise<void> {
    await this.db.set(this.storageObject.identity, flatPath(path), value);
  }

  async unset(path: keyof TStorage): Promise<void>;
  async unset(path: Path<TStorage>): Promise<void>;
  @lock
  async unset(path: any): Promise<void> {
    await this.db.unset(this.storageObject.identity, flatPath(path));
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
  async slice(path: keyof TStorage, size: number): Promise<void>;
  async slice(path: Path<TStorage>, size: number): Promise<void>;
  @lock
  async slice(path: any, size: number): Promise<void> {
    await this.db.slice(this.storageObject.identity, flatPath(path), size);
  }

  async shift(path: keyof TStorage): Promise<void>;
  async shift(path: Path<TStorage>): Promise<void>;
  @lock
  async shift(path: any): Promise<void> {
    await this.db.shift(this.storageObject.identity, flatPath(path));
  }

  async unshift<TPath extends keyof TStorage>(
    path: TPath,
    value: TStorage[TPath][number],
  ): Promise<void>;
  async unshift<TPath extends Path<TStorage>>(
    path: TPath,
    value: Property<TStorage, TPath>[number],
  ): Promise<void>;
  @lock
  async unshift(path: any, value: any): Promise<void> {
    await this.db.unshift(this.storageObject.identity, flatPath(path), value);
  }

  async pop(path: keyof TStorage): Promise<void>;
  async pop(path: Path<TStorage>): Promise<void>;
  @lock
  async pop(path: any): Promise<void> {
    await this.db.pop(this.storageObject.identity, flatPath(path));
  }

  async push<TPath extends keyof TStorage>(
    path: TPath,
    ...value: TStorage[TPath]
  ): Promise<void>;
  async push<TPath extends Path<TStorage>>(
    path: TPath,
    ...value: Property<TStorage, TPath>
  ): Promise<void>;
  @lock
  async push(path: any, ...value: any[]): Promise<void> {
    await this.db.push(this.storageObject.identity, flatPath(path), ...value);
  }
}

function flatPath<TStorage>(path: Path<TStorage>): string {
  return typeof path === 'string' ? path : path.join('.');
}
