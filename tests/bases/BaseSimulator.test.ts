import { assertEquals } from "@std/assert";

import BaseSimulator from "../../src/base/BaseSimulator.ts";

class TestSimulator extends BaseSimulator {
    constructor() {
        super("test");
    }

    async invoke(...args: any[]) {
        return "Not yet implemented";
    }
}

Deno.test("BaseSimulator should initalize correctly", () => {
    const simulator = new TestSimulator();
    assertEquals(simulator.name, "test");
});

Deno.test("BaseSimulator should return correctly", async () => {
    const simulator = new TestSimulator();
    const result = await simulator.invoke();
    const expectedValue = "Not yet implemented";

    assertEquals(result, expectedValue, `Got: ${result}`);
});