import {
  AppInstallationId,
  OrganizationId,
  ProcedureId,
  TagId,
  TeamId,
} from '@makeflow/types-nominal';
import {Dict} from 'tslang';

export namespace PowerApp {
  ///////////
  // Hooks //
  ///////////

  // installation/activate hook //

  interface InstallationActivateHookParams extends SharedConfigHookParams {
    configs: Dict<unknown>;
    resources: ResourcesMapping;
  }

  // installation/update hook //

  interface InstallationUpdateHookParams extends SharedConfigHookParams {
    configs: Dict<unknown>;
    resources: ResourcesMapping;
  }

  interface InstallationUpdateHookReturn {
    granted?: boolean;
  }

  // installation/deactivate hook //

  interface InstallationDeactivateHookParams extends SharedConfigHookParams {}

  // permission/grant hook //

  interface PermissionGrantHookParams extends SharedConfigHookParams {
    accessToken: string;
  }

  // permission/revoke hook //

  interface PermissionRevokeHookParams extends SharedConfigHookParams {}

  ///

  interface SharedConfigHookParams {
    source: Source;
    organization: OrganizationId;
    installation: AppInstallationId;
    team: TeamId;
  }

  ///////////////
  // Non-hooks //
  ///////////////

  ///////////
  // Types //
  ///////////

  interface ResourcesMapping {
    tags: Dict<TagId>;
    procedures: Dict<ProcedureId>;
  }

  interface Source {
    url: string;
    token: string;
  }
}
