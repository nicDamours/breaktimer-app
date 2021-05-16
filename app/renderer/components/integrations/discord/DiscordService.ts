import axios from "axios"
import {DiscordLocalStorageService} from "./DiscordLocalStorageService"

export class DiscordService {

  private readonly DISCORD_API_URL = process.env.REACT_APP_DISCORD_API_URL || 'https://discord.com/api'
  private readonly DISCORD_CLIENT_ID = process.env.REACT_APP_DISCORD_CLIENT_ID || '800040443412086804'
  private readonly DISCORD_CLIENT_SECRET = process.env.REACT_APP_DISCORD_CLIENT_SECRET || 'rgut8lzHTxYJcjG--_Fb54k5iWU2MZi1'
  private readonly DISCORD_REDIRECT_URI = process.env.REACT_APP_DISCORD_REDIRECT_URI || 'http://localhost:3000'

  private accessToken: string | null
  private refreshToken: string | null
  private tokenExpiring: number | null
  private updateSettingFunction: (name: string, property: string, value: any) => void

  constructor(updateSettingFunction: (name: string, property: string, value: any) => void,
    accessToken?: string,
    refreshToken?: string,
    tokenExpiring?: number) {

    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.tokenExpiring = tokenExpiring
    this.updateSettingFunction = updateSettingFunction
  }

  async fetchServers() {
    if (this.accessToken && this.refreshToken) {

      if (DiscordLocalStorageService.isCachedDataStillValid()) {
        return DiscordLocalStorageService.fetchServersFromCachedData()
      }

      if (this.isTokenDueForRefresh()) {
        await this.attemptRefresh()
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

        console.log(servers)

        DiscordLocalStorageService.cacheServerData(servers)

        return servers
      } catch (e) {
        if (e.status === 401) {
          await this.attemptRefresh()
          return this.fetchServers()
        } else {
          throw e
        }
      }
    } else {
      console.error("No token defined could not fetch guilds.")
    }
  }

  async attemptRefresh() {
    if (!this.refreshToken) {
      throw new Error("Could not refresh, no refresh token available.")
    }

    const requestParams = new URLSearchParams()
    requestParams.append('client_id', this.DISCORD_CLIENT_ID)
    requestParams.append('client_secret', this.DISCORD_CLIENT_SECRET)
    requestParams.append('grant_type', 'refresh_token')
    requestParams.append('refresh_token', this.refreshToken)

    const response = await axios.post(`${this.DISCORD_API_URL}/oauth2/token`, requestParams)

    if (response.status === 200) {
      this.updateSettings(response.data)
    }
  }

  updateSettings(data) {
    this.accessToken = data.access_token
    this.refreshToken = data.refresh_token
    this.tokenExpiring = new Date().getTime() + data.expires_in

    this.updateSettingFunction.call({}, 'discord', {
      access_token: this.accessToken,
      refresh_token: this.refreshToken,
      token_expiring_date: this.tokenExpiring
    })
  }

  async attemptLogin(code) {
    const requestParams = new URLSearchParams()
    requestParams.append('client_id', this.DISCORD_CLIENT_ID)
    requestParams.append('client_secret', this.DISCORD_CLIENT_SECRET)
    requestParams.append('grant_type', 'authorization_code')
    requestParams.append('code', code)
    requestParams.append('redirect_uri', this.DISCORD_REDIRECT_URI)

    const response = await axios.post(`${this.DISCORD_API_URL}/oauth2/token`, requestParams)

    if (response.status === 200) {
      this.updateSettings(response.data)
    }
  }

  isTokenDueForRefresh(): boolean {
    // if the token is due in less than an hour, we refresh it.
    return new Date().getTime() >= this.tokenExpiring - (60 * 60)
  }

  getDiscordOauthUrl(): string {
    return `${this.DISCORD_API_URL}/oauth2/authorize?client_id=${this.DISCORD_CLIENT_ID}&redirect_uri=${this.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20guilds`
  }
}
