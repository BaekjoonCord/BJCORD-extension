// 만약 '제출'페이지를 보고 있다면, 이 스크립트가 실행된다.
log("BOJ status page detected!");
log("Current user: " + getHandle());

const currentUrl = window.location.href;
const handle = getHandle();

// 현재 페이지가 '내 제출' 페이지인지 확인한다.
if (!!handle) {
  if (
    ["status", `user_id=${handle}`, "problem_id", "from_mine=1"].every((key) =>
      currentUrl.includes(key)
    )
  )
    watch();
}

/**
 * 내 제출 페이지에서 채점 중인 제출이 있는지 확인한다.
 * 10초 내 AC는 바로 웹훅을 전송하고 10초 이상된 AC는
 * `isJudging`이 true인지 확인하고 전송한다.
 */
let isJudging = false;
let judgeStartTime = 0;

/**
 * 1초마다 제출 결과를 확인한다. 제출 결과가 AC인 경우, Discord로 메시지를 전송한다.
 */
function watch() {
  const interval = setInterval(() => {
    const table = getResultTable();
    if (!table || table.length == 0) return;

    const data = table[0];

    if (
      data.hasOwnProperty("username") &&
      data.hasOwnProperty("resultCategory")
    ) {
      const { username, resultCategory } = data;

      if (username == getHandle()) {
        if (resultCategory == "judging") {
          if (!isJudging) {
            isJudging = true;
            judgeStartTime = new Date().getTime();
            log("Waiting for judge result...");
          }
          return;
        }
        if (resultCategory != "ac") {
          log('Result is not "AC". Aborted.');
          return;
        }

        const time = getTimeDifference(data.submissionTime);
        if (time > 10) {
          if (!isJudging) return;

          const duration = new Date().getTime() - judgeStartTime;
          log("AC detected. " + duration / 1000 + " s elapsed.");
        }

        clearInterval(interval);
        log("Submission detected: " + resultCategory);
        log(data);

        let attemps = 1;
        for (let i = 1; i < table.length; i++) {
          if (table[i].username != username) break;
          if (table[i].resultCategory != "ac") attemps++;
          else break;
        }

        log("Sending message to Discord...");
        (async () => {
          const startTime = new Date().getTime();
          const msg = await getWebhookMessage(
            getHandle(),
            data.submissionId,
            data.problemId,
            data.language,
            data.memory,
            data.resultCategory,
            data.runtime,
            data.codeLength,
            data.result,
            data.submissionTime,
            attemps
          );

          const webhooks = await getWebhooks();
          const enabled = webhooks.filter((x) => x.enabled);
          log(
            webhooks.length + " webhooks found. " + enabled.length + " enabled."
          );

          let success = 0;
          let failed = 0;
          for (const webhook of enabled) {
            try {
              await sendMessage(msg, webhook.url);
              success++;
            } catch (e) {
              logErr(e);
              failed++;
            }
          }

          log("Message sent to " + success + " webhooks.");
          if (failed > 0) logErr(failed + " webhooks failed to send message.");
          const endTime = new Date().getTime();

          log("Took " + (endTime - startTime) + "ms");
        })();
      }
    }
  }, 1000);
}
