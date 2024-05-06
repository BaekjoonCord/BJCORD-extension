/**
 * 현재 로그인한 사용자의 handle을 불러옵니다.
 * @returns {string?} 지금 로그인 한 사용자의 handle. 로그인되지 않았다면 null.
 */
function getHandle() {
  const element = document.querySelector("a.username");
  if (!element) {
    logErr("handle을 불러오지 못했습니다 : 필요한 요소를 찾을 수 없습니다.");
    return null;
  }

  const handle = element.innerText?.trim();
  if (!handle) {
    logErr("handle을 불러오지 못했습니다 : 로그인되지 않았습니다.");
    return null;
  }

  return handle;
}

/**
 * 로그를 info 레벨로 출력합니다.
 * @param {*} text 로그에 출력할 값
 */
function log(text) {
  console.log("[BJCORD]", text);
}

/**
 * 로그를 error 레벨로 출력합니다.
 * @param {*} text 로그에 출력할 값
 */
function logErr(text) {
  console.error("[BJCORD]", text);
}
