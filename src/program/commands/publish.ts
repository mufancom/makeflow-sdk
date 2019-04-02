import * as FS from 'fs';
import * as Path from 'path';

import {Castable, Command, command, param} from 'clime';
import {Validator} from 'jsonschema';

import {ACCESS_TOKEN, API_BASE_URL} from '../config';
import {API} from '../core';

const api = new API(API_BASE_URL);

const powerAppSchema = loadPowerAppJSONSchema();

const schemaValidator = new Validator();

@command({
  description: 'Publish a PowerApp for Makeflow.',
})
export default class extends Command {
  async execute(
    @param({
      description: 'PowerApp file.',
      default: 'power-app.json',
    })
    file: Castable.File,
  ): Promise<void> {
    await file.assert();

    let powerAppConfig = await file.json();

    await this.publish(powerAppConfig);

    console.info(`🎉 Publish succeeded`);
  }

  private async publish(powerAppConfig: object): Promise<void> {
    let result = schemaValidator.validate(powerAppConfig, powerAppSchema);

    if (result.errors.length) {
      let errorMessages = result.errors.map(({message}) => `- ${message}`);

      throw new Error(
        `Invalid power app configuration, reasons:\n${errorMessages.join(
          '\n',
        )}`,
      );
    }

    if (!ACCESS_TOKEN) {
      throw new Error('Please login first, via "mf login"');
    }

    await api.post(
      '/power-app/publish',
      {
        'power-app': powerAppConfig,
      },
      {
        headers: {
          'X-Access-Token': ACCESS_TOKEN,
        },
      },
    );
  }
}

function loadPowerAppJSONSchema(): object {
  let schemaJSON = FS.readFileSync(
    Path.join(__dirname, '../../power-app/schema.json'),
    'utf8',
  );

  return JSON.parse(schemaJSON);
}
