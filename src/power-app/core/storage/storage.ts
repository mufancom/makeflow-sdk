import _ from 'lodash';

import {InstallationDoc, InstallationStorage} from './installation';
import {PowerGlanceDoc, PowerGlanceStorage} from './power-glance';
import {PowerItemDoc, PowerItemStorage} from './power-item';
import {ExtractStorage} from './utils';

export interface ActionStorage<
  TStorageObject extends IStorageObject = IStorageObject,
  TStorage extends Storages = ExtractStorage<TStorageObject>,
  TKey extends keyof TStorage = keyof TStorage
> {
  get: TStorageObject['get'];
  set(...args: [TStorage] | [TKey, TStorage[TKey]]): Promise<void>;
  merge(...args: Parameters<TStorageObject['merge']>): Promise<void>;
}

export type Docs = InstallationDoc | PowerItemDoc | PowerGlanceDoc;

export type Storages =
  | InstallationStorage
  | PowerItemStorage
  | PowerGlanceStorage;

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
  private storage: TStorage | undefined;
  protected doc: TDoc | undefined;

  constructor(protected originalDoc?: TDoc) {
    this.initialize(originalDoc);
  }

  get(): TStorage;
  get<TKey extends keyof TStorage>(key: TKey): TStorage[TKey];
  get<TKey extends keyof TStorage>(
    key?: TKey | undefined,
  ): TStorage | TStorage[TKey] | undefined {
    let storage = this.storage;

    if (!storage) {
      return undefined;
    }

    if (typeof key === 'undefined') {
      return storage;
    }

    return storage[key];
  }

  set(storage: TStorage): void;
  set<TKey extends keyof TStorage>(key: TKey, value: TStorage[TKey]): void;
  set<TKey extends keyof TStorage>(
    storageOrKey: TStorage | TKey,
    value?: TStorage[TKey],
  ): void {
    if (typeof storageOrKey === 'object') {
      this.storage = storageOrKey;
    } else if (this.storage) {
      this.storage[storageOrKey] = value!;
    }
  }

  merge(storage: Partial<TStorage>): void {
    this.storage = _.merge(this.storage, storage);
  }

  create(doc: TDoc): void {
    if (this.originalDoc) {
      return;
    }

    this.initialize(doc);
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

      doc = this.mergeStorageToDoc(doc, this.storage!);

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
        doc: this.mergeStorageToDoc(doc, this.storage!),
      };
    }

    return undefined;
  }

  rebuild(): void {
    this.initialize(this.doc);
  }

  protected abstract extractDocToStorage(doc: TDoc): TStorage;

  protected abstract mergeStorageToDoc(doc: TDoc, storage: TStorage): TDoc;

  private initialize(doc?: TDoc): void {
    if (doc) {
      this.storage = _.cloneDeep(this.extractDocToStorage(doc));
      this.doc = _.cloneDeep(doc);
    } else {
      this.storage = undefined;
      this.doc = undefined;
    }
  }
}

export const AbstractStorageObject = StorageObject;
