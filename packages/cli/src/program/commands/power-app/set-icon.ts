import * as QueryString from 'querystring';

import {
  Castable,
  Command,
  ExpectedError,
  Options,
  command,
  metadata,
  option,
} from 'clime';
import Mime from 'mime';

import {config} from '../../config';
import {API} from '../../core';

const api = new API(config.api, config.token);

export class SetIconOptions extends Options {
  @option({
    flag: 'n',
    description: 'The name of the published power app',
    required: true,
  })
  name!: string;

  @option({
    flag: 'f',
    description: 'The file path of the icon',
    required: true,
  })
  file!: Castable.File;
}

@command({
  description: 'Set an icon for a published power app.',
})
export default class extends Command {
  @metadata
  async execute({name, file}: SetIconOptions): Promise<void> {
    await file.assert();

    let type = Mime.getType(file.fullName);

    if (!type) {
      throw new Error(`Cannot recognize the type of file "${file.fullName}"`);
    }

    let iconBuffer = await file.buffer();

    await this.updateIcon(name, iconBuffer, type);

    console.info(
      `The icon of powerApp "${name}" has been successfully updated!`,
    );
  }

  private async updateIcon(
    name: string,
    fileBuffer: Buffer,
    type: string,
  ): Promise<void> {
    let {token: accessToken} = config;

    if (!accessToken) {
      throw new ExpectedError('Please login with `mf login` first');
    }

    return api.upload(
      `/power-app/update-icon?${QueryString.stringify({name})}`,
      fileBuffer,
      type,
    );
  }
}
