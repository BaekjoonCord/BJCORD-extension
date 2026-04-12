import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_TIER_SELECTOR_END,
  DEFAULT_TIER_SELECTOR_START,
  TIER_NAME,
} from "@/lib/constants";
import { Webhook } from "@/lib/webhook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import cn from "@yeahx4/cn";

const BASE_IMG =
  "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/solved-tier/";

const TIER_COLORS: Record<number, string> = {
  0: "#9d9d9d",
  1: "#ad5600", 2: "#ad5600", 3: "#ad5600", 4: "#ad5600", 5: "#ad5600",
  6: "#435f7a", 7: "#435f7a", 8: "#435f7a", 9: "#435f7a", 10: "#435f7a",
  11: "#ec9b00", 12: "#ec9b00", 13: "#ec9b00", 14: "#ec9b00", 15: "#ec9b00",
  16: "#27e2a4", 17: "#27e2a4", 18: "#27e2a4", 19: "#27e2a4", 20: "#27e2a4",
  21: "#00b4fc", 22: "#00b4fc", 23: "#00b4fc", 24: "#00b4fc", 25: "#00b4fc",
  26: "#ff0062", 27: "#ff0062", 28: "#ff0062", 29: "#ff0062", 30: "#ff0062",
};

/** 각 티어 경계 마커 (슬라이더용) */
const TIER_MARKERS = [
  { level: 0, img: "unrated", label: "Unrated" },
  { level: 1, img: "bronze5", label: "Bronze V" },
  { level: 6, img: "silver5", label: "Silver V" },
  { level: 11, img: "gold5", label: "Gold V" },
  { level: 16, img: "platinum5", label: "Plat V" },
  { level: 21, img: "diamond5", label: "Diamond V" },
  { level: 26, img: "ruby5", label: "Ruby V" },
  { level: 30, img: "ruby1", label: "Ruby I" },
] as const;

function getTierColor(tier: number): string {
  return TIER_COLORS[tier] ?? "#9d9d9d";
}

/** 티어 레벨(0~30)에 대응하는 이미지 파일명 반환 */
function getTierImg(level: number): string {
  if (level === 0) return "unrated";
  const names = ["bronze", "silver", "gold", "platinum", "diamond", "ruby"];
  const tierIdx = Math.ceil(level / 5) - 1;
  const sub = 5 - ((level - 1) % 5);
  return `${names[tierIdx]}${sub}`;
}

/**
 * WebKit 기준 슬라이더 thumb 중심 CSS 위치 계산
 * thumbDiameter=16px → offset = 8 - (level/30)*16
 */
function thumbPos(level: number): string {
  const pct = (level / 30) * 100;
  const offset = 8 - (level / 30) * 16;
  return `calc(${pct.toFixed(3)}% + ${offset.toFixed(3)}px)`;
}

/** 티어 이미지 + 이름을 함께 표시하는 셀렉트 아이템 row */
function TierRow({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-2">
      <img
        src={`${BASE_IMG}${getTierImg(level)}.png`}
        alt={TIER_NAME[level]}
        style={{ width: 16, height: 16, objectFit: "contain" }}
      // onError={(e) => {
      //   (e.target as HTMLImageElement).style.visibility = "hidden";
      // }}
      />
      <span style={{ color: getTierColor(level) }}>{TIER_NAME[level]}</span>
    </span>
  );
}

