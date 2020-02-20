import {Model, typeToModelDefinitionDict} from '../model';
import {StorageObject} from '../storage';

export interface IDBAdapter extends DBAdapter {}

export type DefaultQueryType<TModel extends Model> = Partial<TModel> &
  Required<{type: TModel['type']}>;

export interface StorageQueryType<TModel extends Model> {
  type: TModel['type'];
  storage: TModel['storage'];
}

export interface StorageDefinitionInfo<TModel extends Model> {
  primaryField: keyof TModel;
  allowedFields: (keyof TModel)[];
}

abstract class DBAdapter {
  private readonly ready = this.initialize();

  constructor(protected options: unknown) {}

  async setStorage<TModel extends Model>(
    storage: StorageObject<TModel>,
  ): Promise<void> {
    await this.ready;

    let result = storage.save();

    if (!result) {
      return;
    }

    switch (result.type) {
      case 'create':
        await this.createModel(result.model);
        break;

      case 'update': {
        let {prev, next} = result.models;

        await this.updateModel(prev, next);
        break;
      }
      case 'delete':
        await this.deleteModel(result.model);
        break;
    }

    storage.rebuild();
  }

  async getStorage<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<StorageObject<TModel>> {
    await this.ready;

    let model = await this.getModel(partialModel);

    return new StorageObject(model);
  }

  async getStorageObjectsByStorage<TModel extends Model>(
    partialModel: StorageQueryType<TModel>,
  ): Promise<StorageObject<TModel>[]> {
    await this.ready;

    let models = await this.getModelList(partialModel);

    return models.map(model => new StorageObject(model));
  }

  protected abstract initialize(): Promise<void>;

  protected abstract async getModel<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel | undefined>;

  protected abstract async getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel> | StorageQueryType<TModel>,
  ): Promise<TModel[]>;

  protected abstract async deleteModel<TModel extends Model>(
    model: TModel,
  ): Promise<void>;

  protected abstract async createModel<TModel extends Model>(
    model: TModel,
  ): Promise<void>;

  protected abstract async updateModel<TModel extends Model>(
    prevModel: TModel,
    nextModel: TModel,
  ): Promise<void>;

  protected getStorageDefinitionInfo<TModel extends Model>(
    type: TModel['type'],
  ): StorageDefinitionInfo<TModel> {
    let definition = typeToModelDefinitionDict[type];

    let primaryField = definition.primaryField as keyof TModel;
    let allowedFields = definition.allowedFields as (keyof TModel)[];

    return {
      primaryField,
      allowedFields: [...allowedFields, 'version'],
    };
  }
}

export const AbstractDBAdapter = DBAdapter;
