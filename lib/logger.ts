import { isDev } from "./util";

const log = (file: string, ...args: any[]) => {
  console.log(`[BJCORD][${file}]${isDev && "[DEV]"}`, ...args);
};

const error = (file: string, ...args: any[]) => {
  console.error(`[BJCORD][${file}]${isDev && "[DEV]"}`, ...args);
};

/**
 * 로거를 생성합니다. 로그에는 `log`와 `error` 메소드가 있습니다.
 * prefix로 `[BJCORD][file]`이 붙습니다. dev모드에서는 `[DEV]`도 붙습니다.
 *
 * @param file 현재 파일 이름
 * @returns 로거
 */
export const getLogger = (file: string) => ({
  log: (...args: any[]) => log(file, ...args),
  error: (...args: any[]) => error(file, ...args),
});
