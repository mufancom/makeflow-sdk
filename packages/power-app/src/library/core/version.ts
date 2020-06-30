import {API as APITypes} from '@makeflow/types';
import {Dict} from 'tslang';

import {Context, ContextType} from './context';

export interface PowerAppVersionInfo {
  range: string;
  definition: PowerAppVersion.Definition;
}

export interface CustomDeclareDict {
  installation: Required<GeneralDeclare>;
  powerItems: {[key in string]: GeneralDeclareWithInputs};
  powerNodes: {[key in string]: GeneralDeclareWithInputs};
  powerGlances: {[key in string]: GeneralDeclare};
  powerCustomCheckableItems: {[key in string]: GeneralDeclareWithInputs};
  pages: {[key in string]: GeneralDeclare};
}

export interface GeneralDeclare {
  storage: any;
  configs?: any;
}

export interface GeneralDeclareWithInputs extends GeneralDeclare {
  inputs: Dict<any>;
}

type GeneralChange<
  TType extends ContextType,
  TDeclare extends GeneralDeclare,
  TResponse
> = TDeclare extends GeneralDeclareWithInputs
  ? (
      data: {
        context: Context<TType, TDeclare['storage'], TDeclare['configs']>;
        inputs: TDeclare['inputs'];
      } & Omit<TDeclare, 'inputs' | 'storage' | 'configs'>,
    ) => Promise<TResponse | void> | TResponse | void
  : (
      data: {
        context: Context<TType, TDeclare['storage'], TDeclare['configs']>;
      } & Omit<TDeclare, 'storage' | 'configs'>,
    ) => Promise<TResponse | void> | TResponse | void;

export namespace PowerAppVersion {
  export interface Definition<
    TCustomDeclareDict extends Partial<CustomDeclareDict> = CustomDeclareDict,
    TInstallationDeclare extends Required<
      GeneralDeclare
    > = TCustomDeclareDict['installation'] extends Required<GeneralDeclare>
      ? TCustomDeclareDict['installation']
      : Required<GeneralDeclare>
  > {
    ancestor?: string;
    installation?: Installation.Definition<TInstallationDeclare>;
    contributions?: {
      powerItems?: (TCustomDeclareDict['powerItems'] extends CustomDeclareDict['powerItems']
        ? {
            [TKey in keyof TCustomDeclareDict['powerItems']]: PowerItem.Definition<
              TCustomDeclareDict['powerItems'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: PowerItem.Definition<GeneralDeclareWithInputs>;
        };
      powerNodes?: (TCustomDeclareDict['powerNodes'] extends CustomDeclareDict['powerNodes']
        ? {
            [TKey in keyof TCustomDeclareDict['powerNodes']]: PowerNode.Definition<
              TCustomDeclareDict['powerNodes'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: PowerNode.Definition<GeneralDeclareWithInputs>;
        };
      powerGlances?: (TCustomDeclareDict['powerGlances'] extends CustomDeclareDict['powerGlances']
        ? {
            [TKey in keyof TCustomDeclareDict['powerGlances']]: PowerGlance.Definition<
              TCustomDeclareDict['powerGlances'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: PowerGlance.Definition<GeneralDeclare>;
        };
      powerCustomCheckableItems?: (TCustomDeclareDict['powerCustomCheckableItems'] extends CustomDeclareDict['powerCustomCheckableItems']
        ? {
            [TKey in keyof TCustomDeclareDict['powerCustomCheckableItems']]: PowerCustomCheckableItem.Definition<
              TCustomDeclareDict['powerCustomCheckableItems'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: PowerCustomCheckableItem.Definition<
            GeneralDeclareWithInputs
          >;
        };
      pages?: (TCustomDeclareDict['pages'] extends CustomDeclareDict['pages']
        ? {
            [TKey in keyof TCustomDeclareDict['pages']]: Page.Definition<
              TCustomDeclareDict['pages'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: Page.Definition<GeneralDeclare>;
        };
    };
  }

  export type MigrationFunction<TData = Dict<any>> = (data: TData) => Dict<any>;

  export interface Migrations<TData = Dict<any>> {
    /**
     * up 是把前一个版本的数据升级成当前版本
     */
    up?: MigrationFunction<TData>;
    /**
     * down 是把当前版本的数据降级成前一个版本
     */
    down?: MigrationFunction<TData>;
  }

  // installation

  export namespace Installation {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'installation',
      TDeclare,
      // TODO
      {
        description?: string | false;
      }
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
    }
  }

  // power-item

  export namespace PowerItem {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'powerItems',
      TDeclare,
      APITypes.PowerItem.HookReturn
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
      actions?: {
        [key in string]: Change<TDeclare>;
      };
      migrations?: Migrations<TDeclare['storage']>;
    }
  }

  // power-node

  export namespace PowerNode {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'powerNodes',
      TDeclare,
      APITypes.PowerNode.HookReturn
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
      actions?: {
        [key in string]: Change<TDeclare>;
      };
      migrations?: Migrations<TDeclare['storage']>;
    }
  }

  // power-glance

  export namespace PowerGlance {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'powerGlances',
      TDeclare & {
        resources: APITypes.PowerGlance.ResourceEntry[];
      },
      APITypes.PowerGlance.HookReturn
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      initialize?: Change<TDeclare>;
      change?: Change<TDeclare>;
      dispose?: Change<TDeclare>;
      migrations?: Migrations<TDeclare['storage']>;
    }
  }

  // power-custom-checkable-item

  export namespace PowerCustomCheckableItem {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'powerCustomCheckableItems',
      TDeclare & APITypes.PowerCustomCheckableItem.HookContext,
      APITypes.PowerCustomCheckableItem.HookReturn
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      processor?: Change<TDeclare>;
      migrations?: Migrations<TDeclare['storage']>;
    }
  }

  // page

  export namespace Page {
    export type Change<TDeclare extends GeneralDeclare> = GeneralChange<
      'pages',
      TDeclare,
      APITypes.PowerAppPage.HookReturn
    >;

    export interface Definition<TDeclare extends GeneralDeclare> {
      request?: Change<TDeclare>;
      migrations?: Migrations<TDeclare['storage']>;
    }
  }
}
