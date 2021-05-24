import * as React from 'react'
import {ipcRenderer, IpcRendererEvent} from 'electron'
import {
  Tabs, Tab, Switch, HTMLSelect, FormGroup, InputGroup, Intent, Button
} from "@blueprintjs/core"
import {TimePicker, TimePrecision} from "@blueprintjs/datetime"
import {Settings, NotificationType, NotificationClick} from "../../types/settings"
import {IpcChannel} from "../../types/ipc"
import {toast} from "../toaster"
import SettingsHeader from './SettingsHeader'
import IntegrationSettingsEl from "./integrations/Integrations"
const styles = require('./Settings.scss')

export default function SettingsEl() {
  const [settings, setSettings] = React.useState<Settings>(null)

  React.useEffect(() => {
    ipcRenderer.on(IpcChannel.GET_SETTINGS_SUCCESS, (event: IpcRendererEvent, settings: Settings) => {
      setSettings(settings)
    })

    ipcRenderer.on(IpcChannel.SET_SETTINGS_SUCCESS, () => {
      toast('Settings saved', Intent.PRIMARY)
    })

    ipcRenderer.on(IpcChannel.ERROR, (event: IpcRendererEvent, error: string) => {
      toast(error, Intent.DANGER)
    })

    ipcRenderer.send(IpcChannel.GET_SETTINGS)
  }, [])

  if (!settings) {
    return null
  }

  const handleNotificationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const notificationType = e.target.value as NotificationType
    setSettings({...settings, notificationType})
  }

  const handleNotificationClickChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const notificationClick = e.target.value as NotificationClick
    setSettings({...settings, notificationClick})
  }

  const handleDateChange = (field: string, newVal: Date): void => {
    const newSettings = {...settings}
    newSettings[field] = newVal
    setSettings(newSettings)
  }

  const handlePostponeLimitChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const postponeLimit = Number(e.target.value)
    setSettings({...settings, postponeLimit})
  }

  const handleTextChange = (field: string, e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSettings = {...settings}
    newSettings[field] = e.target.value
    setSettings(newSettings)
  }

  const handleSwitchChange = (field: string, e: React.ChangeEvent<HTMLInputElement>): void => {
    const newSettings = {...settings}
    newSettings[field] = e.target.checked
    setSettings(newSettings)
  }

  const updateIntegrationSetting = (integrationName, integrationSettings) => {
    const newSettings = {...settings, integrations: integrationSettings}
    setSettings(newSettings)
  }

  const handleResetColors = (): void => {
    setSettings({
      ...settings,
      textColor: '#ffffff',
      backgroundColor: '#16a085',
    })
  }

  const handleSave = (): void => {
    ipcRenderer.send(IpcChannel.SET_SETTINGS, settings)
  }

  return (
    <React.Fragment>
      <SettingsHeader
        textColor={settings.textColor}
        backgroundColor={settings.backgroundColor}
        handleSave={handleSave}
      />
      <main className={styles.settings}>
        <FormGroup>
          <Switch
            label="Breaks enabled"
            checked={settings.breaksEnabled}
            onChange={handleSwitchChange.bind(null, 'breaksEnabled')}
          />
        </FormGroup>
        <Tabs defaultSelectedTabId="break-settings">
          <Tab
            id="break-settings"
            title="Break Settings"
            panel={(
              <React.Fragment>
                <FormGroup label="Notify me with">
                  <HTMLSelect
                    value={settings.notificationType}
                    options={[
                      {value: NotificationType.Popup, label: "Fullscreen popup"},
                      {value: NotificationType.Notification, label: "Simple notification"},
                    ]}
                    onChange={handleNotificationTypeChange}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Break frequency" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'breakFrequency')}
                    value={new Date(settings.breakFrequency)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Break length" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'breakLength')}
                    value={new Date(settings.breakLength)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Clicking break start notification should">
                  <HTMLSelect
                    value={settings.notificationClick}
                    options={[
                      {value: NotificationClick.DoNothing, label: "Do nothing"},
                      {value: NotificationClick.Skip, label: "Skip the break"},
                      {value: NotificationClick.Postpone, label: "Postpone the break"},
                    ]}
                    onChange={handleNotificationClickChange}
                    disabled={!settings.breaksEnabled || settings.notificationType !== NotificationType.Popup}
                  />
                </FormGroup>
                <FormGroup label="Postpone length" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'postponeLength')}
                    value={new Date(settings.postponeLength)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settings.breaksEnabled || settings.notificationClick !== NotificationClick.Postpone}
                  />
                </FormGroup>
                <FormGroup label="Postpone limit">
                  <HTMLSelect
                    value={settings.postponeLimit}
                    options={[
                      {value: 1, label: "1"},
                      {value: 2, label: "2"},
                      {value: 3, label: "3"},
                      {value: 4, label: "4"},
                      {value: 5, label: "5"},
                      {value: 0, label: "No limit"}
                    ]}
                    onChange={handlePostponeLimitChange}
                    disabled={!settings.breaksEnabled || settings.notificationClick !== NotificationClick.Postpone}
                  />
                </FormGroup>
                <Switch
                  label="Play gong sound on break start/end"
                  checked={settings.gongEnabled}
                  onChange={handleSwitchChange.bind(null, 'gongEnabled')}
                  disabled={!settings.breaksEnabled}
                />
                <Switch
                  label="Allow end break"
                  checked={settings.endBreakEnabled}
                  onChange={handleSwitchChange.bind(null, 'endBreakEnabled')}
                  disabled={!settings.breaksEnabled}
                />
              </React.Fragment>
            )}
          />
          <Tab
            id="customization"
            title="Customization"
            panel={(
              <React.Fragment>
                <FormGroup label="Break title">
                  <InputGroup
                    id="break-title"
                    value={settings.breakTitle}
                    onChange={handleTextChange.bind(null, 'breakTitle')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Break message">
                  <InputGroup
                    id="break-message"
                    value={settings.breakMessage}
                    onChange={handleTextChange.bind(null, 'breakMessage')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Primary color">
                  <InputGroup
                    id="primary-color"
                    className={styles.colorPicker}
                    type="color"
                    value={settings.backgroundColor}
                    onChange={handleTextChange.bind(null, 'backgroundColor')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Text color">
                  <InputGroup
                    id="text-color"
                    className={styles.colorPicker}
                    type="color"
                    value={settings.textColor}
                    onChange={handleTextChange.bind(null, 'textColor')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup>
                  <Button onClick={handleResetColors}>Reset colors</Button>
                </FormGroup>
                <IntegrationSettingsEl settings={settings} updateIntegrationSetting={updateIntegrationSetting} />
              </React.Fragment>
            )}
          />
          <Tab
            id="working-hours"
            title="Working Hours"
            panel={(
              <React.Fragment>
                <FormGroup>
                  <Switch
                    label="Enable working hours"
                    checked={settings.workingHoursEnabled}
                    onChange={handleSwitchChange.bind(null, 'workingHoursEnabled')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Breaks from">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'workingHoursFrom')}
                    value={new Date(settings.workingHoursFrom)}
                    selectAllOnFocus
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                </FormGroup>
                <FormGroup label="Breaks to">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'workingHoursTo')}
                    value={new Date(settings.workingHoursTo)}
                    selectAllOnFocus
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                </FormGroup>
                <FormGroup label="Breaks on">
                  <Switch
                    label="Monday"
                    checked={settings.workingHoursMonday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursMonday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Tuesday"
                    checked={settings.workingHoursTuesday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursTuesday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Wednesday"
                    checked={settings.workingHoursWednesday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursWednesday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Thursday"
                    checked={settings.workingHoursThursday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursThursday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Friday"
                    checked={settings.workingHoursFriday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursFriday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Saturday"
                    checked={settings.workingHoursSaturday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursSaturday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                  <Switch
                    label="Sunday"
                    checked={settings.workingHoursSunday}
                    onChange={handleSwitchChange.bind(null, 'workingHoursSunday')}
                    disabled={!settings.breaksEnabled || !settings.workingHoursEnabled}
                  />
                </FormGroup>
              </React.Fragment>
            )}
          />
          <Tab
            id="idle-reset"
            title="Idle Reset"
            panel={(
              <React.Fragment>
                <FormGroup>
                  <Switch
                    label="Enable idle reset"
                    checked={settings.idleResetEnabled}
                    onChange={handleSwitchChange.bind(null, 'idleResetEnabled')}
                    disabled={!settings.breaksEnabled}
                  />
                </FormGroup>
                <FormGroup label="Reset break countdown when idle for" labelInfo="(hh:mm:ss)">
                  <TimePicker
                    onChange={handleDateChange.bind(null, 'idleResetLength')}
                    value={new Date(settings.idleResetLength)}
                    selectAllOnFocus
                    precision={TimePrecision.SECOND}
                    disabled={!settings.breaksEnabled || !settings.idleResetEnabled}
                  />
                </FormGroup>
                <Switch
                  label="Show notification on idle reset"
                  checked={settings.idleResetNotification}
                  onChange={handleSwitchChange.bind(null, 'idleResetNotification')}
                  disabled={!settings.breaksEnabled || !settings.idleResetEnabled}
                />
              </React.Fragment>
            )}
          />
          {process.env.SNAP === undefined && (
            <Tab
              id="system"
              title="System"
              panel={(
                <React.Fragment>
                  <FormGroup>
                    <Switch
                      label="Start at login"
                      checked={settings.autoLaunch}
                      onChange={handleSwitchChange.bind(null, 'autoLaunch')}
                    />
                  </FormGroup>
                </React.Fragment>
              )}
            />
          )}
        </Tabs>
      </main>
    </React.Fragment>
  )
}
