import {ExpectedError} from 'clime';
import fetch from 'node-fetch';

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

  async call<T>(
    path: string,
    data: unknown,
    ignoreAccessToken = false,
  ): Promise<T> {
    let url = this.getURL(path);

    let response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
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
