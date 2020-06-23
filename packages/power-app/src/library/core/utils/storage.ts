import * as v from 'villa';

import {IDBAdapter} from '../db';
import {Model} from '../model';
import {StorageObject} from '../storage';
import {PowerAppVersion} from '../types';

import {getStorageLockKey} from './model';

export async function runMigrations(
  db: IDBAdapter,
  storageObject: StorageObject<Model>,
  migrations: PowerAppVersion.MigrationFunction[],
): Promise<void> {
  await v.lock(getStorageLockKey(storageObject.identity), async () => {
    if (migrations.length) {
      let storage = storageObject.getField('storage') ?? {};

      for (let migration of migrations) {
        storage = migration(storage);
      }

      await db.setStorage(storageObject.identity, storage);
    }
  });
}
