import {JsSDK} from '@makeflow/types';

const REQUEST_TIMEOUT = 10000;

class Makeflow implements JsSDK.API {
  private timestampToResolveMap = new Map<
    number,
    (value?: any | PromiseLike<any>) => void
  >();

  constructor() {
    window.addEventListener('message', ({data}) => {
      if (!assertResponseEvent(this, data)) {
        return;
      }

      let resolver = this.timestampToResolveMap.get(data.timestamp);

      if (!resolver) {
        return;
      }

      this.timestampToResolveMap.delete(data.timestamp);

      resolver(data.response);
    });
  }

  modal(params: JsSDK.ModalEvent['request']): void {
    this.send('modal', params);
  }

  message(params: JsSDK.MessageEvent['request']): void {
    this.send('message', params);
  }

  async getUserInfo(): Promise<JsSDK.UserInfoEvent['response']> {
    return this.request('getUserInfo', {});
  }

  private send(
    type: JsSDK.Event['type'],
    params: JsSDK.Event['request'],
  ): void {
    let timestamp = Date.now();

    window.parent.postMessage(
      {
        type,
        request: params,
        timestamp,
      },
      '*',
    );
  }

  private request<T>(
    type: JsSDK.Event['type'],
    params: JsSDK.Event['request'],
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      let timestamp = Date.now();

      window.parent.postMessage(
        {
          type,
          request: params,
          timestamp,
        },
        '*',
      );

      let timer = setTimeout(reject, REQUEST_TIMEOUT);

      this.timestampToResolveMap.set(timestamp, (value: any) => {
        resolve(value);
        clearTimeout(timer);
      });
    });
  }
}

export default function (): Makeflow {
  return new Makeflow();
}

function assertResponseEvent(
  api: JsSDK.API,
  event: any,
): event is JsSDK.ResponseEvent {
  return !!(event?.type && event.type in api && event?.timestamp);
}
