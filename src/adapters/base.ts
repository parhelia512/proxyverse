export type WebAuthenticationChallengeDetails =
  | chrome.webRequest.WebAuthenticationChallengeDetails
  | browser.webRequest._OnAuthRequiredDetails;
export type BlockingResponse = chrome.webRequest.BlockingResponse;
export type WebRequestCompletedDetails =
  | chrome.webRequest.WebResponseDetails
  | browser.webRequest._OnCompletedDetails;

export type WebRequestErrorOccurredDetails =
  | chrome.webRequest.WebResponseDetails
  | browser.webRequest._OnErrorOccurredDetails;

export type ProxyConfig = {
  /** Optional. The proxy auto-config (PAC) script for this configuration. Use this for 'pac_script' mode. */
  pacScript?: PacScript;
  /**
   * 'direct' = Never use a proxy
   * 'auto_detect' = Auto detect proxy settings
   * 'pac_script' = Use specified PAC script
   * 'system' = Use system proxy settings
   */
  mode: "direct" | "auto_detect" | "pac_script" | "system";
};

export type ProxyErrorDetails = chrome.proxy.ErrorDetails | Error;
export type ProxySettingResultDetails = {
  /**
   * One of
   * • not_controllable: cannot be controlled by any extension
   * • controlled_by_other_extensions: controlled by extensions with higher precedence
   * • controllable_by_this_extension: can be controlled by this extension
   * • controlled_by_this_extension: controlled by this extension
   */
  levelOfControl:
    | "not_controllable"
    | "controlled_by_other_extensions"
    | "controllable_by_this_extension"
    | "controlled_by_this_extension";
  /** The value of the setting. */
  value: ProxyConfig;
  /**
   * Optional.
   * Whether the effective value is specific to the incognito session.
   * This property will only be present if the incognito property in the details parameter of get() was true.
   */
  incognitoSpecific?: boolean | undefined;
};

export type SimpleProxyServer = chrome.proxy.ProxyServer;
export type PacScript = chrome.proxy.PacScript;
export type ProxyRules = chrome.proxy.ProxyRules;

export enum BrowserFlavor {
  Unknown = "unknown",
  Web = "web", // now only for local dev purpose
  Chrome = "chrome",
}

export abstract class BaseAdapter {
  get flavor(): BrowserFlavor {
    return BrowserFlavor.Unknown;
  }

  // local storage
  abstract set<T>(key: string, val: T): Promise<void>;
  abstract get<T>(key: string): Promise<T | undefined>;
  async getWithDefault<T>(key: string, defaultVal: T): Promise<T> {
    const ret = await this.get<T>(key);
    if (ret === undefined) {
      return defaultVal;
    }

    return ret;
  }

  // proxy
  abstract setProxy(cfg: ProxyConfig): Promise<void>;
  abstract clearProxy(): Promise<void>;
  abstract onProxyError(callback: (error: ProxyErrorDetails) => void): void;
  abstract onProxyChanged(
    callback: (setting: ProxySettingResultDetails) => void
  ): void;
  abstract getProxySettings(): Promise<ProxySettingResultDetails>;

  // indicator
  abstract setBadge(text: string, color: string): Promise<void>;

  // webRequest
  abstract onWebRequestAuthRequired(
    callback: (
      details: WebAuthenticationChallengeDetails,
      callback?: (response: BlockingResponse) => void
    ) => void
  ): void;
  abstract onWebRequestCompleted(
    callback: (details: WebRequestCompletedDetails) => void
  ): void;
  abstract onWebRequestErrorOccurred(
    callback: (details: WebRequestErrorOccurredDetails) => void
  ): void;

  // i18n
  abstract currentLocale(): string;
  abstract getMessage(key: string, substitutions?: string | string[]): string;

  // compatible issues, return an error message in HTML format
  async error(): Promise<string | undefined> {
    return;
  }
}
