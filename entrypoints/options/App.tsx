import OptionHeader from "@/components/options/option-header";
import OptionInputField from "@/components/options/option-input-field";
import PopupTitle from "@/components/popup/title";
import cn from "@yeahx4/cn";

function App() {
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
          {/* TODO : Webhook here */}
        </div>

        <div className="border-t border-[#cbcbcb] pt-4">
          <OptionInputField />
        </div>
      </div>
    </div>
  );
}

export default App;
