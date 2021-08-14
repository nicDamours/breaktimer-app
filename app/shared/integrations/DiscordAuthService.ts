import axios, {AxiosPromise} from "axios"

export class DiscordAuthService {
  protected DISCORD_API_URL;
  protected DISCORD_CLIENT_ID;
  protected DISCORD_CLIENT_SECRET;
  protected DISCORD_REDIRECT_URI;

  protected refreshToken: string | null
  protected tokenExpiring: number | null

  constructor(
    discordApiUrl: string,
    discordClientId: string,
    discordClientSecret: string,
    discordRedirectUri: string,
    refreshToken?: string,
    tokenExpiring?: number
  ) {
    this.DISCORD_API_URL = discordApiUrl
    this.DISCORD_CLIENT_ID = discordClientId
    this.DISCORD_CLIENT_SECRET = discordClientSecret
    this.DISCORD_REDIRECT_URI = discordRedirectUri

    this.refreshToken = refreshToken
    this.tokenExpiring = tokenExpiring
  }

  async attemptRefresh(): Promise<AxiosPromise> {
    if (!this.refreshToken) {
      throw new Error("Could not refresh, no refresh token available.")
    }

    const requestParams = new URLSearchParams()
    requestParams.append('client_id', this.DISCORD_CLIENT_ID)
    requestParams.append('client_secret', this.DISCORD_CLIENT_SECRET)
    requestParams.append('grant_type', 'refresh_token')
    requestParams.append('refresh_token', this.refreshToken)

    return axios.post(`${this.DISCORD_API_URL}/oauth2/token`, requestParams)
  }

  async attemptLogin(code) {
    const requestParams = new URLSearchParams()
    requestParams.append('client_id', this.DISCORD_CLIENT_ID)
    requestParams.append('client_secret', this.DISCORD_CLIENT_SECRET)
    requestParams.append('grant_type', 'authorization_code')
    requestParams.append('code', code)
    requestParams.append('redirect_uri', this.DISCORD_REDIRECT_URI)

    return axios.post(`${this.DISCORD_API_URL}/oauth2/token`, requestParams)
  }

  async attemptRevoke(access_token) {
    return Promise.all([this.revokeToken(this.refreshToken), this.revokeToken(access_token)])
  }

  async revokeToken(token) {
    const requestParams = new URLSearchParams()
    requestParams.append('client_id', this.DISCORD_CLIENT_ID)
    requestParams.append('client_secret', this.DISCORD_CLIENT_SECRET)
    requestParams.append('token', token)

    return axios.post(`${this.DISCORD_API_URL}/oauth2/token/revoke`, requestParams, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
  }

  isTokenDueForRefresh(): boolean {
    // if the token is due in less than an hour, we refresh it.
    return new Date().getTime() >= this.tokenExpiring - (60 * 60)
  }

  getDiscordOauthUrl(): string {
    return `${this.DISCORD_API_URL}/oauth2/authorize?client_id=${this.DISCORD_CLIENT_ID}&redirect_uri=${this.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20guilds`
  }
}
