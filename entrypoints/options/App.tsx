import PopupTitle from "@/components/popup/title";
import { getCurrentBrowser } from "@/lib/browser";
import { isDev } from "@/lib/isDev";
import cn from "@yeahx4/cn";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col items-center">
      <div className="flex flex-col mt-16 mb-8">
        <PopupTitle large hideUsage />
      </div>

      <div
        className={cn(
          "max-w-5xl w-full flex flex-col bg-[#424549]",
          "h-[568px] rounded-md"
        )}
      ></div>
    </div>
  );
}

export default App;
