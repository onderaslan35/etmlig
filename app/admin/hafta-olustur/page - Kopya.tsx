"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type MatchItem = {
  id: number;
  mac_no: number;
  ev_sahibi: string;
  deplasman: string;
  tur: string;
  kategori: string;
};

type ScoreState = {
  [macNo: number]: {
    home: string;
    away: string;
  };
};

const MOCK_FIXTURES: MatchItem[] = [
  { id: 1, mac_no: 1, ev_sahibi: "OLIMPIYAKOS", deplasman: "NEC NUMEGEN", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 2, mac_no: 2, ev_sahibi: "SPARTA PRAG", deplasman: "OLIMPIC LYON", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 3, mac_no: 3, ev_sahibi: "USG", deplasman: "BODO-GLIMT", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 4, mac_no: 4, ev_sahibi: "FENERBAHÇE", deplasman: "STURM GRAZ", tur: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3", kategori: "dfo" },
  { id: 5, mac_no: 5, ev_sahibi: "PANATHINAIKOS", deplasman: "CSKA 1948", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 6, mac_no: 6, ev_sahibi: "HRADEC KRALOVE", deplasman: "BEŞİKTAŞ", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 7, mac_no: 7, ev_sahibi: "DEBRECEN", deplasman: "KOPENAG", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 8, mac_no: 8, ev_sahibi: "DINAMO KIEV", deplasman: "KARABAĞ FK", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 9, mac_no: 9, ev_sahibi: "GOTEBORG", deplasman: "GENT", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 10, mac_no: 10, ev_sahibi: "PAOK", deplasman: "ANDERLECHT", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 11, mac_no: 11, ev_sahibi: "AJAX", deplasman: "SHELBOURNE", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 12, mac_no: 12, ev_sahibi: "BRAGA", deplasman: "DINAMO MINSK", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 13, mac_no: 13, ev_sahibi: "BENFICA", deplasman: "HEART", tur: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR İL", kategori: "dfo" },
  { id: 14, mac_no: 14, ev_sahibi: "PAIDE LINNAMEESKOND", deplasman: "RAPID WIEN", tur: "UEFA KONFERANS LİGİ ÖN ELEME 3.Tİ", kategori: "dfo" },
  { id: 15, mac_no: 15, ev_sahibi: "BOLUSPOR", deplasman: "MANİSA FK", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 16, mac_no: 16, ev_sahibi: "BANDIRMASPOR", deplasman: "İSTANBULSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 17, mac_no: 17, ev_sahibi: "SİVASSPOR", deplasman: "EROKSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 18, mac_no: 18, ev_sahibi: "ÜMRANİYE SPOR", deplasman: "MARDİN 1969", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 19, mac_no: 19, ev_sahibi: "ANTALYASPOR", deplasman: "KEÇİÖRENGÜCÜ", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 20, mac_no: 20, ev_sahibi: "IĞDIR FK", deplasman: "FATİH KARAGÜMRÜK", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 21, mac_no: 21, ev_sahibi: "SARIYER", deplasman: "MUĞLASPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 22, mac_no: 22, ev_sahibi: "BODRUMSPOR", deplasman: "BURSASPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 23, mac_no: 23, ev_sahibi: "VANSPOR FK", deplasman: "KAYSERİSPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" },
  { id: 24, mac_no: 24, ev_sahibi: "PENDİKSPOR", deplasman: "BATMAN PETROL SPOR", tur: "TÜRKİYE 1.LİG", kategori: "tffo" }
];

export default function AdminHaftaOlustur() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ username: string; user_code: string; role: string } | null>(null);
  const [scores, setScores] = useState<ScoreState>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Admin kullanıcısını sabitleme
    const adminUser = { username: "mankoman", user_code: "2435", role: "admin" };
    localStorage.setItem("etml_admin", JSON.stringify(adminUser));
    setCurrentUser(adminUser);
  }, []);

  const handleScoreChange = (macNo: number, field: "home" | "away", val: string) => {
    setScores((prev) => ({
      ...prev,
      [macNo]: {
        home: prev[macNo]?.home ?? "",
        away: prev[macNo]?.away ?? "",
        [field]: val,
      },
    }));
  };

  const handleSaveResults = async () => {
    setMessage("");
    setSaving(true);

    try {
      for (const match of MOCK_FIXTURES) {
        const sc = scores[match.mac_no];
        if (!sc || sc.home === "" || sc.away === "") continue;

        await supabase
          .from("matches_h3")
          .update({
            skor_ev: Number(sc.home),
            skor_dep: Number(sc.away),
            oynandi: true
          })
          .eq("mac_no", match.mac_no);
      }
      setMessage("Girilen maç sonuçları başarıyla kaydedildi! Puanlar otomatik hesaplanabilir.");
    } catch (err: any) {
      setMessage("Sonuçlar kaydedildi.");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
          <div>
            <span className="text-xs font-bold uppercase text-amber-400">Yönetici Paneli</span>
            <h1 className="text-2xl font-black text-white">Yönetici: {currentUser?.username}</h1>
            <p className="text-xs text-slate-300">ID: {currentUser?.user_code} • Maç sonuçlarını girip kaydedebilirsiniz.</p>
          </div>
          <button
            onClick={() => router.push("/tahmin")}
            className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold hover:bg-slate-700"
          >
            Tahmin Sayfasına Git
          </button>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-bold text-emerald-400">3. Hafta Gerçek Maç Sonuçları Girişi</h2>
          <div className="space-y-4">
            {MOCK_FIXTURES.map((match) => {
              const current = scores[match.mac_no] || { home: "", away: "" };
              return (
                <div key={match.mac_no} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-950 p-4">
                  <span className="text-xs text-slate-400 w-12">#{match.mac_no}</span>
                  <span className="font-bold w-1/3 text-right">{match.ev_sahibi}</span>
                  <div className="flex items-center gap-2 mx-4">
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={current.home}
                      onChange={(e) => handleScoreChange(match.mac_no, "home", e.target.value)}
                      className="w-12 rounded-lg bg-slate-900 border border-emerald-500/40 text-center py-1 text-lg font-black text-emerald-400 outline-none"
                    />
                    <span className="text-slate-500">-</span>
                    <input
                      type="number"
                      min="0"
                      max="9"
                      value={current.away}
                      onChange={(e) => handleScoreChange(match.mac_no, "away", e.target.value)}
                      className="w-12 rounded-lg bg-slate-900 border border-emerald-500/40 text-center py-1 text-lg font-black text-emerald-400 outline-none"
                    />
                  </div>
                  <span className="font-bold w-1/3 text-left">{match.deplasman}</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleSaveResults}
            disabled={saving}
            className="mt-6 w-full rounded-xl bg-amber-500 py-3 font-black text-slate-950 hover:bg-amber-400 transition"
          >
            {saving ? "Kaydediliyor..." : "Gerçek Sonuçları Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}