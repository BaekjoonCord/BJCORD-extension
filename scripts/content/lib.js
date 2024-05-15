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

/**
 * HTML 문자열의 escape된 문자를 unescape하여 반환합니다.
 *
 * @param {string} text HTML 문자열
 * @returns {string} unescape된 문자열
 */
function unescapeHtml(text) {
  const unescaped = {
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
    (m) => unescaped[m]
  );
}

/** 문자열을 unescape 하여 반환합니다. */
String.prototype.unescapeHtml = function () {
  return unescapeHtml(this);
};

/**
 * 채점 테이블의 데이터를 파싱하고 반환합니다.
 * @returns {Array<Object>} 테이블의 데이터를 반환합니다.
 */
function getResultTable() {
  const table = document.getElementById("status-table");

  if (!table) {
    logErr("테이블을 찾을 수 없습니다.");
    return null;
  }

  const mapTableHeader = (header) => {
    switch (header) {
      case "문제번호":
      case "문제":
        return "problemId";
      case "난이도":
        return "level";
      case "결과":
        return "result";
      case "문제내용":
        return "problemDescription";
      case "언어":
        return "language";
      case "제출 번호":
        return "submissionId";
      case "아이디":
        return "username";
      case "제출시간":
      case "제출한 시간":
        return "submissionTime";
      case "시간":
        return "runtime";
      case "메모리":
        return "memory";
      case "코드 길이":
        return "codeLength";
      default:
        return "unknown";
    }
  };

  const headers = Array.from(table.rows[0].cells).map((x) =>
    mapTableHeader(x.innerText.trim())
  );

  const list = [];
  for (let i = 1; i < table.rows.length; i++) {
    const row = table.rows[i];
    const cells = Array.from(row.cells, (x, i) => {
      switch (headers[i]) {
        case "result":
          return {
            result: x.innerText,
            resultCategory: x.firstChild
              .getAttribute("data-color")
              .replace("-eng", "")
              .trim(),
          };
        case "language":
          return x.innerText.unescapeHtml().replace(/\/.*$/g, "").trim();
        case "submissionTime":
          const time = x.querySelector("a.show-date");
          if (!time) return null;
          return time.getAttribute("data-original-title");
        case "problemId":
          const idElement = x.querySelector("a.problem_title");
          if (!idElement) return null;
          return {
            problemId: idElement
              .getAttribute("href")
              .replace(/^.*\/([0-9]+)$/, "$1"),
          };
        default:
          return x.innerText.trim();
      }
    });

    let obj = {
      elementId: row.id,
    };
    for (let j = 0; j < headers.length; j++) obj[headers[j]] = cells[j];
    obj = { ...obj, ...obj.result, ...obj.problemId };
    list.push(obj);
  }

  return list;
}

/**
 * 두 날짜 사이의 시간 차이를 초 단위로 반환합니다.
 * 타임스탬프가 한국어로 되어 있는 경우 영어로 변환합니다.
 *
 * @param {string} timestamp
 * @returns {number} 시간 차이를 초 단위로 반환합니다.
 */
function getTimeDifference(timestamp) {
  const monthNames = {
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

/**
 * 데이터를 기반으로 웹훅 메세지를 생성합니다.
 * Discord의 Embed Object를 반환합니다.
 * 문제 데이터를 받아오기 위해 service worker를 통해
 * solved.ac의 API를 호출합니다.
 *
 * @param {string} handle 유저의 핸들
 * @param {string | number} submissionId 제출 번호
 * @param {string | number} problemId 문제 번호
 * @param {string} language 제출한 언어 이름
 * @param {number} memory 메모리 사용량 (KB)
 * @param {string} result 실행 결과
 * @param {number} runtime 실행 시간 (ms)
 * @param {number} length 코드 길이 (B)
 * @param {string} resultText 결과 텍스트
 * @param {string} timestamp 제출한 시간
 * @param {number} attemps 시도 횟수
 * @returns {Promise<Object>} 웹훅 메시지를 반환합니다.
 */
async function getWebhookMessage(
  handle,
  submissionId,
  problemId,
  language,
  memory,
  result,
  runtime,
  length,
  resultText,
  timestamp,
  attemps
) {
  const solved = await getProblemData(problemId);
  // console.log(solved);

  const getTagName = (tag) => {
    const key = tag.key;
    const display = tag.displayNames.filter((x) => x.language == "ko");

    if (!display) return key;

    return display[0].name;
  };

  return {
    content: null,
    embeds: [
      {
        title: `[${bj_level[solved.level]}] ${problemId}번: ${solved.titleKo}`,
        url: `https://www.acmicpc.net/problem/${problemId}`,
        description: `[코드 보기](https://www.acmicpc.net/source/${submissionId})\n태그: ||${solved.tags
          .map(getTagName)
          .join(", ")}||`,
        color: getColor(bj_level[solved.level].split(" ")[0].toLowerCase()),
        fields: [
          {
            name: "성능",
            value: `${memory} KB / ${runtime} ms`,
            inline: true,
          },
          {
            name: "언어",
            value: `${language}`,
            inline: true,
          },
          {
            name: "시도한 횟수",
            value: `${attemps} 회`,
            inline: true,
          },
          {
            name: "제출 일자",
            value: `${timestamp}`,
            inline: true,
          },
          {
            name: "코드 길이",
            value: `${length} B`,
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
          name: `${handle}`,
          url: `https://solved.ac/profile/${handle}`,
        },
        thumbnail: {
          url: getLevelImg(bj_level[solved.level]),
        },
      },
    ],
    username: "BJCORD",
    avatar_url:
      "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/thumbnail.png",
    attachments: [],
  };
}

/**
 * 문제 티어에 맞는 이미지 URL을 반환합니다.
 *
 * @param {string} level 문제 티어 (Bronze V ~ Ruby I, Unrated 등)
 * @returns {string} 티어에 해당하는 이미지 URL
 */
function getLevelImg(level) {
  const tier = level.split(" ")[0];
  if (tier == "Unrated") {
    return `https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/solved-tier/unrated.png`;
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

  return `https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/solved-tier/${
    tier.toLowerCase() + stepNum
  }.png`;
}

/**
 * 웹훅 메세지를 전송합니다.
 * POST 요청을 사용하여 메세지를 전송합니다.
 *
 * @param {string} message 전송할 웹훅 메세지
 * @param {string} url 웹훅 URL
 */
async function sendMessage(message, url) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error("Response was not ok");
    }
  } catch (err) {
    log(err);
    throw err;
  }
}

/**
 * 문제의 티어에 맞는 색상을 리턴합니다.
 *
 * @param {string} tier 문제의 티어 영문 (Platinum IV)
 * @returns {number} 티어에 해당하는 색상 코드
 */
const getColor = (tier) => {
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

/**
 * service worker를 통해 solved.ac의 API를 호출하여 문제 데이터를 가져옵니다.
 *
 * @param {number} id 문제 번호
 * @returns {Promise<Object>} 문제 데이터를 반환합니다.
 */
async function getProblemData(id) {
  return chrome.runtime.sendMessage({
    sender: "boj",
    task: "solvedProblemFetch",
    problemId: id,
  });
}

/**
 * 크롬 스토리지에 저장된 웹훅 목록을 불러옵니다.
 * 각 웹훅 객체는 `{name, url, enabled}`로 구성됩니다.
 *
 * @returns {Array<Object>} 웹훅 목록을 반환합니다.
 */
async function getWebhooks() {
  const data = await chrome.storage.sync.get("webhooks");
  return data.webhooks || [];
}
