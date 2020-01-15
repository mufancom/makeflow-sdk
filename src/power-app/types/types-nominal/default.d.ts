declare module '@makeflow/types-nominal' {
  import {Nominal} from 'tslang';

  export type OrganizationId = Nominal<string, ['syncable-id', 'organization']>;

  export type UserId = Nominal<string, ['syncable-id', 'user']>;

  export interface UserRef {
    type: 'user';
    id: UserId;
  }

  export type TeamId = Nominal<string, ['syncable-id', 'team']>;

  export interface TeamRef {
    type: 'team';
    id: TeamId;
  }

  export type TagId = Nominal<string, ['syncable-id', 'tag']>;

  export interface TagRef {
    type: 'tag';
    id: TagId;
  }

  export type ProcedureId = Nominal<string, ['syncable-id', 'procedure']>;

  export interface ProcedureRef {
    type: 'procedure';
    id: ProcedureId;
  }

  export type TaskId = Nominal<string, ['syncable-id', 'task']>;

  export interface TaskRef {
    type: 'task';
    id: TaskId;
  }

  export interface AppInstallationRef {
    type: 'app-installation';
    id: AppInstallationId;
  }

  export type AppInstallationId = Nominal<
    string,
    ['syncable-id', 'app-installation']
  >;

  export type FileId = Nominal<string, 'file-id'>;

  export type OperationTokenToken = Nominal<string, 'operation-token-token'>;
}
