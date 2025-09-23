import OptionHeader from "@/components/options/option-header";
import OptionInputField from "@/components/options/option-input-field";
import OptionWebhookItem from "@/components/options/option-webhook-item";
import PopupTitle from "@/components/popup/title";
import { getWebhooks, initStorage } from "@/lib/browser";
import { addWebhook, createWebhook, Webhook } from "@/lib/webhook";
import cn from "@yeahx4/cn";

function App() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [nameInput, setNameInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [displayNameInput, setDisplayNameInput] = useState("");

  useEffect(() => {
    (async () => {
      await initStorage();
      setWebhooks(await getWebhooks());
    })();
  }, []);

  const handleAddWebhook = async () => {
    if (!nameInput || !urlInput) return;
    const newWebhook = createWebhook(nameInput, urlInput, displayNameInput);
    setWebhooks((prev) => [...prev, newWebhook]);
    setNameInput("");
    setUrlInput("");
    setDisplayNameInput("");

    await addWebhook(newWebhook);
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center">
      <div className="flex flex-col mt-16 mb-8">
        <PopupTitle large hideUsage />
      </div>

      <div
        className={cn(
          "max-w-4xl w-full flex flex-col bg-[#424549]",
          "h-[568px] rounded-md justify-between p-6"
        )}
      >
        <div className="flex flex-col gap-2">
          <OptionHeader />
          {webhooks.map((wh) => (
            <OptionWebhookItem key={wh.id} webhook={wh} />
          ))}
        </div>

        <div className="border-t border-[#cbcbcb] pt-4">
          <OptionInputField
            nameInput={nameInput}
            setNameInput={setNameInput}
            urlInput={urlInput}
            setUrlInput={setUrlInput}
            displayNameInput={displayNameInput}
            setDisplayNameInput={setDisplayNameInput}
            handleAddWebhook={handleAddWebhook}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
