import ClientCache from "../core/cache.ts";

let uniqueFilePathCounter = 0;
export async function loadFiles(dir: string) {
  const foldersPath = `./src/${dir}`;
  const dirFolders = Deno.readDirSync(foldersPath);

  for (const folder of dirFolders) {
    if (folder.isFile && folder.name.endsWith(".ts")) { // we are assuming that it is an event file
      const filePath = `${foldersPath}/${folder.name}#${uniqueFilePathCounter}`
        .replace("src/", "../");
      console.log(`Loading ${filePath}`);
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
        console.log(`Loading ${filePath}`);
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
            ClientCache.quests.set(_file.name, _file);
            break;
        }
      }
    }
    uniqueFilePathCounter++;
  }
}

// let uniqueFilePathCounter = 0;
// let paths: string[] = [];

// export async function importDirectories(path: string) {
// 	const files = Deno.readDirSync(Deno.realPathSync(path));
// 	const folder = path.substring(path.indexOf("/src/") + 5);
// 	if (!folder.includes("/")) console.log(`Loading ${folder}...`);

// 	for (const file of files) {
// 		if (!file.name) continue;

// 		const currentPath = `${path}/${file.name}`.replace("\\", "/");
// 		if (file.isFile) {
// 			if (!currentPath.endsWith(".ts")) continue;
// 			paths.push(`import "${Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))}/${currentPath.substring(currentPath.indexOf("src/"))}#${uniqueFilePathCounter}";`);
// 			continue;
// 		}

// 		await importDirectories(currentPath);
// 	}

// 	uniqueFilePathCounter++;
// }

// export async function fileLoader() {
// 	await Deno.writeTextFile("fileloader.ts", paths.join("\n").replace("\\", "/"));
// 	await import (`${
// 		Deno.mainModule.substring(0, Deno.mainModule.lastIndexOf("/"))
// 	}/fileloader.ts#${uniqueFilePathCounter}`);
// 	paths = [];
// }
