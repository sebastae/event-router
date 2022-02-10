export type EventRouterOptions = {};

export type RouteOptions = {
    /**
     * Pass event to the fallback route if the event is not defined on this route
     */
    fallback: Route | undefined;
    /**
     * Pass events if the event is defined but no callbacks exist
     */
    fallbackOnNoCallbacks: boolean;
    /**
     * The name of the route. Mostly used by the router
     */
    name: string;
};

export type EventCallback = (e: Event) => any;
/**
 * The router has a few default routes:
 *  - default: default route that is used if no specific route is defined
 *  - before: handlers in this route is always called before the currently active route
 *  - after: handlers in this route is always called after the currently active route
 */
export type EventRoutes = {
    default: Route;
    before: Route;
    after: Route;
    [k: string]: Route;
};
// Option defaults
const DEFAULT_EVENT_ROUTER_OPTIONS: EventRouterOptions = {};

const DEFAULT_ROUTE_OPTIONS: RouteOptions = {
    fallback: undefined,
    fallbackOnNoCallbacks: true,
    name: "",
};

// Data wrapper for planned functionality
export class Event {
    public data: any;
    constructor(data: any) {
        this.data = data;
    }
}

export default class EventRouter {
    private _options: EventRouterOptions;
    private _routes: EventRoutes;
    private _active: Route;

    constructor(options?: Partial<EventRouterOptions>) {
        // Ensure all fields have values
        this._options = {
            ...DEFAULT_EVENT_ROUTER_OPTIONS,
            ...options,
        } as EventRouterOptions;

        this._routes = {
            default: new Route(),
            before: new Route(),
            after: new Route(),
        };

        this._active = this._routes.default;
    }

    public route(name: string, options?: Partial<RouteOptions>): Route {
        if (this._routes.hasOwnProperty(name)) {
            return this._routes[name];
        } else {
            if (name in this._routes) {
                throw "Cannot create route with reserved name";
            }

            this._routes[name] = new Route({ ...options, name });
            return this._routes[name];
        }
    }

    public emit(event: string, data?: any): EventRouter {
        this._routes.before.emit(event, data);
        if (this._active) {
            this._active.emit(event, data);
        }
        this._routes.after.emit(event, data);
        return this;
    }

    public setActive(route: string | Route): EventRouter {
        if (typeof route === "string") {
            if (this._routes.hasOwnProperty(route)) {
                this._active = this._routes[route];
            } else {
                throw "Cannot set undefined route as active";
            }
        } else {
            this._active = route;
        }
        return this;
    }

    public hasRoute(name: string): boolean {
        return this._routes.hasOwnProperty(name);
    }

    public getRoute(name: string): Route | undefined {
        // Check for property so only actual routes can be returned
        if (this.hasRoute(name)) {
            return this._routes[name];
        }
        return undefined;
    }

    public get active(): Route {
        return this._active;
    }
}

export class Route {
    private _options: RouteOptions;
    private _handlers: { [k: string]: EventCallback[] };

    constructor(options?: Partial<RouteOptions>) {
        // Ensure all fields have values
        this._options = {
            ...DEFAULT_ROUTE_OPTIONS,
            ...options,
        };

        this._handlers = {};
    }

    private _emitFallback(event: string, data: any) {
        if (this._options.fallback) {
            this._options.fallback.emit(event, data);
        }
    }

    public on(event: string, callback: EventCallback): Route {
        if (event in this._handlers) {
            this._handlers[event].push(callback);
        } else {
            this._handlers[event] = [callback];
        }
        return this;
    }

    public off(event: string | EventCallback, fn?: EventCallback): Route {
        if (typeof event === "string") {
            if (fn == undefined) {
                // Remove all listeners for event name
                if (this._handlers.hasOwnProperty(event)) {
                    delete this._handlers[event];
                }
            } else {
                // Remove the specified callback for this event
                if (
                    this._handlers.hasOwnProperty(event) &&
                    this._handlers[event].includes(fn)
                ) {
                    this._handlers[event].splice(
                        this._handlers[event].indexOf(fn),
                        1
                    );
                }
            }
        } else {
            // Search through all handlers and remove specified callback
            Object.values(this._handlers).forEach(
                (callbacks: EventCallback[]) => {
                    if (callbacks.includes(event)) {
                        callbacks.splice(callbacks.indexOf(event), 1);
                    }
                }
            );
        }
        return this;
    }

    public emit(event: string, data?: any): Route {
        const ev = new Event(data);
        if (this._handlers.hasOwnProperty(event)) {
            if (this._handlers[event].length !== 0) {
                this._handlers[event].forEach((fn: EventCallback) => fn(ev));
            } else {
                if (this._options.fallbackOnNoCallbacks) {
                    this._emitFallback(event, data);
                }
            }
        } else {
            this._emitFallback(event, data);
        }
        return this;
    }

    public getName(): string {
        return this._options.name;
    }

    public getOptions(): RouteOptions {
        return { ...this._options }; // Return a copy of the current options
    }
}
