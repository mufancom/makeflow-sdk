import _ from 'lodash';
import {
  Collection,
  Db,
  MongoClient,
  ObjectId,
  OnlyFieldsOfType,
  UpdateQuery,
} from 'mongodb';

import {Docs, InstallationDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

interface IDocument {
  _id: ObjectId;
}

interface NameToDocs {
  installation: InstallationDoc;
  'power-item': PowerItemDoc;
}

type NameToCollectionDocumentSchemaDict = {
  [TKey in keyof NameToDocs]: NameToDocs[TKey] & IDocument;
};

export interface MongoOptions {
  uri: string;
  name: string;
}

export class MongoAdapter extends AbstractDBAdapter {
  protected db!: Db;

  readonly ready: Promise<void>;

  constructor(options: MongoOptions) {
    super(options);

    this.ready = this.initialize(options);
  }

  protected async getInstallationDoc({
    installation,
    organization,
    team,
  }: Partial<InstallationDoc>): Promise<InstallationDoc | undefined> {
    let collection = this.getCollection('installation');

    if (!installation || !organization || !team) {
      return undefined;
    }

    let doc = await collection.findOne({
      installation,
      organization,
      team,
    });

    return doc ? doc : undefined;
  }

  protected async createInstallationDoc(doc: InstallationDoc): Promise<void> {
    let collection = this.getCollection('installation');
    await collection.insertOne(doc);
  }

  protected async deleteInstallationDoc({
    installation,
    organization,
    team,
  }: Partial<InstallationDoc>): Promise<void> {
    let collection = this.getCollection('installation');

    if (!installation || !organization || !team) {
      return;
    }

    await collection.deleteOne({
      installation,
      organization,
      team,
    });
  }

  protected async updateInstallationDoc(
    {installation, organization, team}: InstallationDoc,
    nDoc: InstallationDoc,
  ): Promise<void> {
    let collection = this.getCollection('installation');

    await collection.updateOne(
      {
        installation,
        organization,
        team,
      },
      getUpdateQuery(nDoc),
    );
  }

  protected async getPowerItemDoc({
    token,
  }: Partial<PowerItemDoc>): Promise<PowerItemDoc | undefined> {
    if (!token) {
      return undefined;
    }

    let collection = this.getCollection('power-item');

    let doc = await collection.findOne({token});

    return doc ? doc : undefined;
  }

  protected async createPowerItemDoc(doc: PowerItemDoc): Promise<void> {
    let collection = this.getCollection('power-item');
    await collection.insertOne(doc);
  }

  protected async deletePowerItemDoc({
    token,
  }: Partial<PowerItemDoc>): Promise<void> {
    let collection = this.getCollection('power-item');

    if (!token) {
      return;
    }

    await collection.deleteOne({token});
  }

  protected async updatePowerItemDoc(
    {token}: PowerItemDoc,
    {storage}: PowerItemDoc,
  ): Promise<void> {
    let collection = this.getCollection('power-item');

    await collection.updateOne(
      {
        token,
      },
      {
        $set: {
          storage,
        },
      },
    );
  }

  private async initialize({uri, name}: MongoOptions): Promise<void> {
    let client = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      ignoreUndefined: true,
      useUnifiedTopology: true,
    });

    this.db = client.db(name);

    console.info(`Connected to MongoDB ${uri}`);
  }

  private getCollection<TName extends keyof NameToCollectionDocumentSchemaDict>(
    name: TName,
  ): Collection<NameToCollectionDocumentSchemaDict[TName]> {
    return this.db.collection(name);
  }
}

function getUpdateQuery<TDoc extends Docs>(doc: TDoc): UpdateQuery<TDoc> {
  let unset = _.fromPairs(
    _.toPairsIn(_.pickBy(doc, _.isUndefined)).map(key => [key, '']),
  );

  return {
    $set: doc,
    ...((!_.isEmpty(unset)
      ? {
          $unset: unset,
        }
      : {}) as OnlyFieldsOfType<TDoc, any, ''>),
  };
}
