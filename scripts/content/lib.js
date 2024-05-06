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
    function (m) {
      return unescaped[m];
    }
  );
}

/** 문자열을 unescape 하여 반환합니다. */
String.prototype.unescapeHtml = function () {
  return unescapeHtml(this);
};

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

async function getWebhookMessage(
  handle,
  submissionId,
  problemId,
  language,
  memory,
  result,
  runtime,
  length,
  resultText
) {
  const solved = await getProblemData(problemId);
  console.log(solved);

  const getTagName = (tag) => {
    const key = tag.key;
    const display = tag.displayNames.filter((x) => x.language == "ko");

    if (!display) return key;

    return display[0].name;
  };

  return {
    content: `**${handle}**님이 문제를 풀었습니다!
언어: ${language}
메모리: ${memory || "?"} KB, 시간: ${runtime || "?"} ms
코드 길이: ${length} B`,
    embeds: [
      {
        title: `#${problemId}: ${solved.titleKo}`,
        url: `https://www.acmicpc.net/problem/${problemId}`,
        color: getColor(result),
        fields: [
          {
            name: "난이도",
            value: bj_level[solved.level],
            inline: true,
          },
          {
            name: "태그",
            value: solved.tags
              .map(getTagName)
              .map((x) => `||${x}||`)
              .join(", "),
            inline: false,
          },
        ],
        author: {
          name: `${handle}`,
          url: `https://solved.ac/profile/${handle}`,
        },
      },
    ],
    username: "BJCORD",
    avatar_url:
      "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/thumbnail.png",
    attachments: [],
  };
}

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

const getColor = (result) => {
  switch (result) {
    case "ac":
      return 0x00ff00;
    case "pac":
      return 0x57b557;
    case "pe":
      return 0xffa500;
    case "wa":
      return 0xff0000;
    case "awa":
      return 0x00ff00;
    case "tle":
      return 0xff0000;
    case "mle":
      return 0xff0000;
    case "ole":
      return 0xff0000;
    case "rte":
      return 0xff0000;
    case "ce":
      return 0xff0000;
    case "co":
      return 0x000000;
    case "del":
      return 0x000000;
    default:
      return 0x000000;
  }
};

async function getProblemData(id) {
  return chrome.runtime.sendMessage({
    sender: "boj",
    task: "solvedProblemFetch",
    problemId: id,
  });
}
