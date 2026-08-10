'use client';

import React, { useState, useEffect } from 'react';

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262723": "AYHAN LUŞOĞLU",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

export default function TahminlerPage() {
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedUserId, setSelectedUserId] = useState<string>("262728"); // ÖNDER ASLAN
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const matchesRes = await fetch(`/data/week${selectedWeek}_matches.json?v=${Date.now()}`);
        if (matchesRes.ok) {
          const mData = await matchesRes.json();
          setMatches(Array.isArray(mData) ? mData : []);
        } else {
          setMatches([]);
        }

        const predRes = await fetch(`/data/week${selectedWeek}_predictions.json?v=${Date.now()}`);
        if (predRes.ok) {
          const pData = await predRes.json();
          setPredictions(pData);
        } else {
          setPredictions(null);
        }
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setMatches([]);
        setPredictions(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [selectedWeek]);

  // AKILLI FORMAT AYRIŞTIRICI (Dizi veya Nesne desteği)
  let userPredMap: Record<string, string> = {};
  if (predictions) {
    if (Array.isArray(predictions)) {
      const found = predictions.find((p: any) => String(p.id) === String(selectedUserId));
      if (found && found.predictions) {
        userPredMap = found.predictions;
      }
    } else if (typeof predictions === 'object') {
      userPredMap = predictions[selectedUserId] || {};
    }
  }

  const selectedUserName = allPlayersList[selectedUserId] || "YARIŞMACI SEÇİLMEDİ";

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100 font-sans">
      <div className="w-full bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between shadow-2xl gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-amber-400 uppercase tracking-wider">
            Katılımcı Tahminleri
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">
            {selectedWeek}. Hafta maç bülteni ve oyuncu tahmin matrisi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-amber-400/80 uppercase tracking-wider">
              HAFTA SEÇİN
            </label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold py-2.5 px-3 rounded-xl outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={1}>1. HAFTA</option>
              <option value={2}>2. HAFTA</option>
              <option value={3}>3. HAFTA</option>
              <option value={4}>4. HAFTA</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[10px] font-black text-amber-400/80 uppercase tracking-wider">
              YARIŞMACI SEÇİN
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-amber-400 text-xs font-bold py-2.5 px-3 rounded-xl outline-none focus:border-amber-400 cursor-pointer max-w-[220px] truncate"
            >
              {Object.entries(allPlayersList).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl p-6 shadow-2xl">
        <h2 className="text-lg font-extrabold text-amber-400 uppercase tracking-wide border-b border-slate-800/80 pb-4 mb-4 flex items-center justify-between">
          <span>{selectedUserName} - MAÇ TAHMİNLERİ</span>
          <span className="text-xs text-slate-400 font-bold bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            {selectedWeek}. HAFTA
          </span>
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400 font-bold text-sm">
            ⏳ Tahminler yükleniyor...
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((m: any, idx: number) => {
              const matchIdStr = String(m.id);
              const userTahmin = userPredMap[matchIdStr] || userPredMap[m.id] || "-";

              return (
                <div
                  key={m.id || idx}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 hover:border-slate-700/80 transition-colors"
                >
                  <div className="flex flex-col gap-1 w-full sm:w-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Maç #{idx + 1} • {m.league} • {m.dateLabel || m.date || ''} {m.time ? `| ${m.time}` : ''}
                    </span>
                    <div className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                      <span>{m.home}</span>
                      <span className="text-amber-500 font-black text-xs">VS</span>
                      <span>{m.away}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl self-end sm:self-center shadow-inner">
                    <span className="text-xs font-bold text-slate-400">Tahmin:</span>
                    <span className="text-sm font-black text-amber-400 tracking-wider">
                      {userTahmin}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 font-bold text-sm">
            ⚠️ {selectedWeek}. Haftaya ait maç bülteni henüz bulunamadı (`public/data/week{selectedWeek}_matches.json` boş veya eksik).
          </div>
        )}
      </div>
    </div>
  );
}