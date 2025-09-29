export default defineBackground(() => {
  async function getProblemData(id: string) {
    const res = await fetch(
      `https://solved.ac/api/v3/problem/show?problemId=${id}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch problem data");
    }

    return await res.json();
  }

  function handleMessage(
    request: any,
    _: Browser.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    if (request.task == "solvedProblemFetch") {
      getProblemData(request.problemId).then((res) => sendResponse(res));
    }

    return true;
  }

  browser.runtime.onMessage.addListener(handleMessage);
});
