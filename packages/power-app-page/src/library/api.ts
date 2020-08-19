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
