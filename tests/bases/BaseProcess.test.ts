import { assertEquals } from "@std/assert";

import BaseProcess from "../../src/base/BaseProcess.ts";

class TestProcess extends BaseProcess {
  constructor() {
    super("test");
  }

  override async invoke(...args: any[]) {
    return "Not yet implemented";
  }
}

Deno.test("BaseProcess should initalize correctly", () => {
  const process = new TestProcess();
  assertEquals(process.name, "test");
});

Deno.test("BaseProcess should return correctly", async () => {
  const process = new TestProcess();
  const result = await process.invoke();
  const expectedValue = "Not yet implemented";

  assertEquals(result, expectedValue, `Got: ${result}`);
});
