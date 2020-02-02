import {Dict} from 'tslang';

import {accessTokenCreate} from './access-token';
import {accountListUsers} from './account';
import {powerAppPublish, powerAppRefreshToken} from './power-app';
import {powerCheckableCustomItemUpdate} from './power-custom-checkable-item';
import {powerGlanceChange, powerGlanceInitialize} from './power-glance';
import {powerItemUpdate} from './power-item';
import {taskAddOutputs, taskCreate} from './task';
import {userMatch} from './user';

export interface IAPIDeclaration<
  TName extends string,
  TParams extends Dict<any> | void,
  TResult
> {
  name: TName;
  accessToken?: boolean;
  token?: boolean;
  params?: TParams;
  result?: APIResult<TResult>;
}

interface APISuccessResult<TData> {
  data: TData;
}

interface APIErrorResult {
  error: {
    code: string;
    message: string;
  };
}

export type APIResult<TData> = APISuccessResult<TData> | APIErrorResult;

const accessToken = {accessTokenCreate};
const account = {accountListUsers};
const powerApp = {powerAppPublish, powerAppRefreshToken};
const powerCustomCheckableItem = {powerCheckableCustomItemUpdate};
const powerGlance = {powerGlanceChange, powerGlanceInitialize};
const powerItem = {powerItemUpdate};
// types error:
// The inferred type of 'task' cannot be named without a reference to '@makeflow/types-nominal/node_modules/tslang'.
// This is likely not portable. A type annotation is necessary.
// So replace TaskId and UserId to string after remove import @makeflow/types-nominal
const task = {taskAddOutputs, taskCreate};
const user = {userMatch};

type APIDeclaration = typeof accessToken &
  typeof account &
  typeof powerApp &
  typeof powerCustomCheckableItem &
  typeof powerGlance &
  typeof powerItem &
  typeof task &
  typeof user;

export const APIDeclaration: APIDeclaration = {
  ...accessToken,
  ...account,
  ...powerApp,
  ...powerCustomCheckableItem,
  ...powerGlance,
  ...powerItem,
  ...task,
  ...user,
};
