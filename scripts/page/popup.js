function injectSettingPage() {
  const setting = document.getElementById("a-setting-page");
  if (!setting) return;

  setting.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });
}
