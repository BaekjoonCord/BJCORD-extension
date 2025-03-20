/**
 * @typedef {Object[]} Webhook 웹훅 리스트
 */
const webhooks = [];

/**
 * 웹훅을 전송한 후 결과 이모지를 표시할지 여부
 */
let showEmoji = true;

/**
 * 문제를 처음으로 맞춘 경우에만 웹훅을 전송할지 여부
 */
let webhookFirstAcceptOnly = true;

/**
 * 렌더링을 수행합니다.
 * 로딩된 웹훅 목록을 화면에 렌더링하고, 삭제 버튼을 추가합니다.
 * 삭제 버튼을 클릭하면 해당 웹훅을 삭제합니다.
 */
function render() {
  const createEditableSpan = (className, text, onSave) => {
    const span = document.createElement("span");
    span.classList.add(className);
    span.classList.add("edit-span");
    span.textContent = text;

    span.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = span.textContent;
      input.classList.add(className);
      input.classList.add("edit-input");

      input.addEventListener("blur", () => {
        span.textContent = input.value;
        onSave(input.value);
        span.style.display = "inline";
        input.replaceWith(span);
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          input.blur();
        }
      });

      span.replaceWith(input);
      input.focus();
    });

    return span;
  };

  const wh = webhooks.map((webhook, i) => {
    const webhookElement = document.createElement("div");
    webhookElement.classList.add("webhook");

    const webhookName = createEditableSpan(
      "webhook-name",
      webhook.name,
      (value) => {
        webhooks[i].name = value;
        chrome.storage.sync.set({ webhooks });
      }
    );

    const webhookUrl = createEditableSpan(
      "webhook-url",
      webhook.url,
      (value) => {
        webhooks[i].url = value;
        chrome.storage.sync.set({ webhooks });
      }
    );

    const displayName = createEditableSpan(
      "webhook-display-name",
      webhook.displayName || "",
      (value) => {
        webhooks[i].displayName = value;
        chrome.storage.sync.set({ webhooks });
      }
    );

    const webhookDelete = document.createElement("button");
    webhookDelete.classList.add("webhook-delete");
    webhookDelete.addEventListener("click", () => {
      remove(i);
    });

    webhookElement.appendChild(webhookName);
    webhookElement.appendChild(webhookUrl);
    webhookElement.appendChild(displayName);
    webhookElement.appendChild(webhookDelete);

    return webhookElement;
  });

  const webhooksElement = document.getElementById("webhook-list");
  if (webhooks.length) {
    webhooksElement.innerHTML = "";
    webhooksElement.append(...wh);
  } else {
    webhooksElement.innerHTML =
      "<span style='font-size: large;'>등록된 웹훅이 없습니다.</span>";
  }
}

/**
 * 입력 필드를 초기화합니다.
 * 웹훅이 추가된 후 실행됩니다.
 */
function clearInputs() {
  document.getElementById("name-input").value = "";
  document.getElementById("url-input").value = "";
  document.getElementById("display-name-input").value = "";
}

/**
 * 새로운 웹훅츨 추가하고 chrome sync에 저장합니다.
 */
function addWebhook() {
  const name = document.getElementById("name-input").value;
  const url = document.getElementById("url-input").value;
  const displayName = document.getElementById("display-name-input").value || "";

  add(name, url, displayName);
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
 * @param {string | '' | undefined} displayName 표시 이름. 없는 경우 빈 문자열
 */
async function add(name, url, displayName) {
  if (name === "" || url === "") return;
  webhooks.push({ name, url, enabled: true, displayName });
  render();
  await chrome.storage.sync.set({ webhooks });
  console.log("Webhook added");
}

/**
 * chrome sync에서 웹훅 목록과 이모지 표시 여부를 불러옵니다.
 * webhooks 배열에 저장합니다.
 */
async function load() {
  const data = await chrome.storage.sync.get("webhooks");
  if (data.webhooks) {
    webhooks.push(...data.webhooks);
  }
  console.log("Webhooks loaded");
  console.log(data);

  showEmoji = await getShowEmoji();
  document.getElementById("cb-show-emoji").checked = showEmoji;

  console.log("Show emoji: " + showEmoji);

  webhookFirstAcceptOnly = await getWebhookFirstAcceptOnly();
  document.getElementById("cb-webhook-first-accept-only").checked =
    webhookFirstAcceptOnly;

  console.log("Show webhook first accept only: " + webhookFirstAcceptOnly);
}

/**
 * 웹훅을 전송한 후 결과 이모지를 표시할지 여부를 반환합니다.
 * 설정이 없는 경우 기본값은 true입니다.
 *
 * @returns {Promise<boolean>} 웹훅을 전송한 후 결과 이모지를 표시할지 여부
 */
async function getShowEmoji() {
  const data = await chrome.storage.sync.get("showEmoji");

  if (data.showEmoji === false || data.showEmoji === true) {
    return data.showEmoji;
  } else {
    await chrome.storage.sync.set({ showEmoji: true });
    return true;
  }
}

/**
 * 처음으로 맞춘 문제에 한해서만 웹훅을 전송할지 여부를 반환합니다.
 * 설정이 없는 경우 기본값은 true입니다.
 *
 * @returns {Promise<boolean>} 처음으로 맞춘 문제에 한해서만 웹훅을 전송할지 여부
 */
async function getWebhookFirstAcceptOnly() {
  const data = await chrome.storage.sync.get("webhookFirstAcceptOnly");

  if (
    data.webhookFirstAcceptOnly === false ||
    data.webhookFirstAcceptOnly === true
  ) {
    return data.webhookFirstAcceptOnly;
  } else {
    await chrome.storage.sync.set({ webhookFirstAcceptOnly: true });
    return true;
  }
}

async function toogleShowEmoji() {
  showEmoji = !showEmoji;
  await chrome.storage.sync.set({ showEmoji });
  document.getElementById("cb-show-emoji").checked = showEmoji;
  console.log("Show emoji set to " + showEmoji);
}

async function toggleWebhookFirstAcceptOnly() {
  webhookFirstAcceptOnly = !webhookFirstAcceptOnly;
  await chrome.storage.sync.set({ webhookFirstAcceptOnly });
  document.getElementById("cb-webhook-first-accept-only").checked =
    webhookFirstAcceptOnly;
  console.log("Webhook first accept only set to " + webhookFirstAcceptOnly);
}

/**
 * 이벤트 리스너를 추가하고 초기 렌더링을 수행합니다.
 */
async function init() {
  const addButton = document.getElementById("add-webhook");
  addButton.addEventListener("click", addWebhook);

  const nameInput = document.getElementById("name-input");
  const urlInput = document.getElementById("url-input");
  const displayInput = document.getElementById("display-name-input");
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      urlInput.focus();
    }
  });
  urlInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      displayInput.focus();
    }
  });
  displayInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      addWebhook();
    }
  });

  await load();
  render();

  const cbShowEmoji = document.getElementById("cb-show-emoji");
  cbShowEmoji.addEventListener("change", toogleShowEmoji);

  const cbWebhookFirstAcceptOnly = document.getElementById(
    "cb-webhook-first-accept-only"
  );
  cbWebhookFirstAcceptOnly.addEventListener(
    "change",
    toggleWebhookFirstAcceptOnly
  );
}

document.addEventListener("DOMContentLoaded", init);
