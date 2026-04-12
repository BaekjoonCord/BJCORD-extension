import cn from "@yeahx4/cn";

export default function OptionHeader() {
  return (
    <div
      className={cn(
        "bg-[#1e1f22] flex justify-between items-center w-full",
        "p-2 rounded-sm"
      )}
    >
      <div className="w-[18%] text-center font-bold">웹훅 이름</div>
      <div className="w-[38%] text-center font-bold">웹훅 URL</div>
      <div className="w-[16%] text-center font-bold">표시될 이름</div>
      <div className="w-[22%] text-center font-bold">티어 범위</div>
      <div className="w-[6%] text-center font-bold" />
    </div>
  );
}
