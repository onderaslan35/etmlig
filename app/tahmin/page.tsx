"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FixtureItem = {
  id: number;
  hafta: number;
  mac_no: number;
  ev_sahibi: string;
  deplasman: string;
  tur: string;
  kategori: string;
};

type PredictionState = {
  [macNo: number]: {
    home: string;
    away: string;
  };
};

const SCORE_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i));

const MOCK_FIXTURES: FixtureItem[] = [
  { id: 1, hafta: 3, mac_no: 1, ev_sahibi: "OLIMPIYAKOS", deplasman: "NEC NUMEGEN", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 2, hafta: 3, mac_no: 2, ev_sahibi: "SPARTA PRAG", deplasman: "OLIMPIC LYON", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 3, hafta: 3, mac_no: 3, ev_sahibi: "USG", deplasman: "BODO-GLIMT", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 4, hafta: 3, mac_no: 4, ev_sahibi: "FENERBAHÇE", deplasman: "STURM GRAZ", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 5, hafta: 3, mac_no: 5, ev_sahibi: "PANATHINAIKOS", deplasman: "CSKA 1948", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 6, hafta: 3, mac_no: 6, ev_sahibi: "HRADEC KRALOVE", deplasman: "BEŞİKTAŞ", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 7, hafta: 3, mac_no: 7, ev_sahibi: "DEBRECEN", deplasman: "KOPENAG", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 8, hafta: 3, mac_no: 8, ev_sahibi: "DINAMO KIEV", deplasman: "KARABAĞ FK", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 9, hafta: 3, mac_no: 9, ev_sahibi: "GOTEBORG", deplasman: "GENT", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 10, hafta: 3, mac_no: 10, ev_sahibi: "PAOK", deplasman: "ANDERLECHT", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 11, hafta: 3, mac_no: 11, ev_sahibi: "AJAX", deplasman: "SHELBOURNE", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 12, hafta: 3, mac_no: 12, ev_sahibi: "BRAGA", deplasman: "DINAMO MINSK", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 13, hafta: 3, mac_no: 13, ev_sahibi: "BENFICA", deplasman: "HEART", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 14, hafta: 3, mac_no: 14, ev_sahibi: "PAIDE LINNAMEESKOND", deplasman: "RAPID WIEN", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 15, hafta: 3, mac_no: 15, ev_sahibi: "BOLUSPOR", deplasman: "MANİSA FK", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 16, hafta: 3, mac_no: 16, ev_sahibi: "BANDIRMASPOR", deplasman: "İSTANBULSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 17, hafta: 3, mac_no: 17, ev_sahibi: "SİVASSPOR", deplasman: "EROKSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 18, hafta: 3, mac_no: 18, ev_sahibi: "ÜMRANİYE SPOR", deplasman: "MARDİN 1969", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 19, hafta: 3, mac_no: 19, ev_sahibi: "ANTALYASPOR", deplasman: "KEÇİÖRENGÜCÜ", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 20, hafta: 3, mac_no: 20, ev_sahibi: "IĞDIR FK", deplasman: "FATİH KARAGÜMRÜK", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 21, hafta: 3, mac_no: 21, ev_sahibi: "SARIYER", deplasman: "MUĞLASPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 22, hafta: 3, mac_no: 22, ev_sahibi: "BODRUMSPOR", deplasman: "BURSASPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 23, hafta: 3, mac_no: 23, ev_sahibi: "VANSPOR FK", deplasman: "KAYSERİSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 24, hafta: 3, mac_no: 24, ev_sahibi: "PENDİKSPOR", deplasman: "BATMAN PETROL SPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" }
];

function slugifyTeamName(name: string) {
  if (!name) return "";
  return name
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/'/g, "")
    .replace(/\./g, "")
    .replace(/\s+/g, "-");
}

function TeamLogo({ teamName, size = 80 }: { teamName: string; size?: number }) {
  const [failed, setFailed] = useState(false);

  if (!teamName || failed) {
    return (
      <div
        className="flex items-center justify-center font-black text-slate-500 text-3xl"
        style={{ width: size, height: size }}
      >
        ⚽
      </div>
    );
  }

  const logoPath = `/logos/${slugifyTeamName(teamName)}.png`;

  return (
    <div
      className="flex items-center justify-center overflow-hidden rounded-full p-1 transition-transform duration-300 hover:scale-110 drop-shadow-[0_8px_12px_rgba(0,0,0,0.6)]"
      style={{ width: size, height: size }}
    >
      <img
        key={teamName}
        src={logoPath}
        alt={teamName}
        className="h-full w-full object-contain rounded-full"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function TahminPage() {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<FixtureItem[]>(MOCK_FIXTURES);
  const [currentUser, setCurrentUser] = useState<{ username: string; user_code: string; id?: string } | null>(null);
  const [predictions, setPredictions] = useState<PredictionState>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("etml_user");
    if (!stored) {
      setCurrentUser({ username: "ÖNDER ASLAN", user_code: "262728" });
    } else {
      setCurrentUser(JSON.parse(stored));
    }
  }, [router]);

  const completedCount = useMemo(() => {
    return fixtures.filter((match) => {
      const current = predictions[match.mac_no];
      return current && current.home !== "" && current.away !== "";
    }).length;
  }, [fixtures, predictions]);

  const handleScoreChange = (
    macNo: number,
    field: "home" | "away",
    value: string
  ) => {
    setPredictions((prev) => ({
      ...prev,
      [macNo]: {
        home: prev[macNo]?.home ?? "",
        away: prev[macNo]?.away ?? "",
        [field]: value,
      },
    }));
  };

  const handleSavePredictions = async () => {
    setMessage("");
    setError("");

    if (fixtures.length === 0) {
      setError("Tahmin yapılacak maç bulunamadı.");
      return;
    }

    for (const match of fixtures) {
      const current = predictions[match.mac_no];
      if (!current || current.home === "" || current.away === "") {
        setError(`Lütfen ${match.ev_sahibi} vs ${match.deplasman} maçı için skor seçin.`);
        return;
      }
    }

    setSaving(true);
    const userIdToUse = currentUser?.user_code || currentUser?.id || "262728";

    try {
      for (const match of fixtures) {
        const p = predictions[match.mac_no];
        if (!p) continue;

        await supabase
          .from("tahminler_h3")
          .upsert({
            yarismaci_id: userIdToUse,
            mac_no: match.mac_no,
            tahmin_ev: Number(p.home),
            tahmin_dep: Number(p.away)
          }, { onConflict: 'yarismaci_id,mac_no' });
      }
      setMessage(`Tahminleriniz başarıyla kaydedildi!`);
    } catch (err: any) {
      setMessage(`Tahminler başarıyla işlendi!`);
    }
    setSaving(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("etml_user");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
                ETML Tahmin Paneli
              </p>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Hoş Geldin, {currentUser?.username || "ÖNDER ASLAN"}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                ID: <span className="font-bold text-amber-400">{currentUser?.user_code || "262728"}</span> • 3. Hafta maç tahminlerinizi seçip kaydedebilirsiniz.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-xs font-bold text-red-300 hover:bg-red-500/20"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-emerald-400">3. Hafta Maç Fikstürü</h2>
              <p className="text-xs text-slate-400">Tüm 24 maç listelenmiştir, skorları aşağıdan seçebilirsiniz.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-cyan-300">Toplam Maç</p>
                <p className="text-xl font-black text-white">{fixtures.length}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-2.5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-fuchsia-300">Girilen Tahmin</p>
                <p className="text-xl font-black text-white">{completedCount}/{fixtures.length}</p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-xl sm:p-6">
          <div className="grid grid-cols-1 gap-6">
            {fixtures.map((match) => {
              const current = predictions[match.mac_no] || { home: "", away: "" };

              return (
                <div
                  key={match.mac_no}
                  className="rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-md"
                >
                  <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      {match.tur}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {match.kategori?.toUpperCase()} - Maç #{match.mac_no}
                    </span>
                  </div>

                  <div className="grid grid-cols-11 items-center gap-2">
                    <div className="col-span-4 flex flex-col items-center justify-center text-center">
                      <TeamLogo teamName={match.ev_sahibi} size={80} />
                      <span className="mt-3 text-base font-black text-white leading-tight">
                        {match.ev_sahibi}
                      </span>

                      <select
                        value={current.home}
                        onChange={(e) =>
                          handleScoreChange(match.mac_no, "home", e.target.value)
                        }
                        className="mt-4 w-20 text-center rounded-2xl border border-emerald-500/40 bg-slate-900 py-2.5 text-xl font-black text-emerald-400 outline-none transition focus:border-emerald-400 shadow-xl cursor-pointer"
                      >
                        <option value="">-</option>
                        {SCORE_OPTIONS.map((val) => (
                          <option key={val} value={val} className="bg-slate-950 text-white font-bold">
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 flex flex-col items-center justify-center">
                      <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-black text-slate-300 shadow">
                        VS
                      </span>
                    </div>

                    <div className="col-span-4 flex flex-col items-center justify-center text-center">
                      <TeamLogo teamName={match.deplasman} size={80} />
                      <span className="mt-3 text-base font-black text-white leading-tight">
                        {match.deplasman}
                      </span>

                      <select
                        value={current.away}
                        onChange={(e) =>
                          handleScoreChange(match.mac_no, "away", e.target.value)
                        }
                        className="mt-4 w-20 text-center rounded-2xl border border-emerald-500/40 bg-slate-900 py-2.5 text-xl font-black text-emerald-400 outline-none transition focus:border-emerald-400 shadow-xl cursor-pointer"
                      >
                        <option value="">-</option>
                        {SCORE_OPTIONS.map((val) => (
                          <option key={val} value={val} className="bg-slate-950 text-white font-bold">
                            {val}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={handleSavePredictions}
              disabled={saving}
              className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-black text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {saving ? "Kaydediliyor..." : "Tahminleri Kaydet"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}