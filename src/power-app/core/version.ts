import {Dict} from 'tslang';

import {
  ActionStorage,
  IStorageObject,
  PowerItem as PowerItemStorageObject,
} from './storage';

export namespace PowerAppVersion {
  export interface Definition {
    ancestor: string;
    contributions: {
      powerItems?: {
        [key in string]: PowerItem.Definition;
      };
    };
  }

  export interface Migrations<TStorageObject extends IStorageObject> {
    up?(storage: ActionStorage<TStorageObject>): void;
    down?(storage: ActionStorage<TStorageObject>): void;
  }

  export namespace PowerItem {
    export interface ChangeParams {
      storage: ActionStorage<PowerItemStorageObject>;
      // TODO
      api: undefined;
      inputs: Dict<unknown>;
      configs: Dict<unknown>;
    }

    export interface ChangeResponseData {
      description?: string;
      stage?: 'none' | 'done';
      outputs?: object;
    }

    export type PowerItemChange = (
      params: ChangeParams,
    ) => ChangeResponseData | void;

    export interface Definition {
      activate?: PowerItemChange;
      update?: PowerItemChange;
      deactivate?: PowerItemChange;
      action?: {
        [key in string]: PowerItemChange;
      };
      migrations?: Migrations<PowerItemStorageObject>;
    }
  }
}
