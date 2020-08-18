import {LowdbSync} from 'lowdb';
import {Db} from 'mongodb';

import LowDB from './@lowdb';
import Mongo from './@mongo';

export async function migrationRunner(db: LowdbSync<any> | Db): Promise<void> {
  let latestCount = 0;

  // because class Db extends EventEmitter
  if ('on' in db) {
    for (let [name, fn] of Object.entries(Mongo)) {
      let count = await getMongoMigrationNumber(db);
      latestCount = +name.slice(-1);

      if (count >= latestCount) {
        continue;
      }

      await fn(db);
    }

    await setMongoMigrationNumber(db, latestCount);
  } else {
    for (let [name, fn] of Object.entries(LowDB)) {
      let count = await getLowDBMigrationNumber(db);
      latestCount = +name.slice(-1);

      if (count >= latestCount) {
        continue;
      }

      await fn(db);
    }

    await setLowDBMigrationNumber(db, latestCount);
  }
}

async function getMongoMigrationNumber(db: Db): Promise<number> {
  let res = await db.collection<{count: number}>('migration').findOne({});

  return res?.count || 0;
}

async function setMongoMigrationNumber(db: Db, count: number): Promise<void> {
  await db.collection<{count: number}>('migration').updateOne(
    {},
    {
      count,
    },
    {upsert: true},
  );
}

async function getLowDBMigrationNumber(db: LowdbSync<any>): Promise<number> {
  let res = await db.get('count');

  return Number(res) || 0;
}

async function setLowDBMigrationNumber(
  db: LowdbSync<any>,
  count: number,
): Promise<void> {
  await db.set('count', count);
}
