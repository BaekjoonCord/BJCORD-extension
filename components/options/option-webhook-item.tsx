import { Webhook } from "@/lib/webhook";
import cn from "@yeahx4/cn";

export default function OptionWebhookItem({ webhook }: { webhook: Webhook }) {
  return (
    <div
      className={cn(
        "flex justify-between items-center w-full gap-2",
        "h-8 bg-[#2c2f33] pl-4 pr-2 rounded-sm min-w-0"
      )}
    >
      <div className={cn("w-[20%] hover:cursor-text h-full flex items-center")}>
        <span className="w-full truncate">{webhook.name}</span>
      </div>
      <div className={cn("w-64 hover:cursor-text h-full flex items-center")}>
        <span className="w-full truncate">{webhook.url}</span>
      </div>
      <div className={cn("w-[25%] hover:cursor-text h-full flex items-center")}>
        <span className="w-full truncate">{webhook.displayName}</span>
      </div>
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
