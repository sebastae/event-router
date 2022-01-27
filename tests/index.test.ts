import EventRouter from "../src/index";

describe("EventRouter", () => {
    describe("constructor", () => {
        it("should successfully construct with empty constructor", () => {
            const er = new EventRouter();
            expect(er).toBeDefined();
        });
    });
});
