import ClientCache from "../core/cache.ts";
import logger from "./logger.ts";

let uniqueFilePathCounter = 0;
export async function loadFiles(dir: string) {
  const foldersPath = `./src/${dir}`;
  const dirFolders = Deno.readDirSync(foldersPath);

  for (const folder of dirFolders) {
    if (folder.isFile && folder.name.endsWith(".ts")) { // we are assuming that it is an event file
      const filePath = `${foldersPath}/${folder.name}#${uniqueFilePathCounter}`
        .replace("src/", "../");
      logger.debug('utils - fs', `Loading ${filePath}`);
      const { default: file } = await import(`${filePath}`);
      const _file = new file();
      switch (dir) {
        case "events":
          ClientCache.events.set(_file.name, _file);
          break;
        case "simulators":
          ClientCache.simulators.set(_file.name, _file);
          break;
      }
    } else {
      const filesPath = `${foldersPath}/${folder.name}`;
      const dirFiles = Deno.readDirSync(filesPath).filter((file) =>
        file.name.endsWith(".ts")
      );
      for (const dirFile of dirFiles) {
        const filePath = `${filesPath}/${dirFile.name}#${uniqueFilePathCounter}`
          .replace("src/", "../");
        logger.debug('process - fs', `Loading ${filePath}`);
        const { default: file } = await import(`${filePath}`);
        const _file = new file();

        switch (dir) {
          case "commands":
            ClientCache.commands.set(_file.data.name, _file);
            break;
          case "monitors":
            ClientCache.monitors.set(_file.name, _file);
            break;
          case "process":
            ClientCache.process.set(_file.name, _file);
            break;
          case "tasks":
            ClientCache.tasks.set(_file.name, _file);
            break;
          case "quests":
            ClientCache.quests.set(_file.questId, _file);
            break;
        }
      }
    }
    uniqueFilePathCounter++;
  }
}
