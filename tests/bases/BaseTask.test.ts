import { assertEquals } from "@std/assert";

import BaseTask from "../../src/base/BaseTask.ts";

class TestTask extends BaseTask {
    constructor() {
        super("test");
    }

    override async invoke(...args: any[]) {
        return "Not yet implemented";
    }
}

Deno.test("BaseTask should initalize correctly", () => {
    const task = new TestTask();
    assertEquals(task.name, "test");
});

Deno.test("BaseTask should return correctly", async () => {
    const task = new TestTask();
    const result = await task.invoke();
    const expectedValue = "Not yet implemented";

    assertEquals(result, expectedValue, `Got: ${result}`);
});