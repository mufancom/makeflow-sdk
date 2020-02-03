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

  private readonly 'installation' = {
    create: this.createInstallationDoc,
    delete: this.deleteInstallationDoc,
    update: this.updateInstallationDoc,
    query: this.getInstallationDoc,
    class: Installation,
  };

  private readonly 'power-item' = {
    create: this.createPowerItemDoc,
    delete: this.deletePowerItemDoc,
    update: this.updatePowerItemDoc,
    query: this.getPowerItemDoc,
    class: PowerItem,
  };

  private readonly 'power-glance' = {
    create: this.createPowerGlanceDoc,
    delete: this.deletePowerGlanceDoc,
    update: this.updatePowerGlanceDoc,
    query: this.getPowerGlanceDoc,
    class: PowerGlance,
  };

  constructor(protected options: unknown) {}

  async setStorage(storage: IStorageObject): Promise<void> {
    await this.ready;

    let result = storage.save();

    if (!result) {
      return;
    }

    let type = 'docs' in result ? result.docs.old.type : result.doc.type;

    let params = ('docs' in result
      ? [result.docs.old, result.docs.new]
      : [result.doc]) as any;

    await this[type][result.type].apply(this, params);

    storage.rebuild();
  }

  async getStorage(
    query: Partial<Docs> & Required<{type: Docs['type']}>,
  ): Promise<IStorageObject> {
    await this.ready;

    let type = query.type;

    return new this[type].class(
      await (this[type].query as any).call(this, query),
    );
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
}

export const AbstractDBAdapter = DBAdapter;
