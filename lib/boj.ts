import { ContentScriptContext } from "#imports";
import { getActiveWebhooks, getSendFirstAcOnly, getShowEmoji } from "./browser";
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
  TIER_NAME,
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

interface ResultTableRow {
  codeLength: string;
  elementId: string;
  language: string;
  memory: string;
  problemId: string;
  result: string;
  resultCategory: string;
  runtime: string;
  submissionId: string;
  submissionTime: string;
  username: string;
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
          const idElement = x.querySelector(PROBLEM_ID_QUERY);
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

  return list as ResultTableRow[];
}

function getTimeDifference(timestamp: string) {
  const monthNames: Record<string, string> = {
    "1월": "January",
    "2월": "February",
    "3월": "March",
    "4월": "April",
    "5월": "May",
    "6월": "June",
    "7월": "July",
    "8월": "August",
    "9월": "September",
    "10월": "October",
    "11월": "November",
    "12월": "December",
  };

  for (let month in monthNames) {
    if (timestamp.includes(month)) {
      timestamp = timestamp.replace(month, monthNames[month]);
    }
  }

  timestamp = timestamp
    .replace("년", ", ")
    .replace("일", ",")
    .replace(":", ":");

  const timestampDate = new Date(Date.parse(timestamp));

  const now = new Date();
  const difference = now.getTime() - timestampDate.getTime();
  const differenceInSeconds = Math.floor(difference / 1000);

  return differenceInSeconds;
}

export interface SolvedTag {
  key: string;
  isMeta: boolean;
  bojTagId: number;
  problemCount: number;
  displayNames: {
    language: string;
    name: string;
    short: string;
  }[];
  aliases: string[];
}

export interface SolvedProblem {
  problemId: number;
  titleKo: string;
  titles: {
    language: string;
    languageDisplayName: string;
    title: string;
    isOriginal: boolean;
  }[];
  isSolvable: boolean;
  isPartial: boolean;
  acceptedUserCount: number;
  level: number;
  votedUserCount: number;
  sprout: boolean;
  givesNoRating: boolean;
  isLevelLocked: boolean;
  averageTries: number;
  official: boolean;
  tags: SolvedTag[];
  metadata: Record<string, unknown>;
}

export async function getProblemData(problemId: string) {
  return (await browser.runtime.sendMessage({
    sender: "boj",
    task: "solvedProblemFetch",
    problemId,
  })) as SolvedProblem;
}

export function getProblemTier(problemData: SolvedProblem) {
  const { level, isLevelLocked } = problemData;

  if (level === 0 && isLevelLocked) {
    return "Not Ratable";
  }

  return TIER_NAME[level];
}

export const getColor = (tier: string) => {
  switch (tier) {
    case "bronze":
      return 0xcd7f32;
    case "silver":
      return 0xc0c0c0;
    case "gold":
      return 0xffd700;
    case "platinum":
      return 0x61fa9e;
    case "diamond":
      return 0x4db8fa;
    case "ruby":
      return 0xff125d;
    default:
      return 0x000000;
  }
};

function getLevelImg(level: string) {
  const tier = level.split(" ")[0];
  const CDN = `https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/solved-tier`;
  if (tier == "Unrated") {
    return `${CDN}/unrated.png`;
  }

  if (level == "Not Ratable") {
    return `${CDN}/not-ratable.png`;
  }

  const step = level.split(" ")[1];

  let stepNum = 0;
  switch (step) {
    case "I":
      stepNum = 1;
      break;
    case "II":
      stepNum = 2;
      break;
    case "III":
      stepNum = 3;
      break;
    case "IV":
      stepNum = 4;
      break;
    case "V":
      stepNum = 5;
      break;
    default:
      stepNum = 0;
  }

  return `${CDN}/${tier.toLowerCase()}${stepNum}.png`;
}

async function sendMessage(message: any, url: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error("Failed to send webhook: " + response.statusText);
  }
}

