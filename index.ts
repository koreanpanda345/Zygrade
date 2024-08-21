import mongoose from "mongoose";
import DiscordClient from "./src/DiscordClient";
import logger from "./src/utils/logger";

export const discordClient = new DiscordClient();

logger.info("---------------------------------------------------");
await discordClient.run();
await mongoose.connect(Bun.env.MONGODB_TRAINER_URI as string);