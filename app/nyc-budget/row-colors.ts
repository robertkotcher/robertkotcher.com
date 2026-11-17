export const rowColors = [
  { name: "Default", value: "" },
  { name: "White", value: "#ffffff" },
  { name: "Light blue", value: "#e8f0fe" },
  { name: "Light green", value: "#e6f4ea" },
  { name: "Light yellow", value: "#fef7e0" },
  { name: "Light purple", value: "#f3e8fd" },
] as const;

export const rowColorKey = (id: number) => `row-color:${id}`;
export const isRowColorKey = (key: string) => /^row-color:[1-9]\d{0,6}$/.test(key);
export const isRowColor = (value: unknown): value is string =>
  rowColors.some((color) => color.value === value);
