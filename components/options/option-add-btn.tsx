import cn from "@yeahx4/cn";

export default function OptionAddBtn() {
  return (
    <button
      className={cn(
        "w-[5%] bg-[#3556ca] h-full rounded-sm",
        "cursor-pointer hover:bg-[#2e4bb8]",
        "text-white font-bold transition-colors"
      )}
    >
      추가
    </button>
  );
}
