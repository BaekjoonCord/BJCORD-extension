import cn from "@yeahx4/cn";
import OptionInput from "./option-input";
import OptionAddBtn from "./option-add-btn";
import OptionCheckbox from "./option-checkbox";
import TierRangeTooltip from "@/components/options/tier-range-tooltip";
import { Webhook } from "@/lib/webhook";
import {
  getSendFirstAcOnly,
  getShowEmoji,
  syncSendFirstAcOnly,
  syncShowEmoji,
} from "@/lib/browser";

export default function OptionInputField({
  nameInput,
  displayNameInput,
  urlInput,
  setDisplayNameInput,
  setNameInput,
  setUrlInput,
  tierMinInput,
  setTierMinInput,
  tierMaxInput,
  setTierMaxInput,
  includeUnratedInput,
  setIncludeUnratedInput,
  handleAddWebhook,
}: {
  nameInput: string;
  setNameInput: (name: string) => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  displayNameInput: string;
  setDisplayNameInput: (displayName: string) => void;
  tierMinInput: number;
  setTierMinInput: (value: number) => void;
  tierMaxInput: number;
  setTierMaxInput: (value: number) => void;
  includeUnratedInput: boolean;
  setIncludeUnratedInput: (value: boolean) => void;
  handleAddWebhook: () => void;
}) {
  const [showEmoji, setShowEmoji] = useState(true);
  const [onlyFirstSolve, setOnlyFirstSolve] = useState(false);
  const draftWebhook: Webhook = {
    id: "draft",
    name: "draft",
    url: "draft",
    active: true,
    tierMin: tierMinInput,
    tierMax: tierMaxInput,
    includeUnrated: includeUnratedInput,
  };

  useEffect(() => {
    (async () => {
      setShowEmoji(await getShowEmoji());
      setOnlyFirstSolve(await getSendFirstAcOnly());
    })();
  });

  const toggleShowEmoji = async () => {
    setShowEmoji((prev) => !prev);
    await syncShowEmoji(!showEmoji);
  };

  const toggleOnlyFirstSolve = async () => {
    setOnlyFirstSolve((prev) => !prev);
    await syncSendFirstAcOnly(!onlyFirstSolve);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid grid-cols-[21%_40%_20%_12%_5%] items-center w-full gap-1",
          "h-[36px]"
        )}
      >
        <OptionInput
          className="w-full"
          placeholder="웹훅 이름"
          value={nameInput}
          onChange={setNameInput}
          handleAddWebhook={handleAddWebhook}
        />
        <OptionInput
          className="w-full"
          placeholder="웹훅 URL (신뢰할 수 없는 타인에게 공유하지 마세요)"
          value={urlInput}
          onChange={setUrlInput}
          handleAddWebhook={handleAddWebhook}
        />
        <OptionInput
          className="w-full"
          placeholder="표시될 이름"
          value={displayNameInput}
          onChange={setDisplayNameInput}
          handleAddWebhook={handleAddWebhook}
        />
        <div className="bg-[#2c2f33] rounded-sm h-full flex items-center justify-center">
          <TierRangeTooltip
            webhook={draftWebhook}
            handleUpdateWebhook={(_, updates) => {
              if (updates.tierMin !== undefined) setTierMinInput(updates.tierMin);
              if (updates.tierMax !== undefined) setTierMaxInput(updates.tierMax);
              if (updates.includeUnrated !== undefined)
                setIncludeUnratedInput(updates.includeUnrated);
            }}
          />
        </div>
        <OptionAddBtn onClick={handleAddWebhook} />
      </div>
      <div className="flex flex-col gap-1">
        <OptionCheckbox
          name="webhook-success-emoji"
          checked={showEmoji}
          onChange={toggleShowEmoji}
        >
          웹훅 전송 완료 이모지 표시
        </OptionCheckbox>
        <OptionCheckbox
          name="webhook-first-solve"
          checked={onlyFirstSolve}
          onChange={toggleOnlyFirstSolve}
        >
          문제를 최초로 맞춘 경우에만 웹훅 전송
        </OptionCheckbox>
      </div>
    </div>
  );
}
