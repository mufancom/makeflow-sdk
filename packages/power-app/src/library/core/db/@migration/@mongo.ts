import {Db} from 'mongodb';

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

export default {
  mongo1,
  mongo2,
} as {
  [key in string]: (db: Db) => Promise<void>;
};

async function mongo1(db: Db): Promise<void> {
  for (let collectionName of COLLECTIONS) {
    let collection = db.collection(collectionName);

    let docs = await collection.find().toArray();

    // 部分 APP 已经手动执行过的，忽略了
    if (typeof docs[0]?.installation !== 'string') {
      return;
    }

    for (let doc of docs) {
      await collection.updateOne(
        {_id: doc._id},
        {
          $set: {
            organization: {id: doc.organization},
            team: {id: doc.team, abstract: false},
            installation: {id: doc.installation},
          },
        },
      );
    }
  }

  let installationCollection = db.collection(INSTALLATION_COLLECTION);

  let installations = await installationCollection.find().toArray();

  for (let installation of installations) {
    let users = installation.users.map((user: any) => {
      return {
        id: user.id,
        team: {
          id: user.team,
          abstract: false,
        },
      };
    });

    await installationCollection.updateOne(
      {_id: installation._id},
      {
        $set: {
          users,
        },
      },
    );
  }
}

async function mongo2(db: Db): Promise<void> {
  for (let collectionName of COLLECTIONS) {
    let collection = db.collection(collectionName);

    let docs = await collection.find().toArray();

    for (let doc of docs) {
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

      await collection.updateOne(
        {_id: doc._id},
        {
          $set: item,
        },
      );
    }
  }
}
