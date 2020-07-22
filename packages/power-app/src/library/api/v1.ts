import {Readable} from 'stream';
import {URL} from 'url';

import {API as APITypes, PowerApp, Value} from '@makeflow/types';
import {
  OperationTokenToken,
  OrganizationId,
  ProcedureId,
  TagId,
  TaskId,
  TeamId,
  UserId,
} from '@makeflow/types-nominal';
import {CompositeValueDescriptor} from '@makeflow/types/value';
import fetch, {BodyInit} from 'node-fetch';
import {Dict} from 'tslang';

const JSON_CONTENT_TYPE = 'application/json;charset=UTF-8';
const STREAM_CONTENT_TYPE = 'application/octet-stream';

export type APISource = APITypes.PowerApp.BasicSource;

export interface RequestOptions {
  body?: string | Dict<any> | Buffer | NodeJS.ReadableStream;
  type?: string;
  requireAccessToken?: boolean;
}

export class API<TSourceObject extends APISource = APISource> {
  readonly version = 'v1';

  private accessToken: string | undefined;

  private operationToken: OperationTokenToken | undefined;

  get granted(): boolean {
    return !!this.accessToken;
  }

  constructor(private source: TSourceObject) {}

  setAccessToken(token: string | undefined): void {
    this.accessToken = token;
  }

  setOperationToken(token: OperationTokenToken | undefined): void {
    this.operationToken = token;
  }

  // account

  /**
   * 获取当前登录账号下的用户
   * @accessToken
   */
  async getAccountListUsers(): Promise<UserCandidate[]> {
    return this.request('/account/list-users', {
      requireAccessToken: true,
    });
  }

  // power-app

  /**
   * 发布应用
   * @param definition 应用定义
   * @accessToken
   */
  async publishPowerApp(
    definition: PowerApp.DenominalizedRawDefinition,
  ): Promise<string | undefined> {
    return this.request('/power-app/publish', {
      requireAccessToken: true,
      body: {
        definition,
      },
    });
  }

  /**
   * 刷新应用凭证
   * @param name 应用名称
   * @accessToken
   */
  async refreshPowerAppToken(name: string): Promise<string | undefined> {
    return this.request('/power-app/refresh-token', {
      requireAccessToken: true,
      body: {
        name,
      },
    });
  }

  // power-checkable-custom-item

  /**
   * 更新超级自定义检查项
   * @params options.description 超级自定义检查项描述
   * @params options.stage 超级自定义检查项状态
   * @token
   */
  async updatePowerCheckableCustomItem(
    options: Omit<APITypes.PowerCustomCheckableItem.UpdateParams, 'token'>,
  ): Promise<void> {
    return this.request('/power-checkable-custom-item/update', {
      body: {
        token: this.operationToken,
        ...options,
      },
    });
  }

  // power-glance

  /**
   * 更新超级概览
   * @param dataSet 超级概览数据集合
   * @token
   */
  async updatePowerGlance(
    dataSet: APITypes.PowerGlance.DataSetEntry[],
  ): Promise<void> {
    return this.request('/power-glance/change', {
      body: {
        token: this.operationToken,
        dataSet,
      },
    });
  }

  /**
   * 初始化超级概览
   * @token
   */
  async initializePowerGlance(): Promise<
    APITypes.PowerGlance.InitializeResult
  > {
    return this.request('/power-glance/initialize', {
      body: {
        token: this.operationToken,
      },
    });
  }

  // power-item

  /**
   * 更新超级流程项
   * @params options.description 流程项描述
   * @params options.stage 流程项状态
   * @params options.outputs 输出
   * @token
   */
  async updatePowerItem(
    options: Omit<APITypes.PowerItem.UpdateParams, 'token'>,
  ): Promise<void> {
    return this.request('/power-item/update', {
      body: {
        token: this.operationToken,
        ...options,
      },
    });
  }

  // power-node

  /**
   * 更新超级节点
   * @params options.description 节点描述
   * @params options.stage 节点状态
   * @params options.outputs 输出
   * @token
   */
  async updatePowerNode(
    options: Omit<APITypes.PowerNode.UpdateParams, 'token'>,
  ): Promise<void> {
    return this.request('/power-node/update', {
      body: {
        token: this.operationToken,
        ...options,
      },
    });
  }

  // task

