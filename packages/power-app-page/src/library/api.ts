import {PowerAppPageAPI} from '@makeflow/types';

export class PowerAppPage {
  private id = 0;

  private idToResolverMap = new Map<
    number,
    (value?: any | PromiseLike<any>) => void
  >();

  constructor() {
    window.addEventListener('message', ({data}) => {
      let {id, return: response} = (data ??
        {}) as PowerAppPageAPI.APIReturnResult;

      let resolver = this.idToResolverMap.get(id);

      if (!resolver) {
        return;
      }

      this.idToResolverMap.delete(id);

      resolver(response);
    });

    window.document.addEventListener(
      'click',
      () => this.clearAllPopups().catch(console.error),
      true,
    );
  }

  showMessage(params: PowerAppPageAPI.ShowMessageOptions): void {
    this.send('show-message', params);
  }

  async showModal<T>(params: PowerAppPageAPI.ShowModalOptions): Promise<T> {
    return this.request('show-modal', params);
  }

  setHeight(params: PowerAppPageAPI.SetHeightOptions): void {
    this.send('set-height', params);
  }

  async getUser(
    options: PowerAppPageAPI.GetUserOptions = {},
  ): Promise<PowerAppPageAPI.GetUserResult> {
    return this.request('get-user', options);
  }

  async selectUsers(
    context: Element | EventTarget,
    options?: Omit<PowerAppPageAPI.SelectUsersOptions, 'rect'>,
  ): Promise<PowerAppPageAPI.SelectUsersResult> {
    if (!(context instanceof Element)) {
      return;
    }

    return this.request('select-users', {
      rect: context.getBoundingClientRect(),
      ...options,
    });
  }

  async selectProcedures(
    context: Element | EventTarget,
    options?: Omit<PowerAppPageAPI.SelectProceduresOptions, 'rect'>,
  ): Promise<PowerAppPageAPI.SelectProceduresResult> {
    if (!(context instanceof Element)) {
      return;
    }

    return this.request('select-procedures', {
      rect: context.getBoundingClientRect(),
      ...options,
    });
  }

  async selectTags(
    context: Element | EventTarget,
    options?: Omit<PowerAppPageAPI.SelectTagsOptions, 'rect'>,
  ): Promise<PowerAppPageAPI.SelectTagsResult> {
    if (!(context instanceof Element)) {
      return;
    }

    return this.request('select-tags', {
      rect: context.getBoundingClientRect(),
      ...options,
    });
  }

  async clearAllPopups(): Promise<void> {
    return this.request('clear-all-popups', {});
  }

  close(): void {
    this.send('close', {});
  }

  private send(
    name: PowerAppPageAPI.APITypes['name'],
    options: PowerAppPageAPI.APITypes['options'],
  ): void {
    this.postMessage(name, options);
  }

  private request<T>(
    name: PowerAppPageAPI.APITypes['name'],
    options: PowerAppPageAPI.APITypes['options'],
  ): Promise<T> {
    return new Promise(resolve => {
      this.idToResolverMap.set(this.postMessage(name, options), resolve);
    });
  }

  private postMessage(
    name: PowerAppPageAPI.APITypes['name'],
    options: PowerAppPageAPI.APITypes['options'],
  ): number {
    let id = ++this.id;

    window.parent.postMessage(
      {
        id,
        name,
        options,
      } as PowerAppPageAPI.APICall,
      '*',
    );

    return id;
  }
}
