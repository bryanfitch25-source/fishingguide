"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  CATEGORY_ICON,
  TACKLE_CATEGORIES,
  TRAY_BRANDS,
  TRAY_SIZE_CLASSES,
  type Discipline,
  type TackleCategory,
  type TackleItem,
  type TackleTray,
  type TraySizeClass,
} from "@/types/tackle";
import { PhotoUploadField } from "./PhotoUploadField";
import { MultiPhotoField } from "./MultiPhotoField";
import { downloadCSV } from "@/lib/csv";
import {
  TACKLE_SPEC_FIELDS,
  cleanSpecs,
  describe,
  summarise,
  type SpecValues,
} from "@/lib/tackle-specs";
import { SpecFieldGrid } from "./SpecFields";
import { WarrantyFields, EMPTY_WARRANTY, downloadWarrantyIcs } from "./WarrantyFields";
import { WARRANTY_FIELDS, warrantyLabel, warrantyStatus } from "@/lib/warranty";
import { localDate } from "@/lib/dates";
import { writeWithSchemaFallback } from "@/lib/schema-compat";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

// Quantity at or below this counts as "running low" — worth restocking before a trip.
const LOW_STOCK_THRESHOLD = 1;

/** The handful of strings that differ between the two boxes. */
export interface BoxLabels {
  itemNoun: string;
  itemNounPlural: string;
  addLabel: string;
  storageNoun: string;
  storageNounPlural: string;
  csvName: string;
  namePlaceholder: string;
}

const DEFAULT_LABELS: BoxLabels = {
  itemNoun: "Item",
  itemNounPlural: "items",
  addLabel: "+ Add Tackle",
  storageNoun: "Tray",
  storageNounPlural: "Trays",
  csvName: "tackle-inventory.csv",
  namePlaceholder: "e.g. Bucktail jig",
};

// Both migrations' columns, dropped together if either is missing. Splitting them would
// mean two fallback attempts to work out which one the database is behind on, for no
// gain: the answer in both cases is "save everything else and say so".
const WRITE_FALLBACK_FIELDS = [...TACKLE_SPEC_FIELDS, ...WARRANTY_FIELDS] as const;

async function fetchItems(
  supabase: SupabaseBrowserClient,
  discipline: Discipline
): Promise<{ items: TackleItem[]; error: string | null }> {
  const [itemsRes, catchesRes] = await Promise.all([
    supabase
      .from("tackle_items")
      .select("*, tackle_item_species(species_slug)")
      // The separation the user sees is this filter. Everything else about the two boxes
      // is identical, so if this is ever dropped the fly gear simply appears in the
      // tackle box — which is exactly the thing the feature exists to prevent.
      .eq("discipline", discipline)
      .order("created_at", { ascending: false }),
    // Counted in the database rather than by pulling every catch row to the browser
    // and tallying them here. See the tackle_item_catch_counts view.
    supabase.from("tackle_item_catch_counts").select("tackle_item_id, catch_count"),
  ]);

  if (itemsRes.error) return { items: [], error: itemsRes.error.message };

  const catchCounts = new Map<string, number>();
  for (const row of (catchesRes.data as { tackle_item_id: string; catch_count: number }[] | null) ?? []) {
    catchCounts.set(row.tackle_item_id, row.catch_count);
  }

  return {
    items: (itemsRes.data ?? []).map((row) => ({
      ...(row as unknown as TackleItem),
      species_slugs: (
        (row as { tackle_item_species?: { species_slug: string }[] }).tackle_item_species ?? []
      ).map((r) => r.species_slug),
      catch_count: catchCounts.get((row as unknown as TackleItem).id) ?? 0,
    })),
    error: null,
  };
}

async function fetchTrays(
  supabase: SupabaseBrowserClient,
  discipline: Discipline
): Promise<TackleTray[]> {
  const { data } = await supabase
    .from("tackle_trays")
    .select("*")
    .eq("discipline", discipline)
    .order("position")
    .order("name");
  return (data as TackleTray[]) ?? [];
}

interface SpeciesOption {
  slug: string;
  common_name: string;
}

const NO_TRAY = "none";


const emptyForm = {
  id: null as string | null,
  name: "",
  category: "lure" as TackleCategory,
  brand: "",
  model: "",
  color_size: "",
  quantity: "1",
  tray_id: NO_TRAY,
  storage_location: "",
  notes: "",
  photo_url: "",
  extra_photo_urls: [] as string[],
  slot_index: "" as string, // "" = auto-place in next free slot
  slot_span: "1",
  last_serviced_on: "",
  maintenance_interval_days: "",
  maintenance_notes: "",
  species_slugs: [] as string[],
  specs: {} as SpecValues,
  ...EMPTY_WARRANTY,
  // The pre-specs free-text value, kept so editing an old item doesn't silently discard
  // what was in "Color / Size" before this existed. Only written back when the category's
  // own fields produce no summary of their own.
  legacy_color_size: "",
};

const emptyTrayForm = {
  name: "",
  brand: "",
  size_class: "" as TraySizeClass | "",
  compartments: "",
};

function defaultCompartments(size: TraySizeClass | ""): number | null {
  return TRAY_SIZE_CLASSES.find((s) => s.value === size)?.defaultCompartments ?? null;
}

/**
 * Serves both the Tackle Box and the Fly Box.
 *
 * The two are entirely separate to use — different screens, different categories, and a
 * `discipline` column that keeps the records apart — but they are the same machinery
 * underneath: create, edit, photograph, warranty, storage boxes, species tags, packing,
 * catch counts. Parameterising was the alternative to a second sixteen-hundred-line copy
 * that would drift out of step the first time either side was touched.
 */
