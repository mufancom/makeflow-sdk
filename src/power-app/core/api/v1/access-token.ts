import {API} from '@makeflow/types';

import {IAPIDeclaration} from './v1';

export const accessTokenCreate: IAPIDeclaration<
  '/access-token/create',
  API.AccessToken.CreateParams,
  API.AccessToken.CreateReturn
> = {
  name: '/access-token/create',
  token: true,
} as const;
