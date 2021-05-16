/* eslint-disable react/prop-types */
import {Button, FormGroup, HTMLSelect, InputGroup, Intent} from "@blueprintjs/core"
import {SHARE} from "@blueprintjs/icons/lib/esnext/generated/iconNames"
import React, {useEffect, useState} from "react"
import {ipcRenderer, IpcRendererEvent} from "electron"
import {DiscordSettings} from "../../../../types/integrations/discord"
import {SettingComponentProps} from "../IntegrationGroup"
import {DiscordService} from "./DiscordService"
import {IpcChannel} from "../../../../types/ipc"
import {toast} from "../../../toaster"

export default function DiscordSettingsEl({settings, updateSetting}: SettingComponentProps<DiscordSettings>) {
  const [discordServers, setDiscordServers] = useState<{ label: string; value: string }[]>([])

  const name = 'discord'

  const service = new DiscordService(updateSetting, settings.access_token, settings.refresh_token)

  const handleSettingChange = (property, event) => {
    updateSetting.call({}, name, event.currentTarget.value, property)
  }

  const tryAndFetchDiscordServers = async () => {
    if (settings.access_token && settings.refresh_token) {
      return service.fetchServers()
    } else {
      return Promise.resolve([])
    }
  }

  useEffect(() => {
    tryAndFetchDiscordServers().then(servers => setDiscordServers(servers))
  }, [])

  const displayDiscordOauthWindow = async () => {
    return new Promise((resolve, reject) => {
      const targetUrl = service.getDiscordOauthUrl()
      ipcRenderer.send(IpcChannel.DISPLAY_BROWSER_WINDOW, targetUrl)

      ipcRenderer.on(IpcChannel.DISPLAY_BROWSER_WINDOW_SUCCESS, (event: IpcRendererEvent, url: string) => {
        const urlParams = new URLSearchParams('?' + url.split('?')[1])
        resolve(urlParams.get('code'))
      })

      ipcRenderer.on(IpcChannel.ERROR, (event: IpcRendererEvent, error: string) => {
        reject(error)
      })
    })
  }

  const triggerDiscordLogin = async () => {
    try {
      const responseCode = await displayDiscordOauthWindow()
      await service.attemptLogin(responseCode)
      const servers = await tryAndFetchDiscordServers()
      setDiscordServers(servers)
    } catch (e) {
      toast('couldn\'t login with discord : ' + e.message, Intent.DANGER)
      console.error('couldn\'t login with discord : ' + e.message)
    }
  }

  const handleTargetGuildChange = (event) => {
    updateSetting.call({}, 'discord', 'target_guild', event.currentTarget.value)
  }

  const renderDiscordSettings = () => {
    return (<div />)
  }

  const renderDiscordLogin = () => {
    return (
      <Button icon={SHARE} onClick={triggerDiscordLogin.bind(null)} intent={Intent.PRIMARY}>Login with discord</Button>
    )
  }

  const DisplayedPage = () => {
    if (settings.access_token && settings.refresh_token) {
      return renderDiscordSettings()
    } else {
      return renderDiscordLogin()
    }
  }

  return (
    <div>
      <React.Fragment>
        <FormGroup label="Suffix">
          <InputGroup
            id="discord-suffix"
            type="text"
            value={settings.suffix}
            onChange={handleSettingChange.bind(null, 'suffix')}
          />
        </FormGroup>
        <FormGroup label="Server">
          <HTMLSelect
            options={discordServers}
            value={settings.target_guild}
            onChange={handleTargetGuildChange.bind(null)}
          />
        </FormGroup>
        <FormGroup label="Bot url">
          <InputGroup
            id="discord-target-bot-url"
            type="text"
            value={settings.targetBotUrl}
            onChange={handleSettingChange.bind(null, 'targetBotUrl')}
          />
        </FormGroup>
      </React.Fragment>
      <DisplayedPage />
    </div>
  )
}
