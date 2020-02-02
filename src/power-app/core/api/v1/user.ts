import {IAPIDeclaration} from './v1';

export const userMatch: IAPIDeclaration<
  '/user/match',
  {
    email: string;
  },
  string | undefined
> = {
  name: '/user/match',
  accessToken: true,
} as const;
