import { assertEquals } from "@std/assert";

import BaseMonitor from "../../src/base/BaseMonitor.ts";


class TestMonitor extends BaseMonitor {
    constructor() {
        super("test");
    }

    override async invoke(...args: any[]) {
        return "Not yet implemented";
    }
}

Deno.test("BaseMonitor should initalize correctly", () => {
    const monitor = new TestMonitor();
    assertEquals(monitor.name, "test");
});

Deno.test("BaseMonitor should return correctly", async () => {
    const monitor = new TestMonitor();
    const result = await monitor.invoke();
    const expectedValue = "Not yet implemented";

    assertEquals(result, expectedValue, `Got: ${result}`);
});