import lowdb, {LowdbSync} from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

import {InstallationDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

export interface LowdbOptions {
  file?: string;
}

interface Schema {
  installation: InstallationDoc[];
  'power-item': PowerItemDoc[];
}

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
      })
      .write();
  }

  protected async getInstallationDoc({
    installation,
  }: Partial<InstallationDoc>): Promise<InstallationDoc | undefined> {
    return this.db
      .get('installation')
      .find({installation})
      .value();
  }

  protected async createInstallationDoc(doc: InstallationDoc): Promise<void> {
    await this.db
      .get('installation')
      .push(doc)
      .write();
  }

  protected async deleteInstallationDoc({
    installation,
  }: Partial<InstallationDoc>): Promise<void> {
    await this.db
      .get('installation')
      .remove({
        installation,
      })
      .write();
  }

  protected async updateInstallationDoc(
    {installation}: InstallationDoc,
    nDoc: InstallationDoc,
  ): Promise<void> {
    await this.db
      .get('installation')
      .find({installation})
      .assign(nDoc)
      .write();
  }

  protected async getPowerItemDoc({
    token,
  }: Partial<PowerItemDoc>): Promise<PowerItemDoc | undefined> {
    return this.db
      .get('power-item')
      .find({token})
      .value();
  }

  protected async createPowerItemDoc(doc: PowerItemDoc): Promise<void> {
    await this.db
      .get('power-item')
      .push(doc)
      .write();
  }

  protected async deletePowerItemDoc({
    token,
  }: Partial<PowerItemDoc>): Promise<void> {
    await this.db
      .get('power-item')
      .remove({
        token,
      })
      .write();
  }

  protected async updatePowerItemDoc(
    {token}: PowerItemDoc,
    {storage}: PowerItemDoc,
  ): Promise<void> {
    await this.db
      .get('power-item')
      .find({token})
      .set('storage', storage)
      .write();
  }
}
