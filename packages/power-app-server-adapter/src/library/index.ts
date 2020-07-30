export interface AdapterServeOptions {
  host?: string;
  port?: number;
  path?: string;
}

export interface AdapterMiddlewareOptions {
  path?: string;
}

export type PowerAppRoutePath =
  | string
  | {
      name: string;
      optional?: boolean;
    };

export type PowerAppRouteMethod = 'get' | 'post';

export interface PowerAppRoute<TType, TParams, TBody, TResponse> {
  type: TType;
  paths: PowerAppRoutePath[];
  method?: PowerAppRouteMethod;
  validator?(params: TParams): boolean;
  handler({
    type,
    body,
    params,
  }: {
    type: TType;
    params: TParams;
    body: TBody;
  }): Promise<TResponse>;
}

export interface PowerAppAdapterDefinition<
  TType = string,
  TParams = any,
  TBody = any,
  TResponse = any
> {
  routes: PowerAppRoute<TType, TParams, TBody, TResponse>[];
  authenticate?(body: TBody): boolean;
}

export type PowerAppAdapter<TMiddleware> = (
  definition: PowerAppAdapterDefinition,
) => {
  middleware(
    middlewareOptions?: AdapterMiddlewareOptions | string,
  ): TMiddleware;
  serve(serveOptions?: AdapterServeOptions): void;
};
