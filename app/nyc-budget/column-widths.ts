export const columns = ["A", "B", "C"] as const;
export type ColumnShares = [number, number, number];
export const totalShare = 10_000;
export const minShare = 500;

export const columnLayoutKey = (sheet: string) => `width:${sheet}:layout`;
export const isColumnLayoutKey = (key: string) => /^width:(cash-flow|tax|retirement):layout$/.test(key);
export const isColumnWidthKey = (key: string) => /^width:(cash-flow|tax|retirement):(?:[A-D]|layout)$/.test(key);

export function readColumnShares(value?: string): ColumnShares | undefined {
  if (!value || !/^\d+,\d+,\d+$/.test(value)) return;
  const [a, b, c] = value.split(",").map(Number);
  if (a >= minShare && b >= minShare && c >= minShare && a + b + c === totalShare) return [a, b, c];
}

export function sheetColumnShares(settings: Record<string, string>, sheet: string): ColumnShares {
  const saved = readColumnShares(settings[columnLayoutKey(sheet)]);
  if (saved) return saved;

  const a = Number(settings[`width:${sheet}:A`] ?? 320);
  const b = Number(settings[`width:${sheet}:B`] ?? 150);
  const c = Number(settings[`width:${sheet}:C`] ?? 230);
  const total = a + b + c;
  const distribute = totalShare - 3 * minShare;
  const first = minShare + Math.round(a / total * distribute);
  const second = minShare + Math.round(b / total * distribute);
  return [first, second, totalShare - first - second];
}
