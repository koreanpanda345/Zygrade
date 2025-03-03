import { assertEquals } from "@std/assert";
import BaseCommand from "../../src/base/BaseCommand.ts";
import { CommandInteraction } from "discord.js";

class TestCommand extends BaseCommand {
    constructor() {
        super("test"," this is a test command", (data) => data);
    }

    override async invoke(interaction: CommandInteraction) {
        return "Not yet implemented";
    }
}

Deno.test("BaseCommand should execute correctly", async () => {
    const command = new TestCommand();
    const interaction = {
        commandName: "test",
        options: {
            getString: () => "test",
        },
    } as unknown as CommandInteraction;
    const result = await command.invoke(interaction);
    const expectedValue = "Not yet implemented";

    assertEquals(result, expectedValue, `Got: ${result}`)
});