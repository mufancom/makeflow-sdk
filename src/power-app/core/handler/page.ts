import _ from 'lodash';

import {PageModel, UserModel} from '../model';
import {PageEvent, PageEventParams} from '../serve';
import {IPowerApp, PowerAppVersion} from '../types';
import {getActionStorage, getChangeAndMigrations} from '../utils';

export async function pageHandler(
  app: IPowerApp,
  event: PageEvent['eventObject'],
  response: PageEvent['response'],
): Promise<void> {
  let {params, payload} = event;

  let {
    token: resourceToken,
    source: {token, url, installation, organization, team, version},
    configs = {},
    user,
  } = payload;

  let storage = await app.dbAdapter.getStorage<PageModel>({
    type: 'page',
    resourceToken,
  });

  let result = getChangeAndMigrations<PowerAppVersion.Page.Change>(
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

  let actionStorage = getActionStorage(storage, app.dbAdapter);

  if (storage.created) {
    for (let migration of migrations) {
      await migration(actionStorage);
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
      resourceToken,
      storage: {},
    });
  }

  let responseData: PowerAppVersion.Page.ChangeResponseData | void;

  if (change) {
    let api = await app.generateAPI(storage);

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

    responseData = await change({
      storage: actionStorage,
      userStorage: userActionStorage,
      api,
      configs,
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
) => PowerAppVersion.Page.Change | undefined {
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
