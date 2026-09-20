"use client";
import React, { useEffect, useState } from 'react';

export default function CanliSkorMerkezi() {
  const [maclar, setMaclar] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  // 🚨 KARARGAHIN TAKİP EDECEĞİ MAÇLAR (Aralarına tire koyarak diziyoruz)
  const HEDEF_MACLAR = "1550136-1570400";

  useEffect(() => {
    const skorlariCek = async () => {
      try {
        // Vercel'in kalbindeki 3 namlulu motoru tetikliyoruz
        const res = await fetch(`/api/canli-skor?ids=${HEDEF_MACLAR}`);
        const data = await res.json();
        
        if (data.response) {
          setMaclar(data.response);
        }
      } catch (error) {
        console.error("Karargaha veri akışı koptu:", error);
      } finally {
        setYukleniyor(false);
      }
    };

    skorlariCek(); // İlk mermiyi ateşle
    // Sonraki atışlar Vercel Karatahtasından okunur, limit yemez! (2 dakikada bir yenilenir)
    const interval = setInterval(skorlariCek, 120000); 
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto">
        
        {/* ÜST BAŞLIK */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-widest drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            KARARGAH CANLI RADAR
          </h1>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest">Gerçek Zamanlı Saha Akışı</p>
        </div>

        {/* YÜKLENİYOR EKRANI */}
        {yukleniyor ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4">
            <span className="text-4xl animate-bounce">📡</span>
            <div className="text-emerald-500 font-bold animate-pulse tracking-widest">SİNYAL ARANIYOR...</div>
          </div>
        ) : (
          /* MAÇ KARTLARI */
          <div className="flex flex-col gap-6">
            {maclar.map((mac) => {
              const evSahibi = mac.teams.home.name;
              const deplasman = mac.teams.away.name;
              const evLogo = mac.teams.home.logo;
              const depLogo = mac.teams.away.logo;
              const evSkor = mac.goals.home ?? 0;
              const depSkor = mac.goals.away ?? 0;
              const dakika = mac.fixture.status.elapsed;
              const durum = mac.fixture.status.short;

              // Sadece golleri ve kırmızı kartları cımbızla al
              const goller = mac.events.filter((e: any) => e.type === "Goal");
              const kirmiziKartlar = mac.events.filter((e: any) => e.type === "Card" && e.detail === "Red Card");

              return (
                <div key={mac.fixture.id} className="bg-slate-900/80 border border-slate-700/50 hover:border-emerald-500/30 transition-colors duration-300 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col">
                  
                  {/* MAÇ DURUMU (Dakika / Maç Sonu) */}
                  <div className="flex justify-center mb-6">
                    <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest shadow-inner ${
                      durum === 'FT' ? 'bg-slate-800 text-slate-400 border border-slate-700' : 
                      ['1H','2H','HT','ET','P'].includes(durum) ? 'bg-rose-500/10 text-rose-500 border border-rose-500/50 animate-pulse' : 
                      'bg-slate-800/50 text-slate-500 border border-slate-700/50'
                    }`}>
                      {['1H','2H','HT','ET','P'].includes(durum) ? `${dakika}' CANLI OYNANIYOR` : durum === 'FT' ? 'MAÇ SONA ERDİ' : 'BAŞLAMADI'}
                    </span>
                  </div>

                  {/* ORTA BÖLÜM: SKORBORD */}
                  <div className="flex justify-between items-center gap-2 sm:gap-4">
                    <div className="flex-1 flex flex-col sm:flex-row items-center justify-end gap-3 text-right">
                      <span className="text-slate-200 font-bold text-base sm:text-xl">{evSahibi}</span>
                      <img src={evLogo} alt={evSahibi} className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-lg" />
                    </div>

                    <div className="flex items-center justify-center bg-slate-950 px-4 py-3 sm:px-8 sm:py-4 rounded-xl border border-slate-800 shadow-inner">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400">{evSkor}</span>
                      <span className="text-slate-600 mx-2 sm:mx-4 text-xl sm:text-2xl font-light">-</span>
                      <span className="text-3xl sm:text-4xl font-black text-emerald-400">{depSkor}</span>
                    </div>

                    <div className="flex-1 flex flex-col sm:flex-row-reverse items-center justify-end gap-3 text-left">
                      <span className="text-slate-200 font-bold text-base sm:text-xl">{deplasman}</span>
                      <img src={depLogo} alt={deplasman} className="w-10 h-10 sm:w-14 sm:h-14 object-contain drop-shadow-lg" />
                    </div>
                  </div>

                  {/* ALT BÖLÜM: GOL VE KART DETAYLARI */}
                  {(goller.length > 0 || kirmiziKartlar.length > 0) && (
                    <div className="mt-8 pt-4 border-t border-slate-800/50 flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-slate-400 bg-slate-950/30 rounded-xl p-4">
                      
                      {/* Ev Sahibi Olayları */}
                      <div className="flex-1 flex flex-col gap-2 items-start sm:items-end sm:pr-6 sm:border-r border-slate-800/50">
                        {goller.filter((g: any) => g.team.id === mac.teams.home.id).map((g: any, i: number) => (
                          <span key={`h-g-${i}`} className="flex items-center gap-2">⚽ <span className="text-slate-300">{g.player.name}</span> <span className="text-slate-500">({g.time.elapsed}')</span></span>
                        ))}
                        {kirmiziKartlar.filter((k: any) => k.team.id === mac.teams.home.id).map((k: any, i: number) => (
                          <span key={`h-k-${i}`} className="flex items-center gap-2">🟥 <span className="text-rose-500">{k.player.name}</span> <span className="text-slate-500">({k.time.elapsed}')</span></span>
                        ))}
                      </div>

                      {/* Deplasman Olayları */}
                      <div className="flex-1 flex flex-col gap-2 items-start sm:pl-6 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                        {goller.filter((g: any) => g.team.id === mac.teams.away.id).map((g: any, i: number) => (
                          <span key={`a-g-${i}`} className="flex items-center gap-2"><span className="text-slate-500">({g.time.elapsed}')</span> <span className="text-slate-300">{g.player.name}</span> ⚽</span>
                        ))}
                        {kirmiziKartlar.filter((k: any) => k.team.id === mac.teams.away.id).map((k: any, i: number) => (
                          <span key={`a-k-${i}`} className="flex items-center gap-2"><span className="text-slate-500">({k.time.elapsed}')</span> <span className="text-rose-500">{k.player.name}</span> 🟥</span>
                        ))}
                      </div>
                      
                    </div>
                  )}
                  
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}