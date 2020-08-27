import {AccessControl} from '@makeflow/types';

// /root/workspace/makeflow-web/app/src/program/views/power-app/@installed-app/@app-config.tsx

export const permissionData: {
  label: string;
  value: AccessControl.AccessTokenPermissionName;
}[] = [
  {
    label: '通过信息模糊匹配用户',
    value: 'user:match',
  },

  {
    label: '创建任务',
    value: 'task:create',
  },

  {
    label: '更新任务',
    value: 'task:update',
  },

  {
    label: '在任务中发送消息',
    value: 'task:send-message',
  },

  {
    label: '创建流程',
    value: 'procedure:create',
  },

  {
    label: '更新流程',
    value: 'procedure:update',
  },
];
