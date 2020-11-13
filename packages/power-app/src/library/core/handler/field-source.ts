import {PowerAppProcedureField} from '@makeflow/types';
import _ from 'lodash';

import {PowerApp} from '../../app';
import {FieldSourceModel} from '../model';
import {
  getChangeAndMigrations,
  getInstallationResourceId,
  runMigrations,
} from '../utils';
import {GeneralDeclare, PowerAppVersion} from '../version';

export type FieldSourceHandler = (
  app: PowerApp,
  params: FieldSourceHandlerParams,
) => Promise<PowerAppProcedureField.FieldBaseDefinition[] | void>;

export interface FieldSourceParams {
  name: string;
  type: 'request';
}

interface FieldSourceHandlerParams {
  params: FieldSourceParams;
  // body: API.ProcedureField.FieldSourceParams;
  // 等待 动态字段
  body: any;
}

export const fieldSourceHandler: FieldSourceHandler = async (
  app: PowerApp,
  {
    params,
    body: {
      source: {token, url, installation, organization, team, version},
    },
  },
) => {
  let db = app.dbAdapter;

  let {value: storage, savedVersion} = await db.createOrUpgradeStorageObject<
    FieldSourceModel
  >({
    type: 'field-source',
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
    getFieldSourceChange(params),
    getFieldSourceMigrations(params),
  );

  if (!result) {
    return;
  }

  let {change, migrations} = result;

  await runMigrations(db, storage, migrations);

  let responseField: PowerAppProcedureField.FieldBaseDefinition[] | void;

  if (change) {
    let [context] = await app.getStorageObjectContexts('field-source', storage);

    responseField = await change({
      context,
    });
  }

  return responseField ?? [];
};

function getFieldSourceChange({
  name,
  type,
}: FieldSourceParams): (
  definition: PowerAppVersion.Definition,
) => PowerAppVersion.FieldSource.Change<GeneralDeclare> | undefined {
  return ({contributions: {fieldSources = {}} = {}}) =>
    fieldSources[name]?.[type];
}

function getFieldSourceMigrations({
  name,
}: FieldSourceParams): (
  type: keyof PowerAppVersion.Migrations,
  definitions: PowerAppVersion.Definition[],
) => PowerAppVersion.MigrationFunction[] {
  return (type, definitions) =>
    _.compact(
      definitions.map(
        definition =>
          definition.contributions?.fieldSources?.[name]?.migrations?.[type],
      ),
    );
}
