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
        // if (
        //   resultCategory == "judging" ||
        //   resultCategory == "compile" ||
        //   resultCategory == "wait"
        // )
        //   return;
        if (resultCategory != "ac") return;

        const time = getTimeDifference(data.submissionTime);
        if (time > 120) return;

        clearInterval(interval);
        log("Submission detected: " + resultCategory);
        log(data);
        log("Sending message to Discord...");

        let attemps = 1;
        for (let i = 0; i < table.length; i++) {
          if (table[i].username != username) break;
          if (table[i].resultCategory != "ac") attemps++;
          else break;
        }

        (async () => {
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

          // TODO : Flexibly change the webhook URL via the settings page.
          sendMessage(
            msg,
            "https://discord.com/api/webhooks/1236995046964727869/r5bHZKznebAt1TFeaHQZ3ATenc_zT_Xr9QFCtCycMxFw-4CUXOAK8JQi15aAZUOGlOUu"
          );
        })();
      }
    }
  }, 1000);
}
