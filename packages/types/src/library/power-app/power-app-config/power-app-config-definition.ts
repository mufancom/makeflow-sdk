import {Nominal} from 'tslang';

import {PowerAppConfigFieldType} from './power-app-config-field';
import {PowerAppConfigDefinitionFieldOptions} from './power-app-config-fields';

export type PowerAppConfigName = Nominal<string, 'power-app-config-name'>;

export interface PowerAppConfigDefinition {
  name: PowerAppConfigName;
  displayName: string;
  description?: string;
  required?: boolean;
  field?: PowerAppConfigFieldType | PowerAppConfigDefinitionFieldOptions;
}
