import cn from "@yeahx4/cn";

export default function WebhookList() {
  return (
    <div
      className={cn(
        "bg-[#424549] w-full p-4 rounded-sm min-h-48",
        "overflow-auto flex flex-col"
      )}
    >
      <span className="text-sm text-gray-300 self-center">
        등록된 웹훅이 없습니다.
      </span>
    </div>
  );
}
