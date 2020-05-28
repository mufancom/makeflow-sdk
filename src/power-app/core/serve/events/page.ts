import {API} from '@makeflow/types';

import {PowerAppVersion} from '../../types';

export interface PageEvent {
  type: 'page';
  eventObject: PageEventObject;
  response(data: API.PowerAppPage.HookReturn): void;
}

type _PageEventObject = PageLoadEventObject;

export interface PageEventParams {
  name: string;
  type: Exclude<keyof PowerAppVersion.Page.Definition, 'migrations'>;
}

export type PageEventObject<
  TPageEventObject extends _PageEventObject = _PageEventObject
> = {
  params: PageEventParams;
} & TPageEventObject;

export interface PageLoadEventObject {
  payload: API.PowerAppPage.LoadHookParams;
}
