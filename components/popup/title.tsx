import { getCurrentBrowser, getLongVersion, getVersion } from "@/lib/browser";
import { HOW_TO_USE_URL } from "@/lib/constants";
import { isDev } from "@/lib/isDev";
import cn from "@yeahx4/cn";

export default function PopupTitle({
  large = false,
  hideUsage = false,
  hideVersion = false,
}: {
  large?: boolean;
  hideUsage?: boolean;
  hideVersion?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2 justify-center items-center pt-4 select-none">
        <img
          src="/thumbnail.png"
          alt="Thumbnail"
          className={large ? "w-16 h-16" : "w-10 h-10"}
        />
        <div className="flex items-start">
          <span
            className={cn(large ? "text-3xl" : "text-2xl", "font-semibold")}
          >
            BJCORD
          </span>
          {!hideVersion && (
            <span className="italic text-sm text-[#999]">
              {getLongVersion()}
            </span>
          )}
        </div>
      </div>

      <span className="text-center mb-2">
        {getCurrentBrowser()} {isDev && "(dev)"}
      </span>

      {!hideUsage && (
        <a
          href={HOW_TO_USE_URL}
          target="_blank"
          rel="noreferrer"
          className="text-sm underline underline-offset-2 text-center"
        >
          사용법 안내
        </a>
      )}
    </div>
  );
}
