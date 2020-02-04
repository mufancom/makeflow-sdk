import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {API} from './api';
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
  ) => Promise<void> | void;

  export interface Migrations<TStorageObject extends IStorageObject> {
    /**
     * up 是把前一个版本的数据升级成当前版本
     */
    up?: MigrationFunction<TStorageObject>;
    /**
     * down 是把当前版本的数据降级成前一个版本
     */
    down?: MigrationFunction<TStorageObject>;
  }

  export type Changes = PowerItem.Change | PowerGlance.Change;

  // power-item

  export namespace PowerItem {
    export interface ChangeParams {
      storage: ActionStorage<PowerItemStorageObject>;
      api: API;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData extends APITypes.PowerItem.HookReturn {}

    export type Change = (
      params: ChangeParams,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

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
      api: API;
      resources: APITypes.PowerGlance.ResourceEntry[];
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData
      extends APITypes.PowerGlance.HookReturn {}

    export type Change = (
      params: ChangeParams,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export interface Definition {
      initialize?: Change;
      change?: Change;
      dispose?: Change;
      migrations?: Migrations<PowerGlanceStorageObject>;
    }
  }
}
