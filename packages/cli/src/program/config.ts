import * as FS from 'fs';
import * as OS from 'os';
import * as Path from 'path';

const CONFIG_PATH = Path.join(OS.homedir(), '.mfrc');

export interface SDKConfig {
  api: string;
  token?: string;
}

const DEFAULT_CONFIG: SDKConfig = {
  api: 'https://makeflow.com/api/v1',
};

export const config: SDKConfig = {...DEFAULT_CONFIG};

try {
  let configJSON = FS.readFileSync(CONFIG_PATH, 'utf-8');
  Object.assign(config, JSON.parse(configJSON));
} catch (error) {}

export function updateConfig(update: Partial<SDKConfig>): void {
  Object.assign(config, update);

  let configToSave: Partial<SDKConfig> = {};

  for (let [key, value] of Object.entries(config)) {
    if (value !== DEFAULT_CONFIG[key as keyof SDKConfig]) {
      configToSave[key as keyof SDKConfig] = value;
    }
  }

  FS.writeFileSync(
    CONFIG_PATH,
    `${JSON.stringify(configToSave, undefined, 2)}\n`,
  );
}
