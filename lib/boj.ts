import { getSendFirstAcOnly } from "./browser";
import { AC_TITLE_TOOLTIP_QUERY, HANDLE_QUERY } from "./constants";
import { Logger } from "./logger";

export function getHandle() {
  const element = document.querySelector(HANDLE_QUERY);
  if (!element) return null;

  const handle = element.textContent?.trim();
  if (!handle) {
    return null;
  }

  return handle;
}

export function isUserAlreadyAccepted() {
  const acceptedProblemTitleTooltip = document.querySelector(
    AC_TITLE_TOOLTIP_QUERY
  );

  return !!acceptedProblemTitleTooltip;
}

export async function watchJudgementChange(logger: Logger) {
  if (isUserAlreadyAccepted()) {
    if (await getSendFirstAcOnly()) {
      logger.log("Already accepted, aborted.");
      return;
    }
  }

  logger.log("Watching judgement change...");
}
