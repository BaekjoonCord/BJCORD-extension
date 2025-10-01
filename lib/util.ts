/**
 * 현재 실행 환경이 개발 환경인지 여부를 반환합니다.
 * Vite의 import.meta.env.DEV 값을 사용합니다.
 * `pnpm dev` 명령어로 실행한 경우 true입니다.
 */
export const isDev = import.meta.env.DEV;

/**
 * UUIDv4를 생성합니다. 최신 브라우저와 Node.js에서 호환됩니다.
 *
 * @returns UUID
 * @see https://caniuse.com/?search=randomUUID
 */
export const createUUID = () => crypto.randomUUID();
