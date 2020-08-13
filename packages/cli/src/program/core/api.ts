import {ExpectedError} from 'clime';
import fetch, {BodyInit} from 'node-fetch';

const JSONContentType = 'application/json';

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

export class API {
  constructor(
    private apiBaseURL: string,
    private _accessToken: string | undefined,
  ) {
    console.info('API', apiBaseURL);
  }

  get accessToken(): string {
    let accessToken = this._accessToken;

    if (!accessToken) {
      throw new ExpectedError('Please login with `mf login` first');
    }

    return accessToken;
  }

  getURL(path: string): string {
    return this.apiBaseURL + path;
  }

  async post<T>(
    path: string,
    data: unknown,
    ignoreAccessToken = false,
  ): Promise<T> {
    return this.call('POST', path, JSON.stringify(data), ignoreAccessToken);
  }

  async upload<T>(path: string, data: Buffer, type: string): Promise<T> {
    return this.call('POST', path, data, false, type);
  }

  async call<T>(
    method: string,
    path: string,
    body: BodyInit,
    ignoreAccessToken = false,
    type = JSONContentType,
  ): Promise<T> {
    let url = this.getURL(path);

    let response = await fetch(url, {
      method,
      body,
      headers: {
        'Content-Type': type,
        ...(ignoreAccessToken
          ? undefined
          : {
              'X-Access-Token': this.accessToken,
            }),
      },
    });

    let result = (await response.json()) as APIResult;

    if ('error' in result) {
      let error = result.error;

      throw new ExpectedError(error.message || error.code);
    } else {
      return result.data;
    }
  }
}
