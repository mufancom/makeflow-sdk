import {Nominal} from 'tslang';

import {PowerAppDefinitionId} from './power-app-definition';

export type PowerAppId = Nominal<string, 'power-app-id'>;

export interface PowerApp {
  id: PowerAppId;
  name: string;
  official: boolean;
  publisher: MakeflowTypes.OrganizationId;
  maintainers: MakeflowTypes.UserId[];
  token?: string;
  latest: PowerAppDefinitionId;
}
