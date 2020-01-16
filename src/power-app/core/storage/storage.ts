import _ from 'lodash';

import {InstallationDoc, InstallationStorage} from './installation';
import {PowerItemDoc, PowerItemStorage} from './power-item';

export type ActionStorage<
  TStorageObject extends IStorageObject = IStorageObject
> = Pick<TStorageObject, 'get' | 'set'>;

export type Docs = InstallationDoc | PowerItemDoc;

export type Storages = InstallationStorage | PowerItemStorage;

export interface IStorageObject<
  TDoc extends Docs = Docs,
  TStorage extends Storages = Storages
> extends StorageObject<TDoc, TStorage> {}

export type StorageSaveResult<TDoc extends Docs> =
  | {type: 'create'; doc: TDoc}
  | {type: 'delete'; doc: TDoc}
  | {
      type: 'update';
      docs: {
        old: TDoc;
        new: TDoc;
      };
    };

abstract class StorageObject<TDoc extends Docs, TStorage extends Storages> {
  private storage: Partial<TStorage>;
  private doc: TDoc | undefined;

  constructor(private readonly originalDoc?: TDoc) {
    if (originalDoc) {
      this.storage = _.cloneDeep(this.extractDocToStorage(originalDoc));
      this.doc = _.cloneDeep(originalDoc);
    } else {
      this.storage = {};
    }
  }

  get(): Partial<TStorage>;
  get<TKey extends keyof TStorage>(key: TKey): TStorage[TKey];
  get<TKey extends keyof TStorage>(
    key?: TKey | undefined,
  ): Partial<TStorage> | TStorage[TKey] | undefined {
    let storage = this.storage;

    if (!storage) {
      return undefined;
    }

    if (typeof key === 'undefined') {
      return storage;
    }

    return storage[key];
  }

  set(storage: Partial<TStorage>): void;
  set<TKey extends keyof TStorage>(key: TKey, value: TStorage[TKey]): void;
  set<TKey extends keyof TStorage>(
    storageOrKey: Partial<TStorage> | TKey,
    value?: TStorage[TKey],
  ): void {
    if (typeof storageOrKey === 'object') {
      this.storage = storageOrKey;
    } else {
      this.storage[storageOrKey] = value;
    }
  }

  create(doc: TDoc): void {
    if (this.originalDoc) {
      return;
    }

    this.doc = doc;
  }

  delete(): void {
    this.doc = undefined;
  }

  save(): StorageSaveResult<TDoc> | undefined {
    let originalDoc = this.originalDoc;
    let doc = this.doc;

    if (originalDoc) {
      if (!doc) {
        return {
          type: 'delete',
          doc: originalDoc,
        };
      }

      doc = this.mergeStorageToDoc(doc, this.storage);

      if (_.isEqual(originalDoc, doc)) {
        return undefined;
      }

      return {
        type: 'update',
        docs: {
          old: originalDoc,
          new: doc,
        },
      };
    } else if (doc) {
      return {
        type: 'create',
        doc,
      };
    }

    return undefined;
  }

  getActionStorage<
    TStorageObject extends IStorageObject = IStorageObject
  >(): ActionStorage<TStorageObject> {
    return {
      get: this.get.bind(this),
      set: this.set.bind(this),
    };
  }

  protected abstract extractDocToStorage(doc: TDoc): TStorage;

  protected abstract mergeStorageToDoc(
    doc: TDoc,
    storage: Partial<TStorage>,
  ): TDoc;
}

export const AbstractStorageObject = StorageObject;
