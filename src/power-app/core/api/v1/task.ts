import {API, Value} from '@makeflow/types';
import {Dict} from 'tslang';

import {IAPIDeclaration} from './v1';

export const taskCreate: IAPIDeclaration<
  '/task/create',
  API.PowerItem.UpdateParams,
  string
> = {
  name: '/task/create',
  accessToken: true,
} as const;

// export const taskSendFileMessage: IAPIDeclaration<
//   '/task/send-file-message',
//   API.PowerItem.UpdateParams,
//   void
// > = {
//   name: '/task/send-file-message',
//   accessToken: true,
// } as const;

export const taskAddOutputs: IAPIDeclaration<
  '/task/add-outputs',
  {
    taskId: string;
    outputs: Dict<Value.CompositeValueDescriptor>;
  },
  void
> = {
  name: '/task/add-outputs',
  accessToken: true,
} as const;
