import { getWebhooks, syncWebhooks } from "./browser";
import { createUUID } from "./util";

/**
 * sync storage에 저장되는 웹훅 데이터
 */
export interface Webhook {
  id: string;
  name: string;
  url: string;
  displayName?: string;
  active: boolean;
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
  displayName?: string
): Webhook => {
  return {
    id: createUUID(),
    name,
    url,
    displayName,
    active: true,
  };
};

/**
 * 웹훅을 업데이트합니다. id로 웹훅을 찾을 수 없다면 오류를 던집니다.
 * 해당 id의 웹훅에서 updates에 명시된 필드를 덮어쓰기하고 저장합니다.
 *
 * @param id 업데이트할 웹훅의 id
 * @param updates 업데이트할 내용
 */
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

/**
 * id로 웹훅을 삭제합니다. id에 해당하는 웹훅이 없다면 아무 작업도 수행하지 않습니다.
 * 삭제된 웹훅은 복구할 수 없으며 바로 저장됩니다.
 *
 * @param id 삭제할 웹훅의 id
 */
export const deleteWebhook = async (id: string) => {
  const webhooks = await getWebhooks();
  const newWebhooks = webhooks.filter((wh) => wh.id !== id);
  await syncWebhooks(newWebhooks);
};

/**
 * 웹훅을 sync storage에 추가합니다.
 *
 * @param webhook 추가할 웹훅
 */
export const addWebhook = async (webhook: Webhook) => {
  const webhooks = await getWebhooks();
  webhooks.push(webhook);
  await syncWebhooks(webhooks);
};
