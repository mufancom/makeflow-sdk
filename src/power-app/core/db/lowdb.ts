import {CollectionChain} from 'lodash';
import lowdb, {LowdbSync} from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

import {Model} from '../model';

import {AbstractDBAdapter, DefaultQueryType} from './db';

export interface LowdbOptions {
  file?: string;
}

type Schema<TModel extends Model = Model> = {
  [key in TModel['type']]: TModel[];
};

export class LowdbAdapter extends AbstractDBAdapter {
  private db!: LowdbSync<Schema>;

  constructor(protected options: LowdbOptions) {
    super(options);
  }

  protected async initialize(): Promise<void> {
    let {file = 'db.json'} = this.options;

    this.db = lowdb(new FileSync(file));

    this.db
      .defaults<Schema>({
        installation: [],
        'power-item': [],
        'power-glance': [],
        'power-custom-checkable-item': [],
      })
      .write();
  }

  protected async getModel<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel | undefined> {
    let {primaryField} = this.getStorageDefinitionInfo(partialModel.type);

    return this.getCollection(partialModel)
      .find({[primaryField]: partialModel[primaryField]})
      .value() as TModel | undefined;
  }

  protected async getModelList<TModel extends Model>(
    partialModel: DefaultQueryType<TModel>,
  ): Promise<TModel[]> {
    return this.getCollection(partialModel)
      .filter(partialModel as any)
      .value() as TModel[];
  }

  protected async deleteModel<TModel extends Model>(
    model: TModel,
  ): Promise<void> {
    let {primaryField} = this.getStorageDefinitionInfo(model.type);

    await this.getCollection(model)
      .remove({[primaryField]: model[primaryField]})
      .write();
  }

  protected async createModel<TModel extends Model>(
    model: TModel,
  ): Promise<void> {
    await this.getCollection(model)
      .push(model)
      .write();
  }

  protected async updateModel<TModel extends Model>(
    prevModel: TModel,
    nextModel: TModel,
  ): Promise<void> {
    let {primaryField, allowedFields} = this.getStorageDefinitionInfo(
      prevModel.type,
    );

    let model = this.getCollection(prevModel).find({
      [primaryField]: prevModel[primaryField],
    });

    for (let allowedField of allowedFields) {
      model.set(allowedField, nextModel[allowedField]);
    }

    model.set('storage', nextModel.storage);

    await model.write();
  }

  private getCollection<TModel extends Model>({
    type,
  }: {
    type: TModel['type'];
  }): CollectionChain<Model> {
    return this.db.get(type) as CollectionChain<Model>;
  }
}
