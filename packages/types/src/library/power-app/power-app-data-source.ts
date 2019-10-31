import {PowerAppInputDefinition} from './power-app-input';

export interface PowerAppDataSourceOptions {
  url: string;
  inputs?: PowerAppInputDefinition[];
}
