import { assertEquals, assertThrows } from "@std/assert";
import BaseEvent from "../../src/base/BaseEvent.ts";

class TestEvent extends BaseEvent {
    constructor() {
        super("test");
    }

    override async invoke(...args: any[]) {
        return "Not yet implemented";
    }
}

Deno.test("BaseEvent should initalize correctly", () => {
    const event = new TestEvent();
    assertEquals(event.name, "test");
    assertEquals(event.onlyOnce, false);
});

Deno.test("BaseEvent should return correctly", async () => {
    const event = new TestEvent();
    const result = await event.invoke();
    const expectedValue = "Not yet implemented";

    assertEquals(result, expectedValue, `Got: ${result}`);
});