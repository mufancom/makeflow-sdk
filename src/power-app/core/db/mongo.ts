import _ from 'lodash';
import {
  Collection,
  Db,
  MongoClient,
  ObjectId,
  OnlyFieldsOfType,
  UpdateQuery,
} from 'mongodb';

import {Docs, InstallationDoc, PowerGlanceDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

interface IDocument {
  _id: ObjectId;
}

interface NameToDocs {
  installation: InstallationDoc;
  'power-item': PowerItemDoc;
  'power-glance': PowerGlanceDoc;
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
    {storage, version}: PowerItemDoc,
  ): Promise<void> {
    let collection = this.getCollection('power-item');

    await collection.updateOne(
      {
        token,
      },
      {
        $set: {
          version,
          storage,
        },
      },
    );
  }

  protected async getPowerGlanceDoc({
    token,
  }: Partial<PowerGlanceDoc>): Promise<PowerGlanceDoc | undefined> {
    if (!token) {
      return undefined;
    }

    let collection = this.getCollection('power-glance');

    let doc = await collection.findOne({token});

    return doc ? doc : undefined;
  }

  protected async createPowerGlanceDoc(doc: PowerGlanceDoc): Promise<void> {
    let collection = this.getCollection('power-glance');
    await collection.insertOne(doc);
  }

  protected async deletePowerGlanceDoc({
    token,
  }: Partial<PowerGlanceDoc>): Promise<void> {
    let collection = this.getCollection('power-item');

    if (!token) {
      return;
    }

    await collection.deleteOne({token});
  }

  protected async updatePowerGlanceDoc(
    {token}: PowerGlanceDoc,
    {storage, version, clock}: PowerGlanceDoc,
  ): Promise<void> {
    let collection = this.getCollection('power-glance');

    await collection.updateOne(
      {
        token,
      },
      {
        $set: {
          storage,
          version,
          clock,
        },
      },
    );
  }

  private getCollection<TName extends keyof NameToCollectionDocumentSchemaDict>(
    name: TName,
  ): Collection<NameToCollectionDocumentSchemaDict[TName]> {
    return this.db.collection(name);
  }
}

function getUpdateQuery<TDoc extends Docs>(doc: TDoc): UpdateQuery<TDoc> {
  let unset = _.fromPairs(
    _.toPairsIn(_.pickBy(doc, _.isUndefined)).map(([key]) => [key, '']),
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
