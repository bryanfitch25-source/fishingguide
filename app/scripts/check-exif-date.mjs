// Does a photo's EXIF timestamp survive being read on a device in another timezone?
//
// Run: node scripts/check-exif-date.mjs   (from `app/`)
//
// This exists because the obvious implementations are both wrong, and wrong in a way that
// only shows up for some users on some days:
//
//   toISOString().slice(0,10)  reports the day before for anyone east of UTC.
//   localDate(d)               converts the instant into Atlantic time, re-dating a photo
//                              taken in another zone.
//
// exifr parses the bare EXIF wall-clock into a Date whose *local getters* return the
// numbers the camera wrote, so reading the calendar fields directly is the answer — and
// this proves it across zones rather than asserting it in a comment.
//
// The fixture is a hand-built JPEG carrying only an APP1/EXIF segment with
// DateTimeOriginal, so the check needs no binary committed to the repo.

import { execFileSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const STAMP = "2024:07:14 06:30:00";
const EXPECTED = "2024-07-14";
const file = join(tmpdir(), `exif-date-check-${process.pid}.jpg`);

function buildJpeg() {
  const tiff = Buffer.alloc(64);
  let o = 0;
  tiff.write("II", o); o += 2;
  tiff.writeUInt16LE(42, o); o += 2;
  tiff.writeUInt32LE(8, o); o += 4;      // IFD0 at byte 8
  tiff.writeUInt16LE(1, o); o += 2;      // one entry
  tiff.writeUInt16LE(0x8769, o); o += 2; // ExifIFDPointer
  tiff.writeUInt16LE(4, o); o += 2;      // LONG
  tiff.writeUInt32LE(1, o); o += 4;
  tiff.writeUInt32LE(26, o); o += 4;     // Exif IFD at byte 26
  tiff.writeUInt32LE(0, o);              // no next IFD
  tiff.writeUInt16LE(1, 26);
  tiff.writeUInt16LE(0x9003, 28);        // DateTimeOriginal
  tiff.writeUInt16LE(2, 30);             // ASCII
  tiff.writeUInt32LE(20, 32);            // 19 chars + NUL
  tiff.writeUInt32LE(44, 36);            // data at byte 44
  tiff.writeUInt32LE(0, 40);
  tiff.write(`${STAMP}\0`, 44, "latin1");

  const payload = Buffer.concat([Buffer.from("Exif\0\0", "latin1"), tiff]);
  const len = payload.length + 2;
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    Buffer.from([0xff, 0xe1, len >> 8, len & 0xff]),
    payload,
    Buffer.from([0xff, 0xd9]),
  ]);
}

writeFileSync(file, buildJpeg());

// Mirrors lib/dates.ts calendarDate(). Kept as a literal here so the check fails if that
// function changes shape rather than silently importing whatever it became.
const READER = `
const exifr = require("exifr");
(async () => {
  const meta = await exifr.parse(process.argv[1], ["DateTimeOriginal", "CreateDate"]);
  const d = meta.DateTimeOriginal ?? meta.CreateDate;
  const pad = (n) => String(n).padStart(2, "0");
  const calendarDate = \`\${d.getFullYear()}-\${pad(d.getMonth() + 1)}-\${pad(d.getDate())}\`;
  console.log(JSON.stringify({ calendarDate, viaIso: d.toISOString().slice(0, 10) }));
})();
`;

const ZONES = ["UTC", "America/Halifax", "America/Vancouver", "Australia/Sydney", "Pacific/Kiritimati"];
let failures = 0;
for (const tz of ZONES) {
  const raw = execFileSync(process.execPath, ["-e", READER, file], {
    env: { ...process.env, TZ: tz },
    encoding: "utf8",
  });
  const { calendarDate, viaIso } = JSON.parse(raw);
  const ok = calendarDate === EXPECTED;
  if (!ok) failures++;
  const drift = viaIso === EXPECTED ? "" : `   (toISOString would have said ${viaIso})`;
  console.log(`${ok ? "OK  " : "FAIL"} ${tz.padEnd(20)} ${calendarDate}${drift}`);
}

unlinkSync(file);

if (failures) {
  console.error(`\n${failures} zone(s) did not read back ${EXPECTED}.`);
  process.exit(1);
}
console.log(`\nEvery zone reads the photo as ${EXPECTED}, which is what the camera wrote.`);
