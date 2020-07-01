import {API} from '@makeflow/types';
import {UserId} from '@makeflow/types-nominal';

export interface PageEvent {
  type: 'page';
  eventObject: PageEventObject;
  response(data: API.PowerAppPage.HookReturn): void;
}

type _PageEventObject = PageRequestEventObject;

export interface PageEventParams {
  name: string;
  type: 'request';
}

export type PageEventObject<
  TPageEventObject extends _PageEventObject = _PageEventObject
> = {
  params: PageEventParams;
} & TPageEventObject;

export interface PageRequestEventObject {
  payload: API.PowerAppPage.RequestHookParams & {
    // TODO
    user: {
      id: UserId;
    };
    path?: string;
  };
}
