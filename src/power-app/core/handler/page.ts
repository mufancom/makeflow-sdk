import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PageModel, UserModel} from '../model';
import {PageEvent, PageEventParams} from '../serve';
import {GeneralDeclare, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function pageHandler(
  app: PowerApp,
  event: PageEvent['eventObject'],
  response: PageEvent['response'],
): Promise<void> {
  let {
    params,
    payload: {
      source: {token, url, installation, organization, team, version},
      token: operationToken,
      user,
    },
  } = event;

  let storage = await app.dbAdapter.getStorage<PageModel>({
    type: 'page',
    operationToken,
  });

  let result = getChangeAndMigrations(
    version,
    storage.version,
    app.definitions,
    getPageChange(params),
    getPageMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  if (storage.created) {
    if (migrations.length) {
      let storageField = storage.getField('storage') ?? {};

      for (let migration of migrations) {
        migration(storageField);
      }

      storage.set(storageField);
    }
  } else {
    storage.create({
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
  }

  let responseData: API.PowerAppPage.HookReturn | void;

  if (change) {
    let userStorage = await app.dbAdapter.getStorage<UserModel>({
      type: 'user',
      id: user,
    });

    if (!storage.created) {
      userStorage.create({
        type: 'user',
        id: user,
        token,
        url,
        organization,
        storage: {},
        // 以下字段不建议使用
        installation,
        team,
        version,
      });
    }

    let userActionStorage = getActionStorage(userStorage, app.dbAdapter);

    let [context] = await app.getStorageObjectContexts('pages', storage, {
      matchedUser: userActionStorage,
    });

    responseData = await change({
      context,
    });

    await app.dbAdapter.setStorage(userStorage);
  }

  storage.upgrade(version);

  await app.dbAdapter.setStorage(storage);

  response(responseData || {});
}

function getPageChange({
  name,
  type,
}: PageEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Page.Change<GeneralDeclare> | undefined {
  return ({contributions: {pages = {}} = {}}) => {
    let page = pages[name];

    if (!page) {
      return undefined;
    }

    return typeof page === 'function' ? page : page[type];
  };
}

function getPageMigrations({
  name,
}: PageEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(definition => {
        let page = definition.contributions?.pages?.[name];

        if (typeof page === 'function') {
          return undefined;
        }

        return page?.migrations?.[type];
      }),
    );
}
