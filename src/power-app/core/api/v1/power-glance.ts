import {API} from '@makeflow/types';

import {IAPIDeclaration} from './v1';

export const powerGlanceChange: IAPIDeclaration<
  '/power-glance/change',
  API.PowerGlance.UpdateParams,
  API.PowerGlance.UpdateReturn
> = {
  name: '/power-glance/change',
  token: true,
} as const;

export const powerGlanceInitialize: IAPIDeclaration<
  '/power-glance/initialize',
  API.PowerGlance.InitializeParams,
  API.PowerGlance.InitializeReturn
> = {
  name: '/power-glance/initialize',
  token: true,
} as const;
