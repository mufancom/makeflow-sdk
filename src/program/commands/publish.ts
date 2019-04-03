import * as FS from 'fs';
import * as Path from 'path';

import {Castable, Command, command, param} from 'clime';
import {Validator} from 'jsonschema';

import {ACCESS_TOKEN, API_BASE_URL} from '../config';
import {API} from '../core';

const api = new API(API_BASE_URL);

const definitionSchema = loadDefinitionJSONSchema();

const schemaValidator = new Validator();

@command({
  description: 'Publish a PowerApp for Makeflow.',
})
export default class extends Command {
  async execute(
    @param({
      description: 'PowerApp definition file.',
      default: 'power-app.json',
    })
    file: Castable.File,
  ): Promise<void> {
    await file.assert();

    let definition = await file.json<any>();

    await this.publish(definition);

    console.info(
      `PowerApp "${definition.name}" has been successfully published!`,
    );
  }

  private async publish(definition: object): Promise<void> {
    let result = schemaValidator.validate(definition, definitionSchema);

    if (result.errors.length) {
      let errorMessages = result.errors.map(({message}) => `- ${message}`);

      throw new Error(
        `Invalid PowerApp definition, reasons:\n${errorMessages.join('\n')}`,
      );
    }

    if (!ACCESS_TOKEN) {
      throw new Error('Please login with `mf login` first');
    }

    await api.post(
      '/power-app/publish',
      {
        definition,
      },
      {
        headers: {
          'X-Access-Token': ACCESS_TOKEN,
        },
      },
    );
  }
}

function loadDefinitionJSONSchema(): object {
  let schemaJSON = FS.readFileSync(
    Path.join(__dirname, '../../power-app/schema.json'),
    'utf8',
  );

  return JSON.parse(schemaJSON);
}
