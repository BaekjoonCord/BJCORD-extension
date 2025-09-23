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
          <PopupWebhookItem
            key={wh.id}
            webhook={wh}
            toggleWebhook={toggleWebhook}
          />
        ))
      ) : (
        <span className="text-sm text-gray-300 self-center">
          "등록된 웹훅이 없습니다."
        </span>
      )}
    </div>
  );
}
