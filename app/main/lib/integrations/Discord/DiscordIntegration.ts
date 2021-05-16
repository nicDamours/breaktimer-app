import {BaseIntegration} from "../BaseIntegration"
import {DiscordSettings} from "../../../../types/integrations/discord"

export class DiscordIntegration extends BaseIntegration {
  constructor() {
    super()
  }

  async handleBreakStart(): Promise<any> {
    super.handleBreakStart()
  }

  async handleBreakEnd(): Promise<any> {
    super.handleBreakEnd()
  }

  public getIntegrationKey(): string {
    return 'discord'
  }

  getIntegrationDefaultSettings(): DiscordSettings {
    return {
      "enabled": false,
      "access_token": "",
      "suffix": "",
      "refresh_token": "",
      "target_guild": "",
      "targetBotUrl": "",
      "token_expiring_date": 0
    }
  }
}
