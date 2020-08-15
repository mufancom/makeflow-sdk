import _ from 'lodash';

import {PowerApp} from '../../app';
import {DataSourceModel} from '../model';
import {DataSourceEvent, DataSourceEventParams} from '../serve';
import {getChangeAndMigrations, runMigrations} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export async function dataSourceHandler(
  app: PowerApp,
  {
    params,
    payload: {
      source: {token, url, installation, organization, team, version},
      inputs,
      search,
    },
  }: DataSourceEvent['eventObject'],
  response: DataSourceEvent['response'],
): Promise<void> {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    DataSourceModel
  >({
    type: 'data-source',
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
    getDataSourceChange(params),
    getDataSourceMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseData: Parameters<DataSourceEvent['response']>[0];

  if (change) {
    let [context] = await app.getStorageObjectContexts('data-source', storage, {
      'data-source': {
        search,
      },
    });

    responseData = await change({
      context,
      inputs,
    });
  }

  response(responseData || {});
}

function getDataSourceChange({
  name,
  type,
}: DataSourceEventParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.DataSource.Change<GeneralDeclareWithInputs> | undefined {
  return ({contributions: {dataSources = {}} = {}}) =>
    dataSources[name]?.[type];
}

function getDataSourceMigrations({
  name,
}: DataSourceEventParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.dataSources?.[name]?.migrations?.[type],
      ),
    );
}
