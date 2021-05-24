import {Settings} from "../../../types/settings"
import {IntegrationsSettings} from "../../../types/integrations/integrationsSettings"
import {getSettings, setSettings} from "../store"

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

  protected setIntegrationSettings(settingObject) {
    const currentSettings = getSettings()
    const updatedSettings = {
      ...currentSettings,
      integrations: {
        ...currentSettings.integrations,
        [this.getIntegrationKey()]: {
          ...currentSettings.integrations[this.getIntegrationKey()],
          ...settingObject
        }
      }
    }

    setSettings(updatedSettings)
  }

  public abstract getIntegrationKey(): string;

  public abstract getIntegrationDefaultSettings(): IntegrationsSettings;
}
