/**
 * @typedef {Object} Webhook 웹훅 리스트
 */
const webhooks = [];

/**
 * 렌더링을 수행합니다.
 * 로딩된 웹훅 목록을 화면에 렌더링하고, 삭제 버튼을 추가합니다.
 * 삭제 버튼을 클릭하면 해당 웹훅을 삭제합니다.
 */
function render() {
  const wh = webhooks.map((webhook, i) => {
    const webhookElement = document.createElement("div");
    webhookElement.classList.add("webhook");

    const webhookName = document.createElement("span");
    webhookName.classList.add("webhook-name");
    webhookName.textContent = webhook.name;

    const webhookUrl = document.createElement("span");
    webhookUrl.classList.add("webhook-url");
    webhookUrl.textContent = webhook.url;

    const webhookDelete = document.createElement("button");
    webhookDelete.classList.add("webhook-delete");
    webhookDelete.textContent = "X";
    webhookDelete.addEventListener("click", () => {
      remove(i);
    });

    webhookElement.appendChild(webhookName);
    webhookElement.appendChild(webhookUrl);
    webhookElement.appendChild(webhookDelete);

    return webhookElement;
  });

  const webhooksElement = document.getElementById("webhook-list");
  if (webhooks.length) {
    webhooksElement.innerHTML = "";
    webhooksElement.append(...wh);
  }
  else {
    webhooksElement.innerHTML = "<span style='font-size: large;'>등록된 웹훅이 없습니다.</span>";
  }
}

/**
 * 입력 필드를 초기화합니다.
 * 웹훅이 추가된 후 실행됩니다.
 */
function clearInputs() {
  document.getElementById("name-input").value = "";
  document.getElementById("url-input").value = "";
}

/**
 * 새로운 웹훅츨 추가하고 chrome sync에 저장합니다.
 */
function addWebhook() {
  const name = document.getElementById("name-input").value;
  const url = document.getElementById("url-input").value;

  add(name, url);
  clearInputs();
}

/**
 * 웹훅을 삭제하고 chrome sync에 반영합니다.
 *
 * @param {number} index 삭제할 웹훅의 인덱스
 */
async function remove(index) {
  webhooks.splice(index, 1);
  render();
  await chrome.storage.sync.set({ webhooks });
  console.log("Webhook deleted");
}

/**
 * 웹훅을 chrome sync에 저장합니다.
 *
 * @param {string} name 웹훅 이름
 * @param {string} url 웹훅 URL
 */
async function add(name, url) {
  webhooks.push({ name, url, enabled: true });
  render();
  await chrome.storage.sync.set({ webhooks });
  console.log("Webhook added");
}

/**
 * chrome sync에서 웹훅 목록을 불러옵니다.
 * webhooks 배열에 저장합니다.
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
 * 이벤트 리스너를 추가하고 초기 렌더링을 수행합니다.
 */
async function init() {
  const addButton = document.getElementById("add-webhook");
  addButton.addEventListener("click", addWebhook);

  const nameInput = document.getElementById("name-input");
  const urlInput = document.getElementById("url-input");
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      urlInput.focus();
    }
  });
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addWebhook();
    }
  });

  await load();
  render();
}

document.addEventListener("DOMContentLoaded", init);
