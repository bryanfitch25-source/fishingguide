"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Catch } from "@/types/tackle";

type SupabaseBrowserClient = ReturnType<typeof createClient>;

interface SpeciesOption {
  slug: string;
  common_name: string;
}

interface TackleOption {
  id: string;
  name: string;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

async function fetchAll(
  supabase: SupabaseBrowserClient
): Promise<{ catches: Catch[]; tackle: TackleOption[]; error: string | null }> {
  const [catchesRes, tackleRes] = await Promise.all([
    supabase.from("catches").select("*").order("catch_date", { ascending: false }),
    supabase.from("tackle_items").select("id, name").order("name"),
  ]);
  return {
    catches: catchesRes.error ? [] : (catchesRes.data as unknown as Catch[]),
    tackle: (tackleRes.data as TackleOption[]) ?? [],
    error: catchesRes.error?.message ?? null,
  };
}

const emptyForm = {
  id: null as string | null,
  species_slug: "",
  catch_date: today(),
  location: "",
  tackle_item_id: "",
  length_desc: "",
  weight_desc: "",
  kept: false,
  notes: "",
  photo_url: "",
};

export function CatchLogClient({ species }: { species: SpeciesOption[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [tackle, setTackle] = useState<TackleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAll() {
    setLoading(true);
    const result = await fetchAll(supabase);
    if (result.error) setError(result.error);
    setCatches(result.catches);
    setTackle(result.tackle);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await fetchAll(supabase);
      if (cancelled) return;
      if (result.error) setError(result.error);
      setCatches(result.catches);
      setTackle(result.tackle);
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

  function startEdit(c: Catch) {
    setForm({
      id: c.id,
      species_slug: c.species_slug ?? "",
      catch_date: c.catch_date,
      location: c.location ?? "",
      tackle_item_id: c.tackle_item_id ?? "",
      length_desc: c.length_desc ?? "",
      weight_desc: c.weight_desc ?? "",
      kept: c.kept,
      notes: c.notes ?? "",
      photo_url: c.photo_url ?? "",
    });
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this catch?")) return;
    const { error } = await supabase.from("catches").delete().eq("id", id);
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
      species_slug: form.species_slug || null,
      catch_date: form.catch_date,
      location: form.location.trim() || null,
      tackle_item_id: form.tackle_item_id || null,
      length_desc: form.length_desc.trim() || null,
      weight_desc: form.weight_desc.trim() || null,
      kept: form.kept,
      notes: form.notes.trim() || null,
      photo_url: form.photo_url.trim() || null,
    };

    const query = form.id
      ? supabase.from("catches").update(payload).eq("id", form.id)
      : supabase.from("catches").insert(payload);

    const { error } = await query;
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setShowForm(false);
    loadAll();
  }

  const speciesName = (slug: string | null) =>
    slug ? species.find((s) => s.slug === slug)?.common_name ?? slug : null;
  const tackleName = (id: string | null) => (id ? tackle.find((t) => t.id === id)?.name ?? null : null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">
          {catches.length} catch{catches.length === 1 ? "" : "es"} logged
        </p>
        <button
          onClick={startAdd}
          className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition"
        >
          + Log a Catch
        </button>
      </div>

      {error && <p className="text-sm text-red-700 bg-red-50 rounded px-3 py-2 mb-4">{error}</p>}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl border border-border bg-surface p-5 space-y-4"
        >
          <h2 className="font-bold text-brand-dark">{form.id ? "Edit Catch" : "New Catch"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Species</label>
              <select
                value={form.species_slug}
                onChange={(e) => setForm({ ...form, species_slug: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— Not sure / other —</option>
                {species.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.common_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.catch_date}
                onChange={(e) => setForm({ ...form, catch_date: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Pointe-du-Chêne Wharf"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tackle used</label>
              <select
                value={form.tackle_item_id}
                onChange={(e) => setForm({ ...form, tackle_item_id: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="">— None / not sure —</option>
                {tackle.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Length</label>
              <input
                value={form.length_desc}
                onChange={(e) => setForm({ ...form, length_desc: e.target.value })}
                placeholder="e.g. 18 in"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Weight</label>
              <input
                value={form.weight_desc}
                onChange={(e) => setForm({ ...form, weight_desc: e.target.value })}
                placeholder="e.g. 2.5 lb"
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
            <div className="flex items-center gap-2 pt-6">
              <input
                id="kept"
                type="checkbox"
                checked={form.kept}
                onChange={(e) => setForm({ ...form, kept: e.target.checked })}
              />
              <label htmlFor="kept" className="text-sm font-medium">
                Kept (unchecked = released)
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              placeholder="Conditions, tide, what worked…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand text-white font-semibold px-4 py-2 text-sm hover:bg-brand-dark transition disabled:opacity-60"
            >
              {saving ? "Saving…" : form.id ? "Save Changes" : "Log Catch"}
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
      ) : catches.length === 0 ? (
        <p className="text-muted text-sm">No catches logged yet — add your first one above.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-brand-light">
              <tr>
                <th className="text-left px-3 py-2">Date</th>
                <th className="text-left px-3 py-2">Species</th>
                <th className="text-left px-3 py-2">Location</th>
                <th className="text-left px-3 py-2">Size</th>
                <th className="text-left px-3 py-2">Tackle</th>
                <th className="text-left px-3 py-2">Kept?</th>
                <th className="text-left px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {catches.map((c) => (
                <tr key={c.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 whitespace-nowrap">{c.catch_date}</td>
                  <td className="px-3 py-2">{speciesName(c.species_slug) ?? "—"}</td>
                  <td className="px-3 py-2">{c.location ?? "—"}</td>
                  <td className="px-3 py-2">
                    {[c.length_desc, c.weight_desc].filter(Boolean).join(" / ") || "—"}
                  </td>
                  <td className="px-3 py-2">{tackleName(c.tackle_item_id) ?? "—"}</td>
                  <td className="px-3 py-2">{c.kept ? "Kept" : "Released"}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button onClick={() => startEdit(c)} className="text-accent hover:underline mr-3">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
