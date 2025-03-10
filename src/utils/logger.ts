import { createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf } = format;

const consoleFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] [${label}] (${level}): ${message}`;
});

const fileFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}]\t[${label}]\n\t↳(${level}): ${message}`;
});

const logger = createLogger({
  level: "debug",
  format: combine(label({ label: "discord" }), timestamp(), fileFormat),
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

if (Deno.env.get("WORKSPACE_STATE".toUpperCase()) !== "PRODUCTION") {
  logger.add(
    new transports.Console({
      format: combine(label({ label: "discord" }), timestamp(), consoleFormat),
    }),
  );
}

export default logger;
