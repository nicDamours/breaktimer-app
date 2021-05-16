import {Settings} from "../../../types/settings"
import {IntegrationsSettings} from "../../../types/integrations/integrationsSettings"

export abstract class BaseIntegration {
  public setup() {
  }

  async handleBreakStart() {
  }

  async handleBreakEnd() {
  }

  public isActive(settings: Settings): boolean {
    return (
      this.getIntegrationKey() in settings.integrations
      && settings.integrations[this.getIntegrationKey()].enabled
    )
  }

  public abstract getIntegrationKey(): string;

  public abstract getIntegrationDefaultSettings(): IntegrationsSettings;
}
