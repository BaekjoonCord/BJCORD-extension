import cn from "@yeahx4/cn";
import OptionInput from "./option-input";
import OptionAddBtn from "./option-add-btn";
import OptionCheckbox from "./option-checkbox";

export default function OptionInputField() {
  return (
    <div className="flex flex-col gap-4">
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
      <div className="flex flex-col gap-1">
        <OptionCheckbox name="webhook-success-emoji">
          웹훅 전송 완료 이모지 표시
        </OptionCheckbox>
        <OptionCheckbox name="webhook-first-solve">
          문자를 최초로 맞춘 경우에만 웹훅 전송
        </OptionCheckbox>
      </div>
    </div>
  );
}
