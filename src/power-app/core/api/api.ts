import {API} from '@makeflow/types';
// import fetch, {BodyInit, Response} from 'node-fetch';
import {Dict} from 'tslang';

import {APIDeclaration} from './v1';

export interface APIServiceCallOptions {
  type?: string;
  headers?: Dict<string>;
}

type APIFunction<TDeclarationName extends keyof typeof APIDeclaration> = (
  params: Exclude<typeof APIDeclaration[TDeclarationName]['params'], undefined>,
) => typeof APIDeclaration[TDeclarationName]['result'];

interface APIContext {
  accessToken: string | undefined;
  token: string | undefined;
  url: string | undefined;
}

export type API = {
  [T in keyof typeof APIDeclaration]: APIFunction<T>;
} & {
  setContext(context: Partial<APIContext>): void;
};

// export class APIService {
//   // let makeflowAddressURL = new URL('baseURL');

//   // `${makeflowAddressURL.origin}/api/v1${path}`

//   async call(url: string, body?: BodyInit, token?: string): Promise<Response> {
//     let response = await fetch(url, {
//       method: 'POST',
//       body,
//       headers: {
//         'Content-Type': 'application/json;charset=UTF-8',
//         'x-access-token': token || '',
//       },
//     });

//     return response;
//   }
// }

export default new Proxy(APIDeclaration, {
  context: {
    accessToken: undefined,
    token: undefined,
    url: undefined,
  },
  get<T extends keyof typeof APIDeclaration>(
    target: typeof APIDeclaration,
    propKey: T,
    receiver: any,
  ): any {
    return Reflect.get(target, propKey, receiver);
  },
  set(target, propKey, value, receiver) {
    return Reflect.set(target, propKey, value, receiver);
  },
} as ProxyHandler<typeof APIDeclaration & {context: APIContext}>) as API;
