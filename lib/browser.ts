/**
 * 현재 확장 프로그램의 ID를 반환합니다.
 * 찾을 수 없는 경우 null을 반환합니다.
 *
 * @returns extension id. 찾을 수 없는 경우 null
 */
export const getExtensionId = () => {
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.id) {
    return browser.runtime.id;
  }

  return null;
};

export type BrowserType = "chrome" | "firefox" | "edge" | "opera" | "safari";

/**
 * 현재 브라우저 종류를 반환합니다. 알 수 없는 경우 "unknown"을 반환합니다.
 * Chrome, Firefox, Edge, Opera, Safari를 구분합니다.
 * userAgent를 기반으로 구분합니다.
 * Brave처럼 Chromium 기반 브라우저의 경우 "chrome"으로 반환됩니다.
 *
 * @returns 현재 브라우저 종류. 알 수 없는 경우 "unknown"
 */
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

/**
 * 현재 확장 프로그램의 버전을 반환합니다. 버전은 `package.json`의 `version` 필드와 동일합니다.
 * 만약 버전이 `2.1.3-beta`처럼 접미사가 붙은 경우 이 함수는 `2.1.3`만 반환합니다.
 * 전체 버전 문자열이 필요한 경우 `getLongVersion` 함수를 사용하세요.
 *
 * @returns 확장 프로그램의 버전
 * @see getLongVersion
 */
export const getVersion = () => browser.runtime.getManifest().version;

/**
 * @returns 확장 프로그램의 이름
 */
export const getName = () => browser.runtime.getManifest().name;

/**
 * 현재 확장 프로그램의 전체 버전 문자열을 반환합니다.
 * `package.json`의 `version_name` 필드가 존재하는 경우 해당 값을 반환합니다.
 * 만약 `version_name` 필드가 없는 경우 `getVersion` 함수를 사용하여 버전을 반환합니다.
 *
 * @returns 확장 프로그램의 전체 버전 문자열
 * @see getVersion
 */
export const getLongVersion = () =>
  browser.runtime.getManifest().version_name || getVersion();

export interface Webhook {
  id: string;
  name: string;
  url: string;
  displayName?: string;
  active: boolean;
}
