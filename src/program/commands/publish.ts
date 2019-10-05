import * as FS from 'fs';
import * as Path from 'path';

import {
  Castable,
  Command,
  ExpectedError,
  Options,
  command,
  option,
  param,
} from 'clime';
import {Validator} from 'jsonschema';

import {config} from '../config';
import {API} from '../core';

const api = new API(config.api, config.token);

const definitionSchema = loadDefinitionJSONSchema();

const schemaValidator = new Validator();

export class PublishOptions extends Options {
  @option({
    flag: 't',
    description: 'The verification token for makeflow callback',
  })
  token?: string;
}

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
    options: PublishOptions,
  ): Promise<void> {
    await file.assert();

    let definition = await file.json<any>();

    await this.publish(definition, options.token);

    console.info(
      `PowerApp "${definition.name}" has been successfully published!`,
    );
  }

  private async publish(definition: object, token?: string): Promise<void> {
    let result = schemaValidator.validate(definition, definitionSchema);

    if (result.errors.length) {
      let errorMessages = result.errors.map(({message}) => `- ${message}`);

      throw new Error(
        `Invalid PowerApp definition, reasons:\n${errorMessages.join('\n')}`,
      );
    }

    let {token: accessToken} = config;

    if (!accessToken) {
      throw new ExpectedError('Please login with `mf login` first');
    }

    await api.call('/power-app/publish', {
      definition,
      token,
    });
  }
}

function loadDefinitionJSONSchema(): object {
  let schemaJSON = FS.readFileSync(
    Path.join(__dirname, '../../power-app/schema.json'),
    'utf-8',
  );

  return JSON.parse(schemaJSON);
}
