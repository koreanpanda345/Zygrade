import { Logger } from "@deno-library/logger";
const logger = new Logger();

if (Deno.env.get("STATE") === "DEVELOPMENT") {
  logger.enableConsole();
  logger.disableFile();
} else {
  logger.disableConsole();
  logger.initFileLogger("./logs");
}

export default logger;
