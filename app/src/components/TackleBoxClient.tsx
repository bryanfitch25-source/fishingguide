"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { TACKLE_CATEGORIES, type TackleCategory, type TackleItem } from "@/types/tackle";

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

interface SpeciesOption {
  slug: string;
  common_name: string;
}

const emptyForm = {
  id: null as string | null,
  name: "",
  category: "lure" as TackleCategory,
  brand: "",
  model: "",
  color_size: "",
  quantity: "1",
  storage_location: "",
  notes: "",
  photo_url: "",
  species_slugs: [] as string[],
};

export function TackleBoxClient({ species }: { species: SpeciesOption[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<TackleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<TackleCategory | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadItems() {
    setLoading(true);
    const result = await fetchItems(supabase);
    if (result.error) setError(result.error);
    else setItems(result.items);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchItems(supabase);
      if (cancelled) return;
      if (result.error) setError(result.error);
      else setItems(result.items);
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
    else loadItems();
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
    loadItems();
  }

  function toggleSpecies(slug: string) {
    setForm((f) => ({
      ...f,
      species_slugs: f.species_slugs.includes(slug)
        ? f.species_slugs.filter((s) => s !== slug)
        : [...f.species_slugs, slug],
    }));
  }

  const filtered = items.filter((i) => categoryFilter === "all" || i.category === categoryFilter);
  const speciesName = (slug: string) => species.find((s) => s.slug === slug)?.common_name ?? slug;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
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
              <label className="block text-sm font-medium mb-1">Storage Location</label>
              <input
                value={form.storage_location}
                onChange={(e) => setForm({ ...form, storage_location: e.target.value })}
                placeholder="e.g. Tackle bag, top tray"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Photo URL</label>
              <input
                value={form.photo_url}
                onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
                placeholder="https://…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
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
            : "Nothing in this category."}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-brand-dark">{item.name}</h3>
                <span className="shrink-0 rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
                  ×{item.quantity}
                </span>
              </div>
              <p className="text-xs text-muted mb-2 capitalize">
                {TACKLE_CATEGORIES.find((c) => c.value === item.category)?.label}
                {item.brand ? ` · ${item.brand}` : ""}
                {item.model ? ` ${item.model}` : ""}
              </p>
              {item.color_size && <p className="text-sm">{item.color_size}</p>}
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
                <button onClick={() => startEdit(item)} className="text-accent hover:underline">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:underline">
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
