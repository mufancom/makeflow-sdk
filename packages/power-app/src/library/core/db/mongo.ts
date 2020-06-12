import _ from 'lodash';
import {
  Collection,
  Db,
  FilterQuery,
  MongoClient,
  OnlyFieldsOfType,
  UpdateQuery,
} from 'mongodb';

import {Model} from '../model';

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

  protected async initialize(): Promise<void> {
    let {uri, name} = this.options;

    let client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      ignoreUndefined: true,
      useUnifiedTopology: true,
    });

    this.db = client.db(name);
  }

  protected async getModel<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel | undefined> {
    let {primaryField} = this.getStorageDefinitionInfo(partialModel.type);

    let model = await this.getCollection<TModel>(partialModel).findOne({
      [primaryField]: partialModel[primaryField],
    } as FilterQuery<TModel>);

    return model ?? undefined;
  }

  protected async getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel[]> {
    return this.getCollection<TModel>(partialModel)
      .find(getDictFilterQuery(partialModel))
      .toArray();
  }

  protected async deleteModel<TModel extends Model>(
    model: TModel,
  ): Promise<void> {
    let {primaryField} = this.getStorageDefinitionInfo(model.type);
    await this.getCollection<TModel>(model).deleteOne({
      [primaryField]: model[primaryField],
    } as FilterQuery<TModel>);
  }

  protected async createModel<TModel extends Model>(
    model: TModel,
  ): Promise<void> {
    await this.getCollection<TModel>(model).insertOne(model as any);
  }

  protected async updateModel<TModel extends Model>(
    prevModel: TModel,
    nextModel: TModel,
  ): Promise<void> {
    let {primaryField, allowedFields} = this.getStorageDefinitionInfo<TModel>(
      prevModel.type,
    );

    await this.getCollection<TModel>(prevModel).updateOne(
      {
        [primaryField]: prevModel[primaryField],
      } as FilterQuery<TModel>,
      getUpdateQuery({
        ..._.pick(nextModel, allowedFields),
        storage: nextModel.storage,
      }),
    );
  }

  private getCollection<TModel extends Model>({
    type,
  }: {
    type: TModel['type'];
  }): Collection<TModel> {
    return this.db.collection(type);
  }
}

function getDictFilterQuery<TModel extends Model>(
  doc: DefaultQueryType<TModel> | TModel,
): FilterQuery<Model> {
  function isObject(obj: unknown): obj is object {
    return _.isObjectLike(obj);
  }

  let query: FilterQuery<any> = {};

  for (let [key, value] of Object.entries(doc)) {
    if (!isObject(value)) {
      query[key] = value;
      continue;
    }

    query = {
      ...query,
      ..._.fromPairs(
        Object.entries(value).map(([property, value]) => [
          `${key}.${property}`,
          value,
        ]),
      ),
    };
  }

  return query;
}

function getUpdateQuery<TModel extends Model>(
  model: Partial<TModel>,
): UpdateQuery<TModel> {
  let unset = _.fromPairs(
    _.toPairsIn(_.pickBy(model, _.isUndefined)).map(([key]) => [key, '']),
  );

  return {
    $set: model,
    ...((!_.isEmpty(unset)
      ? {
          $unset: unset,
        }
      : {}) as OnlyFieldsOfType<TModel, any, ''>),
  };
}
