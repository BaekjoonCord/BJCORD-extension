import { ContentScriptContext } from "#imports";
import { getSendFirstAcOnly } from "./browser";
import {
  AC_TITLE_TOOLTIP_QUERY,
  HANDLE_QUERY,
  HEADER_CODE_LENGTH,
  HEADER_LANGUAGE,
  HEADER_LEVEL,
  HEADER_MEMORY,
  HEADER_PROBLEM_DESCRIPTION,
  HEADER_PROBLEM_ID,
  HEADER_RESULT,
  HEADER_RUNTIME,
  HEADER_SUBMISSION_ID,
  HEADER_SUBMISSION_TIME,
  HEADER_USERNAME,
  RESULT_TABLE_ID,
  SUBMISSION_TIME_QUERY,
  WATCH_JUDGEMENT_INTERVAL,
} from "./constants";
import { Logger } from "./logger";

/**
 * 유저의 핸들을 가져옵니다.
 * BOJ 최상단의 element에서 핸들을 추출합니다.
 * 로그인되지 않은 상태인 경우 null을 반환합니다.
 *
 * @returns 유저의 핸들. 없으면 null
 */
export function getHandle() {
  const element = document.querySelector(HANDLE_QUERY);
  if (!element) return null;

  const handle = element.textContent?.trim();
  if (!handle) {
    return null;
  }

  return handle;
}

/**
 * 유저가 이미 맞은 문제인지 여부를 반환합니다.
 * status 페이지에서 AC된 문제의 제목에 `result-ac` 클래스가 붙습니다.
 * 이 클래스를 통해 이미 맞은 문제인지 확인합니다.
 * 이미 맞은 문제인 경우 설정에 따라서 웹훅을 보내지 않아야 할 수 있습니다.
 *
 * @returns 유저가 이미 맞은 문제인지 여부
 * @see getSendFirstAcOnly
 */
export function isUserAlreadyAccepted() {
  const acceptedProblemTitleTooltip = document.querySelector(
    AC_TITLE_TOOLTIP_QUERY
  );

  return !!acceptedProblemTitleTooltip;
}

function mapTableHeader(header: string) {
  switch (header.toLowerCase()) {
    case "문제번호":
    case "문제":
    case "problem":
      return HEADER_PROBLEM_ID;
    case "난이도":
      return HEADER_LEVEL;
    case "결과":
    case "result":
      return HEADER_RESULT;
    case "문제내용":
      return HEADER_PROBLEM_DESCRIPTION;
    case "언어":
    case "language":
      return HEADER_LANGUAGE;
    case "제출 번호":
    case "solution":
      return HEADER_SUBMISSION_ID;
    case "아이디":
    case "user":
      return HEADER_USERNAME;
    case "제출시간":
    case "제출한 시간":
    case "submission time":
      return HEADER_SUBMISSION_TIME;
    case "시간":
    case "time":
      return HEADER_RUNTIME;
    case "메모리":
    case "memory":
      return HEADER_MEMORY;
    case "코드 길이":
    case "length":
      return HEADER_CODE_LENGTH;
    default:
      return "unknown";
  }
}

export function unescapeHtml(text: string) {
  const unescaped: Record<string, string> = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
  };

  return text.replace(
    /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160);/g,
    (m) => unescaped[m]!!
  );
}

export function getResultTable() {
  const table = document.getElementById(
    RESULT_TABLE_ID
  ) as HTMLTableElement | null;
  if (!table) return null;

  const headers = Array.from(table.rows[0].cells)
    .map((x) => x.innerText.trim())
    .map(mapTableHeader);

  const list = [];
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const cells = Array.from(row.cells, (x, i) => {
      switch (headers[i]) {
        case HEADER_RESULT:
          return {
            result: x.innerText,
            resultCategory: (x.firstChild as HTMLElement)
              .getAttribute("data-color")!!
              .replace("-eng", "")
              .trim(),
          };
        case HEADER_LANGUAGE:
          return unescapeHtml(x.innerText).replace(/\/.*$/g, "").trim();
        case HEADER_SUBMISSION_TIME:
          const time = x.querySelector(SUBMISSION_TIME_QUERY);
          if (!time) return null;
          return time.getAttribute("data-original-title");
        case HEADER_PROBLEM_ID:
          const idElement = x.querySelector("a.problem_title");
          if (!idElement) return null;
          return {
            problemId: idElement
              .getAttribute("href")!!
              .replace(/^.*\/([0-9]+)$/, "$1"),
          };
        default:
          return x.innerText.trim();
      }
    });

    // TODO : 타입 정의
    let obj: Record<string, any> = { elementId: row.id };
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = cells[j];

    obj = { ...obj, ...obj.result, ...obj.problemId };
    list.push(obj);
  }

  return list;
}

/**
 * BJCORD의 메인 로직입니다.
 * 유저의 채점 결과 변화를 감시하고, 새로운 AC가 감지되면
 * 설정에 따라서 디스코드 웹훅을 보냅니다.
 *
 * @param ctx ContentScriptContext
 * @param logger Logger
 */
export async function watchJudgementChange(
  ctx: ContentScriptContext,
  logger: Logger
) {
  if (isUserAlreadyAccepted()) {
    if (await getSendFirstAcOnly()) {
      logger.log("Already accepted, aborted.");
      return;
    }
  }

  logger.log("Watching judgement change...");

  /*
    많은 브라우저들은 확장이 "invalidated" 되었을 때
    (ex. 업데이트되거나 사용자가 확장을 비활성화하거나 제거하는 경우)
    모든 content script를 중지시키지 않습니다. Invalidated된 상태에서
    interval이 계속 동작하는 것을 막아주기 위해 ctx.setInterval을 사용합니다.
    참고 : https://wxt.dev/guide/essentials/content-scripts.html
  */
  const interval = ctx.setInterval(() => {
    const table = getResultTable();
    console.log(table);

    clearInterval(interval);
  }, WATCH_JUDGEMENT_INTERVAL);
}
