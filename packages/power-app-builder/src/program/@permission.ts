import {AccessControl} from '@makeflow/types';

// /root/workspace/makeflow-web/app/src/program/views/power-app/@installed-app/@app-config.tsx

export const permissionData: {
  label: string;
  value: AccessControl.PermissionName;
}[] = [
  {
    label: 'Match User',
    value: 'user:match',
  },

  {
    label: 'Create Task',
    value: 'task:create',
  },

  {
    label: 'Update Task',
    value: 'task:update',
  },

  {
    label: 'Send TaskMessage',
    value: 'task:send-message',
  },

  {
    label: 'Create Procedure',
    value: 'procedure:create',
  },

  {
    label: 'Update Procedure',
    value: 'procedure:update',
  },
];
