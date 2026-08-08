import type { Regulation } from "@/types/content";
import { provinceLabel } from "./Badges";
import { SeasonStatus } from "./SeasonStatus";

const VERIFICATION: Record<string, { label: string; className: string; }> = {
  disputed: {
    label: "⚠ Needs confirming",
    className: "bg-danger-light text-danger",
  },
  unverified: {
    label: "Not independently checked",
    className: "bg-background text-muted",
  },
};

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
            <span className="flex shrink-0 items-center gap-2">
              {reg.verification_status && VERIFICATION[reg.verification_status] && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${VERIFICATION[reg.verification_status].className}`}
                >
                  {VERIFICATION[reg.verification_status].label}
                </span>
              )}
              {reg.last_verified && (
                <span className="text-xs text-muted">Verified {reg.last_verified}</span>
              )}
            </span>
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
                <dd>
                  {reg.season}
                  <SeasonStatus season={reg.season} />
                </dd>
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
          {reg.verification_note && (
            <p className="mt-2 rounded-lg bg-danger-light px-3 py-2 text-sm text-danger">
              {reg.verification_note}
            </p>
          )}
          {reg.notes && <p className="mt-2 text-sm">{reg.notes}</p>}
          {reg.source_url && (
            <a
              href={reg.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-accent-dark underline"
            >
              Official source ↗
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