export default function TierRangeTooltip({
  webhook,
  handleUpdateWebhook,
}: {
  webhook: Webhook;
  handleUpdateWebhook: (
    id: string,
    updates: Partial<Omit<Webhook, "id">>
  ) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectOpenRef = useRef(0);
  const [minVal, setMinVal] = useState(
    webhook.tierMin ?? DEFAULT_TIER_SELECTOR_START
  );
  const [maxVal, setMaxVal] = useState(
    webhook.tierMax ?? DEFAULT_TIER_SELECTOR_END
  );
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinVal(webhook.tierMin ?? DEFAULT_TIER_SELECTOR_START);
    setMaxVal(webhook.tierMax ?? DEFAULT_TIER_SELECTOR_END);
  }, [webhook.tierMin, webhook.tierMax]);

  const calcPopupStyle = (): React.CSSProperties => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 360;
    const popupHeight = 340;
    const margin = 8;
    let left = rect.left;
    let top = rect.bottom + margin;
    if (left + popupWidth > window.innerWidth - 8)
      left = Math.max(8, window.innerWidth - popupWidth - 8);
    if (top + popupHeight > window.innerHeight - 8)
      top = rect.top - popupHeight - margin;
    return { top, left, width: popupWidth };
  };

  const handleOpen = () => {
    setPopupStyle(calcPopupStyle());
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      // Select가 열려 있는 동안에는 팝업을 닫지 않음
      if (selectOpenRef.current > 0) return;
      const t = e.target as Element;
      // Radix Portal 내부 클릭 시 popup 닫지 않음
      if (t.closest?.("[data-radix-popper-content-wrapper]")) return;
      if (
        popupRef.current && !popupRef.current.contains(t as Node) &&
        triggerRef.current && !triggerRef.current.contains(t as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const commitMin = (val: number) => {
    const v = Math.min(val, maxVal);
    setMinVal(v);
    handleUpdateWebhook(webhook.id, { tierMin: v });
  };
  const commitMax = (val: number) => {
    const v = Math.max(val, minVal);
    setMaxVal(v);
    handleUpdateWebhook(webhook.id, { tierMax: v });
  };
  const handleMinDrag = (val: number) => setMinVal(Math.min(val, maxVal));
  const handleMaxDrag = (val: number) => setMaxVal(Math.max(val, minVal));

  const isDefault =
    minVal === DEFAULT_TIER_SELECTOR_START &&
    maxVal === DEFAULT_TIER_SELECTOR_END;

  const minPct = (minVal / 30) * 100;
  const maxPct = (maxVal / 30) * 100;

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        title={
          isDefault
            ? "전체 티어"
            : `${TIER_NAME[minVal]} ~ ${TIER_NAME[maxVal]}`
        }
        className={cn(
          "text-[11px] px-2 py-0.5 rounded transition-colors w-full text-left truncate",
          "bg-[#1e1f22] hover:bg-[#36393f]",
          open ? "ring-1 ring-[#5865f2] text-white" : "text-gray-300"
        )}
      >
        {isDefault ? (
          <span className="text-gray-400">전체 티어</span>
        ) : (
          <>
            <span style={{ color: getTierColor(minVal) }}>
              {TIER_NAME[minVal]}
            </span>
            <span className="text-gray-500 mx-1">~</span>
            <span style={{ color: getTierColor(maxVal) }}>
              {TIER_NAME[maxVal]}
            </span>
          </>
        )}
      </button>

      {/* 오버레이 팝업 (fixed, 레이아웃 시프트 없음) */}
      {open && (
        <div
          ref={popupRef}
          style={popupStyle}
          className={cn(
            "fixed z-[9999]",
            "bg-[#2c2f33] border border-[#5865f2]",
            "rounded-xl shadow-2xl",
            "p-6"
          )}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">전송할 티어 범위 설정</span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white text-xs transition-colors leading-none"
            >
              ✕
            </button>
          </div>

          {/* 현재 선택 표시 */}
          <div className="flex justify-between text-xs mb-5 px-1">
            <span className="font-semibold" style={{ color: getTierColor(minVal) }}>
              {TIER_NAME[minVal]}
            </span>
            <span className="text-gray-500">~</span>
            <span className="font-semibold" style={{ color: getTierColor(maxVal) }}>
              {TIER_NAME[maxVal]}
            </span>
          </div>

          {/* ── 슬라이더 영역 ── */}
          <div className="px-1">
            <div className="relative h-5 flex items-center">
              <div className="absolute w-full h-1.5 rounded-full bg-[#4f545c]" />
              <div
                className="absolute h-1.5 rounded-full bg-[#5865f2]"
                style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }}
              />
              <input
                type="range" min={0} max={30} value={minVal}
                onChange={(e) => handleMinDrag(Number(e.target.value))}
                onMouseUp={(e) => commitMin(Number((e.target as HTMLInputElement).value))}
                className="dual-range-input"
                style={{ zIndex: minVal > 28 ? 5 : 3 }}
              />
              <input
                type="range" min={0} max={30} value={maxVal}
                onChange={(e) => handleMaxDrag(Number(e.target.value))}
                onMouseUp={(e) => commitMax(Number((e.target as HTMLInputElement).value))}
                className="dual-range-input"
                style={{ zIndex: 4 }}
              />
            </div>

            {/* ── 티어 마커 (점 + 아이콘) ── */}
            <div className="relative mt-1" style={{ height: 44 }}>
              {TIER_MARKERS.map(({ level, img, label }) => {
                const isActive = level >= minVal && level <= maxVal;
                return (
                  <div
                    key={level}
                    className="absolute flex flex-col items-center"
                    style={{
                      left: thumbPos(level),
                      transform: "translateX(-50%)",
                      top: 0,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full mb-0.5 transition-colors"
                      style={{
                        backgroundColor: isActive
                          ? getTierColor(level)
                          : "#4f545c",
                      }}
                    />
                    <img
                      src={`${BASE_IMG}${img}.png`}
                      alt={label}
                      title={label}
                      className="transition-opacity"
                      style={{
                        width: 20, height: 20,
                        objectFit: "contain",
                        opacity: isActive ? 1 : 0.25,
                      }}
                    // onError={(e) => {
                    //   (e.target as HTMLImageElement).style.display = "none";
                    // }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── 드롭다운 (Radix Select + 티어 이미지) ── */}
          <div className="flex gap-3 items-end mt-4">
            {/* 하한 */}
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">
                하한
              </label>
              <Select
                value={String(minVal)}
                onValueChange={(v) => commitMin(Number(v))}
                onOpenChange={(o) => {
                  if (o) selectOpenRef.current += 1;
                  else setTimeout(() => { selectOpenRef.current -= 1; }, 0);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full bg-[#1e1f22] border-[#4f545c] text-white text-xs h-8 focus-visible:ring-[#5865f2]/50 focus-visible:border-[#5865f2]"
                >
                  <SelectValue>
                    <TierRow level={minVal} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1e1f22] border-[#4f545c] text-white max-h-56 z-[99999]">
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem
                      key={i}
                      value={String(i)}
                      disabled={i > maxVal}
                      className="text-xs focus:bg-[#36393f] focus:text-white data-[disabled]:opacity-30"
                    >
                      <TierRow level={i} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <span className="text-gray-500 pb-1.5 text-sm">~</span>

            {/* 상한 */}
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">
                상한
              </label>
              <Select
                value={String(maxVal)}
                onValueChange={(v) => commitMax(Number(v))}
                onOpenChange={(o) => {
                  if (o) selectOpenRef.current += 1;
                  else setTimeout(() => { selectOpenRef.current -= 1; }, 0);
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-full bg-[#1e1f22] border-[#4f545c] text-white text-xs h-8 focus-visible:ring-[#5865f2]/50 focus-visible:border-[#5865f2]"
                >
                  <SelectValue>
                    <TierRow level={maxVal} />
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#1e1f22] border-[#4f545c] text-white max-h-56 z-[99999]">
                  {Array.from({ length: 31 }, (_, i) => (
                    <SelectItem
                      key={i}
                      value={String(i)}
                      disabled={i < minVal}
                      className="text-xs focus:bg-[#36393f] focus:text-white data-[disabled]:opacity-30"
                    >
                      <TierRow level={i} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
