import {API} from '@makeflow/types';
import {OrganizationId, UserId} from '@makeflow/types-nominal';

import {IAPIDeclaration} from './v1';

export interface UserCandidate {
  id: UserId;
  username: string;
  organization: {
    id: OrganizationId;
    displayName: string;
  };
  profile:
    | {
        fullName?: string | undefined;
        avatar?: string | undefined;
        bio?: string | undefined;
        mobile?: string | undefined;
        email?: string | undefined;
        position?: string | undefined;
      }
    | undefined;
  disabled: boolean | undefined;
}

export const accountListUsers: IAPIDeclaration<
  '/account/list-users',
  API.PowerItem.UpdateParams,
  UserCandidate[]
> = {
  name: '/account/list-users',
  token: true,
} as const;
