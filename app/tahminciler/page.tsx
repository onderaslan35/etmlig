'use client';

import React, { useState, useEffect } from 'react';

const defaultUsers = [
  { id: "262740", name: "ABDULLAH DİK", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262705", name: "AHMET BİRCAN", master: 0, dfo: 0, tff: 0, trophies: "🏆" },
  { id: "351925", name: "ALİOS GÖZTEPE", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262723", name: "AYHAN LUŞOĞLU", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262708", name: "BAYRAM YILMAZ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262718", name: "BEKİR KARADAĞ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262716", name: "BİROL DEMİREL", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262749", name: "B.VEYSELOĞLU EROL", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262703", name: "CEMALETTİN BELLİ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262772", name: "CEMAL SİVRİKAYA", master: 0, dfo: 0, tff: 0, trophies: "🏆" },
  { id: "262790", name: "CUMALİ SÖKER", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262755", name: "DOĞAÇ ALKAN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262756", name: "EYÜP KARACAOĞLU", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262731", name: "FATİH AYAN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262706", name: "GAZİ AYAN", master: 0, dfo: 0, tff: 0, trophies: "🏆🏆" },
  { id: "262707", name: "HAKAN AYAN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262726", name: "HUDAVER TOPARDIC", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262725", name: "İLYAS KAZDAL", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262744", name: "İLYAS UYGUN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262714", name: "İSMAİL EKER", master: 0, dfo: 0, tff: 0, trophies: "🏆" },
  { id: "262813", name: "KEMAL ERSOY", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262734", name: "LEVENT YILDIRIM", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262750", name: "MAHMUT CBR", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262736", name: "MEHMET ALİ KARA", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262758", name: "MELİH PINAR", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262738", name: "MEVLÜT EVLER", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262733", name: "MUHSİN ASİLKAN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262717", name: "MURAT ALİ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262712", name: "MURAT AYDEMİR", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262702", name: "MURAT KARA", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262763", name: "MUSTAFA ELMAS", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262787", name: "MUSTAFA TUCİ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262754", name: "OSMAN ALİ AYDIN", master: 0, dfo: 0, tff: 0, trophies: "🏆" },
  { id: "262770", name: "OZKAYA MAZAKALI BAYRAM", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262728", name: "ÖNDER ASLAN", master: 0, dfo: 0, tff: 0, trophies: "👑" },
  { id: "262730", name: "ÖNDER IŞIK", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262711", name: "RIDVAN DOGER", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262732", name: "R. İLHAN KARACA", master: 0, dfo: 0, tff: 0, trophies: "🏆🏆" },
  { id: "262709", name: "SALİH KARACAOĞLU", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262816", name: "SEDAT SEDAT", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262786", name: "SEDAT DİŞLİ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262737", name: "ŞAHİN GEZGİNCİ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262715", name: "ŞEMSETTİN DÜGER", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262774", name: "ŞENOL CAN ÇAKICI", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262771", name: "ULAŞ ADIGÜZEL", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262739", name: "UĞUR GÜRBÜZ", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262719", name: "UĞUR VARDAR", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262704", name: "YAPAY ZEKA", master: 0, dfo: 0, tff: 0, trophies: "🤖" },
  { id: "262782", name: "YUSUF ERBAY", master: 0, dfo: 0, tff: 0, trophies: "" },
  { id: "262753", name: "YUSUF KIZILTUĞ", master: 0, dfo: 0, tff: 0, trophies: "" }
];

export default function TahmincilerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(defaultUsers.find(u => u.id === "262728") || defaultUsers[0]);
  const [exactScores, setExactScores] = useState<Record<string, number>>({});

  useEffect(() => {
    // Admin panelinden kaydedilen haftalık tam skor verilerini çek
    const savedWeekly = localStorage.getItem('skorWeeklyData');
    if (savedWeekly) {
      try {
        const weeklyData = JSON.parse(savedWeekly);
        const scoreTotals: Record<string, number> = {};

        Object.keys(weeklyData).forEach((weekKey) => {
          const weekObj = weeklyData[weekKey];
          Object.keys(weekObj).forEach((userId) => {
            scoreTotals[userId] = (scoreTotals[userId] || 0) + (weekObj[userId] || 0);
          });
        });
        setExactScores(scoreTotals);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Arama filtresi
  const filteredUsers = defaultUsers.filter(u =>
    u.name.toLocaleLowerCase('tr-TR').includes(searchQuery.toLocaleLowerCase('tr-TR'))
  );

  return (
    <div className="max-w-6xl mx-auto p-4 text-slate-100 font-sans">
      {/* BAŞLIK */}
      <div className="text-center mb-6">
        <h1 className="text-xl md:text-2xl font-extrabold text-amber-400 uppercase tracking-wider">
          👥 TAHMİNCİ PROFİLLERİ VE İSTATİSTİKLERİ
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Yarışmacıların lig performanslarını ve toplam skor başarılarını detaylı inceleyin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* SOL TARAF: A-Z ALFABETİK ARAMA VE OYUNCU LİSTESİ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[600px]">
          <div className="mb-3">
            <input
              type="text"
              placeholder="🔍 Yarışmacı Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 px-1 flex justify-between">
            <span>YARIŞMACI ({filteredUsers.length})</span>
            <span>ID</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-amber-500/30">
            {filteredUsers.map((user) => {
              const isSelected = selectedUser.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between text-xs font-bold ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black'
                      : 'bg-slate-950/60 text-slate-200 border-slate-800/80 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate pr-2">
                    {user.name} {user.trophies}
                  </span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                    #{user.id}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SAĞ TARAF: SEÇİLİ OYUNCUNUN BİLGİ VE İSTATİSTİK KARTI */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* OYUNCU ÜST KÜNYE */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg border border-amber-400/50">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg md:text-xl font-black text-slate-100 uppercase">
                      {selectedUser.name}
                    </h2>
                    {selectedUser.trophies && (
                      <span className="text-lg">{selectedUser.trophies}</span>
                    )}
                  </div>
                  <span className="inline-block mt-1 text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                    SİSTEM ID: #{selectedUser.id}
                  </span>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">DURUM</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                  AKTİF TAHMİNCİ
                </span>
              </div>
            </div>

            {/* İSTATİSTİK KARTLARI IZGARASI */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  🎯 TAM SKOR
                </span>
                <span className="text-xl font-black text-emerald-400">
                  {exactScores[selectedUser.id] || 0}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  🏆 MASTER LİG
                </span>
                <span className="text-xl font-black text-amber-400">
                  {selectedUser.master} <span className="text-xs text-slate-500 font-normal">P</span>
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  ⚽ DFO LİGİ
                </span>
                <span className="text-xl font-black text-blue-400">
                  {selectedUser.dfo} <span className="text-xs text-slate-500 font-normal">P</span>
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-center">
                <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  🇹🇷 TFF LİGİ
                </span>
                <span className="text-xl font-black text-red-400">
                  {selectedUser.tff} <span className="text-xs text-slate-500 font-normal">P</span>
                </span>
              </div>
            </div>

            {/* DETAYLI PERFORMANS BİLGİSİ */}
            <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
              <h3 className="text-xs font-extrabold text-amber-400 uppercase mb-2">
                📋 Yarışmacı Notları
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedUser.name}, Elit Tahmin Ligleri bünyesinde kayıtlı ve aktif olarak haftalık tahmin gönderimi yapan resmi yarışmacıdır. Yukarıdaki istatistikler admin paneli güncellemelerine bağlı olarak canlı çekilmektedir.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[10px] font-bold text-slate-500 uppercase">
            ETML Tahminci Veri Sistemi • #2026
          </div>
        </div>

      </div>
    </div>
  );
}