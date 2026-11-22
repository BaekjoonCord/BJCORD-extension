import { getWebhooks } from "./browser";
import {
  DEFAULT_TIER_SELECTION_END,
  DEFAULT_TIER_SELECTION_START,
  TIER_NAME,
} from "./constants";
import {
  fetchProblemMetadata,
  getSolvedCredentials,
  type ProblemMetadata,
} from "./solved";
import { BASE_IMG, getTierImg } from "./tier";
import { includesUnrated, type Webhook } from "./webhook";

export interface Submission {
  submissionId: string;
  problemId: string;
  title: string;
  username: string;
  memory: string;
  runtime: string;
  language: string;
  codeLength: string;
  timestamp: number;
}

export interface DeliveryResult {
  sent: number;
  failed: number;
  unknownTierSkipped: number;
}

export function matchesTier(webhook: Webhook, level?: number) {
  const min = webhook.tierMin ?? DEFAULT_TIER_SELECTION_START;
  const max = webhook.tierMax ?? DEFAULT_TIER_SELECTION_END;
  if (level === undefined) {
    return (
      min <= DEFAULT_TIER_SELECTION_START &&
      max >= DEFAULT_TIER_SELECTION_END &&
      includesUnrated(webhook)
    );
  }
  return level === 0 ? includesUnrated(webhook) : level >= min && level <= max;
}

const embedColors = [
  0xcd7f32, 0xc0c0c0, 0xffd700, 0x61fa9e, 0x4db8fa, 0xff125d,
];

export function buildWebhookMessage(
  row: Submission,
  attempts: number,
  solved: ProblemMetadata | null,
  displayName?: string
) {
  const boj = "https://acmicpc.net";
  const tierPrefix = solved ? `[${TIER_NAME[solved.level]}] ` : "";
  const title = `${tierPrefix}${row.problemId}번${row.title ? `: ${row.title}` : ""}`;
  const source = `[코드 보기](${boj}/source/${row.submissionId})`;
  return {
    username: "BJCORD",
    avatar_url:
      "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/thumbnail.png",
    embeds: [
      {
        title: title.slice(0, 256),
        url: `${boj}/problem/${row.problemId}`,
        description: solved?.tags.length
          ? `${source}\n태그: ||${solved.tags.join(", ")}||`
          : source,
        author: {
          name: displayName || row.username,
          url: `${boj}/user/${encodeURIComponent(row.username)}`,
        },
        ...(solved && {
          color: embedColors[Math.ceil(solved.level / 5) - 1] ?? 0,
          thumbnail: { url: `${BASE_IMG}${getTierImg(solved.level)}.png` },
        }),
        fields: [
          {
            name: "성능",
            value: `${row.memory || "?"} KB / ${row.runtime || "?"} ms`,
            inline: true,
          },
          { name: "언어", value: row.language || "?", inline: true },
          { name: "시도한 횟수", value: `${attempts} 회`, inline: true },
          {
            name: "제출 일자",
            value: row.timestamp > 0 ? `<t:${row.timestamp}:f>` : "?",
            inline: true,
          },
          {
            name: "코드 길이",
            value: row.codeLength ? `${row.codeLength} B` : "?",
            inline: true,
          },
          ...(solved
            ? [
                {
                  name: "맞은 사람",
                  value: `${solved.solvedUserCount} 명`,
                  inline: true,
                },
              ]
            : []),
        ],
      },
    ],
  };
}

export async function deliverSubmission(
  row: Submission,
  attempts: number
): Promise<DeliveryResult> {
  const result = { sent: 0, failed: 0, unknownTierSkipped: 0 };
  const webhooks = (await getWebhooks()).filter((webhook) => webhook.active);
  if (!webhooks.length) return result;

  let solved: ProblemMetadata | null = null;
  try {
    const credentials = await getSolvedCredentials();
    if (credentials)
      solved = await fetchProblemMetadata(row.problemId, credentials);
  } catch {
    console.warn("[BJCORD] solved.ac 문제 정보를 가져올 수 없습니다.");
  }

  for (const webhook of webhooks) {
    if (!matchesTier(webhook, solved?.level)) {
      if (!solved) result.unknownTierSkipped++;
      continue;
    }

    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(
          buildWebhookMessage(row, attempts, solved, webhook.displayName)
        ),
      });
      if (response.ok) result.sent++;
      else result.failed++;
    } catch {
      result.failed++;
    }
  }
  return result;
}
