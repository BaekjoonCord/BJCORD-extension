import { isDev } from "./util";

/**
 * 로그를 출력합니다. 브라우저의 콘솔에 출력됩니다.
 * 개발 모드인 경우 `[DEV]` 태그가 붙습니다.
 *
 * @param file 현재 파일의 이름
 * @param args 로그
 */
const log = (file: string, ...args: any[]) => {
  console.log(`[BJCORD][${file}]${isDev ? "[DEV]" : ""}`, ...args);
};

/**
 * 오류 로그를 출력합니다. 브라우저의 콘솔에 출력됩니다.
 * 개발 모드인 경우 `[DEV]` 태그가 붙습니다.
 *
 * @param file 현재 파일의 이름
 * @param args 로그
 */
const error = (file: string, ...args: any[]) => {
  console.error(`[BJCORD][${file}]${isDev ? "[DEV]" : ""}`, ...args);
};

/**
 * 로거 인터페이스
 */
export interface Logger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

/**
 * 로거를 생성합니다. 로그에는 `log`와 `error` 메소드가 있습니다.
 * prefix로 `[BJCORD][file]`이 붙습니다. dev모드에서는 `[DEV]`도 붙습니다.
 *
 * @param file 현재 파일 이름
 * @returns 로거
 */
export const getLogger = (file: string): Logger => ({
  log: (...args: any[]) => log(file, ...args),
  error: (...args: any[]) => error(file, ...args),
});
