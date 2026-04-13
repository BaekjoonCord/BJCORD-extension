import { RefObject, useEffect } from "react";

/**
 * 지정된 ref 외부를 mousedown 클릭 시 콜백을 호출하는 훅.
 * - Radix UI 포털([data-radix-popper-content-wrapper]) 내부 클릭은 무시.
 * - shouldBlock() 이 true 를 반환하면 (예: Select 열림 중) 콜백을 호출하지 않음.
 */
export function useClickOutside(
  enabled: boolean,
  onClickOutside: () => void,
  ignoredRefs: RefObject<Element | null>[],
  shouldBlock?: () => boolean
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleMouseDown = (e: MouseEvent) => {
      if (shouldBlock?.()) return;

      const t = e.target as Element;
      if (t.closest?.("[data-radix-popper-content-wrapper]")) return;

      const isInsideIgnored = ignoredRefs.some((ref) =>
        ref.current?.contains(t as Node)
      );
      if (!isInsideIgnored) onClickOutside();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
    // ignoredRefs 배열 자체가 매 렌더마다 새 참조이므로 의도적으로 제외
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
