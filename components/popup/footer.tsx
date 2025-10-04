import { FaGithub } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { SiChromewebstore } from "react-icons/si";
import { CHROME_STORE_URL, GITHUB_URL } from "@/lib/constants";

export default function PopupFooter() {
  return (
    <div className="flex justify-center gap-2">
      <a href={GITHUB_URL} target="_blank" rel="noreferrer">
        <FaGithub className="w-6 h-6" />
      </a>
      <a href={CHROME_STORE_URL} target="_blank" rel="noreferrer">
        <SiChromewebstore className="w-6 h-6" />
      </a>
      <a
        // href={`chrome-extension://${extId}/options.html`}
        href={browser.runtime.getURL("/options.html")}
        target="_blank"
        rel="noreferrer"
      >
        <IoSettingsOutline className="w-6 h-6" />
      </a>
    </div>
  );
}
