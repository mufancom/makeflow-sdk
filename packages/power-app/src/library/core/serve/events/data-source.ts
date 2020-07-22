import {API} from '@makeflow/types';

export interface DataSourceEvent {
  type: 'data-source';
  eventObject: DataSourceEventObject;
  // TODO(boen): data-source 返回值校验
  response(data: any): void;
}

type _DataSourceEventObject = DataSourceRequestEventObject;

export interface DataSourceEventParams {
  name: string;
  type: 'request';
}

export type DataSourceEventObject<
  TDataSourceEventObject extends _DataSourceEventObject = _DataSourceEventObject
> = {
  params: DataSourceEventParams;
} & TDataSourceEventObject;

export interface DataSourceRequestEventObject {
  payload: API.ProcedureField.DataSourceParams;
}
