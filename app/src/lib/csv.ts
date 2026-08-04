// Characters that make Excel, Google Sheets and LibreOffice treat a cell as a
// formula rather than text. A catch noted as "=1+1" or "+lookup(...)" would
// otherwise be evaluated — or worse, used to pull in a remote reference — the
// moment the exported file is opened. Prefixing with a single quote makes the
// spreadsheet render the literal text and is stripped back out on paste, so the
// value still reads correctly to a human.
const FORMULA_TRIGGERS = ["=", "+", "-", "@"];

// Leading tab/CR are included because some spreadsheet parsers skip them before
// deciding whether the cell starts with a formula trigger.
function neutralizeFormula(s: string): string {
  const firstMeaningful = s.replace(/^[\t\r\n ]+/, "");
  return FORMULA_TRIGGERS.some((c) => firstMeaningful.startsWith(c)) ? `'${s}` : s;
}

function csvField(value: unknown): string {
  const raw = value === null || value === undefined ? "" : String(value);
  const s = neutralizeFormula(raw);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(headers: string[], rows: unknown[][]): string {
  return [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\n");
}

export function downloadCSV(filename: string, headers: string[], rows: unknown[][]) {
  // The BOM makes Excel open UTF-8 correctly instead of mangling accented place
  // names ("Pointe-du-Chêne", "Cocagne") into mojibake.
  const blob = new Blob(["﻿" + toCSV(headers, rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
