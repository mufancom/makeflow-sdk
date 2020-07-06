import _ from 'lodash';
import {Dict} from 'tslang';

import {
  Model,
  ModelIdentity,
  ModelPrimaryFieldKey,
  typeToModelDefinitionDict,
} from '../model';

export function getModelIdentity<TModel extends Model>(
  model: TModel,
): ModelIdentity<TModel> {
  let {type} = model;

  let primaryField = typeToModelDefinitionDict[type]
    .primaryField as ModelPrimaryFieldKey<TModel>;

  let identity: ModelIdentity<Model> = {
    type,
    installation: model.installation,
    [primaryField]: model[primaryField],
  };

  return identity as ModelIdentity<TModel>;
}

export function buildSecureUpdateData(
  version: string,
  identity: ModelIdentity<Model>,
  model: Dict<any>,
): Dict<any> {
  let {allowedFields} = typeToModelDefinitionDict[identity.type];
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

export function getStorageLockKey<TModel extends Model>(
  identity: ModelIdentity<TModel>,
): string {
  let {type, ...primaryField} = identity;

  return `${type}:${Object.values(primaryField)[0]}`;
}
