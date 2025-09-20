import cn from "@yeahx4/cn";
import OptionInput from "./option-input";
import OptionAddBtn from "./option-add-btn";

export default function OptionInputField() {
  return (
    <div
      className={cn(
        "flex justify-between items-center w-full gap-1",
        "h-[36px]"
      )}
    >
      <OptionInput className="w-[20%]" placeholder="웹훅 이름" />
      <OptionInput
        className="w-[50%]"
        placeholder="웹훅 URL (신뢰할 수 없는 타인에게 공유하지 마세요)"
      />
      <OptionInput className="w-[25%]" placeholder="표시될 이름" />
      <OptionAddBtn />
    </div>
  );
}
