import { getHandle, watchJudgementChange } from "@/lib/boj";
import { getLogger } from "@/lib/logger";

export default defineContentScript({
  matches: ["*://www.acmicpc.net/*", "*://acmicpc.net/*"],
  async main() {
    const logger = getLogger("content");

    const url = location.href;
    logger.log("URL:", url);

    const handle = getHandle();
    if (!handle) {
      logger.log("No handle found, aborted.");
      return;
    }

    logger.log("Handle:", handle);

    if (
      ["status", `user_id=${handle}`, "problem_id", "from_mine=1"].every(
        (key) => url.includes(key)
      )
    ) {
      // Main Content Script
      logger.log("Starting...");
      await watchJudgementChange(logger);
    } else {
      logger.log("Not in the status page, aborted.");
    }

    // logger.log("Injecting script...");

    // await injectScript("/main-world-script.js", {
    //   keepInDom: true,
    // });

    // logger.log("Done!");
  },
});
