import {DiscordIntegration} from "./integrations/Discord/DiscordIntegration"
import {BaseIntegration} from "./integrations/BaseIntegration"
import {IntegrationCacheManager} from "./integrations/IntegrationCacheManager"
import {Settings} from "../../types/settings"
import {getSettings} from "./store"
import {IntegrationsSettings} from "../../types/integrations/integrationsSettings"

function getPossibleIntegrations(): BaseIntegration[] {
  return [
    new DiscordIntegration()
  ]
}

function getActiveIntegrations(): BaseIntegration[] {
  const settings: Settings = getSettings()

  return getPossibleIntegrations().filter(integration => integration.isActive(settings))
}

export function initIntegrations(): void {
  IntegrationCacheManager.getInstance().registerIntegrations(getActiveIntegrations())
  IntegrationCacheManager.getInstance().getRegisteredIntegrations().forEach(integration => integration.setup())
}

export function getIntegrationDefaultSettings(): { [key: string]: IntegrationsSettings } {
  return getPossibleIntegrations().reduce((collector, item) => ({
    ...collector,
    [item.getIntegrationKey()]: item.getIntegrationDefaultSettings()
  }), {})
}

export async function runIntegrationBreakStartHook(): Promise<void> {
  await Promise.all(IntegrationCacheManager
    .getInstance()
    .getRegisteredIntegrations()
    .map(integration => integration.handleBreakStart())
  )
}

export async function runIntegrationBreakEndHook(): Promise<void> {
  await Promise.all(IntegrationCacheManager
    .getInstance()
    .getRegisteredIntegrations()
    .map(integration => integration.handleBreakEnd())
  )
}

