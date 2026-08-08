type MatchItem = {
  id: number;
  hafta: number;
  lig: string;
  evsahibi: string;
  deplasman: string;
  mactarihi: string;
  durum: string;
  macno: number | null;
  evskor: number | null;
  depskor: number | null;
};

type Props = {
  match: MatchItem;
  homeScore: string;
  awayScore: string;
  saving: boolean;
  onScoreChange: (
    matchId: number,
    field: "home" | "away",
    value: string
  ) => void;
  onSave: (match: MatchItem) => void;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function MatchResultCard({
  match,
  homeScore,
  awayScore,
  saving,
  onScoreChange,
  onSave,
}: Props) {
  return (
    <article className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-400">
            {match.hafta}. Hafta · Maç {match.macno ?? "-"} · {match.lig}
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            {match.evsahibi} - {match.deplasman}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {formatDate(match.mactarihi)}
          </p>
        </div>

        <span
          className={`rounded-full border px-3 py-1 text-xs font-bold ${
            match.durum === "Tamamlandı"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {match.durum || "Bekliyor"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            {match.evsahibi}
          </label>

          <input
            type="number"
            min="0"
            value={homeScore}
            onChange={(event) =>
              onScoreChange(match.id, "home", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-xl font-black text-white outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-end justify-center">
          <div className="rounded-full bg-white/10 px-4 py-3 font-black">
            -
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold text-slate-300">
            {match.deplasman}
          </label>

          <input
            type="number"
            min="0"
            value={awayScore}
            onChange={(event) =>
              onScoreChange(match.id, "away", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-center text-xl font-black text-white outline-none focus:border-amber-400"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSave(match)}
        disabled={saving}
        className="mt-5 w-full rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
      >
        {saving ? "Kaydediliyor..." : "Sonucu Kaydet"}
      </button>
    </article>
  );
}

export type { MatchItem };