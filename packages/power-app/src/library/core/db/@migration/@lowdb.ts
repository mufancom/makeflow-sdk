import {LowdbSync} from 'lowdb';

import {Model} from '../../model';

const INSTALLATION_COLLECTION = 'installation';

const COLLECTIONS = [
  'installation',
  'power-item',
  'power-node',
  'power-glance',
  'power-custom-checkable-item',
  'page',
  'user',
];

type Schema<TModel extends Model = Model> = {
  [key in TModel['type']]: TModel[];
};

export default {
  lowdb1,
  lowdb2,
} as {
  [key in string]: (db: LowdbSync<Schema>) => Promise<void>;
};

async function lowdb1(db: LowdbSync<Schema>): Promise<void> {
  for (let collection of COLLECTIONS) {
    let docs = db.get(collection).value();

    // 部分 APP 已经手动执行过的，忽略了
    if (typeof docs[0]?.installation !== 'string') {
      return;
    }

    await db
      .set(
        collection,
        docs.map(
          ({
            organization: organizationId,
            team: teamId,
            installation: installationId,
            ...rest
          }: any) => {
            return {
              organization: {
                id: organizationId,
              },
              team: {
                id: teamId,
                abstract: false,
              },
              installation: {
                id: installationId,
              },
              ...rest,
            };
          },
        ),
      )
      .write();
  }

  let installations = db.get(INSTALLATION_COLLECTION).value();
  await db
    .set(
      INSTALLATION_COLLECTION,
      installations.map(({users, ...rest}: any) => {
        return {
          ...rest,
          users: users.map((user: any) => {
            return {
              id: user.id,
              team: {
                id: user.team,
              },
            };
          }),
        };
      }),
    )
    .write();
}

async function lowdb2(db: LowdbSync<Schema>): Promise<void> {
  for (let collection of COLLECTIONS) {
    let docs = db.get(collection).value();

    await db
      .set(
        collection,
        docs.map((doc: any) => {
          let item = {...doc};

          if ('operationToken' in item) {
            if (item.id) {
              return;
            }

            item.id = item.operationToken;
          } else if (item.type === 'user') {
            let userId = item.id;

            if (userId.includes(':')) {
              return;
            }

            item.id = `${item.installation.id}:${userId}`;
            item.userId = userId;
          } else if (item.type === 'installation') {
            if (item.id) {
              return;
            }

            item.id = item.installation.id;
          }

          return item;
        }),
      )
      .write();
  }
}
