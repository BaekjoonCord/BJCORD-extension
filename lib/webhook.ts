import { getWebhooks, syncWebhooks } from "./browser";
import { makeUUID } from "./util";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  displayName?: string;
  active: boolean;
}

export const createWebhook = (
  name: string,
  url: string,
  displayName?: string
): Webhook => {
  return {
    id: makeUUID(),
    name,
    url,
    displayName,
    active: true,
  };
};

export const updateWebhook = async (
  id: string,
  updates: Partial<Omit<Webhook, "id">>
) => {
  const webhooks = await getWebhooks();
  const index = webhooks.findIndex((wh) => wh.id === id);
  if (index === -1) {
    throw new Error("Webhook not found");
  }

  webhooks[index] = {
    ...webhooks[index],
    ...updates,
  };

  await syncWebhooks(webhooks);
};

export const deleteWebhook = async (id: string) => {
  const webhooks = await getWebhooks();
  const newWebhooks = webhooks.filter((wh) => wh.id !== id);
  await syncWebhooks(newWebhooks);
};

export const addWebhook = async (webhook: Webhook) => {
  const webhooks = await getWebhooks();
  webhooks.push(webhook);
  await syncWebhooks(webhooks);
};
