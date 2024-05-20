const webhooks = [];

function injectSettingPage() {
  const setting = document.getElementById("a-setting-page");
  if (!setting) return;

  const id = chrome.runtime.id;

  setting.href = `chrome-extension://${id}/popup/settings.html`;
}

async function load() {
  const data = await chrome.storage.sync.get("webhooks");
  if (data.webhooks) {
    webhooks.push(...data.webhooks);
  }
  console.log("Webhooks loaded");
  console.log(data);
}

function render() {
  const list = document.getElementById("webhook-list");
  list.innerHTML = "";

  webhooks.forEach((webhook, index) => {
    const item = document.createElement("div");
    item.classList.add("switch-container");

    const label = document.createElement("label");
    label.classList.add("switch");

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = webhook.enabled;
    input.addEventListener("change", () => {
      webhook.enabled = input.checked;
      chrome.storage.sync.set({ webhooks });
    });
    const span = document.createElement("span");
    span.classList.add("slider");
    span.classList.add("round");
    label.appendChild(input);
    label.appendChild(span);
    item.appendChild(label);

    const text = document.createElement("div");
    text.textContent = webhook.name;
    text.classList.add("switch-text");
    item.appendChild(text);
    list.appendChild(item);
  });
}

async function init() {
  injectSettingPage();
  await load();
  render();
}

document.addEventListener("DOMContentLoaded", init);
