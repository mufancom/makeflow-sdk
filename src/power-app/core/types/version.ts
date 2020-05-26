import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {API} from '../../api';
import {
  InstallationModel,
  Model,
  PowerCustomCheckableItemModel,
  PowerGlanceModel,
  PowerItemModel,
  PowerNodeModel,
} from '../model';
import {ActionStorage} from '../storage';

export interface IStorageTypes {
  powerItems?: {
    [key in string]: Dict<any>;
  };
  powerNodes?: {
    [key in string]: Dict<any>;
  };
  powerGlances?: {
    [key in string]: Dict<any>;
  };
  powerCustomCheckableItems?: {
    [key in string]: Dict<any>;
  };
}

export namespace PowerAppVersion {
  export interface Definition<
    TStorageTypes extends IStorageTypes = IStorageTypes,
    TDefaultStorage = Dict<any>
  > {
    ancestor?: string;
    installation?: Installation.Definition;
    contributions?: {
      powerItems?: {
        [TKey in keyof TStorageTypes['powerItems']]: PowerItem.Definition<
          TStorageTypes['powerItems'][TKey]
        >;
      } &
        {
          [key in string]: PowerItem.Definition<TDefaultStorage>;
        };
      powerNodes?: {
        [TKey in keyof TStorageTypes['powerNodes']]: PowerNode.Definition<
          TStorageTypes['powerNodes'][TKey]
        >;
      } &
        {
          [key in string]: PowerNode.Definition<TDefaultStorage>;
        };
      powerGlances?: {
        [TKey in keyof TStorageTypes['powerGlances']]: PowerGlance.Definition<
          TStorageTypes['powerGlances'][TKey]
        >;
      } &
        {
          [key in string]: PowerGlance.Definition<TDefaultStorage>;
        };
      powerCustomCheckableItems?: {
        [TKey in keyof TStorageTypes['powerCustomCheckableItems']]: PowerCustomCheckableItem.Definition<
          TStorageTypes['powerCustomCheckableItems'][TKey]
        >;
      } &
        {
          [key in string]: PowerCustomCheckableItem.Definition<TDefaultStorage>;
        };
    };
  }

  export type Changes =
    | Installation.Change
    | PowerItem.Change
    | PowerNode.Change
    | PowerGlance.Change
    | PowerCustomCheckableItem.Change;

  export type MigrationFunction<
    TModel extends Model = Model,
    TStorage = Dict<any>
  > = (storage: ActionStorage<TModel, TStorage>) => Promise<void> | void;

  export interface Migrations<
    TModel extends Model = Model,
    TStorage = Dict<any>
  > {
    /**
     * up 是把前一个版本的数据升级成当前版本
     */
    up?: MigrationFunction<TModel, TStorage>;
    /**
     * down 是把当前版本的数据降级成前一个版本
     */
    down?: MigrationFunction<TModel, TStorage>;
  }

  // installation

  export namespace Installation {
    export interface ChangeParams {
      storage: ActionStorage<InstallationModel>;
      api: API;
      configs: Dict<unknown>;
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
    export interface ChangeParams<TStorage> {
      storage: ActionStorage<PowerItemModel, TStorage>;
      api: API;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData extends APITypes.PowerItem.HookReturn {}

    export type Change<TStorage = Dict<any>> = (
      params: ChangeParams<TStorage>,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export interface Definition<TStorage = Dict<any>> {
      activate?: Change<TStorage>;
      update?: Change<TStorage>;
      deactivate?: Change<TStorage>;
      action?: {
        [key in string]: Change<TStorage>;
      };
      migrations?: Migrations<PowerItemModel, TStorage>;
    }
  }

  // power-node

  export namespace PowerNode {
    export interface ChangeParams<TStorage> {
      storage: ActionStorage<PowerNodeModel, TStorage>;
      api: API;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData extends APITypes.PowerNode.HookReturn {}

    export type Change<TStorage = Dict<any>> = (
      params: ChangeParams<TStorage>,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export interface Definition<TStorage = Dict<any>> {
      activate?: Change<TStorage>;
      update?: Change<TStorage>;
      deactivate?: Change<TStorage>;
      action?: {
        [key in string]: Change<TStorage>;
      };
      migrations?: Migrations<PowerNodeModel, TStorage>;
    }
  }

  // power-glance

  export namespace PowerGlance {
    export interface ChangeParams<TStorage> {
      storage: ActionStorage<PowerGlanceModel, TStorage>;
      api: API;
      resources: APITypes.PowerGlance.ResourceEntry[];
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData
      extends APITypes.PowerGlance.HookReturn {}

    export type Change<TStorage = Dict<any>> = (
      params: ChangeParams<TStorage>,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export interface Definition<TStorage = Dict<any>> {
      initialize?: Change<TStorage>;
      change?: Change<TStorage>;
      dispose?: Change<TStorage>;
      migrations?: Migrations<PowerGlanceModel, TStorage>;
    }
  }

  // power-custom-checkable-item

  export namespace PowerCustomCheckableItem {
    export interface ChangeParams<TStorage> {
      storage: ActionStorage<PowerCustomCheckableItemModel, TStorage>;
      context: APITypes.PowerCustomCheckableItem.HookContext;
      api: API;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData
      extends APITypes.PowerCustomCheckableItem.HookReturn {}

    export type Change<TStorage = Dict<any>> = (
      params: ChangeParams<TStorage>,
    ) => Promise<ChangeResponseData | void> | ChangeResponseData | void;

    export type Definition<TStorage = Dict<any>> =
      | {
          processor?: Change<TStorage>;
          migrations?: Migrations<PowerCustomCheckableItemModel, TStorage>;
        }
      | Change<TStorage>;
  }
}
