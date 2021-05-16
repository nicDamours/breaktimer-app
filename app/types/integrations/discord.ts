import {IntegrationsSettings} from "./integrationsSettings"

export interface DiscordSettings extends IntegrationsSettings {
  access_token: string
  refresh_token: string
  token_expiring_date: number
  targetBotUrl: string
  targetGuild: string
  suffix: string
}
