import {InstallationDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

export class MySQLAdapter extends AbstractDBAdapter {
  ready!: Promise<void>;

  protected getInstallationDoc(
    doc: InstallationDoc,
  ): Promise<InstallationDoc | undefined> {
    throw new Error('Method not implemented.');
  }

  protected createInstallationDoc(doc: InstallationDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected deleteInstallationDoc(doc: InstallationDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected updateInstallationDoc(
    oDoc: InstallationDoc,
    nDoc: InstallationDoc,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected getPowerItemDoc(
    doc: PowerItemDoc,
  ): Promise<PowerItemDoc | undefined> {
    throw new Error('Method not implemented.');
  }

  protected createPowerItemDoc(doc: PowerItemDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected deletePowerItemDoc(doc: PowerItemDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected updatePowerItemDoc(
    oDoc: PowerItemDoc,
    nDoc: PowerItemDoc,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
