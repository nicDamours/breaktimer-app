import * as React from "react"
import {Text} from "@blueprintjs/core"
import {Settings} from "../../../types/settings"

import IntegrationSettingsGroupEl from "./IntegrationGroup"

interface Props {
  settings: Settings
  updateIntegrationSetting: (integrationName, setting) => void
}

export default function IntegrationSettingsEl({settings, updateIntegrationSetting}: Props) {
  if (!settings) {
    return null
  }

  const integrationsSettings = settings.integrations

  const updateSetting = (name, value, property = null) => {
    const updatedSettingObject = property ? {[property]: value} : value
    const currentIntegrationSettings = settings.integrations[name]

    updateIntegrationSetting.call({}, name, {...settings.integrations, [name]: {...currentIntegrationSettings, ...updatedSettingObject}})
  }

  const integrationMarkup = Object.keys(integrationsSettings).map(key => {
    return (
      <IntegrationSettingsGroupEl
        key={key}
        name={key}
        integrationSettings={settings.integrations[key]}
        updateSetting={updateSetting}
      />
    )
  })

  return (
    <React.Fragment>
      <Text tagName="h3">Integrations</Text>
      {integrationMarkup}
    </React.Fragment>
  )
}
