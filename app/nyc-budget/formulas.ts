import { isPromptFormula } from "./prompt-formula";

type Value = number | string;
export type SheetCells = Record<string, string>;
const reference = /^[A-D][1-9]\d*$/;

export function evaluateSheet(cells: SheetCells, rowCount: number, inputs: Record<string, number>) {
  const results = new Map<string, Value>();
  const visiting = new Set<string>();

  function number(value: Value): number {
    if (typeof value === "number") return value;
    if (value === "") return 0;
    throw new Error(value.startsWith("#") ? value : "#VALUE!");
  }

  function read(address: string): Value {
    if (!reference.test(address) || Number(address.slice(1)) > rowCount) throw new Error("#REF!");
    if (visiting.has(address)) throw new Error("#CYCLE!");
    const cached = results.get(address);
    if (cached !== undefined) return cached;

    const raw = (cells[address] ?? "").trim();
    let result: Value = raw;
    if (raw.startsWith("=")) {
      visiting.add(address);
      try {
        result = parse(raw.slice(1).toUpperCase());
      } catch (error) {
        result = error instanceof Error && error.message.startsWith("#") ? error.message : "#ERROR!";
      } finally {
        visiting.delete(address);
      }
    } else if (raw && Number.isFinite(Number(raw))) {
      result = Number(raw);
    }
    results.set(address, result);
    return result;
  }

  function sumRange(first: string, last: string) {
    if (!reference.test(first) || !reference.test(last)) throw new Error("#REF!");
    const startRow = Math.min(Number(first.slice(1)), Number(last.slice(1)));
    const endRow = Math.max(Number(first.slice(1)), Number(last.slice(1)));
    if (endRow > rowCount) throw new Error("#REF!");
    const startColumn = Math.min(first.charCodeAt(0), last.charCodeAt(0));
    const endColumn = Math.max(first.charCodeAt(0), last.charCodeAt(0));
    let sum = 0;
    for (let row = startRow; row <= endRow; row++) {
      for (let column = startColumn; column <= endColumn; column++) {
        const value = read(String.fromCharCode(column) + row);
        if (typeof value === "number") sum += value;
        else if (value.startsWith("#")) throw new Error(value);
      }
    }
    return sum;
  }

  function parse(source: string) {
    if (source.includes("#REF!")) throw new Error("#REF!");
    const tokens = source.match(/\d+(?:\.\d*)?|\.\d+|[A-Z_][A-Z_0-9]*|[^\s]/g) ?? [];
    let index = 0;
    const take = () => tokens[index++];
    function expect(token: string) {
      if (take() !== token) throw new Error("#ERROR!");
    }
    function primary(): number {
      const token = take();
      if (token === "+") return primary();
      if (token === "-") return -primary();
      if (token === "(") {
        const value = expression();
        expect(")");
        return value;
      }
      if (token === "MIN" || token === "MAX") {
        expect("(");
        const compare = token === "MIN" ? Math.min : Math.max;
        let value = expression();
        while (tokens[index] === ",") {
          take();
          value = compare(value, expression());
        }
        expect(")");
        return value;
      }
      if (token === "SUM") {
        expect("(");
        const first = take();
        expect(":");
        const last = take();
        expect(")");
        return sumRange(first, last);
      }
      if (token && /^\d|^\.\d/.test(token)) return Number(token);
      if (token && Object.hasOwn(inputs, token)) return inputs[token];
      if (token && /^[A-Z]+\d+$/.test(token)) return number(read(token));
      throw new Error("#ERROR!");
    }
    function product() {
      let value = primary();
      while (tokens[index] === "*" || tokens[index] === "/") {
        const operator = take();
        const operand = primary();
        if (operator === "/" && operand === 0) throw new Error("#DIV/0!");
        value = operator === "*" ? value * operand : value / operand;
      }
      return value;
    }
    function expression() {
      let value = product();
      while (tokens[index] === "+" || tokens[index] === "-") {
        const operator = take();
        const operand = product();
        value = operator === "+" ? value + operand : value - operand;
      }
      return value;
    }

    const value = expression();
    if (index !== tokens.length) throw new Error("#ERROR!");
    if (!Number.isFinite(value)) throw new Error("#NUM!");
    return value;
  }

  return read;
}

export function shiftRowReferences(value: string, row: number, insert: boolean): string {
  if (!value.trimStart().startsWith("=") || isPromptFormula(value)) return value;

  const shift = (index: number) => index + (insert ? Number(index >= row) : -Number(index > row));
  return value.replace(/\b([A-D])([1-9]\d*)(?:\s*:\s*([A-D])([1-9]\d*))?\b/gi,
    (match, column: string, first: string, endColumn?: string, last?: string) => {
      const start = Number(first);
      if (!endColumn || !last) {
        if (!insert && start === row) return "#REF!";
        return shift(start) === start ? match : column + shift(start);
      }

      const end = Number(last);
      if (!insert && start === row && end === row) return "#REF!";
      const rangeStart = !insert && start === row && start > end ? start - 1 : shift(start);
      const rangeEnd = !insert && end === row && end > start ? end - 1 : shift(end);
      if (rangeStart === start && rangeEnd === end) return match;
      return `${column}${rangeStart}:${endColumn}${rangeEnd}`;
    });
}
