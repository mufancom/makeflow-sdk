import {API} from '@makeflow/types';
import _ from 'lodash';

import {Model, ModelIdentity} from '../model';
import {getModelIdentity} from '../utils';

export class StorageObject<TModel extends Model, TStorage> {
  get identity(): ModelIdentity<TModel> {
    return getModelIdentity(this.model);
  }

  get type(): TModel['type'] {
    return this.getField('type')!;
  }

  get version(): TModel['version'] {
    return this.getField('version')!;
  }

  get source(): API.PowerApp.Source {
    let {token, version, organization, team, installation, url} = this.model!;

    return {
      token,
      version,
      organization,
      team,
      installation,
      url,
    };
  }

  get storage(): TStorage | undefined {
    return this.model.storage as TStorage;
  }

  constructor(protected readonly model: TModel) {}

  getField<TKey extends keyof TModel>(key: TKey): TModel[TKey] | undefined {
    let model = this.model;

    return model?.[key];
  }
}
