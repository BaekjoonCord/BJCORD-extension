import { getWebhooks, syncWebhooks } from "./browser";
import { createUUID } from "./util";

export interface Webhook {
  id: string;
  name: string;
  url: string;
  displayName?: string;
  active: boolean;
  tierMin?: number; // 0 = Unrated (기본)
  tierMax?: number; // 31 = Master (기본)
}

/**
 * 새로운 웹훅 객체를 생성합니다.
 *
 * @param name 웹훅의 이름
 * @param url 웹훅 URL
 * @param displayName 표시될 이름
 * @returns 웹훅 객체
 */
export const createWebhook = (
  name: string,
  url: string,
  displayName?: string,
  tierMin?: number,
  tierMax?: number
): Webhook => {
  return {
    id: createUUID(),
    name,
    url,
    displayName,
    active: true,
    tierMin: tierMin ?? 0,
    tierMax: tierMax ?? 31,
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
