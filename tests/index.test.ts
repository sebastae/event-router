import EventRouter from "../src/index";
import { Route } from "../src/index";

describe("EventRouter", () => {
    describe("constructor", () => {
        it("should successfully construct with empty constructor", () => {
            const er = new EventRouter();
            expect(er).toBeDefined();
        });
    });

    describe("basic functionality", () => {
        let router: EventRouter;
        const routeName = "testRoute";
        beforeEach(() => {
            router = new EventRouter();
        });

        it("should create a new route", () => {
            expect(router.hasRoute(routeName)).toBe(false);
            router.route(routeName);
            expect(router.hasRoute(routeName)).toBe(true);
        });

        it("should set active route", () => {
            const route = router.route(routeName);
            router.setActive(routeName);

            expect(router.active).toBe(route);
        });

        it("should emit event for active route", () => {
            const fn = jest.fn(() => {});
            router.route(routeName).on("event", fn);
            router.setActive(routeName);
            router.emit("event");

            expect(fn).toBeCalled();
        });

        it("should not emit for non-active routes", () => {
            const fn = jest.fn(() => {});
            router.route(routeName).on("event", fn);
            router.emit("event");

            expect(fn).not.toBeCalled();
        });

        it("should have the default route on init", () => {
            expect(router.active).toBe(router.getRoute("default"));
        });

        it('should emit to the "before" and "after" routes', () => {
            const fn = jest.fn(() => {});
            router.getRoute("before").on("event", fn);
            router.getRoute("after").on("event", fn);
            router.emit("event");

            expect(fn).toBeCalledTimes(2);
        });
    });
});

describe("Route", () => {
    describe("constructor", () => {
        it("should successfully construct with empty parameters", () => {
            const route = new Route();
            expect(route).toBeDefined();
        });
        it("should successfully construct with partial options", () => {
            const route = new Route({ fallback: new Route() });
            expect(route).toBeDefined();
        });
    });

    describe("basic functions", () => {
        let route: Route;
        let callback: jest.Mock;
        let event: string;

        beforeEach(() => {
            route = new Route();
            callback = jest.fn(() => {});
            event = "testEvent";
        });

        it("should run callback after emitting added event", () => {
            route.on(event, callback);
            route.emit(event);

            expect(callback).toBeCalledTimes(1);
        });

        it("should not run callback after removing added event", () => {
            route.on(event, callback);
            route.off(event, callback);
            route.emit(event);

            expect(callback).not.toBeCalled();
        });
    });
});
