import { ContentScriptContext } from "#imports";
import { getSendFirstAcOnly, getShowEmoji } from "./browser";
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
  PROBLEM_ID_QUERY,
  RESULT_TABLE_ID,
  SUBMISSION_TIME_QUERY,
  WATCH_JUDGEMENT_INTERVAL,
} from "./constants";
import type { Logger } from "./logger";
import type { DeliveryResult, Submission } from "./submission";

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
    case "submission #":
    case "submission id":
      return HEADER_SUBMISSION_ID;
    case "아이디":
    case "user":
      return HEADER_USERNAME;
    case "제출시간":
    case "제출한 시간":
    case "submission time":
    case "submitted":
      return HEADER_SUBMISSION_TIME;
    case "시간":
    case "time":
      return HEADER_RUNTIME;
    case "메모리":
    case "memory":
      return HEADER_MEMORY;
    case "코드 길이":
    case "length":
    case "code length":
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

interface ResultTableRow extends Submission {
  resultCategory: string;
}

export function getResultTable(): ResultTableRow[] {
  const table = document.getElementById(
    RESULT_TABLE_ID
  ) as HTMLTableElement | null;
  if (!table?.rows.length) return [];
  const headers = Array.from(table.rows[0].cells, (cell) =>
    mapTableHeader(cell.textContent.trim())
  );

  return Array.from(table.rows)
    .slice(1)
    .map((row) => {
      const cell = (name: ReturnType<typeof mapTableHeader>) =>
        row.cells[headers.indexOf(name)];
      const text = (name: ReturnType<typeof mapTableHeader>) =>
        cell(name)?.textContent.trim() ?? "";
      const problem =
        cell(HEADER_PROBLEM_ID)?.querySelector<HTMLAnchorElement>(
          PROBLEM_ID_QUERY
        );
      const time = cell(HEADER_SUBMISSION_TIME)?.querySelector(
        SUBMISSION_TIME_QUERY
      );
      const result = cell(HEADER_RESULT)?.querySelector("[data-color]");

      return {
        problemId:
          problem?.getAttribute("href")?.match(/\/problem\/(\d+)$/)?.[1] ?? "",
        title:
          problem?.getAttribute("data-original-title") || problem?.title || "",
        submissionId: text(HEADER_SUBMISSION_ID),
        username: text(HEADER_USERNAME),
        language: unescapeHtml(text(HEADER_LANGUAGE)).split("/")[0].trim(),
        resultCategory:
          result?.getAttribute("data-color")?.replace("-eng", "").trim() ?? "",
        codeLength: text(HEADER_CODE_LENGTH),
        memory: text(HEADER_MEMORY),
        runtime: text(HEADER_RUNTIME),
        timestamp: Number(time?.getAttribute("data-timestamp")) || 0,
      };
    });
}

export async function watchJudgementChange(
  ctx: ContentScriptContext,
  logger: Logger,
  handle: string,
  problemId: string
) {
  const latestOnLoad = getResultTable()[0];
  // Once the submitter has AC, BOJ also marks the current problem link as solved.
  const alreadyAccepted =
    latestOnLoad?.resultCategory !== "ac" && isUserAlreadyAccepted();
  const firstOnly = await getSendFirstAcOnly();
  if (firstOnly && alreadyAccepted) return;

  let pendingId: string | undefined;
  const interval = ctx.setInterval(async () => {
    const [latest, ...history] = getResultTable();
    if (!latest?.resultCategory) return;
    if (latest.username !== handle || latest.problemId !== problemId) {
      clearInterval(interval);
      return;
    }
    if (["judging", "wait", "compile"].includes(latest.resultCategory)) {
      pendingId = latest.submissionId;
      return;
    }
    clearInterval(interval);
    if (latest.resultCategory !== "ac") return;

    // A fresh AC may already be final by the time the content script starts.
    const ageSeconds = Date.now() / 1000 - latest.timestamp;
    if (
      pendingId !== latest.submissionId &&
      (ageSeconds < -1 || ageSeconds > 10)
    )
      return;

    const previous = history.filter(
      (row) => row.username === handle && row.problemId === problemId
    );
    const previousAc = previous.findIndex((row) => row.resultCategory === "ac");
    if (firstOnly && previousAc >= 0) return;
    const attempts = 1 + (previousAc < 0 ? previous.length : previousAc);

    try {
      const result: DeliveryResult = await browser.runtime.sendMessage({
        task: "acceptedSubmission",
        submission: latest,
        attempts,
      });
      logger.log("Webhook delivery", result);
      if (!(await getShowEmoji())) return;
      const status = document
        .getElementById(`solution-${latest.submissionId}`)
        ?.querySelector(".result-text");
      if (!status) return;

      const badge = document.createElement("span");
      if (result.failed) {
        badge.textContent = " ❌";
        badge.title = "[BJCORD] 일부 웹훅에 전송하지 못했습니다.";
      } else if (result.sent) {
        badge.textContent = " ✔️";
        badge.title = `[BJCORD] 웹훅 ${result.sent}개에 전송했습니다.`;
      } else if (result.unknownTierSkipped) {
        badge.textContent = " ⓘ";
      } else {
        return;
      }
      if (result.unknownTierSkipped) {
        badge.title += ` 티어를 확인할 수 없어 웹훅 ${result.unknownTierSkipped}개를 건너뛰었습니다.`;
      }
      status.append(badge);
    } catch {
      logger.error("웹훅 전송 결과를 확인할 수 없습니다.");
    }
  }, WATCH_JUDGEMENT_INTERVAL);
}