  /**
   * 创建任务
   * @params options.team 团队ID
   * @params options.procedure 流程ID
   * @params options.brief 任务简述
   * @params options.description 任务描述
   * @params options.tags 标签
   * @params options.assignee 负责人
   * @params options.outputs 任务输出
   * @params options.associatedTasks 关联任务信息
   * @params options.postponedTo 延后任务时间
   * @accessToken
   */
  async createTask(options: CreateTaskOptions): Promise<TaskId> {
    return this.request('/task/create', {
      requireAccessToken: true,
      body: options,
    });
  }

  /**
   * 更新任务
   * @params options.id 任务 ID
   * @params options.brief 任务简述
   * @params options.outputs 任务输出
   * @accessToken
   */
  async updateTask({id, ...restOptions}: UpdateTaskOptions): Promise<TaskId> {
    return this.request(`/task/update?id=${id}`, {
      requireAccessToken: true,
      body: restOptions,
    });
  }

  /**
   * 发送文件消息到任务
   * @param task 任务ID
   * @param body 文件内容
   * @param fileName 文件名
   * @param type 文件类型
   * @accessToken
   */
  async sendTaskFileMessage(
    task: TaskId,
    body: BodyInit,
    fileName: string,
    type: string,
  ): Promise<void> {
    await this.request(
      `/task/send-file-message?task=${task}&fileName=${encodeURIComponent(
        fileName,
      )}&type=${encodeURIComponent(type)}`,
      {
        requireAccessToken: true,
        type: STREAM_CONTENT_TYPE,
        body,
      },
    );
  }

  /**
   * 添加输出到任务
   * @param taskId 任务ID
   * @param outputs 键值对
   * @accessToken
   */
  async addTaskOutputs(
    task: TaskId,
    outputs: Dict<Value.CompositeValueDescriptor>,
  ): Promise<void> {
    return this.request('/task/add-outputs', {
      requireAccessToken: true,
      body: {
        task,
        outputs,
      },
    });
  }

  // user

  /**
   * 根据邮箱匹配用户
   * @param email 邮箱地址
   * @accessToken
   */
  async matchUser(email: string): Promise<string | undefined> {
    return this.request('/user/match', {
      requireAccessToken: true,
      body: {
        email,
      },
    });
  }

  private async request<TData>(
    path: string,
    {body, type = JSON_CONTENT_TYPE, requireAccessToken}: RequestOptions = {},
  ): Promise<TData> {
    let accessToken = this.accessToken;

    if (requireAccessToken && !accessToken) {
      throw new Error('ACCESS_TOKEN_IS_REQUIRED');
    }

    let baseURL = this.source.url;

    if (!baseURL) {
      throw new Error('BASE_URL_IS_REQUIRED');
    }

    let version = this.version;

    if (typeof body === 'object' && type === JSON_CONTENT_TYPE) {
      body = JSON.stringify(body);
    }

    if (
      !(Buffer.isBuffer(body) || body instanceof Readable) &&
      typeof body !== 'undefined' &&
      typeof body !== 'string'
    ) {
      throw new Error('POST_REQUEST_BODY_NOT_SUPPORT');
    }

    let response = await fetch(
      `${new URL(baseURL).origin}/api/${version}${path}`,
      {
        method: 'POST',
        body,
        headers: {
          'Content-Type': type,
          ...(requireAccessToken
            ? {'x-access-token': accessToken!}
            : undefined),
        },
      },
    );

    let result = await response.json();

    if ('error' in result) {
      let error = result.error;
      throw new Error(`[${error.code}] ${error.message}`);
    } else {
      return result.data as TData;
    }
  }
}

// types

export interface CreateTaskOptions {
  team: TeamId;
  procedure: ProcedureId;
  brief: string;
  description?: string;
  tags?: TagId[];
  assignee?: UserId;
  outputs?: Dict<Value.CompositeValueDescriptor>;
  associatedTasks?: TaskAssociation[];
  postponedTo?: number;
  assignmentConfirmed?: boolean;
}

export interface UpdateTaskOptions {
  id: TaskId;
  brief?: string;
  outputs?: Dict<CompositeValueDescriptor>;
}

export interface UserCandidate {
  id: UserId;
  username: string;
  organization: {
    id: OrganizationId;
    displayName: string;
  };
  profile:
    | {
        fullName?: string | undefined;
        avatar?: string | undefined;
        bio?: string | undefined;
        mobile?: string | undefined;
        email?: string | undefined;
        position?: string | undefined;
      }
    | undefined;
  disabled: boolean | undefined;
}

export interface TaskAssociation {
  type: 'blocked-by' | 'blocking' | 'related';
  task: TaskId;
}
