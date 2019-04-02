import * as OS from 'os';
import * as Path from 'path';

import rc from 'rc';

const DEFAULT_CONFIG = {
  apiBaseUrl: 'http://localhost:8080/api/v1',
};

const appConfig = rc('mf', DEFAULT_CONFIG);

export const CONFIG_FILE: string =
  appConfig.config || Path.join(OS.homedir(), '.mfrc');

export const API_BASE_URL: string =
  appConfig['apiBaseUrl'] || DEFAULT_CONFIG.apiBaseUrl;
export const ACCESS_TOKEN: string | undefined = appConfig['accessToken'];
