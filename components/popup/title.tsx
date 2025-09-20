import { getCurrentBrowser } from "@/lib/browser";
import { HOW_TO_USE_URL } from "@/lib/constants";
import { isDev } from "@/lib/isDev";

export default function PopupTitle() {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-center items-center pt-4 select-none">
        <img src="/thumbnail.png" alt="Thumbnail" className="w-10 h-10" />
        <h1 className="text-2xl font-semibold">BJCORD</h1>
      </div>

      <span className="text-center mb-2">
        {getCurrentBrowser()} {isDev && "(dev)"}
      </span>

      <a
        href={HOW_TO_USE_URL}
        target="_blank"
        rel="noreferrer"
        className="text-sm underline underline-offset-2 text-center"
      >
        사용법 안내
      </a>
    </div>
  );
}
