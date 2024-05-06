log("BOJ status page detected!");
log("Current user: " + getHandle());
// log(getResultTable());

const currentUrl = window.location.href;
const handle = getHandle();

if (!!handle) {
  if (
    ["status", `user_id=${handle}`, "problem_id", "from_mine=1"].every((key) =>
      currentUrl.includes(key)
    )
  )
    watch();
}

function watch() {
  const interval = setInterval(() => {
    const table = getResultTable();
    if (!table || table.length == 0) return;

    const data = table[0];

    console.log(data);

    if (
      data.hasOwnProperty("username") &&
      data.hasOwnProperty("resultCategory")
    ) {
      const { username, resultCategory } = data;

      if (username == getHandle()) {
        if (resultCategory == "judging") return;

        console.dir(getTimeDifference(data.submissionTime));

        clearInterval(interval);
        log("Submission detected: " + resultCategory);
        log(data);
      }
    }
  }, 1000);
}
