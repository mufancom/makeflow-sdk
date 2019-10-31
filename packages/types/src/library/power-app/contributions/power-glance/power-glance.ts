import {Nominal} from 'tslang';

import {ReportDefinition} from '../../../report';
import {PowerAppConfigDefinition} from '../../power-app-config';
import {PowerAppInputDefinition} from '../../power-app-input';

export type PowerGlanceName = Nominal<string, 'power-glance-name'>;

export interface PowerGlanceDefinition {
  name: PowerGlanceName;
  displayName: string;
  description?: string;
  hookBaseURL: string;
  inputs?: PowerAppInputDefinition[];
  configs?: PowerAppConfigDefinition[];
  reports: ReportDefinition[];
}
