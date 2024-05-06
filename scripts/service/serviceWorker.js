async function getProblemData(id) {
  const res = await fetch(
    `https://solved.ac/api/v3/problem/show?problemId=${id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch problem data");
  }

  return await res.json();
}

function handleMessge(request, sender, sendResponse) {
  if (request.task == "solvedProblemFetch") {
    getProblemData(request.problemId).then((res) => sendResponse(res));
  }

  return true;
}

chrome.runtime.onMessage.addListener(handleMessge);
