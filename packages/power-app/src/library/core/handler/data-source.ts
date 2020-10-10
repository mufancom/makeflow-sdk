import {API} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {DataSourceModel} from '../model';
import {
  getChangeAndMigrations,
  getInstallationResourceId,
  runMigrations,
} from '../utils';
import {GeneralDeclareWithInputs, PowerAppVersion} from '../version';

export type DataSourceHandler = (
  app: PowerApp,
  params: DataSourceHandlerParams,
  // TODO(boen): data-source 返回值校验
) => Promise<any>;

export interface DataSourceParams {
  name: string;
  type: 'request';
}

interface DataSourceHandlerParams {
  params: DataSourceParams;
  body: API.ProcedureField.DataSourceParams;
}

export const dataSourceHandler: DataSourceHandler = async (
  app: PowerApp,
  {
    params,
    body: {
      source: {token, url, installation, organization, team, version},
      inputs,
      search,
    },
  },
) => {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    DataSourceModel
  >({
    type: 'data-source',
    id: getInstallationResourceId(installation.id, params.name),
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

  let responseData: any;

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

  return responseData || {};
};

function getDataSourceChange({
  name,
  type,
}: DataSourceParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.DataSource.Change<GeneralDeclareWithInputs> | undefined {
  return ({contributions: {dataSources = {}} = {}}) =>
    dataSources[name]?.[type];
}

function getDataSourceMigrations({
  name,
}: DataSourceParams): (
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
