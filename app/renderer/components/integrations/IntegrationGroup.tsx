import {Alignment, Navbar, Switch, Collapse, FormGroup} from "@blueprintjs/core"
import React from "react"
import {IntegrationsSettings} from "../../../types/integrations/integrationsSettings"
import DiscordSettingsEl from "./discord/Discord"
const styles = require('./IntegrationGroup.scss')

interface Props {
  name: string
  integrationSettings: IntegrationsSettings
  updateSetting: (name: string, value: string, property: null | any) => void
}

const components = {
  discord: DiscordSettingsEl
}

export default function IntegrationSettingsGroupEl({name, integrationSettings, updateSetting}: Props) {
  const handleSettingEnabledChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const targetChecked = e.currentTarget.checked

    updateSetting.call({}, name, targetChecked, 'enabled')
  }

  const SettingComponentName = components[name]

  return (
    <FormGroup>
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>{name}</Navbar.Heading>
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Switch checked={integrationSettings.enabled} onChange={handleSettingEnabledChange.bind(null)} />
        </Navbar.Group>
      </Navbar>
      <Collapse isOpen={integrationSettings.enabled} keepChildrenMounted={true}>
        <div className={styles.integrationGroup}>
          <SettingComponentName settings={integrationSettings} updateSetting={updateSetting} />
        </div>
      </Collapse>
    </FormGroup>
  )
}

export interface SettingComponentProps<S = IntegrationsSettings> {
  settings: S
  updateSetting: (name: string, value: string, property: null | any) => void
}
