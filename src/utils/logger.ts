import winston, { transports } from "winston";
const { combine, timestamp, label, printf } = winston.format;

const consoleFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}] [${label}] (${level}): ${message}`;
});

const fileFormat = printf(({ level, message, label, timestamp }) => {
  return `[${timestamp}]\t[${label}]\n\t↳(${level}): ${message}`;
});

const getCurrentDate = () => {
  const date = new Date(Date.now());
  return date;
};

export default function createLogger(name: string) {
  const date = getCurrentDate();
  const logger = winston.createLogger({
    format: combine(label({ label: name }), timestamp(), fileFormat),
    transports: [
      new transports.File({
        filename:
          `logs/${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/errors.log`,
        level: "error",
      }),
      new transports.File({
        filename:
          `logs/${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/info.log`,
        level: "info",
      }),
      new transports.File({
        filename:
          `logs/${date.getFullYear()}/${date.getMonth()}/${date.getDate()}/warnings.log`,
        level: "warn",
      }),
      new transports.Console({
        level: "debug",
        format: combine(label({ label: name }), timestamp(), consoleFormat),
      }),
    ],
  });

  if (Deno.env.get("WORKSPACE_STATE") !== "DEVELOPMENT") {
    logger.remove(winston.transports.Console);
  }

  return logger;
}
