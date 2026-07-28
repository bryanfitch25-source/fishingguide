import type { Regulation } from "@/types/content";
import { provinceLabel } from "./Badges";

export function RegulationsTable({ regulations }: { regulations: Regulation[] }) {
  if (!regulations.length) {
    return (
      <p className="text-sm text-muted">
        No structured regulation data available yet for this species — check the official
        DFO / provincial sources linked below before you fish.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {regulations.map((reg) => (
        <div key={reg.id} className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="font-bold text-brand-dark">{provinceLabel(reg.province)}</h4>
            {reg.last_verified && (
              <span className="text-xs text-muted">Verified {reg.last_verified}</span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {reg.water_type && (
              <div>
                <dt className="text-muted">Water type</dt>
                <dd>{reg.water_type}</dd>
              </div>
            )}
            {reg.season && (
              <div>
                <dt className="text-muted">Season</dt>
                <dd>{reg.season}</dd>
              </div>
            )}
            {reg.bag_limit && (
              <div>
                <dt className="text-muted">Bag / possession limit</dt>
                <dd>{reg.bag_limit}</dd>
              </div>
            )}
            {reg.size_limit && (
              <div>
                <dt className="text-muted">Size limit</dt>
                <dd>{reg.size_limit}</dd>
              </div>
            )}
          </dl>
          {reg.notes && <p className="mt-2 text-sm">{reg.notes}</p>}
          {reg.source_url && (
            <a
              href={reg.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-accent underline"
            >
              Official source ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
