export interface IPermission {
  name: string;
  expiresAt?: MakeflowTypes.NumericTimestamp;
  data?: object;
}

export type AccessControlPermission =
  | 'account'
  | 'user'
  | 'local'
  | GeneralAccessControlPermission;

// Don't forget add permission to POWER_APP_WHITELISTED_PERMISSION_SET in
// server's PowerAppService if the permission can to grant to power app.
export type GeneralAccessControlPermission =
  | 'power-app:publish'
  | 'task:create'
  | 'task:update'
  | 'task:send-channel-message'
  | 'procedure:create'
  | 'procedure:update'
  | 'user:get-user-id-by-email';

export type AccessControlGetPermissionsResult = AccessControlPermission[];
