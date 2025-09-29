import { FaGithub } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { SiChromewebstore } from "react-icons/si";
import { useState } from "react";
import { CHROME_STORE_URL, GITHUB_URL } from "@/lib/constants";
import { getExtensionId } from "@/lib/browser";

export default function PopupFooter() {
  const [extId, setExtId] = useState<string>("");

  useEffect(() => {
    const id = getExtensionId();
    if (id) {
      setExtId(id);
    } else {
      setExtId("unknown_id");
      console.error("Failed to get extension ID");
    }
  }, []);

  return (
    <div className="flex justify-center gap-2">
      <a href={GITHUB_URL} target="_blank" rel="noreferrer">
        <FaGithub className="w-6 h-6" />
      </a>
      <a href={CHROME_STORE_URL} target="_blank" rel="noreferrer">
        <SiChromewebstore className="w-6 h-6" />
      </a>
      <a
        href={`chrome-extension://${extId}/options.html`}
        target="_blank"
        rel="noreferrer"
      >
        <IoSettingsOutline className="w-6 h-6" />
      </a>
    </div>
  );
}
