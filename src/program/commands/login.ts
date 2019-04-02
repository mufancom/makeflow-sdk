import * as FS from 'fs';

import {Command, Options, command, metadata, option} from 'clime';
import prompts, {Choice} from 'prompts';

import {API_BASE_URL, CONFIG_FILE} from '../config';
import {API} from '../core';

const api = new API(API_BASE_URL);

interface MFUserCandidate {
  id: string;
  username: string;
  organization: {
    id: string;
    displayName: string;
  };
  profile: {
    fullName: string;
    avatar: string;
    email: string;
  };
}

class LoginCommandOptions extends Options {
  @option({
    flag: 'u',
    description: 'Username',
  })
  username!: string;

  @option({
    flag: 'p',
    description: 'Password',
  })
  password!: string;

  async getUsernameAndPassword(): Promise<{
    username: string;
    password: string;
  }> {
    let username = this.username;
    let password = this.password;

    if (!username) {
      let answer = await prompts({
        type: 'text',
        name: 'username',
        message: 'Username',
      });

      username = answer.username;
    }

    if (!username) {
      throw new Error('username is required');
    }

    if (!password) {
      let answer = await prompts({
        type: 'password',
        name: 'password',
        message: 'Password',
      });

      password = answer.password;
    }

    if (!password) {
      throw new Error('password is required');
    }

    return {
      username,
      password,
    };
  }
}

@command({
  description: 'Log in to Makeflow.',
})
export default class extends Command {
  @metadata
  async execute(options: LoginCommandOptions): Promise<void> {
    let {username, password} = await options.getUsernameAndPassword();

    await this.createAccessToken(username, password);

    console.info(`🎉 Login succeeded`);
  }

  private async getUserId(username: string, password: string): Promise<string> {
    let result = await api.post<MFUserCandidate[]>(
      '/account/list-user-candidates',
      {
        mobile: username,
        password,
      },
    );

    let userId: string;

    if (result.length > 1) {
      let answer = await prompts({
        type: 'select',
        message: "What's your active user",
        name: 'userId',
        choices: result.map<Choice>(
          ({id, username, organization, profile}) => ({
            title: `${organization.displayName} - @${
              profile.fullName
            }(${username})`,
            value: id,
          }),
        ),
      });

      userId = answer.userId;
    } else {
      userId = result[0].id;
    }

    if (!userId) {
      throw new Error('Account not available');
    }

    return userId;
  }

  private async createAccessToken(
    username: string,
    password: string,
  ): Promise<void> {
    let userId = await this.getUserId(username, password);

    let accessToken = await api.post('/access-token/create', {
      mobile: username,
      password,
      user: userId,
      permissions: ['power-app:publish'],
    });

    let appConfigData = {accessToken: undefined};

    try {
      let appConfigJSONData = FS.readFileSync(CONFIG_FILE, 'utf8') || '{}';

      appConfigData = JSON.parse(appConfigJSONData);
    } catch (error) {}

    appConfigData.accessToken = accessToken;

    FS.writeFileSync(
      CONFIG_FILE,
      `${JSON.stringify(appConfigData, undefined, 2)}\n`,
      'utf8',
    );
  }
}