export async function getWebhookMessage(
  handle: string,
  submissionId: string,
  problemId: string,
  language: string,
  memory: string,
  result: string,
  runtime: string,
  length: string,
  resultText: string,
  timestamp: string,
  attempts: number
) {
  const solved = await getProblemData(problemId);
  console.log(solved);

  const getTagName = (tag: SolvedTag) => {
    const key = tag.key;
    const display = tag.displayNames.filter((x) => x.language == "ko");

    if (!display) return key;

    return display[0].name;
  };

  const tier = getProblemTier(solved);

  return (displayName: string | undefined) => ({
    content: null,
    embeds: [
      {
        title: `[${tier}] ${problemId}번: ${solved.titleKo}`,
        url: `https://www.acmicpc.net/problem/${problemId}`,
        description: `[코드 보기](https://www.acmicpc.net/source/${submissionId})\n${
          solved.tags.length > 0
            ? `태그: ||${solved.tags.map(getTagName).join(", ")}||`
            : ""
        }`,
        color: getColor(tier.split(" ")[0].toLowerCase()),
        fields: [
          {
            name: "성능",
            value: `${memory} KB / ${runtime} ms`,
            inline: true,
          },
          {
            name: "언어",
            value: language || "?",
            inline: true,
          },
          {
            name: "시도한 횟수",
            value: `${attempts} 회`,
            inline: true,
          },
          {
            name: "제출 일자",
            value: `${timestamp}`,
            inline: true,
          },
          {
            name: "코드 길이",
            value: length ? `${length} B` : "?",
            inline: true,
          },
          {
            name: "평균 시도",
            value: `${solved.averageTries} 회`,
            inline: true,
          },
          {
            name: "맞은 사람",
            value: `${solved.acceptedUserCount} 명`,
            inline: true,
          },
        ],
        author: {
          name: `${displayName || handle}`,
          url: `https://solved.ac/profile/${handle}`,
        },
        thumbnail: {
          url: getLevelImg(tier),
        },
      },
    ],
    username: "BJCORD",
    avatar_url:
      "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/thumbnail.png",
    attachments: [],
  });
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

  let isJudging = false;
  let judgeStartTime = 0;

  /*
    많은 브라우저들은 확장이 "invalidated" 되었을 때
    (ex. 업데이트되거나 사용자가 확장을 비활성화하거나 제거하는 경우)
    모든 content script를 중지시키지 않습니다. Invalidated된 상태에서
    interval이 계속 동작하는 것을 막아주기 위해 ctx.setInterval을 사용합니다.
    참고 : https://wxt.dev/guide/essentials/content-scripts.html
  */
  const interval = ctx.setInterval(() => {
    const table = getResultTable();
    // console.log(table);

    if (!table || table.length == 0) return;
    const latest = table[0];

    if (
      latest.resultCategory === "judging" ||
      latest.resultCategory === "wait" ||
      latest.resultCategory === "compile"
    ) {
      if (!isJudging) {
        isJudging = true;
        judgeStartTime = Date.now();
        logger.log("Waiting for judgement...");
      }

      return;
    }

    if (latest.resultCategory !== "ac") {
      logger.log("Latest submission is not AC, aborted.");
      clearInterval(interval);
      return;
    }

    // 마지막 제출로부터 지난 시간
    const time = getTimeDifference(latest.submissionTime);
    if (time > 10) {
      // 10초 이상 지났으면 무시
      if (!isJudging) return;

      const duration = (Date.now() - judgeStartTime) / 1000;
      logger.log(`AC! Took ${duration} seconds.`);
    }

    clearInterval(interval);

    // 시도 횟수 계산
    let attempts = 1;
    for (let i = 1; i < table.length; i++) {
      // if (table[i].username != getHandle()) break;
      if (table[i].resultCategory != "ac") attempts++;
      else break;
    }

    logger.log(`Attempts: ${attempts}`);
    logger.log(`Sending webhook...`);

    (async () => {
      const msg = await getWebhookMessage(
        latest.username,
        latest.submissionId,
        latest.problemId,
        latest.language,
        latest.memory,
        latest.result,
        latest.runtime,
        latest.codeLength,
        latest.resultCategory,
        latest.submissionTime,
        attempts
      );

      const webhooks = await getActiveWebhooks();
      let success = 0;
      let failed = 0;
      for (const webhook of webhooks) {
        try {
          await sendMessage(msg(webhook.displayName), webhook.url);
          success++;
        } catch (e) {
          logger.error(e);
          failed++;
        }
      }

      logger.log(`Webhook sent! (Success: ${success}, Failed: ${failed})`);

      // Show Emoji
      const shouldShowEmoji = await getShowEmoji();
      if (shouldShowEmoji) {
        const statusCell = document.querySelector("span.result-text.result-ac");

        if (statusCell) {
          if (success > 0 && failed === 0) {
            statusCell.innerHTML +=
              '<span title="[BJCORD] 결과를 디스코드에 성공적으로 전달했습니다."> ✔️</span>';
          } else {
            if (failed !== 0)
              statusCell.innerHTML +=
                '<span title="[BJCORD] 결과를 디스코드에 전달하는데 실패했습니다. 자세한 내용은 로그를 참고해주세요."> ❌</span>';
          }
        } else {
          logger.error("Status cell not found. Cannot append status.");
        }
      }

      const endTime = new Date().getTime();
      const elapsed = endTime - judgeStartTime;
      logger.log(`Elapsed time: ${elapsed} ms`);
    })();
  }, WATCH_JUDGEMENT_INTERVAL);
}
