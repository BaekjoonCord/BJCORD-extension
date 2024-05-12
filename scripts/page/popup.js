function injectSettingPage() {
  const setting = document.getElementById("a-setting-page");
  if (!setting) return;

  const id = chrome.runtime.id;

  setting.href = `chrome-extension://${id}/popup/settings.html`;
}

function init() {
  injectSettingPage();
}

document.addEventListener("DOMContentLoaded", init);
