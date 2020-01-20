import {
  Docs,
  IStorageObject,
  Installation,
  InstallationDoc,
  PowerGlance,
  PowerGlanceDoc,
  PowerItem,
  PowerItemDoc,
} from '../storage';

export interface IDBAdapter extends DBAdapter {}

abstract class DBAdapter {
  private readonly ready = this.initialize();

  constructor(protected options: unknown) {}

  async setStorage(storage: IStorageObject): Promise<void> {
    await this.ready;

    let result = storage.save();

    if (!result) {
      return;
    }

    switch (result.type) {
      case 'create':
        await this.createStorage(result.doc);
        break;
      case 'delete':
        await this.deleteStorage(result.doc);
        break;
      case 'update':
        let {old: oDoc, new: nDoc} = result.docs;
        await this.updateStorage(oDoc, nDoc);
        break;
    }
  }

  async getStorage(
    query: Partial<Docs> & Required<{type: Docs['type']}>,
  ): Promise<IStorageObject> {
    await this.ready;

    switch (query.type) {
      case 'installation':
        return new Installation(await this.getInstallationDoc(query));
      case 'power-item':
        return new PowerItem(await this.getPowerItemDoc(query));
      case 'power-glance':
        return new PowerGlance(await this.getPowerGlanceDoc(query));
    }
  }

  protected abstract initialize(): Promise<void>;

  // Installation

  protected abstract async getInstallationDoc(
    doc: Partial<InstallationDoc>,
  ): Promise<InstallationDoc | undefined>;

  protected abstract async createInstallationDoc(
    doc: InstallationDoc,
  ): Promise<void>;

  protected abstract async deleteInstallationDoc(
    doc: Partial<InstallationDoc>,
  ): Promise<void>;

  protected abstract async updateInstallationDoc(
    oDoc: InstallationDoc,
    nDoc: InstallationDoc,
  ): Promise<void>;

  // PowerItem

  protected abstract async getPowerItemDoc(
    doc: Partial<PowerItemDoc>,
  ): Promise<PowerItemDoc | undefined>;

  protected abstract async createPowerItemDoc(doc: PowerItemDoc): Promise<void>;

  protected abstract async deletePowerItemDoc(
    doc: Partial<PowerItemDoc>,
  ): Promise<void>;

  protected abstract async updatePowerItemDoc(
    oDoc: PowerItemDoc,
    nDoc: PowerItemDoc,
  ): Promise<void>;

  // PowerGlance

  protected abstract async getPowerGlanceDoc(
    doc: Partial<PowerGlanceDoc>,
  ): Promise<PowerGlanceDoc | undefined>;

  protected abstract async createPowerGlanceDoc(
    doc: PowerGlanceDoc,
  ): Promise<void>;

  protected abstract async deletePowerGlanceDoc(
    doc: Partial<PowerGlanceDoc>,
  ): Promise<void>;

  protected abstract async updatePowerGlanceDoc(
    oDoc: PowerGlanceDoc,
    nDoc: PowerGlanceDoc,
  ): Promise<void>;

  private async createStorage(doc: Docs): Promise<void> {
    switch (doc.type) {
      case 'installation':
        await this.createInstallationDoc(doc);
        break;
      case 'power-item':
        await this.createPowerItemDoc(doc);
        break;
      case 'power-glance':
        await this.createPowerGlanceDoc(doc);
        break;
    }
  }

  private async deleteStorage(doc: Docs): Promise<void> {
    switch (doc.type) {
      case 'installation':
        await this.deleteInstallationDoc(doc);
        break;
      case 'power-item':
        await this.deletePowerItemDoc(doc);
        break;
      case 'power-glance':
        await this.deletePowerGlanceDoc(doc);
        break;
    }
  }

  private async updateStorage(oDoc: Docs, nDoc: any): Promise<void> {
    switch (oDoc.type) {
      case 'installation':
        await this.updateInstallationDoc(oDoc, nDoc);
        break;
      case 'power-item':
        await this.updatePowerItemDoc(oDoc, nDoc);
        break;
      case 'power-glance':
        await this.updatePowerGlanceDoc(oDoc, nDoc);
        break;
    }
  }
}

export const AbstractDBAdapter = DBAdapter;