export function TackleBoxClient({
  species,
  discipline = "conventional",
  categories = TACKLE_CATEGORIES,
  labels = DEFAULT_LABELS,
}: {
  species: SpeciesOption[];
  discipline?: Discipline;
  categories?: { value: TackleCategory; label: string }[];
  labels?: BoxLabels;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TackleItem[]>([]);
  const [trays, setTrays] = useState<TackleTray[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TackleCategory | "all">("all");
  const [trayFilter, setTrayFilter] = useState<string | "all">("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "productive" | "name">("recent");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [showTrays, setShowTrays] = useState(false);
  const [trayError, setTrayError] = useState<string | null>(null);
  const [editingTrayId, setEditingTrayId] = useState<string | null>(null);
  const [trayForm, setTrayForm] = useState(emptyTrayForm);

  const [viewMode, setViewMode] = useState<"list" | "diagram">("list");
  const [detailItem, setDetailItem] = useState<TackleItem | null>(null);
  const [stackSlot, setStackSlot] = useState<TackleItem[] | null>(null);

  async function loadAll() {
    setLoading(true);
    const [itemsResult, traysResult] = await Promise.all([fetchItems(supabase, discipline), fetchTrays(supabase, discipline)]);
    if (itemsResult.error) setError(itemsResult.error);
    else setItems(itemsResult.items);
    setTrays(traysResult);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [itemsResult, traysResult] = await Promise.all([fetchItems(supabase, discipline), fetchTrays(supabase, discipline)]);
      if (cancelled) return;
      if (itemsResult.error) setError(itemsResult.error);
      else setItems(itemsResult.items);
      setTrays(traysResult);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAdd() {
    // The first category of *this* box, so a new fly is never filed as a crankbait.
    setForm({ ...emptyForm, category: categories[0].value });
    setShowForm(true);
  }

  function startEdit(item: TackleItem) {
    setForm({
      id: item.id,
      name: item.name,
      category: item.category,
      brand: item.brand ?? "",
      model: item.model ?? "",
      color_size: item.color_size ?? "",
      quantity: String(item.quantity),
      tray_id: item.tray_id ?? NO_TRAY,
      storage_location: item.storage_location ?? "",
      notes: item.notes ?? "",
      photo_url: item.photo_url ?? "",
      extra_photo_urls: item.extra_photo_urls ?? [],
      slot_index: item.slot_index !== null ? String(item.slot_index) : "",
      slot_span: String(item.slot_span || 1),
      last_serviced_on: item.last_serviced_on ?? "",
      maintenance_interval_days: item.maintenance_interval_days ? String(item.maintenance_interval_days) : "",
      maintenance_notes: item.maintenance_notes ?? "",
      species_slugs: item.species_slugs ?? [],
      specs: (item.specs as SpecValues) ?? {},
      legacy_color_size: item.color_size ?? "",
      purchase_date: item.purchase_date ?? "",
      warranty_expires_on: item.warranty_expires_on ?? "",
      warranty_lifetime: item.warranty_lifetime ?? false,
      warranty_provider: item.warranty_provider ?? "",
      warranty_reference: item.warranty_reference ?? "",
      warranty_notes: item.warranty_notes ?? "",
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tackle item?")) return;
    const { error } = await supabase.from("tackle_items").delete().eq("id", id);
    if (error) setError(error.message);
    else loadAll();
  }

  async function togglePacked(item: TackleItem) {
    // Optimistic update so the pack list feels instant while heading out the door.
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: !i.packed } : i)));
    const { error } = await supabase.from("tackle_items").update({ packed: !item.packed }).eq("id", item.id);
    if (error) {
      setError(error.message);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, packed: item.packed } : i)));
    }
  }

  async function resetPackList() {
    if (!confirm("Unpack everything?")) return;
    // Scoped to the signed-in angler as well as relying on RLS. This is the only
    // destructive write in the app whose blast radius depended entirely on a policy
    // being correct, and policies get edited.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("tackle_items")
      .update({ packed: false })
      .eq("user_id", user.id)
      .eq("discipline", discipline)
      .eq("packed", true);
    if (error) setError(error.message);
    else loadAll();
  }

  function exportCSV() {
    downloadCSV(
      labels.csvName,
      // "Specs" carries the full per-category detail as label: value pairs, since a
      // spreadsheet can't have a different set of columns per row — a rod's action and a
      // reel's gear ratio would otherwise need forty mostly-empty columns to coexist.
      // "Summary" stays first because it is what the row shows in the app.
      ["Name", "Category", "Brand", "Model", "Summary", "Specs", "Quantity", "Tray", "Location", "Notes"],
      items.map((i) => [
        i.name,
        categories.find((c) => c.value === i.category)?.label ?? i.category,
        i.brand ?? "",
        i.model ?? "",
        i.color_size ?? "",
        describe(i.category, i.specs)
          .map((r) => `${r.label}: ${r.value}`)
          .join("; "),
        i.quantity,
        trayName(i.tray_id) ?? "",
        i.storage_location ?? "",
        i.notes ?? "",
      ])
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("You've been signed out — please sign in again.");
      setSaving(false);
      return;
    }

    const specs = cleanSpecs(form.specs);
    // color_size becomes a derived one-liner rather than something typed by hand. It is
    // what the list rows, tray tiles and CSV already read, so composing it here means none
    // of them need to change and all of them immediately show better text.
    //
    // Falls back to whatever was in the old free-text box when the category's own fields
    // are all empty — otherwise opening a pre-specs item and pressing Save, without
    // touching anything, would blank the only description it had.
    const summary = summarise(form.category, specs);
    const payload = {
      user_id: user.id,
      discipline,
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      color_size: summary || form.legacy_color_size.trim() || null,
      specs,
      purchase_date: form.purchase_date || null,
      // Mutually exclusive, and enforced in the database too — a lifetime warranty and an
      // end date are contradictory claims about the same cover.
      warranty_expires_on: form.warranty_lifetime ? null : form.warranty_expires_on || null,
      warranty_lifetime: form.warranty_lifetime,
      warranty_provider: form.warranty_provider.trim() || null,
      warranty_reference: form.warranty_reference.trim() || null,
      warranty_notes: form.warranty_notes.trim() || null,
      quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
      tray_id: form.tray_id === NO_TRAY ? null : form.tray_id,
      storage_location: form.storage_location.trim() || null,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
      extra_photo_urls: form.extra_photo_urls,
      slot_index: form.slot_index !== "" ? parseInt(form.slot_index, 10) : null,
      slot_span: Math.max(1, parseInt(form.slot_span, 10) || 1),
      last_serviced_on: form.last_serviced_on || null,
      maintenance_interval_days: form.maintenance_interval_days
        ? parseInt(form.maintenance_interval_days, 10)
        : null,
      maintenance_notes: form.maintenance_notes.trim() || null,
    };

    // Through the schema-compat fallback because `specs` arrives with a migration. Vercel
    // deploys the moment main moves; the migration is a separate manual step. In the window
    // between, a payload naming `specs` would be rejected outright and adding tackle — a
    // feature that already worked — would break. This drops the new column and saves the
    // rest instead, and says so.
    let itemId = form.id;
    let degraded = false;
    if (itemId) {
      const res = await writeWithSchemaFallback(payload, WRITE_FALLBACK_FIELDS, (p) =>
        supabase.from("tackle_items").update(p).eq("id", itemId as string)
      );
      if (res.error) {
        setError(res.error.message);
        setSaving(false);
        return;
      }
      degraded = res.degraded;
    } else {
      let insertedId: string | null = null;
      const res = await writeWithSchemaFallback(payload, WRITE_FALLBACK_FIELDS, async (p) => {
        const { data, error } = await supabase.from("tackle_items").insert(p).select("id").single();
        if (data) insertedId = data.id;
        return { error };
      });
      if (res.error || !insertedId) {
        setError(res.error?.message ?? "Couldn't save that item.");
        setSaving(false);
        return;
      }
      itemId = insertedId;
      degraded = res.degraded;
    }
    if (degraded) {
      setError(
        "Saved — but the per-category details aren't in the database yet. Run the pending migration to start recording them."
      );
    }

    // Replace species tags
    await supabase.from("tackle_item_species").delete().eq("tackle_item_id", itemId);
    if (form.species_slugs.length) {
      await supabase
        .from("tackle_item_species")
        .insert(form.species_slugs.map((slug) => ({ tackle_item_id: itemId, species_slug: slug })));
    }

    setSaving(false);
    setShowForm(false);
    loadAll();
  }

  function toggleSpecies(slug: string) {
    setForm((f) => ({
      ...f,
      species_slugs: f.species_slugs.includes(slug)
        ? f.species_slugs.filter((s) => s !== slug)
        : [...f.species_slugs, slug],
    }));
  }

  function suggestTrayName(brand: string, size: TraySizeClass | "") {
    const sizeInfo = TRAY_SIZE_CLASSES.find((s) => s.value === size);
    if (!sizeInfo) return brand;
    // Prefer the brand-specific model number when we have one (e.g. "Flambeau 5007"
    // instead of the generic "Large") so the name itself carries the designation.
    const number =
      brand === "Flambeau" && sizeInfo.flambeauNumber
        ? sizeInfo.flambeauNumber
        : sizeInfo.planoNumber;
    const sizeName = number ? `${sizeInfo.label.split(" (")[0]} (${number})` : sizeInfo.label;
    return [brand, sizeName].filter(Boolean).join(" ");
  }

  async function handleAddTray(e: React.FormEvent) {
    e.preventDefault();
    setTrayError(null);
    const name = trayForm.name.trim() || suggestTrayName(trayForm.brand, trayForm.size_class);
    if (!name) {
      setTrayError("Give the tray a name, or pick a brand/size to auto-name it.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setTrayError("You've been signed out — please sign in again.");
      return;
    }

    const { error } = await supabase.from("tackle_trays").insert({
      discipline,
      user_id: user.id,
      name,
      brand: trayForm.brand || null,
      size_class: trayForm.size_class || null,
      compartments: parseInt(trayForm.compartments, 10) || defaultCompartments(trayForm.size_class),
      position: trays.length,
    });
    if (error) {
      setTrayError(error.message);
      return;
    }
    setTrayForm(emptyTrayForm);
    loadAll();
  }

  async function handleSaveTray(id: string) {
    const name = trayForm.name.trim() || suggestTrayName(trayForm.brand, trayForm.size_class);
    if (!name) {
      setTrayError("Give the tray a name, or pick a brand/size to auto-name it.");
      return;
    }
    const { error } = await supabase
      .from("tackle_trays")
      .update({
        name,
        brand: trayForm.brand || null,
        size_class: trayForm.size_class || null,
        compartments: parseInt(trayForm.compartments, 10) || defaultCompartments(trayForm.size_class),
      })
      .eq("id", id);
    if (error) setTrayError(error.message);
    setEditingTrayId(null);
    loadAll();
  }

  async function handleDeleteTray(id: string) {
    const count = items.filter((i) => i.tray_id === id).length;
    const msg = count
      ? `Delete this tray? ${count} item${count === 1 ? "" : "s"} in it will become untrayed, not deleted.`
      : "Delete this tray?";
    if (!confirm(msg)) return;
    const { error } = await supabase.from("tackle_trays").delete().eq("id", id);
    if (error) setTrayError(error.message);
    if (trayFilter === id) setTrayFilter("all");
    loadAll();
  }

  const lowStockCount = items.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD).length;
  const packedCount = items.filter((i) => i.packed).length;

  function isMaintenanceDue(item: TackleItem): boolean {
    if (!item.maintenance_interval_days) return false;
    if (!item.last_serviced_on) return true; // interval set but never logged as serviced
    const dueDate = new Date(item.last_serviced_on);
    dueDate.setDate(dueDate.getDate() + item.maintenance_interval_days);
    return dueDate.getTime() <= new Date().getTime();
  }

  const filtered = items
    .filter((i) => {
      if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
      if (lowStockOnly && i.quantity > LOW_STOCK_THRESHOLD) return false;
      if (trayFilter === "all") return true;
      if (trayFilter === NO_TRAY) return !i.tray_id;
      return i.tray_id === trayFilter;
    })
    .sort((a, b) => {
      if (sortBy === "productive") return (b.catch_count ?? 0) - (a.catch_count ?? 0);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0; // "recent" — already ordered by created_at from the query
    });
  const speciesName = (slug: string) => species.find((s) => s.slug === slug)?.common_name ?? slug;
  const trayName = (id: string | null) => (id ? trays.find((t) => t.id === id)?.name ?? null : null);
  const untrayedCount = items.filter((i) => !i.tray_id).length;

  // Groups for the diagram view: one section per tray (in tray order, shown even when
  // empty so the layout is visible right away), plus a trailing "No Tray" section for
  // untrayed items — each rendered as a grid of compartments.
  const diagramGroups: { tray: TackleTray | null; items: TackleItem[] }[] = [
    ...trays
      .filter((t) => trayFilter === "all" || trayFilter === t.id)
      .map((tray) => ({ tray, items: filtered.filter((i) => i.tray_id === tray.id) })),
    ...(trayFilter === "all" || trayFilter === NO_TRAY
      ? [{ tray: null, items: filtered.filter((i) => !i.tray_id) }].filter((g) => g.items.length > 0)
      : []),
  ];

  // Same grouping as the diagram, minus the empty trays: a heading over nothing is
  // useful in the diagram (it shows you the physical box) but is just noise in a list.
  const listGroups = diagramGroups.filter((g) => g.items.length > 0);

  // Everything the app already knows needs doing, which until now was only discoverable
  // by scrolling to the bottom of an individual card.
  const today = localDate();
  const needsAttention = {
    low: items.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD),
    service: items.filter((i) => isMaintenanceDue(i)),
    // Only the ones you can still act on. An expired warranty belongs on the item's own
    // card as a fact; putting it here would mean the strip never empties and stops being
    // read at all.
    warranty: items.filter((i) => warrantyStatus(i, today) === "expiring"),
  };

  interface TrayCell {
    key: string;
    span: number;
    items: TackleItem[]; // empty = unfilled slot; 2+ = more items than free room, opens a picker
  }

  // Lays items into a fixed number of compartments (the tray's real divider count).
  // Items with a chosen slot_index/slot_span are pinned there first; anything left
  // unplaced (new items, or a manual placement that no longer fits) auto-fills the
  // next free run of the right size. Whatever still doesn't fit gets bucketed into
  // one overflow cell rather than silently dropped or inventing phantom slots.
  function computeTrayCells(tray: TackleTray | null, groupItems: TackleItem[]): TrayCell[] {
    const sizeDefault = tray ? TRAY_SIZE_CLASSES.find((s) => s.value === tray.size_class)?.defaultCompartments : null;
    const slotCount = tray?.compartments || sizeDefault || groupItems.length || 1;
    const occupied: (TackleItem | null)[] = Array(slotCount).fill(null);

    const manual = groupItems
      .filter((i) => i.slot_index !== null)
      .sort((a, b) => (a.slot_index as number) - (b.slot_index as number));
    const rest: TackleItem[] = groupItems.filter((i) => i.slot_index === null);

    for (const item of manual) {
      const start = item.slot_index as number;
      const span = Math.max(1, item.slot_span || 1);
      const fits = start >= 0 && start + span <= slotCount && occupied.slice(start, start + span).every((c) => !c);
      if (fits) {
        for (let k = start; k < start + span; k++) occupied[k] = item;
      } else {
        rest.push(item); // conflict or out of range — fall back to auto-placement
      }
    }

    const overflow: TackleItem[] = [];
    for (const item of rest) {
      const span = Math.max(1, item.slot_span || 1);
      let start = -1;
      for (let i = 0; i <= slotCount - span; i++) {
        if (occupied.slice(i, i + span).every((c) => !c)) {
          start = i;
          break;
        }
      }
      if (start >= 0) {
        for (let k = start; k < start + span; k++) occupied[k] = item;
      } else {
        overflow.push(item);
      }
    }

    const cells: TrayCell[] = [];
    let i = 0;
    while (i < slotCount) {
      const item = occupied[i];
      if (!item) {
        cells.push({ key: `empty-${i}`, span: 1, items: [] });
        i++;
        continue;
      }
      let span = 0;
      while (i + span < slotCount && occupied[i + span] === item) span++;
      cells.push({ key: item.id, span, items: [item] });
      i += span;
    }
    if (overflow.length) cells.push({ key: "overflow", span: 1, items: overflow });
    return cells;
  }

  // Starting positions where `span` consecutive slots are free in the given tray,
  // for the "Position in tray" picker — only accounts for other items that already
  // have a manual placement (auto-placed items float, so they don't block a choice).
  function availableSlotStarts(trayId: string, span: number, excludeItemId: string | null): number[] {
    const tray = trays.find((t) => t.id === trayId);
    if (!tray) return [];
    const sizeDefault = TRAY_SIZE_CLASSES.find((s) => s.value === tray.size_class)?.defaultCompartments;
    const slotCount = tray.compartments || sizeDefault || 1;
    const occupied = Array(slotCount).fill(false);
    for (const item of items) {
      if (item.tray_id !== trayId || item.id === excludeItemId || item.slot_index === null) continue;
      const itemSpan = Math.max(1, item.slot_span || 1);
      for (let k = item.slot_index; k < Math.min(slotCount, item.slot_index + itemSpan); k++) occupied[k] = true;
    }
    const starts: number[] = [];
    for (let i = 0; i <= slotCount - span; i++) {
      if (occupied.slice(i, i + span).every((c) => !c)) starts.push(i);
    }
    return starts;
  }

  function trayGridColumns(tray: TackleTray | null, slotCount: number): number {
    const aspect = TRAY_SIZE_CLASSES.find((s) => s.value === tray?.size_class)?.aspectRatio ?? 1.5;
    return Math.max(1, Math.min(slotCount, Math.round(Math.sqrt(slotCount * aspect))));
  }

  function traySizeDesignation(tray: TackleTray) {
    const sizeInfo = TRAY_SIZE_CLASSES.find((s) => s.value === tray.size_class);
    if (!sizeInfo) return null;
    const number =
      tray.brand === "Flambeau" && sizeInfo.flambeauNumber ? sizeInfo.flambeauNumber : sizeInfo.planoNumber;
    const sizeName = sizeInfo.label.split(" (")[0];
    return number ? `${sizeName} (${number})` : sizeName;
  }

  return (
    <div>
      {/* Trays management */}
      <div className="mb-6 rounded-xl border border-border bg-surface card-lift p-4 no-print">
        <button
          onClick={() => setShowTrays((v) => !v)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-bold text-tackle">🗂️ Trays ({trays.length})</span>
          <span className="text-muted text-sm">{showTrays ? "Hide" : "Manage"}</span>
        </button>
        {showTrays && (
          <div className="mt-4 space-y-3">
            {trayError && <p className="rounded bg-danger-light px-3 py-2 text-sm text-danger">{trayError}</p>}
            {trays.length === 0 && (
              <p className="text-sm text-muted">No trays yet — add one below to start organizing.</p>
            )}
            <ul className="space-y-2">
              {trays.map((tray) => (
                <li key={tray.id} className="rounded-lg border border-border p-3">
                  {editingTrayId === tray.id ? (
                    <form
                      className="space-y-2"
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSaveTray(tray.id);
                      }}
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          autoFocus
                          value={trayForm.name}
                          onChange={(e) => setTrayForm({ ...trayForm, name: e.target.value })}
                          placeholder="Tray name (optional if brand/size chosen)"
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                        />
                        <select
                          value={trayForm.brand}
                          onChange={(e) => setTrayForm({ ...trayForm, brand: e.target.value })}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                        >
                          <option value="">— Brand —</option>
                          {TRAY_BRANDS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <select
                          value={trayForm.size_class}
                          onChange={(e) =>
                            setTrayForm({ ...trayForm, size_class: e.target.value as TraySizeClass })
                          }
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                        >
                          <option value="">— Size —</option>
                          {TRAY_SIZE_CLASSES.map((s) => (
                            <option key={s.value} value={s.value}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min={1}
                          value={trayForm.compartments}
                          onChange={(e) => setTrayForm({ ...trayForm, compartments: e.target.value })}
                          placeholder={`# compartments (${defaultCompartments(trayForm.size_class) ?? "?"})`}
                          className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div className="flex gap-3 text-sm">
                        <button type="submit" className="text-accent-dark hover:underline">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingTrayId(null)}
                          className="text-muted hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span>
                        <span className="font-medium">{tray.name}</span>{" "}
                        {(tray.brand || tray.size_class) && (
                          <span className="text-muted">
                            ({[tray.brand, traySizeDesignation(tray)].filter(Boolean).join(", ")})
                          </span>
                        )}{" "}
                        {tray.compartments && (
                          <span className="text-muted">— {tray.compartments} compartments</span>
                        )}{" "}
                        <span className="text-muted">
                          — {items.filter((i) => i.tray_id === tray.id).length} item
                          {items.filter((i) => i.tray_id === tray.id).length === 1 ? "" : "s"}
                        </span>
                      </span>
                      <span className="flex gap-3 shrink-0">
                        <button
                          onClick={() => {
                            setEditingTrayId(tray.id);
                            setTrayForm({
                              name: tray.name,
                              brand: tray.brand ?? "",
                              size_class: tray.size_class ?? "",
                              compartments: tray.compartments ? String(tray.compartments) : "",
                            });
                          }}
                          className="text-accent-dark hover:underline"
                        >
                          Edit
                        </button>
                        <button onClick={() => handleDeleteTray(tray.id)} className="text-danger hover:underline">
                          Delete
                        </button>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <form
              onSubmit={handleAddTray}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 pt-2 border-t border-border"
            >
              <input
                value={trayForm.name}
                onChange={(e) => setTrayForm({ ...trayForm, name: e.target.value })}
                placeholder="Name (optional — auto-fills from brand/size)"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                value={trayForm.brand}
                onChange={(e) => setTrayForm({ ...trayForm, brand: e.target.value })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Brand —</option>
                {TRAY_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <select
                value={trayForm.size_class}
                onChange={(e) => setTrayForm({ ...trayForm, size_class: e.target.value as TraySizeClass })}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
                title={TRAY_SIZE_CLASSES.find((s) => s.value === trayForm.size_class)?.dims}
              >
                <option value="">— Size —</option>
                {TRAY_SIZE_CLASSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={trayForm.compartments}
                onChange={(e) => setTrayForm({ ...trayForm, compartments: e.target.value })}
                placeholder={`# compartments (${defaultCompartments(trayForm.size_class) ?? "?"})`}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-lg bg-tackle text-white font-semibold px-4 py-2 text-sm hover:opacity-90 transition whitespace-nowrap"
              >
                + Add Tray
              </button>
            </form>
            {trayForm.size_class && (
              <p className="text-xs text-muted">
                {TRAY_SIZE_CLASSES.find((s) => s.value === trayForm.size_class)?.dims}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 no-print">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
              categoryFilter === "all" ? "bg-brand text-white border-brand" : "border-border hover:border-brand"
            }`}
          >
            All ({items.length})
          </button>
          {categories.map((c) => {
            const count = items.filter((i) => i.category === c.value).length;
            if (!count) return null;
            return (
              <button
                key={c.value}
                onClick={() => setCategoryFilter(c.value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
                  categoryFilter === c.value ? "bg-brand text-white border-brand" : "border-border hover:border-brand"
                }`}
              >
                {c.label} ({count})
              </button>
            );
          })}
          {lowStockCount > 0 && (
            <button
              onClick={() => setLowStockOnly((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
                lowStockOnly
                  ? "bg-danger text-white border-danger"
                  : "border-danger/40 text-danger hover:border-danger"
              }`}
            >
              ⚠️ Low Stock ({lowStockCount})
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="recent">Sort: Recently Added</option>
            <option value="productive">Sort: Most Productive</option>
            <option value="name">Sort: Name A–Z</option>
          </select>
          <div className="flex rounded-lg border border-border p-0.5 text-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                viewMode === "list" ? "bg-tackle text-white" : "text-muted hover:text-foreground"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("diagram")}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                viewMode === "diagram" ? "bg-tackle text-white" : "text-muted hover:text-foreground"
              }`}
            >
              🗂️ Diagram
            </button>
          </div>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-tackle transition"
          >
            🖨️ Print
          </button>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-tackle transition"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={startAdd}
            className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
          >
            + Add Item
          </button>
        </div>
      </div>

      {packedCount > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-brand-light px-3 py-2 text-sm">
          <span className="font-medium text-brand-dark">
            🎒 Pack list: {packedCount} of {items.length} packed
          </span>
          <button onClick={resetPackList} className="text-brand-dark hover:underline">
            Unpack all
          </button>
        </div>
      )}

      {trays.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 no-print">
          <button
            onClick={() => setTrayFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              trayFilter === "all" ? "bg-tackle text-white border-tackle" : "border-border hover:border-tackle"
            }`}
          >
            All Trays
          </button>
          {trays.map((tray) => (
            <button
              key={tray.id}
              onClick={() => setTrayFilter(tray.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                trayFilter === tray.id ? "bg-tackle text-white border-tackle" : "border-border hover:border-tackle"
              }`}
            >
              🗂️ {tray.name} ({items.filter((i) => i.tray_id === tray.id).length})
            </button>
          ))}
          {untrayedCount > 0 && (
            <button
              onClick={() => setTrayFilter(NO_TRAY)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
                trayFilter === NO_TRAY ? "bg-tackle text-white border-tackle" : "border-border hover:border-tackle"
              }`}
            >
              No Tray ({untrayedCount})
            </button>
          )}
        </div>
      )}

      {error && <p className="mb-4 rounded bg-danger-light px-3 py-2 text-sm text-danger">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-surface card-lift p-5 space-y-4 no-print"
        >
          <h2 className="font-bold text-brand-dark">{form.id ? "Edit Item" : "New Item"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={labels.namePlaceholder}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as TackleCategory })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brand</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Model</label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tray</label>
              <select
                value={form.tray_id}
                onChange={(e) => setForm({ ...form, tray_id: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value={NO_TRAY}>— No tray —</option>
                {trays.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {trays.length === 0 && (
                <p className="mt-1 text-xs text-muted">
                  No trays yet — use the Trays panel above to add one.
                </p>
              )}
            </div>
            {form.tray_id !== NO_TRAY && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Slots this item takes</label>
                  <input
                    type="number"
                    min={1}
                    value={form.slot_span}
                    onChange={(e) => setForm({ ...form, slot_span: e.target.value, slot_index: "" })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Position in tray</label>
                  <select
                    value={form.slot_index}
                    onChange={(e) => setForm({ ...form, slot_index: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Auto (next free slot)</option>
                    {availableSlotStarts(form.tray_id, Math.max(1, parseInt(form.slot_span, 10) || 1), form.id).map(
                      (start) => {
                        const span = Math.max(1, parseInt(form.slot_span, 10) || 1);
                        return (
                          <option key={start} value={start}>
                            {span > 1 ? `Slots ${start + 1}–${start + span}` : `Slot ${start + 1}`}
                          </option>
                        );
                      }
                    )}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Location Notes</label>
              <input
                value={form.storage_location}
                onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                placeholder="e.g. Top-left compartment"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <PhotoUploadField
                folder="tackle"
                value={form.photo_url}
                onChange={(url) => setForm({ ...form, photo_url: url })}
              />
            </div>
            <div>
              <MultiPhotoField
                folder="tackle"
                values={form.extra_photo_urls}
                onChange={(urls) => setForm({ ...form, extra_photo_urls: urls })}
              />
            </div>
          </div>

          {/* The part that differs by category. Everything above is true of any item you
              own — a name, a brand, where it lives, a photo. Everything here is only true
              of this kind of thing, and asking a landing net for its gear ratio is how the
              old single form ended up with one box called "Color / Size". */}
          <SpecFieldGrid
            category={form.category}
            specs={form.specs}
            legacySummary={form.legacy_color_size}
            onChange={(id, v) => setForm((f) => ({ ...f, specs: { ...f.specs, [id]: v } }))}
          />

          <WarrantyFields
            values={{
              purchase_date: form.purchase_date,
              warranty_expires_on: form.warranty_expires_on,
              warranty_lifetime: form.warranty_lifetime,
              warranty_provider: form.warranty_provider,
              warranty_reference: form.warranty_reference,
              warranty_notes: form.warranty_notes,
            }}
            itemName={form.name}
            itemId={form.id}
            onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
          />

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-sm font-semibold mb-2">🛠️ Maintenance</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1">Last serviced</label>
                <input
                  type="date"
                  value={form.last_serviced_on}
                  onChange={(e) => setForm({ ...form, last_serviced_on: e.target.value })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Remind every (days)</label>
                <input
                  type="number"
                  min={1}
                  value={form.maintenance_interval_days}
                  onChange={(e) => setForm({ ...form, maintenance_interval_days: e.target.value })}
                  placeholder="e.g. 180"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Maintenance notes</label>
                <input
                  value={form.maintenance_notes}
                  onChange={(e) => setForm({ ...form, maintenance_notes: e.target.value })}
                  placeholder="e.g. Re-line, oil reel"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Good for these species (optional — shows up as owned gear on their guide page)
            </label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-border p-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {species.map((s) => (
                <label key={s.slug} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={form.species_slugs.includes(s.slug)}
                    onChange={() => toggleSpecies(s.slug)}
                  />
                  {s.common_name}
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Save Changes" : "Add Item"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Answers "what needs doing" before "what do I own". Both lists were already being
          computed to drive a chip at the bottom of each card, which meant the only way to
          find a reel due for service was to scroll past every reel that wasn't. Hidden
          entirely when there's nothing wrong — a permanent "all good" panel is furniture. */}
      {!loading &&
        (needsAttention.low.length > 0 ||
          needsAttention.service.length > 0 ||
          needsAttention.warranty.length > 0) && (
        <div className="mb-5 rounded-xl border border-danger/40 bg-surface card-lift p-4 no-print">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
            Needs attention
          </h2>
          <ul className="space-y-1.5 text-sm">
            {needsAttention.low.map((i) => (
              <li key={`low-${i.id}`} className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-catches-light px-2 py-0.5 text-[10px] font-semibold text-catches">
                  Low stock
                </span>
                <button onClick={() => setDetailItem(i)} className="truncate text-left hover:underline">
                  {i.name} — {i.quantity} left
                </button>
              </li>
            ))}
            {needsAttention.service.map((i) => (
              <li key={`svc-${i.id}`} className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
                  Service due
                </span>
                <button onClick={() => setDetailItem(i)} className="truncate text-left hover:underline">
                  {i.name}
                </button>
              </li>
            ))}
            {needsAttention.warranty.map((i) => (
              <li key={`war-${i.id}`} className="flex items-center gap-2">
                <span className="shrink-0 rounded-full bg-danger-light px-2 py-0.5 text-[10px] font-semibold text-danger">
                  Warranty ending
                </span>
                <button onClick={() => setDetailItem(i)} className="truncate text-left hover:underline">
                  {i.name}
                </button>
                <span className="shrink-0 text-xs text-muted">{warrantyLabel(i, today)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm">
          {items.length === 0
            ? "No tackle yet — add your first item above."
            : "Nothing matches these filters."}
        </p>
      ) : viewMode === "diagram" ? (
        <div className="space-y-6">
          {diagramGroups.map((group) => {
            const cells = computeTrayCells(group.tray, group.items);
            const slotCount = cells.reduce((n, c) => n + (c.key === "overflow" ? 1 : c.span), 0);
            const columns = trayGridColumns(group.tray, slotCount);
            return (
              <div
                key={group.tray?.id ?? "no-tray"}
                className="rounded-xl border-2 border-tackle/40 bg-tackle-light/40 p-4"
              >
                <div className="mb-3 flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-tackle">🗂️ {group.tray?.name ?? "No Tray"}</h3>
                  <span className="text-xs text-muted">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"}
                    {group.tray?.compartments ? ` · ${group.tray.compartments} compartments` : ""}
                  </span>
                </div>
                {group.items.length === 0 && (
                  <p className="mb-2 text-xs text-muted">
                    Empty — add an item and assign it a tray to start filling this in.
                  </p>
                )}
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                >
                  {cells.map((cell) => {
                    const top = cell.items[0];
                    const style = { gridColumn: `span ${cell.span}` };
                    if (!top) {
                      return (
                        <div
                          key={cell.key}
                          style={style}
                          className="aspect-square rounded-lg border border-dashed border-tackle/25"
                        />
                      );
                    }
                    return (
                      <button
                        key={cell.key}
                        style={style}
                        onClick={() => (cell.items.length > 1 ? setStackSlot(cell.items) : setDetailItem(top))}
                        className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border border-tackle/30 bg-surface p-1.5 text-center shadow-sm transition hover:border-tackle hover:shadow-md"
                      >
                        {top.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
                          <img
                            src={top.photo_url}
                            alt=""
                            className="absolute inset-0 h-full w-full rounded-lg object-cover"
                          />
                        ) : (
                          <span className="text-2xl">{CATEGORY_ICON[top.category]}</span>
                        )}
                        <span className="relative mt-auto w-full truncate rounded bg-black/60 px-1 py-0.5 text-[11px] font-medium leading-tight text-white">
                          {cell.items.length > 1 ? `${cell.items.length} items` : top.name}
                        </span>
                        {cell.items.length === 1 && top.quantity !== 1 && (
                          <span className="absolute right-1 top-1 rounded-full bg-tackle px-1.5 py-0 text-[10px] font-bold text-white">
                            ×{top.quantity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Grouped by tray rather than a flat grid of cards. A card per item put every
              attribute on its own line and then a tag pile of variable length underneath,
              so no two cards were the same height and the grid went ragged. One row per
              item is uniform, fits far more on a phone, and matches how the gear is
              actually organised — you look in a tray, not in an alphabetical list. */}
          {listGroups.map(({ tray, items: groupItems }) => (
            <section key={tray?.id ?? "untrayed"}>
              <h2 className="mb-1.5 flex items-baseline gap-2 text-xs font-bold uppercase tracking-wide text-muted">
                <span className="text-tackle">🗂️ {tray?.name ?? "No tray"}</span>
                <span>
                  {groupItems.length} item{groupItems.length === 1 ? "" : "s"}
                </span>
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-surface card-lift">
                {groupItems.map((item, i) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 ${i > 0 ? "border-t border-border" : ""} ${
                      item.packed ? "bg-brand-light/40" : ""
                    }`}
                  >
                    {item.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
                      <img
                        src={item.photo_url}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-lg"
                      >
                        {CATEGORY_ICON[item.category]}
                      </span>
                    )}

                    <button
                      onClick={() => setDetailItem(item)}
                      className="min-w-0 flex-1 text-left"
                      title="Open details"
                    >
                      <p className="truncate font-semibold text-brand-dark">{item.name}</p>
                      <p className="truncate text-xs text-muted">
                        {categories.find((c) => c.value === item.category)?.label}
                        {item.brand ? ` · ${item.brand}` : ""}
                        {item.color_size ? ` · ${item.color_size}` : ""}
                      </p>
                      {/* Only exceptions get a chip. Everything else stays quiet, which is
                          what keeps the rows scannable. */}
                      {(item.quantity <= LOW_STOCK_THRESHOLD || isMaintenanceDue(item)) && (
                        <span className="mt-1 inline-flex gap-1">
                          {item.quantity <= LOW_STOCK_THRESHOLD && (
                            <span className="rounded-full bg-catches-light px-2 py-0.5 text-[10px] font-semibold text-catches">
                              Low stock
                            </span>
                          )}
                          {isMaintenanceDue(item) && (
                            <span className="rounded-full bg-accent-light px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
                              Service due
                            </span>
                          )}
                        </span>
                      )}
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm tabular-nums text-muted">×{item.quantity}</span>
                      <label
                        className="flex cursor-pointer items-center no-print"
                        title={item.packed ? "Packed for this trip" : "Not packed"}
                      >
                        <input
                          type="checkbox"
                          checked={item.packed}
                          onChange={() => togglePacked(item)}
                          className="h-4 w-4 accent-[var(--color-brand)]"
                        />
                        <span className="sr-only">Packed</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {stackSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setStackSlot(null)}
        >
          <div
            className="w-full max-w-xs rounded-xl border border-border bg-surface card-lift p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-2 font-bold text-tackle">This compartment holds {stackSlot.length} items</h3>
            <ul className="space-y-1">
              {stackSlot.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setDetailItem(item);
                      setStackSlot(null);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-tackle-light"
                  >
                    <span className="text-lg">{CATEGORY_ICON[item.category]}</span>
                    {item.name}
                    {item.quantity !== 1 && <span className="text-muted">×{item.quantity}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setDetailItem(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface card-lift p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="text-lg font-bold text-brand-dark">{detailItem.name}</h3>
              <button
                onClick={() => setDetailItem(null)}
                className="shrink-0 rounded-full p-1 text-muted hover:bg-border/50"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {detailItem.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
              <img
                src={detailItem.photo_url}
                alt=""
                className="mb-3 h-48 w-full rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg bg-tackle-light text-5xl">
                {CATEGORY_ICON[detailItem.category]}
              </div>
            )}
            {detailItem.extra_photo_urls.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {detailItem.extra_photo_urls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
                  <img key={url} src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                ))}
              </div>
            )}
            <div className="space-y-1.5 text-sm">
              <p>
                <span className="text-muted">Category:</span>{" "}
                {categories.find((c) => c.value === detailItem.category)?.label}
              </p>
              {(detailItem.brand || detailItem.model) && (
                <p>
                  <span className="text-muted">Brand / Model:</span>{" "}
                  {[detailItem.brand, detailItem.model].filter(Boolean).join(" ")}
                </p>
              )}
              {/* Every populated spec, in schema order. The one-line summary is what the
                  list row shows; here there's room for all of it, so a rod's action and
                  piece count are visible rather than compressed away. Falls back to the
                  old free-text field for items saved before the specs existed. */}
              {(() => {
                const rows = describe(detailItem.category, detailItem.specs);
                if (rows.length > 0) {
                  return (
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {rows.map((r) => (
                        <div key={r.label} className="contents">
                          <dt className="text-muted">{r.label}</dt>
                          <dd>{r.value}</dd>
                        </div>
                      ))}
                    </dl>
                  );
                }
                return detailItem.color_size ? (
                  <p>
                    <span className="text-muted">Color / Size:</span> {detailItem.color_size}
                  </p>
                ) : null;
              })()}
              <p>
                <span className="text-muted">Quantity:</span> {detailItem.quantity}
                {detailItem.quantity <= LOW_STOCK_THRESHOLD && (
                  <span className="ml-1.5 text-danger">⚠️ Low stock</span>
                )}
              </p>
              {(detailItem.catch_count ?? 0) > 0 && (
                <p className="text-catches">
                  🔥 Used in {detailItem.catch_count} catch{detailItem.catch_count === 1 ? "" : "es"}
                </p>
              )}
              {trayName(detailItem.tray_id) && (
                <p className="text-tackle">
                  🗂️ {trayName(detailItem.tray_id)}
                  {detailItem.slot_index !== null &&
                    ` — ${
                      detailItem.slot_span > 1
                        ? `slots ${detailItem.slot_index + 1}–${detailItem.slot_index + detailItem.slot_span}`
                        : `slot ${detailItem.slot_index + 1}`
                    }`}
                </p>
              )}
              {detailItem.storage_location && <p>📍 {detailItem.storage_location}</p>}
              {detailItem.notes && <p className="pt-1 whitespace-pre-wrap">{detailItem.notes}</p>}
              {(detailItem.last_serviced_on || detailItem.maintenance_interval_days) && (
                <p className={isMaintenanceDue(detailItem) ? "text-accent-dark" : ""}>
                  🛠️ {isMaintenanceDue(detailItem) ? "Maintenance due" : "Last serviced"}
                  {detailItem.last_serviced_on ? ` ${detailItem.last_serviced_on}` : ""}
                  {detailItem.maintenance_interval_days ? ` · every ${detailItem.maintenance_interval_days} days` : ""}
                  {detailItem.maintenance_notes ? ` — ${detailItem.maintenance_notes}` : ""}
                </p>
              )}
              {warrantyLabel(detailItem, today) && (
                <div className="pt-1">
                  <p
                    className={
                      warrantyStatus(detailItem, today) === "expiring"
                        ? "text-accent-dark"
                        : warrantyStatus(detailItem, today) === "expired"
                          ? "text-danger"
                          : "text-success"
                    }
                  >
                    🧾 {warrantyLabel(detailItem, today)}
                    {detailItem.warranty_provider ? ` · ${detailItem.warranty_provider}` : ""}
                  </p>
                  {detailItem.warranty_reference && (
                    <p className="text-muted">Ref: {detailItem.warranty_reference}</p>
                  )}
                  {detailItem.warranty_notes && (
                    <p className="whitespace-pre-wrap text-muted">{detailItem.warranty_notes}</p>
                  )}
                  {detailItem.warranty_expires_on && (
                    <button
                      onClick={() =>
                        downloadWarrantyIcs({
                          itemId: detailItem.id,
                          itemName: detailItem.name,
                          expiresOn: detailItem.warranty_expires_on as string,
                          provider: detailItem.warranty_provider,
                          reference: detailItem.warranty_reference,
                          notes: detailItem.warranty_notes,
                        })
                      }
                      className="mt-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:border-brand"
                    >
                      📅 Add to calendar
                    </button>
                  )}
                </div>
              )}
              {(detailItem.species_slugs?.length ?? 0) > 0 && (
                <div className="pt-2 flex flex-wrap gap-1">
                  {detailItem.species_slugs!.map((slug) => (
                    <span key={slug} className="rounded-full bg-brand-light px-2 py-0.5 text-xs text-brand-dark">
                      {speciesName(slug)}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-3 text-sm border-t border-border pt-3">
              <button
                onClick={() => {
                  startEdit(detailItem);
                  setDetailItem(null);
                }}
                className="text-accent-dark hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  handleDelete(detailItem.id);
                  setDetailItem(null);
                }}
                className="text-danger hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
