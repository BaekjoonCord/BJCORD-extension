/**
 * @typedef {Object} Webhook 웹훅 리스트
 */
const webhooks = [];

/**
 * chrome extension 아이콘의 href 를 설정 페이지로 변경합니다.
 *
 * @returns {void}
 */
function injectSettingPage() {
  const setting = document.getElementById("a-setting-page");
  if (!setting) return;

  const id = chrome.runtime.id;

  setting.href = `chrome-extension://${id}/popup/settings.html`;
}

/**
 * chrome sync 에서 웹훅을 불러옵니다.
 * webhook에 저장합니다.
 */
async function load() {
  const data = await chrome.storage.sync.get("webhooks");
  if (data.webhooks) {
    webhooks.push(...data.webhooks);
  }
  console.log("Webhooks loaded");
  console.log(data);
}

/**
 * 로딩된 웹훅을 렌더링합니다.
 * 웹훅의 상태에 따라 스위치를 표시합니다.
 * 스위치가 변경될 때마다 chrome sync에 저장합니다.
 */
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

/**
 * 초기화 프로세스를 실행합니다.
 */
async function init() {
  injectSettingPage();
  await load();
  render();
}

document.addEventListener("DOMContentLoaded", init);
