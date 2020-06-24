import {Model, ModelIdentity} from '../model';
import {StorageObject} from '../storage';
import {getModelIdentity} from '../utils';

export interface IDBAdapter extends DBAdapter {}

export type DefaultQueryType<TModel extends Model> = Partial<TModel> &
  Required<{type: TModel['type']}>;

export interface StorageDefinitionInfo<TModel extends Model> {
  primaryField: keyof TModel;
  allowedFields: (keyof TModel)[];
}

abstract class DBAdapter {
  private readonly ready = this.initialize();

  constructor(protected options: unknown) {}

  async getStorageObject<TModel extends Model>(
    identity: ModelIdentity<TModel>,
  ): Promise<StorageObject<TModel> | undefined> {
    await this.ready;

    let model = (await this.getModel(identity)) as TModel | undefined;

    return model && new StorageObject(model);
  }

  async getStorageObjects<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<StorageObject<TModel>[]> {
    await this.ready;

    let models = await this.getModelList(partialModel);

    return models.map(model => new StorageObject(model));
  }

  async createStorageObject<TModel extends Model>(
    model: TModel,
  ): Promise<StorageObject<TModel>> {
    await this.ready;

    model = await this.createModel(model);

    return new StorageObject(model);
  }

  async upgradeStorageObject<TModel extends Model>(
    version: string,
    identity: ModelIdentity<TModel>,
    data: Partial<TModel>,
  ): Promise<StorageObject<TModel>> {
    await this.ready;

    let model = await this.upgradeModel(version, identity, data);

    return new StorageObject(model);
  }

  async createOrUpgradeStorageObject<TModel extends Model>(
    model: TModel,
  ): Promise<{
    value: StorageObject<TModel>;
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

  protected abstract async getModel(
    identity: ModelIdentity<Model>,
  ): Promise<Model | undefined>;

  protected abstract async getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel[]>;

  // model

  protected abstract async createModel<TModel extends Model>(
    model: TModel,
  ): Promise<TModel>;

  protected abstract async upgradeModel<TModel extends Model>(
    version: string,
    identity: ModelIdentity<TModel>,
    model: Partial<TModel>,
  ): Promise<TModel>;

  // storage

  abstract async setStorage<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    storage: any,
  ): Promise<void>;

  // field

  abstract async rename<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    newPath: string,
  ): Promise<void>;

  abstract async inc<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<void>;

  abstract async mul<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<void>;

  abstract async set<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<void>;

  abstract async unset<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<void>;

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
  abstract async slice<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<void>;

  abstract async shift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<void>;

  abstract async unshift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<void>;

  abstract async pop<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<void>;

  abstract async push<TModel extends Model, TValue>(
    identity: ModelIdentity<TModel>,
    path: string,
    ...value: TValue[]
  ): Promise<void>;
}

export const AbstractDBAdapter = DBAdapter;
