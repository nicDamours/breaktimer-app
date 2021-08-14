import {BaseIntegration} from "./BaseIntegration"
import {Settings} from "../../../types/settings"
import {setSettings} from "../store"

export class IntegrationCacheManager {

  private static _instance = null;

  private registeredIntegrations: BaseIntegration[] = [];

  private constructor() {}

  public static getInstance(): IntegrationCacheManager {
    if (!IntegrationCacheManager._instance) {
      IntegrationCacheManager._instance = new IntegrationCacheManager()
    }

    return IntegrationCacheManager._instance
  }

  public registerIntegrations(instances: BaseIntegration[]) {
    this.registeredIntegrations = instances
  }

  public getRegisteredIntegrations(): BaseIntegration[] {
    return this.registeredIntegrations
  }

  public initIntegrationsSettings(settings: Settings, possibleIntegrations: BaseIntegration[]): void {
    let hasChanges = false
    if (settings && !('integrations' in settings)) {
      settings.integrations = {}
      hasChanges = true
    }
    possibleIntegrations.forEach((integration) => {
      if (!(integration.getIntegrationKey() in settings.integrations)) {
        settings.integrations[integration.getIntegrationKey()] = {enabled: false}
        hasChanges = true
      }
    })

    if (hasChanges) {
      console.log(' settings to be updated', settings)
      setSettings(settings)
    }
  }
}
