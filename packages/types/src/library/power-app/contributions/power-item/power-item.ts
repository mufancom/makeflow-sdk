import {Nominal} from 'tslang';

import {
  PowerAppInputDefinition,
  PowerAppInputOptions,
} from '../../power-app-input';

import {PowerItemFieldDefinition} from './power-item-field';

export type PowerItemName = Nominal<string, 'power-item-name'>;

export type PowerItemActionName = Nominal<string, 'power-item-action-name'>;

export interface PowerItemActionDefinition {
  name: PowerItemActionName;
  displayName: string;
  inputs?: PowerAppInputOptions[];
}

export interface PowerItemDefinition {
  name: PowerItemName;
  displayName: string;
  description?: string;
  hookBaseURL?: string;
  inputs?: PowerAppInputDefinition[];
  type?: 'indicator' | 'checkable';
  fields?: PowerItemFieldDefinition[];
  actions?: PowerItemActionDefinition[];
}
