import {API} from '@makeflow/types';

export interface PowerCustomCheckableItemEvent {
  type: 'power-custom-checkable-item';
  eventObject: PowerCustomCheckableItemEventObject;
  response(data: API.PowerCustomCheckableItem.HookReturn): void;
}

export interface PowerCustomCheckableItemEventParams {
  name: string;
}

export interface PowerCustomCheckableItemEventObject {
  params: PowerCustomCheckableItemEventParams;
  payload: API.PowerCustomCheckableItem.HookParams;
}
