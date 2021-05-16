import {ipcMain, IpcMainEvent, BrowserWindow} from 'electron'
import log from 'electron-log'
import {Settings} from '../../types/settings'
import {IpcChannel} from '../../types/ipc'
import {BreakTime} from '../../types/breaks'
import {getWindows} from './windows'
import {getBreakEndTime} from './breaks'
import {getSettings, setSettings} from './store'

export function sendIpc(channel: IpcChannel, ...args: any[]): void {
  const windows: BrowserWindow[] = getWindows()

  log.info(`Send event ${channel}`, args)

  for (const window of windows) {
    if (!window) {
      continue
    }

    window.webContents.send(channel, ...args)
  }
}

ipcMain.on(IpcChannel.GET_SETTINGS, (event: IpcMainEvent): void => {
  log.info(IpcChannel.GET_SETTINGS)

  try {
    const settings: Settings = getSettings()
    event.reply(IpcChannel.GET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    log.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.SET_SETTINGS, (event: IpcMainEvent, settings: Settings): void => {
  log.info(IpcChannel.SET_SETTINGS, {settings})
  try {
    setSettings(settings)
    event.reply(IpcChannel.SET_SETTINGS_SUCCESS, settings)
  } catch (err)  {
    log.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.GET_BREAK_END_TIME, (event: IpcMainEvent): void => {
  log.info(IpcChannel.GET_BREAK_END_TIME)
  try {
    const breakTime: BreakTime = getBreakEndTime()
    event.reply(IpcChannel.GET_BREAK_END_TIME_SUCCESS, breakTime ? breakTime.toISOString() : null)
  } catch (err)  {
    log.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})

ipcMain.on(IpcChannel.DISPLAY_BROWSER_WINDOW, async (event: IpcMainEvent, url: string): Promise<void> => {
  log.info(IpcChannel.DISPLAY_BROWSER_WINDOW)

  try {
    let authWindow = new BrowserWindow({
      "width": 800,
      "height": 600,
      "show": false,
    })

    await authWindow.loadURL(url)
    authWindow.show()
    let responseUrl = null
    authWindow.webContents.on('will-navigate', (browserEvent, newUrl) => {
      responseUrl = newUrl
      authWindow.close()
    })

    authWindow.on('closed', () => {
      event.reply(IpcChannel.DISPLAY_BROWSER_WINDOW_SUCCESS, responseUrl)
    })

  } catch (err)  {
    log.error(err)
    event.reply(IpcChannel.ERROR, err.message)
  }
})
