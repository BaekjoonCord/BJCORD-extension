import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  DEFAULT_TIER_SELECTION_END,
  DEFAULT_TIER_SELECTION_START,
  TIER_NAME,
} from "@/lib/constants";
import { Webhook } from "@/lib/webhook";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import cn from "@yeahx4/cn";
import {
  BASE_IMG,
  getTierColor,
  getTierImg,
  thumbPos,
  TIER_MARKERS,
} from "@/lib/tier";
import { useClickOutside } from "@/hooks/use-click-outside";

const TIER_MIN = DEFAULT_TIER_SELECTION_START;
const TIER_MAX = DEFAULT_TIER_SELECTION_END;
const TIER_RANGE = TIER_MAX - TIER_MIN;

function TierChip({
  level,
  className,
}: {
  level: number;
  className?: string;
}) {
  const tierName = TIER_NAME[level] ?? "Unknown";

  return (
    <div
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full",
        className
      )}
      title={tierName}
    >
      <img
        src={`${BASE_IMG}${getTierImg(level)}.png`}
        alt={tierName}
        className="h-4 w-4 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}

/** 티어 이름을 함께 표시하는 셀렉트 아이템 row */
function TierRow({ level }: { level: number }) {
  return (
    <span className="flex items-center gap-2">
      <img
        src={`${BASE_IMG}${getTierImg(level)}.png`}
        alt={TIER_NAME[level]}
        style={{ width: 16, height: 16, objectFit: "contain" }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
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
    Math.max(webhook.tierMin ?? TIER_MIN, TIER_MIN)
  );
  const [maxVal, setMaxVal] = useState(webhook.tierMax ?? TIER_MAX);
  const [includeUnrated, setIncludeUnrated] = useState(
    webhook.includeUnrated ?? webhook.tierMin === 0
  );
  const [popupStyle, setPopupStyle] = useState<CSSProperties>({});

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMinVal(Math.max(webhook.tierMin ?? TIER_MIN, TIER_MIN));
    setMaxVal(webhook.tierMax ?? TIER_MAX);
    setIncludeUnrated(webhook.includeUnrated ?? webhook.tierMin === 0);
  }, [webhook.tierMin, webhook.tierMax]);

  const calcPopupStyle = (): CSSProperties => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 384;
    const popupHeight = 420;
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

  useClickOutside(
    open,
    () => setOpen(false),
    [popupRef, triggerRef],
    () => selectOpenRef.current > 0
  );

  const commitMin = (val: number) => {
    const v = Math.min(Math.max(val, TIER_MIN), maxVal);
    setMinVal(v);
    handleUpdateWebhook(webhook.id, { tierMin: v });
  };
  const commitMax = (val: number) => {
    const v = Math.max(Math.min(val, TIER_MAX), minVal);
    setMaxVal(v);
    handleUpdateWebhook(webhook.id, { tierMax: v });
  };
  const handleMinDrag = (val: number) =>
    setMinVal(Math.min(Math.max(val, TIER_MIN), maxVal));
  const handleMaxDrag = (val: number) =>
    setMaxVal(Math.max(Math.min(val, TIER_MAX), minVal));

  const minPct = ((minVal - TIER_MIN) / TIER_RANGE) * 100;
  const maxPct = ((maxVal - TIER_MIN) / TIER_RANGE) * 100;

  const onSelectOpenChange = (o: boolean) => {
    if (o) selectOpenRef.current += 1;
    else setTimeout(() => { selectOpenRef.current -= 1; }, 0);
  };

  return (
    <>
      {/* 트리거 버튼 */}
      <button
        ref={triggerRef}
        onClick={handleOpen}
        title={
          includeUnrated
            ? `Unrated, ${TIER_NAME[minVal]} ~ ${TIER_NAME[maxVal]}`
            : `${TIER_NAME[minVal]} ~ ${TIER_NAME[maxVal]}`
        }
        className={cn(
          "inline-flex w-full items-center justify-center rounded-md px-1 py-1",
          "text-left text-[11px] transition-colors bg-[#1e1f22] hover:bg-[#2c2f33]",
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {includeUnrated ? <TierChip level={0} className="h-5" /> : null}
          <TierChip level={minVal} className="h-5" />
          <span className="text-gray-500">~</span>
          <TierChip level={maxVal} className="h-5" />
        </span>
      </button>

      {/* 오버레이 팝업 */}
      {open && (
        <div
          ref={popupRef}
          style={popupStyle}
          className={cn(
            "fixed z-[9999]",
            "bg-[#2c2f33] border border-[#5865f2]",
            "rounded-xl shadow-2xl p-5"
          )}
        >
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-white">
              전송할 난이도 범위 설정
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white text-xs transition-colors leading-none"
            >
              ✕
            </button>
          </div>

          {/* 현재 선택 표시 */}
          <div className="flex items-center justify-between text-xs mb-5 px-1">
            <div className="flex items-center gap-1.5 min-w-0">
              {includeUnrated ? <TierChip level={0} className="h-5" /> : null}
              <TierChip level={minVal} className="h-5" />
            </div>
            <span className="text-gray-500">~</span>
            <TierChip level={maxVal} className="h-5" />
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
                type="range"
                min={TIER_MIN}
                max={TIER_MAX}
                value={minVal}
                onChange={(e) => handleMinDrag(Number(e.target.value))}
                onMouseUp={(e) =>
                  commitMin(Number((e.target as HTMLInputElement).value))
                }
                className="dual-range-input"
                style={{ zIndex: minVal > 28 ? 5 : 3 }}
              />
              <input
                type="range"
                min={TIER_MIN}
                max={TIER_MAX}
                value={maxVal}
                onChange={(e) => handleMaxDrag(Number(e.target.value))}
                onMouseUp={(e) =>
                  commitMax(Number((e.target as HTMLInputElement).value))
                }
                className="dual-range-input"
                style={{ zIndex: 4 }}
              />
            </div>

            {/* ── 티어 마커 ── */}
            <div className="relative mt-1 px-[10px]" style={{ height: 44 }}>
              {TIER_MARKERS.map(({ level, img, label }) => {
                const isActive = level >= minVal && level <= maxVal;
                return (
                  <div
                    key={level}
                    className="absolute flex flex-col items-center gap-1"
                    style={{
                      left: thumbPos(level),
                      transform: "translateX(-50%)",
                      top: 0,
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full transition-colors"
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
                      className="transition-opacity w-5 h-5 object-contain"
                      style={{
                        opacity: isActive ? 1 : 0.25,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Unrated 포함 체크 박스 */}
          <div className="mt-4 rounded-lg border border-[#4f545c]/70 bg-[#1e1f22]/60 px-3 py-2">
            <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-200">
              <input
                type="checkbox"
                checked={includeUnrated}
                onChange={(e) => {
                  const next = e.target.checked;
                  setIncludeUnrated(next);
                  handleUpdateWebhook(webhook.id, { includeUnrated: next });
                }}
                className="mt-0.5 h-4 w-4 accent-[#5865f2]"
              />
              <div>
                <img 
                  src={`${BASE_IMG}${getTierImg(0)}.png`} 
                  alt="Unrated" 
                  className="inline-block w-4 h-4 object-contain mr-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="font-semibold text-white">Unrated 포함</span>
                <span className="block text-[11px] text-gray-400">
                  체크 시 Unrated 문제도 전송됩니다.
                </span>
              </div>
            </label>
          </div>

          {/* 드롭다운 (Radix Select + 티어 이미지) */}
          <div className="flex items-end gap-3 mt-4">
            {/* 하한 */}
            <div className="flex-1">
              <label className="block text-[10px] text-gray-400 mb-1.5 font-medium">
                하한
              </label>
              <Select
                value={String(minVal)}
                onValueChange={(v) => commitMin(Number(v))}
                onOpenChange={onSelectOpenChange}
              >
                <SelectTrigger
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-1.5 bg-[#1e1f22] border-[#4f545c] ",
                    "text-white text-xs h-8", 
                    "focus-visible:ring-[#5865f2]/50 focus-visible:border-[#5865f2]"
                  )}
                >
                  <TierRow level={minVal} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1f22] border-[#4f545c] text-white max-h-56 z-[99999]">
                  {Array.from(
                    { length: TIER_MAX - TIER_MIN + 1 },
                    (_, i) => i + TIER_MIN
                  ).map((i) => (
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
                onOpenChange={onSelectOpenChange}
              >
                <SelectTrigger
                  size="sm"
                  className={cn(
                    "w-full justify-start gap-1.5 bg-[#1e1f22] border-[#4f545c] text-white text-xs h-8",
                    "focus-visible:ring-[#5865f2]/50 focus-visible:border-[#5865f2]"
                  )}
                >
                  <TierRow level={maxVal} />
                </SelectTrigger>
                <SelectContent className="bg-[#1e1f22] border-[#4f545c] text-white max-h-56 z-[99999]">
                  {Array.from(
                    { length: TIER_MAX - TIER_MIN + 1 },
                    (_, i) => i + TIER_MIN
                  ).map((i) => (
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
