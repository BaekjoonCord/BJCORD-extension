import { FaGithub } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { SiChromewebstore } from "react-icons/si";

export default function PopupFooter() {
  return (
    <div className="flex justify-center gap-2">
      <a
        href="https://github.com/BaekjoonCord/BJCORD-extension"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub className="w-6 h-6" />
      </a>
      <a
        href="https://chromewebstore.google.com/detail/%EB%B0%B1%EC%A4%80%EC%BD%94%EB%93%9C/ichhnkdadkmehpahpbdgcoeccfahgpdk"
        target="_blank"
        rel="noreferrer"
      >
        <SiChromewebstore className="w-6 h-6" />
      </a>
      <a
        href="chrome-extension://ichhnkdadkmehpahpbdgcoeccfahgpdk/popup/settings.html"
        target="_blank"
        rel="noreferrer"
      >
        <IoSettingsOutline className="w-6 h-6" />
      </a>
    </div>
  );
}
