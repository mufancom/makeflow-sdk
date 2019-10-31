import {OmitValueOfKey} from 'tslang';

import {IExtendedFieldDefinition} from './base-field';

export type ExtendedFieldDefinition =
  | ExtendedInputFieldDefinition
  | ExtendedSelectFieldDefinition
  | ExtendedRadioFieldDefinition
  | ExtendedUserFieldDefinition
  | ExtendedTeamFieldDefinition
  | ExtendedTeamArrayFieldDefinition
  | ExtendedProcedureArrayFieldDefinition
  | ExtendedTagArrayFieldDefinition
  | ExtendedFileFieldDefinition;

export type FieldDefinition = OmitValueOfKey<ExtendedFieldDefinition, 'data'>;

/**
 * Base field types, all the built-in and power app customized fields are based
 * on those types.
 */
export type BaseFieldType = FieldDefinition['base'];

// input //

export interface ExtendedInputFieldDefinition
  extends IExtendedFieldDefinition<'input', InputBaseFieldOptions> {}

export interface InputBaseFieldOptions {
  secret?: boolean;
}

// select //

export type ExtendedSelectFieldDefinition = IExtendedFieldDefinition<
  'select',
  SelectBaseFieldOptions,
  SelectAlikeFieldCandidate[]
>;

export interface SelectBaseFieldOptions {}

// radio //

export type ExtendedRadioFieldDefinition = IExtendedFieldDefinition<
  'radio',
  RadioBaseFieldOptions,
  SelectAlikeFieldCandidate[]
>;

export interface RadioBaseFieldOptions {}

// user //

export type ExtendedUserFieldDefinition = IExtendedFieldDefinition<
  'user',
  UserBaseFieldOptions
>;

export interface UserBaseFieldOptions {}

// team //

export type ExtendedTeamFieldDefinition = IExtendedFieldDefinition<
  'team',
  TeamBaseFieldOptions
>;

export interface TeamBaseFieldOptions {}

// team-array //

export type ExtendedTeamArrayFieldDefinition = IExtendedFieldDefinition<
  'team-array',
  TeamArrayBaseFieldOptions
>;

export interface TeamArrayBaseFieldOptions {}

// procedure-array //

export type ExtendedProcedureArrayFieldDefinition = IExtendedFieldDefinition<
  'procedure-array',
  ProcedureArrayBaseFiledOptions
>;

export interface ProcedureArrayBaseFiledOptions {}

// tag-array //

export type ExtendedTagArrayFieldDefinition = IExtendedFieldDefinition<
  'tag-array',
  TagArrayBaseFieldOptions
>;

export interface TagArrayBaseFieldOptions {}

// file //

export type ExtendedFileFieldDefinition = IExtendedFieldDefinition<
  'file',
  FileBaseFieldOptions
>;

export interface FileBaseFieldOptions {}

///

export interface SelectAlikeFieldCandidate {
  text: string;
  value: unknown;
}
