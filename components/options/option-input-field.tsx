import cn from "@yeahx4/cn";
import OptionInput from "./option-input";
import OptionAddBtn from "./option-add-btn";
import OptionCheckbox from "./option-checkbox";
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
  handleAddWebhook,
}: {
  nameInput: string;
  setNameInput: (name: string) => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  displayNameInput: string;
  setDisplayNameInput: (displayName: string) => void;
  handleAddWebhook: () => void;
  handleDeleteWebhook: (id: string) => void;
  handleUpdateWebhook: (
    id: string,
    newWebhook: Partial<Omit<Webhook, "id">>
  ) => void;
}) {
  const [showEmoji, setShowEmoji] = useState(true);
  const [onlyFirstSolve, setOnlyFirstSolve] = useState(false);

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
          "flex justify-between items-center w-full gap-1",
          "h-[36px]"
        )}
      >
        <OptionInput
          className="w-[20%]"
          placeholder="웹훅 이름"
          value={nameInput}
          onChange={setNameInput}
          handleAddWebhook={handleAddWebhook}
        />
        <OptionInput
          className="w-[50%]"
          placeholder="웹훅 URL (신뢰할 수 없는 타인에게 공유하지 마세요)"
          value={urlInput}
          onChange={setUrlInput}
          handleAddWebhook={handleAddWebhook}
        />
        <OptionInput
          className="w-[25%]"
          placeholder="표시될 이름"
          value={displayNameInput}
          onChange={setDisplayNameInput}
          handleAddWebhook={handleAddWebhook}
        />
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
          문자를 최초로 맞춘 경우에만 웹훅 전송
        </OptionCheckbox>
      </div>
    </div>
  );
}
