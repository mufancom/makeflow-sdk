import {API as APITypes, PowerAppProcedureField} from '@makeflow/types';

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
  pages: {[key in string]: GeneralDeclareWithInputs};
  dataSources: {[key in string]: GeneralDeclareWithInputs};
  fieldSources: {[key in string]: GeneralDeclare};
}

export interface GeneralDeclare {
  storage: any;
  configs?: any;
}

export interface GeneralDeclareWithInputs extends GeneralDeclare {
  inputs: any;
}

export type ExtractDeclareStorage<TDeclare> = Extract<
  TDeclare,
  {storage: any}
>['storage'];

export type GeneralChange<
  TType extends ContextType,
  TDeclare,
  TResponse
> = TDeclare extends GeneralDeclare
  ? TDeclare extends GeneralDeclareWithInputs
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
      ) => Promise<TResponse | void> | TResponse | void
  : never;

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
          [key in string]: Page.Definition<GeneralDeclareWithInputs>;
        };

      dataSources?: (TCustomDeclareDict['dataSources'] extends CustomDeclareDict['dataSources']
        ? {
            [TKey in keyof TCustomDeclareDict['dataSources']]: DataSource.Definition<
              TCustomDeclareDict['dataSources'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: DataSource.Definition<GeneralDeclareWithInputs>;
        };

      fieldSources?: (TCustomDeclareDict['fieldSources'] extends CustomDeclareDict['fieldSources']
        ? {
            [TKey in keyof TCustomDeclareDict['fieldSources']]: FieldSource.Definition<
              TCustomDeclareDict['fieldSources'][TKey] &
                Pick<TInstallationDeclare, 'configs'>
            >;
          }
        : {}) &
        {
          [key in string]: FieldSource.Definition<GeneralDeclare>;
        };
    };
  }

  export type MigrationFunction<TData = any> = (data: TData) => any;

  export interface Migrations<TData = any> {
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
    export type Change<TDeclare> = GeneralChange<
      'installation',
      TDeclare,
      APITypes.PowerApp.InstallationActivateHookReturn
    >;

    export interface Definition<TDeclare> {
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
    }
  }

  // power-item

  export namespace PowerItem {
    export type Change<TDeclare> = GeneralChange<
      'power-item',
      TDeclare,
      APITypes.PowerItem.HookReturn
    >;

    export interface Definition<TDeclare> {
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
      actions?: {
        [key in string]: Change<TDeclare>;
      };
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // power-node

  export namespace PowerNode {
    export type Change<TDeclare> = GeneralChange<
      'power-node',
      TDeclare,
      APITypes.PowerNode.HookReturn
    >;

    export interface Definition<TDeclare> {
      preactivate?: Change<TDeclare>;
      activate?: Change<TDeclare>;
      update?: Change<TDeclare>;
      deactivate?: Change<TDeclare>;
      actions?: {
        [key in string]: Change<TDeclare>;
      };
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // power-glance

  export namespace PowerGlance {
    export type Change<TDeclare> = GeneralChange<
      'power-glance',
      TDeclare & {
        resources: APITypes.PowerGlance.ResourceEntry[];
      },
      APITypes.PowerGlance.HookReturn
    >;

    export interface Definition<TDeclare> {
      initialize?: Change<TDeclare>;
      change?: Change<TDeclare>;
      dispose?: Change<TDeclare>;
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // power-custom-checkable-item

  export namespace PowerCustomCheckableItem {
    export type Change<TDeclare> = GeneralChange<
      'power-custom-checkable-item',
      TDeclare & APITypes.PowerCustomCheckableItem.HookContext,
      APITypes.PowerCustomCheckableItem.HookReturn
    >;

    export interface Definition<TDeclare> {
      processor?: Change<TDeclare>;
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // page

  export namespace Page {
    export type Change<TDeclare> = GeneralChange<
      'page',
      TDeclare,
      APITypes.PowerAppPage.HookReturn
    >;

    export interface Definition<TDeclare> {
      request?: Change<TDeclare>;
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // data-source

  export namespace DataSource {
    // TODO(boen): data-source 返回值类型
    export type Change<TDeclare> = GeneralChange<'data-source', TDeclare, any>;

    export interface Definition<TDeclare> {
      request?: Change<TDeclare>;
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }

  // field-source

  export namespace FieldSource {
    export type Change<TDeclare> = GeneralChange<
      'field-source',
      TDeclare,
      PowerAppProcedureField.FieldBaseDefinition[]
    >;

    export interface Definition<TDeclare> {
      request?: Change<TDeclare>;
      migrations?: Migrations<ExtractDeclareStorage<TDeclare>>;
    }
  }
}
