import type {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {UserModel} from '../model';
import {PageEvent, PageEventParams} from '../serve';
import {getActionStorage} from '../storage';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export async function pageHandler(
  app: PowerApp,
  {
    params,
    payload: {
      source: {token, url, installation, organization, team, version},
      token: operationToken,
      user,
    },
  }: PageEvent['eventObject'],
  response: PageEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject({
    type: 'page',
    token,
    url,
    installation,
    organization,
    team,
    version,
    operationToken,
    storage: {},
  });

  let result = getChangeAndMigrations(
    version,
    savedVersion,
    app.definitions,
    getPageChange(params),
    getPageMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: API.PowerAppPage.HookReturn | void;

  if (change) {
    let userStorage = await db.getStorageObject<UserModel>({
      type: 'user',
      id: user,
    });

    if (!userStorage) {
      userStorage = await db.createStorageObject({
        type: 'user',
        id: user,
        token,
        url,
        organization,
        storage: {},
        installation,
        team,
        version,
      });
    }

    let userActionStorage = getActionStorage(db, userStorage);

    let [context] = await app.getStorageObjectContexts('pages', storage, {
      matchedUser: userActionStorage,
    });

    responseData = await change({
      context,
    });
  }

  response(responseData || {});
}

function getPageChange({
  name,
  type,
}: PageEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Page.Change<GeneralDeclare> | undefined {
  return ({contributions: {pages = {}} = {}}) => pages[name]?.[type];
}

function getPageMigrations({
  name,
}: PageEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.pages?.[name]?.migrations?.[type],
      ),
    );
}
