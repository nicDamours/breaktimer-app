import axios  from "axios"
import {BaseIntegration} from "../BaseIntegration"
import {DiscordSettings} from "../../../../types/integrations/discord"
import {getSettings} from "../../store"
import {DiscordAuthService} from "../../../../shared/integrations/DiscordAuthService"

export class DiscordIntegration extends BaseIntegration {
  constructor() {
    super()
  }

  async handleBreakStart(): Promise<any> {
    return this.pingBotToChangeNickname()
  }

  async handleBreakEnd(): Promise<any> {
    return this.pingBotToChangeNickname()

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
      "targetGuild": 0,
      "targetBotUrl": "",
      "token_expiring_date": 0
    }
  }

  async pingBotToChangeNickname(): Promise<void> {
    try {
      const settings = getSettings()
      const integrationSettings: DiscordSettings = settings.integrations.discord as DiscordSettings

      let accessToken = integrationSettings.access_token

      const discordService = new DiscordAuthService(integrationSettings.refresh_token, integrationSettings.token_expiring_date)

      if (discordService.isTokenDueForRefresh()) {
        const refreshResponse = await discordService.attemptRefresh()
        this.saveNewTokens(refreshResponse.data)
        accessToken = refreshResponse.data.access_token
      }

      return axios.patch(`${this.formatBotUrlProperly(integrationSettings.targetBotUrl)}nickname/${integrationSettings.targetGuild}`, {
        suffix: integrationSettings.suffix
      }, {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      })
    } catch (e) {
      console.error(e)
    }
  }

  formatBotUrlProperly(url) {
    return url.endsWith('/') ? url : `${url}/`
  }

  saveNewTokens(tokenData) {
    this.setIntegrationSettings({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expiring_date: new Date().getTime() + (tokenData.expires_in * 1000)
    })
  }
}
