import _ from 'lodash';
import {Dict} from 'tslang';

import {Model, ModelIdentity, typeToModelDefinitionDict} from '../model';

export function getModelIdentity<TModel extends Model>(
  model: TModel,
): ModelIdentity<TModel> {
  let {type} = model;

  let {primaryField} = typeToModelDefinitionDict[type];

  return {
    type,
    [primaryField]: (model as any)[primaryField],
  } as ModelIdentity<TModel>;
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

export function getStorageLockKey(identity: ModelIdentity<Model>): string {
  let {type, ...primaryField} = identity;

  return `${type}:${Object.values(primaryField)[0]}`;
}
