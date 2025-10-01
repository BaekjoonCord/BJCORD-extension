import {
  DEFAULT_SEND_FIRST_AC_ONLY,
  DEFAULT_SHOW_EMOJI,
  SEND_FIRST_AC_ONLY_KEY,
  SHOW_EMOJI_KEY,
  WEBHOOK_KEY,
} from "./constants";
import { createUUID } from "./util";
import { Webhook } from "./webhook";

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

/**
 * Webhook 배열을 브라우저 동기화 스토리지에 저장합니다.
 *
 * @param webhooks 동기화할 Webhook 배열
 */
export const syncWebhooks = async (webhooks: Webhook[]) => {
  await browser.storage.sync.set({ [WEBHOOK_KEY]: webhooks });
};

/**
 * 브라우저 동기화 스토리지에 저장된 Webhook 배열을 반환합니다.
 *
 * @returns 브라우저 동기화 스토리지에 저장된 Webhook 배열. 없는 경우 빈 배열
 */
export const getWebhooks = async (): Promise<Webhook[]> => {
  const storage = await browser.storage.sync.get(WEBHOOK_KEY);
  const webhooks: Webhook[] = storage[WEBHOOK_KEY] || [];

  // BJCORD 1 버전에서는 sync stroage에 저장된 웹훅에 id 필드가
  // 존재하지 않았습니다. BJCORD 1 버전에서는 index를 기반으로 웹훅을
  // 식별했으나, BJCORD 2 부터 UUID를 기반으로 식별합니다.
  // 따라서 id 필드가 없는 웹훅에 대해 UUID를 생성하여 id 필드를 추가합니다.
  // 일반적으로 웹훅의 개수는 많지 않으므로 성능에 미치는 영향은 적을 것으로
  // 예상합니다. 추후 대부분의 사용자가 BJCORD 2 버전으로 업데이트된 이후에는
  // 이 코드를 제거할 수 있습니다.
  let hasUndefinedId = false;
  for (const wh of webhooks) {
    if (wh.id === undefined) {
      hasUndefinedId = true;
      break;
    }
  }

  if (hasUndefinedId) {
    for (const wh of webhooks) {
      if (wh.id === undefined) {
        wh.id = createUUID();
      }
    }
    await syncWebhooks(webhooks);
  }

  return webhooks;
};

export const getShowEmoji = async (): Promise<boolean> => {
  const storage = await browser.storage.sync.get(SHOW_EMOJI_KEY);
  return storage[SHOW_EMOJI_KEY] ?? DEFAULT_SHOW_EMOJI;
};

export const syncShowEmoji = async (show: boolean) => {
  await browser.storage.sync.set({ [SHOW_EMOJI_KEY]: show });
};

export const getSendFirstAcOnly = async (): Promise<boolean> => {
  const storage = await browser.storage.sync.get(SEND_FIRST_AC_ONLY_KEY);
  return storage[SEND_FIRST_AC_ONLY_KEY] ?? DEFAULT_SEND_FIRST_AC_ONLY;
};

export const syncSendFirstAcOnly = async (onlyFirst: boolean) => {
  await browser.storage.sync.set({ [SEND_FIRST_AC_ONLY_KEY]: onlyFirst });
};

/**
 * 확장 프로그램이 처음 실행되는지 여부를 반환합니다.
 * 웹훅, 이모지 표시 여부, 첫 AC만 전송 여부 설정이 존재하지 않는 경우(undefined)
 * 처음 실행되는 것으로 간주합니다.
 * 추가적인 업데이트로 인해 새로운 값이 추가된 경우에도 `true`를 반환합니다.
 * Sync 스토리지를 초기화할 때 모든 필드를 초기화하지 않도록 주의해야 합니다.
 *
 * @returns 확장 프로그램이 처음 실행되는지 여부
 */
export const isFirstRun = async (): Promise<boolean> => {
  const isWhUndefined = await browser.storage.sync.get(WEBHOOK_KEY);
  const shouldShowEmoji = await browser.storage.sync.get(SHOW_EMOJI_KEY);
  const sendFirstAcOnly = await browser.storage.sync.get(
    SEND_FIRST_AC_ONLY_KEY
  );

  return (
    isWhUndefined[WEBHOOK_KEY] === undefined ||
    shouldShowEmoji[SHOW_EMOJI_KEY] === undefined ||
    sendFirstAcOnly[SEND_FIRST_AC_ONLY_KEY] === undefined
  );
};

/**
 * 브라우저 동기화 스토리지를 초기화합니다.
 * 웹훅, 이모지 표시 여부, 첫 AC만 전송 여부 설정이 존재하지 않는 경우(undefined)
 * 각각 기본값으로 초기화합니다. 중간에 확장 프로그램의 버전을 업그레이드 해 몇 값이
 * undefined인 경우, 기존 값은 유지하되 누락된 값만 기본값으로 초기화합니다.
 */
export const initStorage = async () => {
  if ((await browser.storage.sync.get(WEBHOOK_KEY)) === undefined)
    await browser.storage.sync.set({ [WEBHOOK_KEY]: [] });

  if ((await browser.storage.sync.get(SHOW_EMOJI_KEY)) === undefined)
    await browser.storage.sync.set({ [SHOW_EMOJI_KEY]: DEFAULT_SHOW_EMOJI });

  if ((await browser.storage.sync.get(SEND_FIRST_AC_ONLY_KEY)) === undefined)
    await browser.storage.sync.set({
      [SEND_FIRST_AC_ONLY_KEY]: DEFAULT_SEND_FIRST_AC_ONLY,
    });
};
