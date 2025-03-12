import BaseProcess from "../../base/BaseProcess.ts";
import Databases from "../../databases/index.ts";
import { UserSettingsSchema } from "../../databases/models/Trainer/UserSettings.ts";

export default class GetOrCreateUserSettingsProcess extends BaseProcess {
  constructor() {
    super("get-or-create-user-settings");
  }

  override async invoke(userid: string) {
    let settings = await Databases.UserSettings.findOne({
      discordUserId: userid,
    });

    if (!settings) {
      const newSettings = {
        discordUserId: userid,
        allowEncounterPvP: true,
        displayLevelUpMessage: true,
      } as UserSettingsSchema;

      await Databases.UserSettings.insertOne(newSettings);
      settings = await Databases.UserSettings.findOne({
        discordUserId: userid,
      });
    }

    return settings;
  }
}
