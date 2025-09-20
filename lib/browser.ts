export const getExtensionId = () => {
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.id) {
    return browser.runtime.id;
  }

  return null;
};

export type BrowserType = "chrome" | "firefox" | "edge" | "opera" | "safari";

export const getCurrentBrowser = (): BrowserType | "unknown" => {
  if (typeof navigator === "undefined") return "unknown";

  const userAgent = navigator.userAgent;

  if (userAgent.includes("Firefox")) {
    return "firefox";
  } else if (userAgent.includes("Edg/")) {
    return "edge";
  } else if (userAgent.includes("OPR/") || userAgent.includes("Opera")) {
    return "opera";
  } else if (userAgent.includes("Chrome")) {
    return "chrome";
  } else if (userAgent.includes("Safari")) {
    return "safari";
  } else {
    return "unknown";
  }
};

export const getVersion = () => browser.runtime.getManifest().version;
export const getName = () => browser.runtime.getManifest().name;
export const getLongVersion = () =>
  browser.runtime.getManifest().version_name || getVersion();
