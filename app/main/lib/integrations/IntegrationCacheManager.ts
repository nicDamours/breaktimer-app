import {BaseIntegration} from "./BaseIntegration"

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
}
