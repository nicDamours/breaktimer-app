import axios from "axios"
import {DiscordAuthService} from "../../../../shared/integrations/DiscordAuthService"
import {DiscordLocalStorageService} from "./DiscordLocalStorageService"

export class DiscordRendererService extends DiscordAuthService {
  private accessToken: string | null
  private updateSettingFunction: (name: string, property: string, value: any) => void

  constructor(updateSettingFunction: (name: string, property: string, value: any) => void,
    accessToken?: string,
    refreshToken?: string,
    tokenExpiring?: number) {
    super(
      process.env.REACT_APP_DISCORD_API_URL,
      process.env.REACT_APP_DISCORD_CLIENT_ID,
      process.env.REACT_APP_DISCORD_CLIENT_SECRET,
      process.env.REACT_APP_DISCORD_REDIRECT_URI,
      refreshToken,
      tokenExpiring)

    this.accessToken = accessToken
    this.updateSettingFunction = updateSettingFunction
  }

  async fetchServers() {

    if (this.accessToken && this.refreshToken) {

      if (DiscordLocalStorageService.isCachedDataStillValid()) {
        return DiscordLocalStorageService.fetchServersFromCachedData()
      }

      if (this.isTokenDueForRefresh()) {
        await this.attemptRefreshAndUpdateSettings()
      }

      try {
        const {data} = await axios.get(`${this.DISCORD_API_URL}/users/@me/guilds`, {
          headers: {
            authorization: `Bearer ${this.accessToken}`
          }
        })

        const servers = [
          ...[{
            label: "No value",
            value: "0"
          }],
          ...data.map(item => ({
            label: item.name,
            value: item.id
          }))]

        DiscordLocalStorageService.cacheServerData(servers)

        return servers
      } catch (e) {
        if (e.status === 401) {
          await this.attemptRefreshAndUpdateSettings()
          return this.fetchServers()
        } else {
          throw e
        }
      }
    } else {
      return Promise.resolve([])
    }
  }

  async attemptRefreshAndUpdateSettings() {
    const response = await this.attemptRefresh()

    if (response.status === 200) {
      this.updateSettings(response.data)
    }
  }

  updateSettings(data) {
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token
    this.tokenExpiring = new Date().getTime() + (data.expires_in * 1000)

    this.updateSettingFunction.call({}, 'discord', {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      token_expiring_date: this.tokenExpiring
    })
  }

  async attemptLoginAndUpdateSettings(code) {
    const response = await this.attemptLogin(code)

    if (response.status === 200) {
      this.updateSettings(response.data)
    }
  }

  setTokens(accessToken, refreshToken, tokenExpiring) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.tokenExpiring = tokenExpiring
  }
}
