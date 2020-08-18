import _ from 'lodash';
import {
  Collection,
  Db,
  FindOneAndUpdateOption,
  MongoClient,
  OnlyFieldsOfType,
  PushOperator,
  UpdateQuery,
} from 'mongodb';

import {Model, ModelIdentity} from '../model';
import {buildSecureUpdateData, flattenObjectToQuery} from '../utils';

import {AbstractDBAdapter, DefaultQueryType} from './db';

export interface MongoOptions {
  uri: string;
  name: string;
}

export class MongoAdapter extends AbstractDBAdapter {
  protected db!: Db;

  constructor(protected options: MongoOptions) {
    super(options);
  }

  // query

  async getModel(identity: ModelIdentity<Model>): Promise<Model | undefined> {
    let {type, id} = identity;

    let model = await this.getCollection({type}).findOne({
      id,
    });

    return model || undefined;
  }

  async getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel[]> {
    return this.getCollection<TModel>(partialModel)
      .find(flattenObjectToQuery(partialModel))
      .toArray();
  }

  // model

  async createModel<TModel extends Model>(model: TModel): Promise<TModel> {
    await this.getCollection<TModel>(model).insertOne(model as any);

    return model;
  }

  async upgradeModel<TModel extends Model>(
    version: string,
    identity: ModelIdentity<TModel>,
    model: Partial<TModel>,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $set: buildSecureUpdateData(version, identity, model),
    });
  }

  async setStorage<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    storage: any,
  ): Promise<void> {
    await this.findOneAndUpdate(identity, {
      $set: {
        storage,
      },
    });
  }

  // filed

  async rename<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    newPath: string,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $rename: {
        [`storage.${path}`]: `storage.${newPath}`,
      },
    });
  }

  async inc<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $inc: {
        [`storage.${path}`]: size,
      } as OnlyFieldsOfType<TModel>,
    });
  }

  async mul<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $mul: {
        [`storage.${path}`]: size,
      } as OnlyFieldsOfType<TModel>,
    });
  }

  async set<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $set: {
        [`storage.${path}`]: value,
      },
    });
  }

  async unset<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $unset: {
        [`storage.${path}`]: '',
      },
    });
  }

  async slice<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    size: number,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $push: {
        [`storage.${path}`]: {
          $each: [],
          $slice: size,
        },
      } as PushOperator<TModel>,
    });
  }

  async shift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $pop: {
        [`storage.${path}`]: -1,
      } as OnlyFieldsOfType<TModel>,
    });
  }

  async unshift<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
    value: any,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $push: {
        [`storage.${path}`]: {
          $each: [value],
          $position: 0,
        },
      } as PushOperator<TModel>,
    });
  }

  async pop<TModel extends Model>(
    identity: ModelIdentity<TModel>,
    path: string,
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $pop: {
        [`storage.${path}`]: 1,
      } as OnlyFieldsOfType<TModel>,
    });
  }

  async push<TModel extends Model, TValue>(
    identity: ModelIdentity<TModel>,
    path: string,
    ...value: TValue[]
  ): Promise<TModel> {
    return this.findOneAndUpdate(identity, {
      $push: {
        [`storage.${path}`]: {
          $each: value,
        },
      } as PushOperator<TModel>,
    });
  }

  protected async initialize(): Promise<void> {
    let {uri, name} = this.options;

    let client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      ignoreUndefined: true,
      useUnifiedTopology: true,
    });

    this.db = client.db(name);

    await this.migrationRunner(this.db);
  }

  // helper

  private getCollection<TModel extends Model>({
    type,
  }: {
    type: TModel['type'];
  }): Collection<TModel> {
    return this.db.collection(type);
  }

  private async findOneAndUpdate<TModel extends Model>(
    {id, type}: ModelIdentity<TModel>,
    update: UpdateQuery<any>,
    options: FindOneAndUpdateOption = {},
  ): Promise<TModel> {
    let identity = {id, type};

    let identityQuery = flattenObjectToQuery<ModelIdentity<TModel>>(identity);

    let {value: newModel, lastErrorObject} = await this.getCollection<TModel>(
      identity,
    ).findOneAndUpdate(identityQuery, update, {
      returnOriginal: false,
      ...options,
    });

    if (!newModel) {
      throw lastErrorObject;
    }

    return newModel;
  }
}
