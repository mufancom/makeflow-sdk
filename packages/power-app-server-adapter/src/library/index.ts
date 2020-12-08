export interface AdapterServeOptions {
  host?: string;
  port?: number;
  path?: string;
}

export interface AdapterMiddlewareOptions {
  path?: string;
}

export type PowerAppRoutePathSegment =
  | string
  | {
      name: string;
      optional?: boolean;
    };

export type PowerAppRouteMethod = 'get' | 'post';

export interface PowerAppHandlerReturn {
  data?: any;
  error?: {
    status: number;
    msg?: string;
  };
}

export interface PowerAppRoute {
  type: string;
  path: PowerAppRoutePathSegment[];
  method?: PowerAppRouteMethod;
  handler({
    type,
    body,
    params,
  }: {
    type: string;
    params: any;
    body: any;
  }): Promise<PowerAppHandlerReturn>;
}

export interface PowerAppAdapterDefinition<> {
  routes: PowerAppRoute[];
}

export type PowerAppAdapter<TMiddleware> = (
  definition: PowerAppAdapterDefinition,
) => {
  middleware(
    middlewareOptions?: AdapterMiddlewareOptions | string,
  ): TMiddleware;
  serve(serveOptions?: AdapterServeOptions): void;
};
