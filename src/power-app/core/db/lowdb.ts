import lowdb, {LowdbSync} from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

import {InstallationDoc, PowerGlanceDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

export interface LowdbOptions {
  file?: string;
}

interface Schema {
  installation: InstallationDoc[];
  'power-item': PowerItemDoc[];
  'power-glance': PowerGlanceDoc[];
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
        'power-glance': [],
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
    {storage, version}: PowerItemDoc,
  ): Promise<void> {
    await this.db
      .get('power-item')
      .find({token})
      .set('storage', storage)
      .set('version', version)
      .write();
  }

  protected async getPowerGlanceDoc({
    token,
  }: Partial<PowerGlanceDoc>): Promise<PowerGlanceDoc | undefined> {
    return this.db
      .get('power-glance')
      .find({token})
      .value();
  }

  protected async createPowerGlanceDoc(doc: PowerGlanceDoc): Promise<void> {
    await this.db
      .get('power-glance')
      .push(doc)
      .write();
  }

  protected async deletePowerGlanceDoc({
    token,
  }: Partial<PowerGlanceDoc>): Promise<void> {
    await this.db
      .get('power-glance')
      .remove({
        token,
      })
      .write();
  }

  protected async updatePowerGlanceDoc(
    {token}: PowerGlanceDoc,
    {storage, clock, version}: PowerGlanceDoc,
  ): Promise<void> {
    await this.db
      .get('power-glance')
      .find({token})
      .set('clock', clock)
      .set('version', version)
      .set('storage', storage)
      .write();
  }
}
