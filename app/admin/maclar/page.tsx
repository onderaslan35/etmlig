"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminMaclarPage() {
  const [selectedWeek, setSelectedWeek] = useState<string>("3");
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, [selectedWeek]);

  const fetchMatches = async () => {
    setLoading(true);
    const tableName = `matches_h${selectedWeek}`;
    const { data } = await supabase.from(tableName).select("*").order("mac_no");
    setMatches(data || []);
    setLoading(false);
  };

  const handleScoreChange = async (macNo: number, skorEv: string, skorDep: string, isTff: boolean) => {
    const tableName = `matches_h${selectedWeek}`;
    const katName = isTff ? "TFF" : "DFO";
    
    await supabase.from(tableName).upsert({
      mac_no: macNo,
      skor_ev: skorEv !== "" ? Number(skorEv) : null,
      skor_dep: skorDep !== "" ? Number(skorDep) : null,
      oynandi: skorEv !== "" && skorDep !== "",
      kategori: katName
    });

    fetchMatches();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              ADMIN YÖNETİM PANELİ
            </p>
            <h1 className="text-3xl font-black text-white">Maç Skorları ve Kategori Yönetimi</h1>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-xl">
            <span className="text-xs text-slate-400 font-bold pl-2">HAFTA:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="bg-slate-950 text-amber-400 font-bold text-xs px-3 py-1.5 rounded-lg border border-white/20 outline-none cursor-pointer"
            >
              <option value="1">1. Hafta (DFO)</option>
              <option value="2">2. Hafta (DFO)</option>
              <option value="3">3. Hafta (TFF 1. LİG & DFO)</option>
            </select>
          </div>
        </div>

        {/* MAÇ LİSTESİ */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-slate-400 font-bold">Maçlar Yükleniyor...</div>
          ) : (
            matches.map((m) => {
              // KURAL: 3. haftada maç no > 14 ise TFF 1. LİG, değilse DFO
              const isTff = m.kategori === "TFF" || m.kategori === "TFFO" || (selectedWeek === "3" && m.mac_no > 14);

              return (
                <div
                  key={m.mac_no}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
                    isTff
                      ? "bg-red-950/20 border-red-500/40 hover:border-red-500"
                      : "bg-blue-950/20 border-blue-500/40 hover:border-blue-500"
                  }`}
                >
                  {/* LİG VE KATEGORİ ROZETİ */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span
                      className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                        isTff
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                          : "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      }`}
                    >
                      {isTff ? "🇹🇷 TFFO" : "🌍 DFO"}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Maç #{m.mac_no} - {m.lig_adi || (isTff ? "TFF 1. Lig" : "Dünya Ligi")}
                    </span>
                  </div>

                  {/* TAKIMLAR VE SKOR GİRİŞİ */}
                  <div className="flex items-center gap-3 font-bold text-sm">
                    <span className="text-right w-36 truncate text-slate-200">{m.ev_sahibi}</span>
                    
                    <input
                      type="number"
                      defaultValue={m.skor_ev ?? ""}
                      onBlur={(e) => handleScoreChange(m.mac_no, e.target.value, String(m.skor_dep ?? ""), isTff)}
                      className={`w-12 h-10 text-center font-black text-base rounded-xl border bg-slate-950 outline-none ${
                        isTff ? "border-red-500/50 text-red-400 focus:border-red-500" : "border-blue-500/50 text-blue-400 focus:border-blue-500"
                      }`}
                    />

                    <span className="text-slate-500 font-black">-</span>

                    <input
                      type="number"
                      defaultValue={m.skor_dep ?? ""}
                      onBlur={(e) => handleScoreChange(m.mac_no, String(m.skor_ev ?? ""), e.target.value, isTff)}
                      className={`w-12 h-10 text-center font-black text-base rounded-xl border bg-slate-950 outline-none ${
                        isTff ? "border-red-500/50 text-red-400 focus:border-red-500" : "border-blue-500/50 text-blue-400 focus:border-blue-500"
                      }`}
                    />

                    <span className="text-left w-36 truncate text-slate-200">{m.deplasman}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}