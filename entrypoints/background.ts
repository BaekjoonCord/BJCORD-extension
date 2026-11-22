import { deliverSubmission, type DeliveryResult } from "@/lib/submission";

export default defineBackground(() => {
  const deliveries = new Map<string, Promise<DeliveryResult>>();

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.task !== "acceptedSubmission" || !sender.url || !sender.tab)
      return;
    const url = new URL(sender.url);
    const row = request.submission;
    if (
      !["https://acmicpc.net", "https://www.acmicpc.net"].includes(
        url.origin
      ) ||
      url.pathname !== "/status" ||
      url.searchParams.get("from_mine") !== "1" ||
      !row ||
      !/^[1-9]\d*$/.test(row.submissionId) ||
      !/^[1-9]\d*$/.test(row.problemId) ||
      url.searchParams.get("user_id") !== row.username ||
      url.searchParams.get("problem_id") !== row.problemId
    )
      return;

    // Reloads and multiple tabs can see the same freshly accepted submission.
    let delivery = deliveries.get(row.submissionId);
    if (!delivery) {
      delivery = deliverSubmission(row, request.attempts).catch(() => ({
        sent: 0,
        failed: 1,
        unknownTierSkipped: 0,
      }));
      deliveries.set(row.submissionId, delivery);
      delivery.then((result) => {
        if (!result.sent) deliveries.delete(row.submissionId);
        else setTimeout(() => deliveries.delete(row.submissionId), 15_000);
      });
    }
    delivery.then(sendResponse);
    return true;
  });
});
