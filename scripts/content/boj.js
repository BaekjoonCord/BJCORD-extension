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
        if (
          resultCategory === "judging" ||
          resultCategory === "wait" ||
          resultCategory === "compile"
        ) {
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

          if (await getShowEmoji()) {
            /**  메시지 전송 결과에 따라 체크 또는 X 표시
             * 모든 웹훅이 정상 작동되면 체크 표시
             * 웹훅이 아무것도 등록이 안된 경우에는 X로 표시
             */
            log("Appending status emoji...");

            const statusCell = document.querySelector(
              "span.result-text.result-ac"
            );

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
              logErr("Status cell not found. Cannot append status.");
            }
          } else {
            log("Emoji display is disabled. Skip.");
          }

          const endTime = new Date().getTime();
          log("Took " + (endTime - startTime) + "ms");
        })();
      }
    }
  }, 100);
}
