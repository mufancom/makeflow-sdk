declare namespace MakeflowTypes {
  export type FileId = string;
  export type OrganizationId = string;
  export type UserId = string;
  export type NumericTimestamp = number;
  export type GlanceDataName = string;
  export type ProcedureBranchDefinitionId = string;
  export type ProcedureItemDefinitionId = string;
  export type ProcedureItemsNodeDefinitionId = string;
  export type ProcedureDefinitionId = string;
  export type ProcedureId = string;
  export type TagId = string;
  export type ProcedureRoleId = string;
  export type AppInstallationId = string;
  export type ProcedureDefinitionFieldId = string;

  export interface ISyncable {
    _id: string;
    _type: string;
  }

  export interface ISyncableObject<T extends ISyncable = ISyncable> {
    syncable: T;
    readonly ref: SyncableRef<this>;
  }

  export interface SyncableRef<T extends ISyncableObject = ISyncableObject> {
    id: T['syncable']['_id'];
    type: T['syncable']['_type'];
  }

  export type SyncableRefType<
    T extends ISyncableObject = ISyncableObject
  > = T extends ISyncableObject
    ? {
        id: T['syncable']['_id'];
        type: T['syncable']['_type'];
      }
    : never;
}
