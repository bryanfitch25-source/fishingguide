"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import {
  TACKLE_CATEGORIES,
  TRAY_BRANDS,
  TRAY_SIZE_CLASSES,
  type TackleCategory,
  type TackleItem,
  type TackleTray,
  type TraySizeClass,
} from "@/types/tackle";
import { PhotoUploadField } from "./PhotoUploadField";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

async function fetchItems(
  supabase: SupabaseBrowserClient
): Promise<{ items: TackleItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("tackle_items")
    .select("*, tackle_item_species(species_slug)")
    .order("created_at", { ascending: false });

  if (error) return { items: [], error: error.message };

  return {
    items: (data ?? []).map((row) => ({
      ...(row as unknown as TackleItem),
      species_slugs: (
        (row as { tackle_item_species?: { species_slug: string }[] }).tackle_item_species ?? []
      ).map((r) => r.species_slug),
    })),
    error: null,
  };
}

async function fetchTrays(supabase: SupabaseBrowserClient): Promise<TackleTray[]> {
  const { data } = await supabase.from("tackle_trays").select("*").order("position").order("name");
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
  species_slugs: [] as string[],
};

const emptyTrayForm = {
  name: "",
  brand: "",
  size_class: "" as TraySizeClass | "",
};

export function TackleBoxClient({ species }: { species: SpeciesOption[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TackleItem[]>([]);
  const [trays, setTrays] = useState<TackleTray[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TackleCategory | "all">("all");
  const [trayFilter, setTrayFilter] = useState<string | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [showTrays, setShowTrays] = useState(false);
  const [trayError, setTrayError] = useState<string | null>(null);
  const [editingTrayId, setEditingTrayId] = useState<string | null>(null);
  const [trayForm, setTrayForm] = useState(emptyTrayForm);

  async function loadAll() {
    setLoading(true);
    const [itemsResult, traysResult] = await Promise.all([fetchItems(supabase), fetchTrays(supabase)]);
    if (itemsResult.error) setError(itemsResult.error);
    else setItems(itemsResult.items);
    setTrays(traysResult);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [itemsResult, traysResult] = await Promise.all([fetchItems(supabase), fetchTrays(supabase)]);
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
    setForm(emptyForm);
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
      species_slugs: item.species_slugs ?? [],
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this tackle item?")) return;
    const { error } = await supabase.from("tackle_items").delete().eq("id", id);
    if (error) setError(error.message);
    else loadAll();
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

    const payload = {
      user_id: user.id,
      name: form.name.trim(),
      category: form.category,
      brand: form.brand.trim() || null,
      model: form.model.trim() || null,
      color_size: form.color_size.trim() || null,
      quantity: Math.max(0, parseInt(form.quantity, 10) || 0),
      tray_id: form.tray_id === NO_TRAY ? null : form.tray_id,
      storage_location: form.storage_location.trim() || null,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
    };

    let itemId = form.id;
    if (itemId) {
      const { error } = await supabase.from("tackle_items").update(payload).eq("id", itemId);
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase.from("tackle_items").insert(payload).select("id").single();
      if (error) {
        setError(error.message);
        setSaving(false);
        return;
      }
      itemId = data.id;
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
      user_id: user.id,
      name,
      brand: trayForm.brand || null,
      size_class: trayForm.size_class || null,
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
      .update({ name, brand: trayForm.brand || null, size_class: trayForm.size_class || null })
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

  const filtered = items.filter((i) => {
    if (categoryFilter !== "all" && i.category !== categoryFilter) return false;
    if (trayFilter === "all") return true;
    if (trayFilter === NO_TRAY) return !i.tray_id;
    return i.tray_id === trayFilter;
  });
  const speciesName = (slug: string) => species.find((s) => s.slug === slug)?.common_name ?? slug;
  const trayName = (id: string | null) => (id ? trays.find((t) => t.id === id)?.name ?? null : null);
  const untrayedCount = items.filter((i) => !i.tray_id).length;

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
      <div className="mb-6 rounded-xl border border-border bg-surface p-4">
        <button
          onClick={() => setShowTrays((v) => !v)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="font-bold text-tackle">🗂️ Trays ({trays.length})</span>
          <span className="text-muted text-sm">{showTrays ? "Hide" : "Manage"}</span>
        </button>
        {showTrays && (
          <div className="mt-4 space-y-3">
            {trayError && <p className="text-sm text-danger bg-red-50 rounded px-3 py-2">{trayError}</p>}
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 pt-2 border-t border-border"
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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`rounded-full px-3 py-1.5 text-sm font-medium border transition ${
              categoryFilter === "all" ? "bg-brand text-white border-brand" : "border-border hover:border-brand"
            }`}
          >
            All ({items.length})
          </button>
          {TACKLE_CATEGORIES.map((c) => {
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
        </div>
        <button
          onClick={startAdd}
          className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
        >
          + Add Item
        </button>
      </div>

      {trays.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
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

      {error && <p className="text-sm text-red-700 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-surface p-5 space-y-4"
        >
          <h2 className="font-bold text-brand-dark">{form.id ? "Edit Item" : "New Item"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Bucktail jig"
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
                {TACKLE_CATEGORIES.map((c) => (
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
              <label className="block text-sm font-medium mb-1">Color / Size</label>
              <input
                value={form.color_size}
                onChange={(e) => setForm({ ...form, color_size: e.target.value })}
                placeholder="e.g. 1/2 oz, chartreuse"
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
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
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

      {loading ? (
        <p className="text-muted text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-muted text-sm">
          {items.length === 0
            ? "No tackle yet — add your first item above."
            : "Nothing matches these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3 mb-1">
                {item.photo_url && (
                  // eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo
                  <img
                    src={item.photo_url}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg object-cover border border-border"
                  />
                )}
                <div className="flex-1 flex items-start justify-between gap-2">
                  <h3 className="font-bold text-brand-dark">{item.name}</h3>
                  <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                    ×{item.quantity}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted mb-2 capitalize">
                {TACKLE_CATEGORIES.find((c) => c.value === item.category)?.label}
                {item.brand ? ` · ${item.brand}` : ""}
                {item.model ? ` ${item.model}` : ""}
              </p>
              {item.color_size && <p className="text-sm">{item.color_size}</p>}
              {trayName(item.tray_id) && (
                <p className="text-sm text-tackle mt-1">🗂️ {trayName(item.tray_id)}</p>
              )}
              {item.storage_location && (
                <p className="text-sm text-muted mt-1">📍 {item.storage_location}</p>
              )}
              {item.notes && <p className="text-sm mt-1">{item.notes}</p>}
              {(item.species_slugs?.length ?? 0) > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.species_slugs!.map((slug) => (
                    <span
                      key={slug}
                      className="rounded-full bg-blue-100 text-blue-900 px-2 py-0.5 text-xs"
                    >
                      {speciesName(slug)}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-3 flex gap-3 text-sm">
                <button onClick={() => startEdit(item)} className="text-accent-dark hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-danger hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
