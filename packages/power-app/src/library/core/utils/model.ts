import {AppInstallationId} from '@makeflow/types-nominal';
import _ from 'lodash';
import {Dict} from 'tslang';

import {Model, ModelIdentity, typeToModelDefinitionDict} from '../model';

export function getModelIdentity<TModel extends Model>(
  model: TModel,
): ModelIdentity<TModel> {
  let {type, id} = model;

  let identity: ModelIdentity<Model> = {
    type,
    id,
  };

  return identity;
}

export function buildSecureUpdateData(
  version: string,
  identity: ModelIdentity<Model>,
  model: Dict<any>,
): Dict<any> {
  let {allowedFields = []} = typeToModelDefinitionDict[identity.type];
  let allowedFieldSet = new Set<string>(allowedFields);

  let data = _.clone(model);

  for (let key in data) {
    if (!allowedFieldSet.has(key)) {
      delete data[key];
    }
  }

  data.version = version;

  return data;
}

export function getInstallationResourceId(
  installation: AppInstallationId,
  id: string,
): string {
  return `${installation}:${id}`;
}

export function getStorageLockKey<TModel extends Model>(
  identity: ModelIdentity<TModel>,
): string {
  let {type, id} = identity;

  return `${type}:${id}`;
}
