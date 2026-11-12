export const columns = ["A", "B", "C", "D"] as const;
export type ColumnShares = [number, number, number, number];
export const totalShare = 10_000;
export const minShare = 500;

export const columnLayoutKey = (sheet: string) => `width:${sheet}:layout`;
export const isColumnLayoutKey = (key: string) => /^width:(cash-flow|tax|retirement):layout$/.test(key);
export const isColumnWidthKey = (key: string) => /^width:(cash-flow|tax|retirement):(?:[A-D]|layout)$/.test(key);

function splitNotes(a: number, b: number, c: number): ColumnShares {
  const secondNotes = Math.max(minShare, Math.floor(c / 2));
  const shortfall = Math.max(0, minShare + secondNotes - c);
  return [
    a - (a >= b ? shortfall : 0),
    b - (a < b ? shortfall : 0),
    c - secondNotes + shortfall,
    secondNotes,
  ];
}

export function readColumnShares(value?: string): ColumnShares | undefined {
  if (!value || !/^\d+,\d+,\d+(?:,\d+)?$/.test(value)) return;
  const shares = value.split(",").map(Number);
  if (shares.some((share) => share < minShare) || shares.reduce((sum, share) => sum + share, 0) !== totalShare) return;

  const [a, b, c, d] = shares;
  return d === undefined ? splitNotes(a, b, c) : [a, b, c, d];
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
  return splitNotes(first, second, totalShare - first - second);
}
