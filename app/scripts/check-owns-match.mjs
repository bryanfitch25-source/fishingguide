// Behavioural check on ownsMatch — does a plausibly-named tackle item light up the right
// recommendation, and stay dark on the wrong one?
//
// Run with `node --experimental-strip-types scripts/check-owns-match.mjs` from `app/`.
// matcher.ts's only import is `import type`, which type stripping erases, so it loads
// without a bundler or a path-alias resolver.

import { ownsMatch, RECOMMENDATIONS } from "../src/lib/matcher.ts";

const byName = (name, slug) =>
  RECOMMENDATIONS.find((r) => r.name === name && (!slug || r.speciesSlug === slug));

// [item name, recommendation name, should it match?]
const CASES = [
  // Named patterns — specific enough to demand every word.
  ["Clouser Minnow chart/white 1/0", "Clouser Deep Minnow", true],
  ["clouser deep minnow olive", "Clouser Deep Minnow", true],
  ["Deep diving crankbait", "Clouser Deep Minnow", false],
  ["Grey Ghost streamer #6", "Grey Ghost", true],
  ["Woolly Bugger, grey, size 8", "Grey Ghost", false],
  ["Green Machine size 6 barbless", "Green Machine", true],
  ["Green Highlander #4", "Green Machine", false],
  ["Bomber - brown, 2", "Bomber", true],
  ["Elk hair caddis 14", "Elk Hair Caddis", true],
  // Type words dropped from the label, which is how people actually write them.
  ["Pheasant Tail #16", "Pheasant Tail Nymph", true],
  ["Hare's Ear beadhead 14", "Gold-Ribbed Hare's Ear", false],
  ["Gold ribbed hares ear, beadhead", "Gold-Ribbed Hare's Ear", true],

  // Described lures — any alias will do.
  ["Kastmaster 3/4oz chrome", "Metal casting spoon", true],
  ["Mepps Aglia #2 gold", "Inline spinner", true],
  ["Blue Fox Vibrax size 3", "Inline spinner", true],
  ["Rapala X-Rap 10 olive", "Swimming plug / minnow bait", true],
  ["Zoom Super Fluke pearl", "Paddletail soft plastic on a jig head", false],
  ["Keitech Swing Impact 4in", "Paddletail soft plastic on a jig head", true],
  ["Zara Spook bone", "Topwater popper or walking plug", true],
  ["Booyah spinnerbait 3/8 white", "Spinnerbait", true],
  ["Sabiki rig size 8", "Sabiki / feather rig", true],
  ["Hi-lo flounder rig", "Hi-lo bottom rig with sandworm or clam", true],
  ["Spare spool of 20lb braid", "Hi-lo bottom rig with sandworm or clam", false],
  ["3/8 oz tube jig green pumpkin", "Tube jig", true],
  ["Diamond jig 8oz", "Diamond jig", true],
  ["Little Cleo 1/4oz", "Small casting spoon", true],
  ["9ft 5wt fly rod", "Inline spinner", false],
  ["Landing net", "Metal casting spoon", false],
];

// The specs fields the tackle form writes should count too.
const SPEC_CASES = [
  [{ name: "Box of assorted", specs: { fly_pattern: "Rusty Rat" } }, "Rusty Rat", true],
  [{ name: "Unnamed", specs: { lure_type: "Spinnerbait" } }, "Spinnerbait", true],
  [{ name: "Unnamed", specs: { lure_type: "Crankbait" } }, "Spinnerbait", false],
];

let failed = 0;
for (const [itemName, recName, expected] of CASES) {
  const rec = byName(recName);
  if (!rec) {
    console.error(`✗ no recommendation called "${recName}"`);
    failed++;
    continue;
  }
  const got = ownsMatch({ name: itemName }, rec);
  if (got !== expected) {
    console.error(`✗ "${itemName}" vs "${recName}": expected ${expected}, got ${got}`);
    failed++;
  }
}
for (const [item, recName, expected] of SPEC_CASES) {
  const rec = byName(recName);
  const got = ownsMatch(item, rec);
  if (got !== expected) {
    console.error(`✗ specs ${JSON.stringify(item.specs)} vs "${recName}": expected ${expected}, got ${got}`);
    failed++;
  }
}

const total = CASES.length + SPEC_CASES.length;
if (failed) {
  console.error(`\n${failed}/${total} cases failed.`);
  process.exit(1);
}
console.log(`ownsMatch: ${total}/${total} cases as expected.`);
