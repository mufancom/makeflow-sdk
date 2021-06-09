import {Dict} from 'tslang';

import {Model, ModelIdentity} from '../model';
import {StorageObject} from '../storage';
import {getModelIdentity} from '../utils';

export interface IDBAdapter extends DBAdapter {}

export type DefaultQueryType<TModel extends Model> = Partial<TModel> &
  Required<{type: TModel['type']}>;

export interface PaginationOptions {
  /**
   * 每页大小
   */
  size: number;
  /**
   * 当前页, 从 0 开始
   */
  current: number;
}

export interface PaginationResult<TData> {
  /**
   * 总条数
   */
  total: number;
  data: TData[];
}

abstract class DBAdapter {
  private readonly ready = this.initialize();

  constructor(protected options: unknown) {}

  async getStorageObject<TModel extends Model, TStorage = Dict<any>>(
    identity: ModelIdentity<TModel>,
  ): Promise<StorageObject<TModel, TStorage> | undefined> {
    await this.ready;

    let model = (await this.getModel(identity)) as TModel | undefined;

    return model && new StorageObject(model);
  }

  async getStorageObjects<TModel extends Model, TStorage>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<StorageObject<TModel, TStorage>[]> {
    await this.ready;

    let models = await this.getModelList(partialModel);

    return models.map(model => new StorageObject(model));
  }

  async getStorageObjectPagination<TModel extends Model, TStorage>(
    partialModel: DefaultQueryType<TModel>,
    options: PaginationOptions,
  ): Promise<PaginationResult<StorageObject<TModel, TStorage>>> {
    await this.ready;

    let {total, data: models} = await this.getModelPagination(
      partialModel,
      options,
    );

    return {
      total,
      data: models.map(model => new StorageObject(model)),
    };
  }

  async createStorageObject<TModel extends Model, TStorage = Dict<any>>(
    model: TModel,
  ): Promise<StorageObject<TModel, TStorage>> {
    await this.ready;

    model = await this.createModel(model);

    return new StorageObject(model);
  }

  async upgradeStorageObject<TModel extends Model, TStorage>(
    version: string,
    identity: ModelIdentity<TModel>,
    data: Partial<TModel>,
  ): Promise<StorageObject<TModel, TStorage>> {
    await this.ready;

    let model = await this.upgradeModel(version, identity, data);

    return new StorageObject(model);
  }

  async createOrUpgradeStorageObject<
    TModel extends Model,
    TStorage = Dict<any>
  >(
    model: TModel,
  ): Promise<{
    value: StorageObject<TModel, TStorage>;
    savedVersion: string | undefined;
  }> {
    await this.ready;

    let storageObject = await this.getStorageObject(getModelIdentity(model));

    if (storageObject) {
      return {
        savedVersion: storageObject.version,
        value: await this.upgradeStorageObject(
          model.version,
          storageObject.identity,
          model,
        ),
      };
    } else {
      return {
        value: await this.createStorageObject(model),
        savedVersion: undefined,
      };
    }
  }

  protected abstract initialize(): Promise<void>;

  // query

  protected abstract getModel(
    identity: ModelIdentity<Model>,
  ): Promise<Model | undefined>;

  protected abstract getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel[]>;

  protected abstract getModelPagination<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
    options: PaginationOptions,
  ): Promise<PaginationResult<TModel>>;

  // model

  protected abstract createModel<TModel extends Model>(
    model: TModel,
  ): Promise<TModel>;

  protected abstract upgradeModel<TModel extends Model>(
    version: string,
    identity: ModelIdentity<TModel>,
    model: Partial<TModel>,
  ): Promise<TModel>;

  // storage

  abstract setStorage<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    storage: any,
  ): Promise<TModel>;

  // field

  abstract rename<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    newPath: string,
  ): Promise<TModel>;

  abstract inc<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel>;

  abstract mul<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel>;

  abstract set<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<TModel>;

  abstract unset<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel>;

  // array field

  /**
   *
   * @param identity
   * @param path
   * @param size
   * 1. [ 0 = empty_array ]
   * 2. [ +? = the_first_?_items ]
   * 3. [ -? = the_last_?_items ]
   */
  abstract slice<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel>;

  abstract shift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel>;

  abstract unshift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<TModel>;

  abstract pop<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel>;

  abstract push<TModel extends Model, TValue>(
    identity: ModelIdentity<TModel>,
    path: string,
    ...value: TValue[]
  ): Promise<TModel>;
}

export const AbstractDBAdapter = DBAdapter;
