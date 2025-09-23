import { Webhook } from "@/lib/webhook";
import cn from "@yeahx4/cn";

export default function OptionWebhookItem({ webhook }: { webhook: Webhook }) {
  return (
    <div
      className={cn(
        "flex justify-between items-center w-full gap-1",
        "h-8 bg-[#2c2f33] pl-4 pr-2 rounded-sm"
      )}
    >
      <div className="w-[20%] hover:cursor-text">{webhook.name}</div>
      <div className="w-[50%] hover:cursor-text">{webhook.url}</div>
      <div className="w-[25%] hover:cursor-text">{webhook.displayName}</div>
      <div
        className={cn(
          "bg-red-500 text-white w-[5%] transition-all",
          "cursor-pointer text-center rounded-sm hover:bg-red-600"
        )}
      >
        X
      </div>
    </div>
  );
}
