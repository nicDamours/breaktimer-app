/* eslint-disable react/prop-types */
import {Button, FormGroup, HTMLSelect, Icon, InputGroup, Intent, Tooltip} from "@blueprintjs/core"
import {SHARE} from "@blueprintjs/icons/lib/esnext/generated/iconNames"
import React, {useEffect, useState} from "react"
import {ipcRenderer, IpcRendererEvent} from "electron"
import Picker from 'emoji-picker-react'
import {IconNames} from "@blueprintjs/icons"
import {DiscordSettings} from "../../../../types/integrations/discord"
import {SettingComponentProps} from "../IntegrationGroup"
import {IpcChannel} from "../../../../types/ipc"
import {toast} from "../../../toaster"
import {DiscordRendererService} from "./DiscordRendererService"
const styles = require('./Discord.scss')

export default function DiscordSettingsEl({settings, updateSetting}: SettingComponentProps<DiscordSettings>) {
  const [discordServers, setDiscordServers] = useState<{ label: string; value: string }[]>([])
  const [emojiPickerVisible, setEmojiPickerVisible] = useState<boolean>(false)

  const name = 'discord'

  const service = new DiscordRendererService(updateSetting, settings.access_token, settings.refresh_token)

  const handleSettingChange = (property, event) => {
    updateSetting.call({}, name, event.currentTarget.value, property)
  }

  const tryAndFetchDiscordServers = async () => {
    return service.fetchServers()
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
      await service.attemptLoginAndUpdateSettings(responseCode)
      const servers = await tryAndFetchDiscordServers()
      setDiscordServers(servers)
    } catch (e) {
      toast('couldn\'t login with discord : ' + e.message, Intent.DANGER)
    }
  }

  const handleIntegrationRemoval = async () => {
    const response = await service.attemptRevoke(settings.access_token)
    if (response.every(res => res.status === 200)) {

      updateSetting.call({}, 'discord', {
        access_token: null,
        refresh_token: null,
        token_expiring_date: null,
        enabled: false,
        targetBotUrl: "",
        targetGuild: 0,
        suffix: ""
      })
    }
  }

  const handleTargetGuildChange = (event) => {
    updateSetting.call({}, 'discord', event.currentTarget.value, 'targetGuild')
  }

  const triggerEmojiPicker = () => {
    setEmojiPickerVisible(!emojiPickerVisible)
  }

  const emojiPickerTrigger = () => {
    return (
      <Tooltip className={styles.emojiPickerTrigger} content="Emojis">
        <Icon icon={IconNames.EMOJI} onClick={triggerEmojiPicker.bind(null)} />
      </Tooltip>
    )
  }

  const addEmojiToCurrentSelection = (event, selectedEmoji) => {
    const newSuffix = settings.suffix + selectedEmoji.emoji
    updateSetting.call({}, name, newSuffix, 'suffix')
    setEmojiPickerVisible(false)
    document.getElementById('discord-suffix').focus()
  }

  const renderEmojiPicker = () => {
    if (emojiPickerVisible) {
      return (<Picker onEmojiClick={addEmojiToCurrentSelection} />)
    }
  }

  const renderDiscordSettings = () => {
    return (
      <React.Fragment key="settingForm">
        <FormGroup label="Suffix">
          <InputGroup
            id="discord-suffix"
            type="text"
            value={settings.suffix}
            onChange={handleSettingChange.bind(null, 'suffix')}
            rightElement={emojiPickerTrigger()}
          />
          {renderEmojiPicker()}
        </FormGroup>
        <FormGroup label="Server">
          <HTMLSelect
            options={discordServers}
            value={settings.targetGuild}
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
        <FormGroup>
          <div className={styles.deleteButtonWrapper}>
            <Button intent={Intent.DANGER} onClick={handleIntegrationRemoval.bind(null)}>Remove Integration</Button>
          </div>
        </FormGroup>
      </React.Fragment>
    )
  }

  const renderDiscordLogin = () => {
    return (
      <React.Fragment key="buttonForm">
        <Button icon={SHARE} onClick={triggerDiscordLogin.bind(null)} intent={Intent.PRIMARY}>Login with discord</Button>
      </React.Fragment>
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
      {DisplayedPage()}
    </div>
  )
}
