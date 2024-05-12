const webhooks = [
  {
    name: "test",
    url: "https://example.com/webhook",
  },
];

function render() {
  const wh = webhooks.map((webhook) => {
    const webhookElement = document.createElement("div");
    webhookElement.classList.add("webhook");

    const webhookName = document.createElement("span");
    webhookName.classList.add("webhook-name");
    webhookName.textContent = webhook.name;

    const webhookUrl = document.createElement("span");
    webhookUrl.classList.add("webhook-url");
    webhookUrl.textContent = webhook.url;

    webhookElement.appendChild(webhookName);
    webhookElement.appendChild(webhookUrl);

    return webhookElement;
  });

  const webhooksElement = document.getElementById("webhook-list");
  webhooksElement.innerHTML = "";
  webhooksElement.append(...wh);
}

async function load() {}

async function init() {
  await load();
  render();
}

document.addEventListener("DOMContentLoaded", init);
