import { Webhook } from "@/lib/webhook";

export default function OptionWebhookItem({ webhook }: { webhook: Webhook }) {
  return (
    <div className="flex">
      <div>{webhook.name}</div>
      <div>{webhook.url}</div>
      <div>{webhook.active ? "Active" : "Inactive"}</div>
      <div>X</div>
    </div>
  );
}
