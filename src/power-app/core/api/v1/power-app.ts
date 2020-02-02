import {PowerApp} from '@makeflow/types';

import {IAPIDeclaration} from './v1';

export const powerAppPublish: IAPIDeclaration<
  '/power-app/publish',
  PowerApp.DenominalizedRawDefinition,
  string | undefined
> = {
  name: '/power-app/publish',
  accessToken: true,
} as const;

export const powerAppRefreshToken: IAPIDeclaration<
  '/power-app/refresh-token',
  {
    name: string;
  },
  string | undefined
> = {
  name: '/power-app/refresh-token',
  accessToken: true,
} as const;
