import type {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {PageModel} from '../model';
import {PageEvent, PageEventParams} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export async function pageHandler(
  app: PowerApp,
  {
    params,
    payload: {
      source: {
        token,
        url,
        installation: originalInstallation,
        organization: originalOrganization,
        team: originalTeam,
        version,
      },
      inputs,
      user,
      path,
    },
  }: PageEvent['eventObject'],
  response: PageEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  // To fit the old version of Makeflow
  let organization =
    typeof originalOrganization === 'string'
      ? {id: originalOrganization}
      : originalOrganization;
  let team =
    typeof originalTeam === 'string'
      ? {id: originalTeam, abstract: false}
      : originalTeam;
  let installation =
    typeof originalInstallation === 'string'
      ? {id: originalInstallation}
      : originalInstallation;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    PageModel
  >({
    type: 'page',
    id: `${installation}:${params.name}`,
    token,
    url,
    installation,
    organization,
    team,
    version,
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
    let [context] = await app.getStorageObjectContexts('page', storage, {
      page: {
        user,
        path,
      },
    });

    responseData = await change({
      context,
      inputs,
    });
  }

  response(responseData || {});
}

function getPageChange({
  name,
  type,
}: PageEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.Page.Change<GeneralDeclareWithInputs> | undefined {
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
