import { Webhook } from "@/lib/webhook";
import cn from "@yeahx4/cn";

export default function OptionWebhookItem({
  webhook,
  handleDeleteWebhook,
  handleUpdateWebhook,
}: {
  webhook: Webhook;
  handleDeleteWebhook: (id: string) => void;
  handleUpdateWebhook: (
    id: string,
    newWebhook: Partial<Omit<Webhook, "id">>
  ) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [nameInput, setNameInput] = useState(webhook.name);
  const [urlInput, setUrlInput] = useState(webhook.url);
  const [displayNameInput, setDisplayNameInput] = useState(
    webhook.displayName || ""
  );

  useEffect(() => {
    setNameInput(webhook.name);
    setUrlInput(webhook.url);
    setDisplayNameInput(webhook.displayName || "");
  }, [webhook]);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (nameInput !== webhook.name) {
      handleUpdateWebhook(webhook.id, { name: nameInput });
    }
  };

  const handleUrlBlur = () => {
    setIsEditingUrl(false);
    if (urlInput !== webhook.url) {
      handleUpdateWebhook(webhook.id, { url: urlInput });
    }
  };

  const handleDisplayNameBlur = () => {
    setIsEditingDisplayName(false);
    if (displayNameInput !== webhook.displayName) {
      handleUpdateWebhook(webhook.id, { displayName: displayNameInput });
    }
  };

  return (
    <div
      className={cn(
        "flex justify-between items-center w-full",
        "h-8 bg-[#2c2f33] pl-4 pr-2 rounded-sm min-w-0"
      )}
    >
      <div
        className={cn("w-[20%] hover:cursor-text h-full flex items-center p-1")}
      >
        {isEditingName ? (
          <input
            className="w-full bg-[#2c2f33] outline-none"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleNameBlur();
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="w-full truncate"
            onClick={() => setIsEditingName(true)}
          >
            {webhook.name}
          </span>
        )}
      </div>
      <div
        className={cn("w-[50%] hover:cursor-text h-full flex items-center p-1")}
      >
        {isEditingUrl ? (
          <input
            className="w-full bg-[#2c2f33] outline-none"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onBlur={handleUrlBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUrlBlur();
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className="w-full truncate"
            onClick={() => setIsEditingUrl(true)}
          >
            {webhook.url}
          </span>
        )}
      </div>
      <div
        className={cn("w-[25%] hover:cursor-text h-full flex items-center p-1")}
      >
        {isEditingDisplayName ? (
          <input
            className="w-full bg-[#2c2f33] outline-none"
            value={displayNameInput}
            onChange={(e) => setDisplayNameInput(e.target.value)}
            onBlur={handleDisplayNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleDisplayNameBlur();
              }
            }}
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "w-full truncate",
              !webhook.displayName ? "text-gray-400 italic" : ""
            )}
            onClick={() => setIsEditingDisplayName(true)}
          >
            {webhook.displayName || "BOJ handle"}
          </span>
        )}
      </div>
      <div
        className={cn(
          "bg-red-500 text-white w-[5%] transition-all",
          "cursor-pointer text-center rounded-sm hover:bg-red-600"
        )}
        onClick={() => handleDeleteWebhook(webhook.id)}
      >
        X
      </div>
    </div>
  );
}
