import {Nominal} from 'tslang';

import {BaseFieldType, ExtendedFieldDefinition} from '../../field';
import {IProcedureFieldDefinition} from '../../procedure';
import {PowerAppDataSourceOptions} from '../power-app-data-source';

export type PowerAppProcedureFieldType = Nominal<
  string,
  'power-app-procedure-field-type'
>;

export type PowerAppProcedureFieldDefinition = __PowerAppProcedureFieldDefinition<
  IProcedureFieldDefinition & {
    type: PowerAppProcedureFieldType;
    data?: unknown;
    dataSource?: PowerAppDataSourceOptions;
  }
>;

interface GeneralPowerAppProcedureFieldDefinition<
  TBaseType extends BaseFieldType
> {
  base: TBaseType;
}

type __PowerAppProcedureFieldDefinition<
  TDefinition
> = TDefinition extends GeneralPowerAppProcedureFieldDefinition<infer TBaseType>
  ? TDefinition & {
      data?: Extract<ExtendedFieldDefinition, {base: TBaseType}>['data'];
    }
  : never;
