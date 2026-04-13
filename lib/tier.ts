export const BASE_IMG =
  "https://cdn.jsdelivr.net/gh/5tarlight/vlog-image@main/bjcord/solved-tier/";

export const TIER_COLORS: Record<number, string> = {
  0: "#9d9d9d",
  1: "#ad5600", 2: "#ad5600", 3: "#ad5600", 4: "#ad5600", 5: "#ad5600",
  6: "#435f7a", 7: "#435f7a", 8: "#435f7a", 9: "#435f7a", 10: "#435f7a",
  11: "#ec9b00", 12: "#ec9b00", 13: "#ec9b00", 14: "#ec9b00", 15: "#ec9b00",
  16: "#27e2a4", 17: "#27e2a4", 18: "#27e2a4", 19: "#27e2a4", 20: "#27e2a4",
  21: "#00b4fc", 22: "#00b4fc", 23: "#00b4fc", 24: "#00b4fc", 25: "#00b4fc",
  26: "#ff0062", 27: "#ff0062", 28: "#ff0062", 29: "#ff0062", 30: "#ff0062",
};

/** 각 티어 경계 마커 (슬라이더용) */
export const TIER_MARKERS = [
  { level: 1, img: "bronze5", label: "B5" },
  { level: 6, img: "silver5", label: "S5" },
  { level: 11, img: "gold5", label: "G5" },
  { level: 16, img: "platinum5", label: "P5" },
  { level: 21, img: "diamond5", label: "D5" },
  { level: 26, img: "ruby5", label: "R5" },
  { level: 30, img: "ruby1", label: "R1" },
] as const;

export function getTierColor(tier: number): string {
  return TIER_COLORS[tier] ?? "#9d9d9d";
}

/** 티어 레벨(0~30)에 대응하는 이미지 파일명 반환 */
export function getTierImg(level: number): string {
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
export function thumbPos(level: number): string {
  if (level === 30) return "95%";

  const pct = ((level - 1) / 29) * 100;
  const offset = 8 - ((level - 1) / 29) * 16;
  return `calc(${pct.toFixed(3)}% + ${offset.toFixed(3)}px)`;
}
