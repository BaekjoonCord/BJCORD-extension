/**
 * solved.ac API를 통해 문제 데이터를 가져옵니다.
 *
 * @param {number} id 문제 번호
 * @returns {Promise<Object>} 문제 데이터
 */
async function getProblemData(id) {
  const res = await fetch(
    `https://solved.ac/api/v3/problem/show?problemId=${id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch problem data");
  }

  return await res.json();
}

/**
 * content script에서 보낸 메세지를 처리합니다.
 *
 * @param {unknown} request chrome API instance
 * @param {unknown} sender chrome API instance
 * @param {unknown} sendResponse chrome API instance
 * @returns {boolean} true
 */
function handleMessge(request, sender, sendResponse) {
  if (request.task == "solvedProblemFetch") {
    getProblemData(request.problemId).then((res) => sendResponse(res));
  }

  return true;
}

chrome.runtime.onMessage.addListener(handleMessge);
