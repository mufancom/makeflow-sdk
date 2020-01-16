import {InstallationDoc, PowerItemDoc} from '../storage';

import {AbstractDBAdapter} from './db';

export class MySQLAdapter extends AbstractDBAdapter {
  protected initialize(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected getInstallationDoc(
    _doc: InstallationDoc,
  ): Promise<InstallationDoc | undefined> {
    throw new Error('Method not implemented.');
  }

  protected createInstallationDoc(_doc: InstallationDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected deleteInstallationDoc(_doc: InstallationDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected updateInstallationDoc(
    _oDoc: InstallationDoc,
    _nDoc: InstallationDoc,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected getPowerItemDoc(
    _doc: PowerItemDoc,
  ): Promise<PowerItemDoc | undefined> {
    throw new Error('Method not implemented.');
  }

  protected createPowerItemDoc(_doc: PowerItemDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected deletePowerItemDoc(_doc: PowerItemDoc): Promise<void> {
    throw new Error('Method not implemented.');
  }

  protected updatePowerItemDoc(
    _oDoc: PowerItemDoc,
    _nDoc: PowerItemDoc,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
