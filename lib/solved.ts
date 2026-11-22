/** Only extension pages and the background worker use the saved app credentials. */
const STORAGE_KEY = "solvedApp";

export interface SolvedCredentials {
  clientId: string;
  clientSecret: string;
}

export async function getSolvedCredentials(): Promise<
  SolvedCredentials | undefined
> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return stored[STORAGE_KEY];
}

export async function saveSolvedCredentials(credentials: SolvedCredentials) {
  await browser.storage.local.setAccessLevel?.({
    accessLevel: "TRUSTED_CONTEXTS",
  });
  await browser.storage.local.set({ [STORAGE_KEY]: credentials });
}

export async function removeSolvedCredentials() {
  await browser.storage.local.remove(STORAGE_KEY);
}

export interface ProblemMetadata {
  level: number;
  tags: string[];
  solvedUserCount: number;
}

interface ProblemDetail {
  level: number;
  tags: { key: string }[];
  solvedUserCount: number;
  ojLinks: { nativeProblemId: string; url: string }[];
}

export async function fetchProblemMetadata(
  problemId: string,
  { clientId, clientSecret }: SolvedCredentials
): Promise<ProblemMetadata | null> {
  if (!/^[1-9]\d*$/.test(problemId)) return null;
  const response = await fetch(
    `https://solved.ac/api/v4/problems/${problemId}`,
    {
      headers: { "x-client-id": clientId, "x-client-secret": clientSecret },
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    }
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`solved.ac HTTP ${response.status}`);

  const problem: ProblemDetail = await response.json();
  // In v4 the same numeric ID can identify a different judge's problem.
  const matchesBoj = problem.ojLinks.some(
    (link) =>
      link.nativeProblemId === problemId &&
      [
        `https://acmicpc.net/problem/${problemId}`,
        `https://www.acmicpc.net/problem/${problemId}`,
      ].includes(link.url)
  );
  if (
    !matchesBoj ||
    !Number.isInteger(problem.level) ||
    problem.level < 0 ||
    problem.level > 30
  ) {
    return null;
  }

  return {
    level: problem.level,
    tags: problem.tags.map((tag) => tag.key),
    solvedUserCount: problem.solvedUserCount,
  };
}
