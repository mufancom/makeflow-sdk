import {Plugin} from '@hapi/hapi';
import {API as APITypes} from '@makeflow/types';
import {Express} from 'express';
import Koa from 'koa';
import {Dict} from 'tslang';

import {IDBAdapter, LowdbOptions, MongoOptions} from '../db';
import {Model, UserModel} from '../model';
import {ServeOptions} from '../serve';
import {ActionStorage} from '../storage';

import {Context, ContextType, ContextTypeToBasicMapping} from './context';
import {PowerAppVersion} from './version';

export type MatchContextsFilter<
  TType extends ContextType
> = ContextTypeToBasicMapping[TType] extends [infer TModel, any]
  ? TModel extends Model
    ? Partial<TModel>
    : never
  : never;

export type PowerAppSource = Partial<
  Pick<APITypes.PowerApp.Source, 'url' | 'token'>
>;

export interface PowerAppOptions {
  source?: PowerAppSource;
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

  version(range: string, definition: PowerAppVersion.Definition<any>): void;

  getContextIterable<
    TContextType extends ContextType,
    TStorage = Dict<any>,
    TConfigs = Dict<any>
  >(
    type: TContextType,
    filter: MatchContextsFilter<TContextType>,
  ): AsyncGenerator<Context<TContextType, TStorage, TConfigs>>;
  getContexts<
    TContextType extends ContextType,
    TStorage = Dict<any>,
    TConfigs = Dict<any>
  >(
    type: TContextType,
    filter: MatchContextsFilter<TContextType>,
  ): Promise<Context<TContextType, TStorage, TConfigs>[]>;

  getUserStorages<TStorage>(
    filter: Partial<UserModel> & {storage?: Partial<TStorage>},
  ): Promise<ActionStorage<UserModel, TStorage>[]>;

  getOrCreateUserStorage<TStorage>(
    source: APITypes.PowerApp.Source,
    id: string,
  ): Promise<ActionStorage<UserModel, TStorage>>;

  serve(options?: ServeOptions): void;
  koa(path: ServeOptions['path']): Koa.Middleware;
  express(path: ServeOptions['path']): Express;
  hapi<T>(): Plugin<T>;
}
