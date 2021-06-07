import {Command, command, metadata} from 'clime';
import prompts, {Choice} from 'prompts';

import {setConfig} from '../config';

const RC_DEFAULT = {
  development: {
    api: 'http://localhost:8060/api/v1',
  },
  production: {
    api: 'https://www.makeflow.com/api/v1',
  },
};

@command({
  description: 'Switch .mfrc template (will clear token).',
})
export default class extends Command {
  @metadata
  async execute(): Promise<void> {
    let answer = await prompts({
      type: 'select',
      message: 'Please select template of .mfrc file.',
      name: 'mode',
      choices: Object.entries(RC_DEFAULT).map<Choice>(([mode, json]) => ({
        title: mode,
        value: json,
      })),
    });

    setConfig(answer.mode);
  }
}
