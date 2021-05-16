export class DiscordLocalStorageService {
  private static readonly DISCORD_SERVICE_PREFIX = '%%discord-integration%%'
  private static readonly DISCORD_SERVERS_KEY = DiscordLocalStorageService.DISCORD_SERVICE_PREFIX + 'servers';
  private static readonly DISCORD_SERVERS_TTL_KEY = DiscordLocalStorageService.DISCORD_SERVICE_PREFIX + 'servers-ttl';
  private static readonly DISCORD_SERVERS_TTL = 60 * 60;

  public static isCachedDataStillValid() {
    const serverTTL = window.localStorage.getItem(DiscordLocalStorageService.DISCORD_SERVERS_TTL_KEY)
    return !!serverTTL && new Date(parseInt(serverTTL, 0)) < new Date()
  }

  public static fetchServersFromCachedData(): {label: string; value: string}[] {
    return JSON.parse(window.localStorage.getItem(DiscordLocalStorageService.DISCORD_SERVERS_KEY))
  }

  public static cacheServerData(servers: {label: string; value: string}[]) {
    const serversTTLTime = new Date().getTime() + DiscordLocalStorageService.DISCORD_SERVERS_TTL
    window.localStorage.setItem(DiscordLocalStorageService.DISCORD_SERVERS_KEY, JSON.stringify(servers))
    window.localStorage.setItem(DiscordLocalStorageService.DISCORD_SERVERS_TTL_KEY, `${serversTTLTime}`)
  }
}
