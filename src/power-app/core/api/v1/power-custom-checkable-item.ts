import {API} from '@makeflow/types';

import {IAPIDeclaration} from './v1';

export const powerCheckableCustomItemUpdate: IAPIDeclaration<
  '/power-checkable-custom-item/update',
  API.PowerCustomCheckableItem.UpdateParams,
  API.PowerCustomCheckableItem.UpdateReturn
> = {
  name: '/power-checkable-custom-item/update',
  token: true,
} as const;
