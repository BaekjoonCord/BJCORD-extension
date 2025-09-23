import { Webhook } from "@/lib/webhook";

export default function PopupWebhookItem({
  webhook,
  toggleWebhook,
}: {
  webhook: Webhook;
  toggleWebhook: (id: string) => void;
}) {
  return (
    <div className="text-white flex gap-2">
      <div>
        {/* TODO : Switch로 바꾸기 */}
        <input
          type="checkbox"
          checked={webhook.active}
          onChange={() => toggleWebhook(webhook.id)}
        />
      </div>
      <span>{webhook.name}</span>
    </div>
  );
}
