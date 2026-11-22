import {
  fetchProblemMetadata,
  getSolvedCredentials,
  removeSolvedCredentials,
  saveSolvedCredentials,
} from "@/lib/solved";

export default function SolvedSettings() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getSolvedCredentials()
      .then((credentials) => {
        setClientId(credentials?.clientId ?? "");
        setSaved(!!credentials);
      })
      .catch(() => setStatus("이 브라우저의 설정을 읽을 수 없습니다."))
      .finally(() => setBusy(false));
  }, []);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const credentials = {
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
    };
    setBusy(true);
    setStatus("");
    try {
      if (!(await fetchProblemMetadata("1000", credentials))) {
        throw new Error();
      }
      await saveSolvedCredentials(credentials);
      setSaved(true);
      setClientSecret("");
      setStatus("연결을 확인하고 이 브라우저에 저장했습니다.");
    } catch {
      setStatus(
        "저장하지 못했습니다. 앱 ID와 시크릿, solved.ac 연결 상태를 확인해 주세요."
      );
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await removeSolvedCredentials();
      setClientId("");
      setClientSecret("");
      setSaved(false);
      setStatus("이 브라우저에서 연결 정보를 삭제했습니다.");
    } catch {
      setStatus("연결 정보를 삭제하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-t border-[#cbcbcb] pt-4 mt-4">
      <h2 className="font-bold">solved.ac 연동 (선택)</h2>
      <p className="my-2 text-sm">
        티어와 태그를 표시하려면{" "}
        <a
          className="underline"
          href="https://backstage.solved.ac/developer/apps"
          target="_blank"
          rel="noreferrer"
        >
          개발자 콘솔
        </a>
        에서 발급받은 본인의 앱 정보를 입력하세요. 기본 알림은 웹훅만 등록하면
        됩니다. 티어를 확인할 수 없을 때는 모든 난이도를 허용한 웹훅에만
        전송합니다.
      </p>
      <form className="flex flex-wrap gap-2" onSubmit={save}>
        <input
          aria-label="Client ID"
          className="bg-[#2c2f33] rounded-sm px-3 py-2"
          placeholder="Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          required
          disabled={busy}
        />
        <input
          aria-label="Client Secret"
          className="bg-[#2c2f33] rounded-sm px-3 py-2"
          type="password"
          autoComplete="off"
          placeholder={saved ? "새 Client Secret" : "Client Secret"}
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          required
          disabled={busy}
        />
        <button
          className="bg-[#3556ca] rounded-sm px-3 disabled:opacity-50"
          disabled={busy || !clientId.trim() || !clientSecret.trim()}
        >
          확인 후 저장
        </button>
        {saved && (
          <button
            type="button"
            className="underline"
            disabled={busy}
            onClick={disconnect}
          >
            연결 해제
          </button>
        )}
      </form>
      <p role="status" className="mt-1 text-sm">
        {status}
      </p>
    </section>
  );
}
