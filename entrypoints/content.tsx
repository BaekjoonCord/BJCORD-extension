import { getHandle, watchJudgementChange } from "@/lib/boj";
import { getLogger } from "@/lib/logger";

export default defineContentScript({
  matches: ["https://acmicpc.net/status*", "https://www.acmicpc.net/status*"],
  async main(ctx) {
    const handle = getHandle();
    const { pathname, searchParams } = new URL(location.href);
    const problemId = searchParams.get("problem_id");
    if (
      pathname !== "/status" ||
      !handle ||
      searchParams.get("user_id") !== handle ||
      searchParams.get("from_mine") !== "1" ||
      !problemId ||
      !/^[1-9]\d*$/.test(problemId)
    )
      return;

    await watchJudgementChange(ctx, getLogger("content"), handle, problemId);
  },
});
