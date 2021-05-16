import axios  from "axios"
import {BaseIntegration} from "../BaseIntegration"
import {DiscordSettings} from "../../../../types/integrations/discord"
import {getSettings} from "../../store"

export class DiscordIntegration extends BaseIntegration {
  constructor() {
    super()
  }

  async handleBreakStart(): Promise<any> {
    await this.pingBotToChangeNickname()
  }

  async handleBreakEnd(): Promise<any> {
    await this.pingBotToChangeNickname()

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
      "targetGuild": "",
      "targetBotUrl": "",
      "token_expiring_date": 0
    }
  }

  pingBotToChangeNickname(): Promise<void> {
    try {
      const settings = getSettings()
      const integrationSettings: DiscordSettings = settings.integrations.discord as DiscordSettings

      return axios.patch(`${integrationSettings.targetBotUrl}nickname/${integrationSettings.targetGuild}`, {
        suffix: integrationSettings.suffix
      }, {
        headers: {
          "Authorization": `Bearer ${integrationSettings.access_token}`
        }
      })
    } catch (e) {
      console.log(e.message, e.response.data.message)
    }
  }
}
