import {AssertTrue, IsEqual} from 'tslang';

import {BaseFieldType, ExtendedFieldDefinition} from '../../field';

import {
  IPowerAppConfigDefinitionFieldOptions,
  PowerAppConfigFieldDefinition,
  PowerAppConfigFieldType,
} from './power-app-config-field';

export const POWER_APP_CONFIG_FIELD_DEFINITIONS = define([
  {
    type: 'text',
    base: 'input',
  },
  {
    type: 'password',
    base: 'input',
    options: {
      secret: true,
    },
  },
  {
    type: 'select',
    base: 'select',
  },
  {
    type: 'radio',
    base: 'radio',
  },
  {
    type: 'user',
    base: 'user',
  },
  {
    type: 'team',
    base: 'team',
  },
  {
    type: 'team-array',
    base: 'team-array',
  },
  {
    type: 'procedure-array',
    base: 'procedure-array',
  },
  {
    type: 'tag-array',
    base: 'tag-array',
  },
  {
    type: 'file',
    base: 'file',
  },
]);

export const POWER_APP_CONFIG_FIELD_DEFINITION_MAP = new Map(
  POWER_APP_CONFIG_FIELD_DEFINITIONS.map((definition): [
    PowerAppConfigFieldType,
    PowerAppConfigFieldDefinition,
  ] => [definition.type, definition]),
);

export type __AssertPowerAppConfigFieldDefinitions = AssertTrue<
  IsEqual<
    (typeof POWER_APP_CONFIG_FIELD_DEFINITIONS)[number]['type'],
    PowerAppConfigFieldType
  >
>;

function define<T extends PowerAppConfigFieldDefinition[]>(definitions: T): T {
  return definitions;
}

type ConcretePowerAppConfigFieldDefinition = (typeof POWER_APP_CONFIG_FIELD_DEFINITIONS)[number];

interface PowerAppConfigFieldDefinitionTypeAndBasePartial<
  TType extends PowerAppConfigFieldType,
  TBaseType extends BaseFieldType
> {
  type: TType;
  base: TBaseType;
}

type __PowerAppConfigDefinitionFieldOptions<
  TDefinition
> = TDefinition extends PowerAppConfigFieldDefinitionTypeAndBasePartial<
  infer TType,
  infer TBaseType
>
  ? IPowerAppConfigDefinitionFieldOptions<
      TType,
      Extract<ExtendedFieldDefinition, {base: TBaseType}>['data']
    >
  : never;

export type PowerAppConfigDefinitionFieldOptions = __PowerAppConfigDefinitionFieldOptions<
  ConcretePowerAppConfigFieldDefinition
>;
