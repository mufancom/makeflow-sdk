import {Nominal} from 'tslang';

import {ResolvableValue, Value} from '../value';

export type PowerAppInputName = Nominal<string, 'power-app-input-name'>;

export interface PowerAppInputDefinition {
  name: PowerAppInputName;
  displayName: string;
  bind?: ResolvableValue;
  default?: ResolvableValue;
}

export type PowerAppInputOptions = ResolvableValue & {
  name: PowerAppInputName;
};

export type PowerAppValueInputOptions = Value & {
  name: PowerAppInputName;
};
