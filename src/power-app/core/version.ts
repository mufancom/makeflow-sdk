import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {API} from '../api';

import {
  Model,
  PowerCustomCheckableItemModel,
  PowerGlanceModel,
  PowerItemModel,
} from './model';
import {ActionStorage} from './storage';

export namespace PowerAppVersion {
  export interface Definition {
    installation?: Installation.Definition;
    contributions: {
      powerItems?: {
        [key in string]: PowerItem.Definition;
      };
      powerGlances?: {
        [key in string]: PowerGlance.Definition;
      };
      powerCustomCheckableItems?: {
        [key in string]: PowerCustomCheckableItem.Definition;
      };
    };
  }

  export type Changes =
    | Installation.Change
    | PowerItem.Change
    | PowerGlance.Change
    | PowerCustomCheckableItem.Change;

  export type MigrationFunction<TModel extends Model> = (
    storage: ActionStorage<TModel>,
  ) => Promise<void> | void;

  export interface Migrations<TModel extends Model> {
    /**
     * up 是把前一个版本的数据升级成当前版本
     */
    up?: MigrationFunction<TModel>;
    /**
     * down 是把当前版本的数据降级成前一个版本
     */
    down?: MigrationFunction<TModel>;
  }

  // installation

  export namespace Installation {
    export interface ChangeParams {
      api: API;
      prevConfigs: Dict<unknown>;
      nextConfigs: Dict<unknown>;
    }

    export type Change = (params: ChangeParams) => Promise<void> | void;

    export interface Definition {
      activate?: Change;
      update?: Change;
      deactivate?: Change;
    }
  }

  // power-item

  export namespace PowerItem {
    export interface ChangeParams {
      storage: ActionStorage<PowerItemModel>;
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
      migrations?: Migrations<PowerItemModel>;
    }
  }

  // power-glance

  export namespace PowerGlance {
    export interface ChangeParams {
      storage: ActionStorage<PowerGlanceModel>;
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
      migrations?: Migrations<PowerGlanceModel>;
    }
  }

  // power-custom-checkable-item

  export namespace PowerCustomCheckableItem {
    export interface ChangeParams {
      storage: ActionStorage<PowerCustomCheckableItemModel>;
      context: APITypes.PowerCustomCheckableItem.HookContext;
      api: API;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData
      extends APITypes.PowerCustomCheckableItem.HookReturn {}

    export type Change = (
      params: ChangeParams,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export type Definition =
      | {
          processor?: Change;
          migrations?: Migrations<PowerCustomCheckableItemModel>;
        }
      | Change;
  }
}
