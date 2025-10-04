import PopupFooter from "@/components/popup/footer";
import PopupTitle from "@/components/popup/title";
import WebhookList from "@/components/popup/webhook-list";

function App() {
  return (
    <div className="w-screen h-screen flex flex-col p-4 justify-between">
      <PopupTitle hideVersion />
      <WebhookList />
      <PopupFooter />
    </div>
  );
}

export default App;
