import {API} from '@makeflow/types';

import {IAPIDeclaration} from './v1';

export const powerItemUpdate: IAPIDeclaration<
  '/power-item/update',
  API.PowerItem.UpdateParams,
  API.PowerItem.UpdateReturn
> = {
  name: '/power-item/update',
  token: true,
} as const;
