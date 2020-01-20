import {API} from '@makeflow/types';
import {Dict} from 'tslang';

import {
  ActionStorage,
  IStorageObject,
  PowerGlance as PowerGlanceStorageObject,
  PowerItem as PowerItemStorageObject,
} from './storage';

export namespace PowerAppVersion {
  export interface Definition {
    contributions: {
      powerItems?: {
        [key in string]: PowerItem.Definition;
      };
      powerGlances?: {
        [key in string]: PowerGlance.Definition;
      };
    };
  }

  export type MigrationFunction<TStorageObject extends IStorageObject> = (
    storage: ActionStorage<TStorageObject>,
  ) => void;

  export interface Migrations<TStorageObject extends IStorageObject> {
    up?: MigrationFunction<TStorageObject>;
    down?: MigrationFunction<TStorageObject>;
  }

  export type Changes = PowerItem.Change | PowerGlance.Change;

  // power-item

  export namespace PowerItem {
    export interface ChangeParams {
      storage: ActionStorage<PowerItemStorageObject>;
      // TODO
      api: undefined;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData extends API.PowerItem.HookReturn {}

    export type Change = (params: ChangeParams) => ChangeResponseData | void;

    export interface Definition {
      activate?: Change;
      update?: Change;
      deactivate?: Change;
      action?: {
        [key in string]: Change;
      };
      migrations?: Migrations<PowerItemStorageObject>;
    }
  }

  // power-glance

  export namespace PowerGlance {
    export interface ChangeParams {
      storage: ActionStorage<PowerGlanceStorageObject>;
      // TODO
      api: undefined;
      resources: API.PowerGlance.ResourceEntry[];
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData extends API.PowerGlance.HookReturn {}

    export type Change = (params: ChangeParams) => ChangeResponseData | void;

    export interface Definition {
      initialize?: Change;
      change?: Change;
      dispose?: Change;
      migrations?: Migrations<PowerGlanceStorageObject>;
    }
  }
}
