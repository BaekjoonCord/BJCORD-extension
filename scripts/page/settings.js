const webhooks = [
  {
    name: "test",
    url: "https://example.com/webhook",
  },
  {
    name: "test2",
    url: "https://example.com/webhook2",
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

    const webhookDelete = document.createElement("button");
    webhookDelete.classList.add("webhook-delete");
    webhookDelete.textContent = "X";
    webhookDelete.addEventListener("click", () => {
      const index = webhooks.indexOf(webhook);
      webhooks.splice(index, 1);
      render();
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

async function load() {}

async function init() {
  await load();
  render();
}

document.addEventListener("DOMContentLoaded", init);
