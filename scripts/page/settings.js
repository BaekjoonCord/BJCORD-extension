const webhooks = [];

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
  webhooksElement.innerHTML = "";
  webhooksElement.append(...wh);
}

function clearInputs() {
  document.getElementById("name-input").value = "";
  document.getElementById("url-input").value = "";
}

function addWebhook() {
  const name = document.getElementById("name-input").value;
  const url = document.getElementById("url-input").value;

  add(name, url);
  clearInputs();
}

async function remove(index) {
  webhooks.splice(index, 1);
  render();
  await chrome.storage.sync.set({ webhooks });
  console.log("Webhook deleted");
}

async function add(name, url) {
  webhooks.push({ name, url, enabled: true });
  render();
  await chrome.storage.sync.set({ webhooks });
  console.log("Webhook added");
}

async function load() {
  const data = await chrome.storage.sync.get("webhooks");
  if (data.webhooks) {
    webhooks.push(...data.webhooks);
  }
  console.log("Webhooks loaded");
  console.log(data);
}

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
