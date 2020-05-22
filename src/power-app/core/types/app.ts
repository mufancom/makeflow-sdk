import {API as APITypes} from '@makeflow/types';
import Koa from 'koa';

import {API} from '../../api';
import {IDBAdapter, LowdbOptions, MongoOptions} from '../db';
import {ServeOptions} from '../serve';
import {StorageObject} from '../storage';

import {PowerAppVersion} from './version';

export interface PowerAppOptions {
  source?: APITypes.PowerApp.Source;
  db?:
    | {type: 'mongo'; options: MongoOptions}
    | {type: 'lowdb'; options: LowdbOptions};
}

export interface PowerAppVersionInfo {
  range: string;
  definition: PowerAppVersion.Definition;
}

export interface IPowerApp {
  definitions: PowerAppVersionInfo[];
  dbAdapter: IDBAdapter;

  version(range: string, definition: PowerAppVersion.Definition): void;

  getAPI(): API;
  generateAPI(storage: StorageObject<any>): Promise<API>;

  serve(options?: ServeOptions): void;
  koa(path: ServeOptions['path']): Koa.Middleware;
  /**
   * waiting implement
   */
  express(): void;
  hapi(): void;
}
