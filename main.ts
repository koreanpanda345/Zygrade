import ClientCache from "./src/core/cache.ts";
import DiscordClient from "./src/core/discord.ts";
import { loadFiles } from "./src/utils/fs.ts";

export const discordClient = new DiscordClient();
await Promise.all(
  [
    "commands",
    "events",
    "monitors",
    "process",
    "simulators",
    "quests",
  ].map(async (dir) => await loadFiles(dir)),
);

await discordClient.run();
