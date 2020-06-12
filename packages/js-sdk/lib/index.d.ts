import { JsSDK } from '@makeflow/types';
declare class Makeflow implements JsSDK.API {
    private timestampToResolveMap;
    constructor();
    modal(params: JsSDK.ModalEvent['request']): void;
    message(params: JsSDK.MessageEvent['request']): void;
    getUserInfo(): Promise<JsSDK.UserInfoEvent['response']>;
    private send;
    private request;
}
export default function (): Makeflow;
export {};
