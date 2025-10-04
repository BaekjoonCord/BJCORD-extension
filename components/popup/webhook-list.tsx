import { getWebhooks } from "@/lib/browser";
import { updateWebhook, Webhook } from "@/lib/webhook";
import cn from "@yeahx4/cn";
import PopupWebhookItem from "./popup-webhook-item";

export default function WebhookList() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  useEffect(() => {
    (async () => {
      setWebhooks(await getWebhooks());
    })();
  }, []);

  const toggleWebhook = async (id: string) => {
    setWebhooks((prev) =>
      prev.map((wh) =>
        wh.id === id ? { ...wh, active: !wh.active } : { ...wh }
      )
    );

    await updateWebhook(id, {
      active: !webhooks.find((wh) => wh.id === id)?.active,
    });
  };

  return (
    <div
      className={cn(
        "bg-[#424549] w-full p-4 rounded-sm h-48",
        "overflow-auto flex flex-col"
      )}
    >
      {webhooks.length ? (
        webhooks.map((wh) => (
          <div className="flex justify-between" key={wh.id}>
            <PopupWebhookItem webhook={wh} toggleWebhook={toggleWebhook} />
            <span className="text-sm text-gray-300 opacity-90">
              {wh.displayName ? `[${wh.displayName}]` : ""}
            </span>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center h-[80%] justify-center">
          <span className="text-sm text-gray-300 self-center">
            등록된 웹훅이 없습니다
          </span>
          <a
            // href={`chrome-extension://${extId}/options.html`}
            href={browser.runtime.getURL("/options.html")}
            target="_blank"
            className="mt-2 text-sm text-blue-400 underline"
          >
            추가하기
          </a>
        </div>
      )}
    </div>
  );
}
