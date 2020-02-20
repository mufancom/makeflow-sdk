import _ from 'lodash';
import {Dict} from 'tslang';

import {Model, ModelToDefinition} from '../model';

type StorageSaveResult<TModel extends Model> =
  | {type: 'create'; model: TModel}
  | {type: 'delete'; model: TModel}
  | {
      type: 'update';
      models: {
        prev: TModel;
        next: TModel;
      };
    };

export class StorageObject<
  TModel extends Model,
  TStorage extends Dict<any> = Dict<any>
> {
  protected model: TModel | undefined;
  private storage: Dict<any> | undefined;

  get version(): string {
    return this.originalModel?.version || this.model?.version || '';
  }

  get created(): boolean {
    return !!this.originalModel;
  }

  constructor(protected originalModel?: TModel) {
    this.initialize(originalModel);
  }

  get<TTStorage extends Dict<any> = TStorage>(): TTStorage;
  get<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(key: TKey): TTStorage[TKey];
  get<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(key?: TKey | undefined): TTStorage | TTStorage[TKey] | undefined {
    let storage = this.storage as TTStorage | undefined;

    if (!storage) {
      return undefined;
    }

    if (typeof key === 'undefined') {
      return storage;
    }

    return storage[key];
  }

  set<TTStorage extends Dict<any> = TStorage>(storage: TTStorage): void;
  set<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(key: TKey, value: TTStorage[TKey]): void;
  set<
    TTStorage extends Dict<any> = TStorage,
    TKey extends keyof TTStorage = keyof TTStorage
  >(storageOrKey: TTStorage | TKey, value?: TTStorage[TKey]): void {
    if (typeof storageOrKey === 'object') {
      this.storage = storageOrKey;
    } else if (
      this.storage &&
      storageOrKey &&
      typeof storageOrKey === 'string'
    ) {
      this.storage[storageOrKey] = value!;
    }
  }

  merge<TTStorage extends Dict<any> = TStorage>(
    storage: Partial<TTStorage>,
  ): void {
    if (!this.storage) {
      return;
    }

    this.storage = {
      ...this.storage,
      ...storage,
    };
  }

  create(model: TModel): void {
    if (this.originalModel) {
      return;
    }

    this.initialize(model);
  }

  delete(): void {
    this.model = undefined;
  }

  getField(key: ModelToDefinition<TModel>['allowedFields'][number]): any {
    let model = this.model;

    return model?.[(key as unknown) as keyof TModel];
  }

  setField(
    key: ModelToDefinition<TModel>['allowedFields'][number],
    value: any,
  ): this {
    let model = this.model;

    if (!model) {
      return this;
    }

    model[(key as unknown) as keyof TModel] = value;

    return this;
  }

  upgrade(version: string): void {
    let model = this.model;

    if (!model) {
      return;
    }

    model.version = version;
  }

  save(): StorageSaveResult<TModel> | undefined {
    let storage = this.storage;
    let originalModel = this.originalModel;
    let model = this.model;

    if (originalModel) {
      if (!model) {
        return {
          type: 'delete',
          model: originalModel,
        };
      }

      model.storage = storage;

      if (_.isEqual(originalModel, model)) {
        return undefined;
      }

      return {
        type: 'update',
        models: {
          prev: originalModel,
          next: model,
        },
      };
    } else if (model) {
      return {
        type: 'create',
        model,
      };
    }

    return undefined;
  }

  rebuild(): void {
    let model = this.model;
    this.originalModel = model;

    this.initialize(model);
  }

  private initialize(model?: TModel): void {
    if (model) {
      this.storage = _.cloneDeep(model);
      this.model = _.cloneDeep(model);
    } else {
      this.storage = undefined;
      this.model = undefined;
    }
  }
}
