import cn from "@yeahx4/cn";
import { FaGithub } from "react-icons/fa6";
import { IoSettingsOutline } from "react-icons/io5";
import { SiChromewebstore } from "react-icons/si";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col p-4 justify-between">
      <div className="flex flex-col">
        <div className="flex gap-2 justify-center items-center p-4 select-none">
          <img src="/thumbnail.png" alt="Thumbnail" className="w-10 h-10" />
          <h1 className="text-2xl font-semibold">BJCORD</h1>
        </div>

        <a
          href="https://github.com/BaekjoonCord/BJCORD-extension/blob/main/README.md"
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-2 text-center"
        >
          사용법 안내
        </a>
      </div>

      <div
        className={cn(
          "bg-[#424549] w-full p-4 rounded-sm min-h-48",
          "overflow-auto flex flex-col"
        )}
      >
        <span className="text-sm text-gray-300 self-center">
          등록된 웹훅이 없습니다.
        </span>
      </div>

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
    </div>
  );
}

export default App;
