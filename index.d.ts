declare module "main" {
    type handleResult = any | Response;
    type handleFunction = (request: RouterRequest) => (handleResult | Promise<handleResult>);
    type RouterRequest = Request & {
        params?: any;
        querys?: any;
    };
    type Method = 'GET' | 'POST' | 'PUT' | 'HEAD' | 'DELETE' | 'CONNECT' | 'OPTIONS' | 'TRACE' | 'PATCH';
    export default class Router {
        routes: Map<{
            path: string;
            type: Method;
        }, handleFunction>;
        get(path: string, handle: handleFunction): void;
        post(path: string, handle: handleFunction): void;
        responseInit: ResponseInit;
        constructor(headers?: ResponseInit);
        route(request: Request): Promise<Response | null>;
    }
}
