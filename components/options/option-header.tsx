import cn from "@yeahx4/cn";

export default function OptionHeader() {
  return (
    <div
      className={cn(
        "bg-[#1e1f22] grid grid-cols-[22%_41%_20%_12%_5%] items-center w-full",
        "p-2 rounded-sm"
      )}
    >
      <div className="w-full text-center font-bold">웹훅 이름</div>
      <div className="w-full text-center font-bold">웹훅 URL</div>
      <div className="w-full text-center font-bold">표시될 이름</div>
      <div className="w-full text-center font-bold">난이도 범위</div>
      <div className="w-full text-center font-bold" />
    </div>
  );
}
