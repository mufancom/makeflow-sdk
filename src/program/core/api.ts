import axios from 'axios';
import {Dict} from 'tslang';

import {ExpectedError, ExpectedErrorCode} from './error';

interface APIPostGenericParams<TData = object, TResult = unknown> {
  data: TData;
  result: TResult;
}

interface APISuccessResult {
  data: any;
}

interface APIErrorResult {
  error: {
    code: string;
    message: string;
  };
}

type APIResult = APISuccessResult | APIErrorResult;

export interface APICallOptions {
  type?: string;
  headers?: Dict<string>;
}

export class API {
  constructor(private apiBaseURL: string) {}

  post<TGenericParams extends APIPostGenericParams<any, any>>(
    url: string,
    data: TGenericParams['data'],
    options?: APICallOptions,
  ): Promise<TGenericParams['result']>;
  post<T>(url: string, data?: Dict<any>, options?: APICallOptions): Promise<T>;
  post(
    url: string,
    data?: Dict<any>,
    options?: APICallOptions,
  ): Promise<unknown> {
    return this.call('POST', url, data, options);
  }

  getURL(path: string): string {
    return this.apiBaseURL + path;
  }

  private async call<T>(
    method: string,
    path: string,
    body?: unknown,
    {type = 'application/json;charset=UTF-8', headers}: APICallOptions = {},
  ): Promise<T> {
    let url = this.getURL(path);

    let response = await axios({
      method,
      url,
      withCredentials: true,
      data: body,
      headers: {
        'Content-Type': type,
        ...headers,
      },
    });

    let result = response.data as APIResult;

    if ('error' in result) {
      let error = result.error;

      throw new ExpectedError(error.code as ExpectedErrorCode, error.message);
    } else {
      return result.data;
    }
  }
}
