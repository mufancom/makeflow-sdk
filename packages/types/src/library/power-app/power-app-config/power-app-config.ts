import {CompositeValueDescriptor} from '../../value';

import {PowerAppConfigName} from './power-app-config-definition';

export interface PowerAppConfigOptions {
  name: PowerAppConfigName;
  value: CompositeValueDescriptor;
}
