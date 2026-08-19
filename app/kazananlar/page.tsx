'use client';

import React, { useState } from 'react';

// EKMEL PROTOKOLÜ DEVREDE: Eski yapı korundu, ana başlık LİDERLER KULÜBÜ yapıldı.
const mockHeroesData: Record<number, any> = {
  1: {
    master: { name: "MEHMET ALİ KARA", points: "İLK LİDER", title: "MASTER LİDERİ", icon: "👑", desc: "Sezonun açılış düdüğüyle birlikte fırtına gibi esti! Ligin ilk haftasında rakiplerine gözdağı vererek koltuğa oturdu ve 'Bu sezonun patronu benim' dedi." },
    dfo: { name: "MEHMET ALİ KARA", points: "ÇİFTE TAÇ", title: "DFO ŞÖVALYESİ", icon: "🛡️", desc: "Avrupa arenasında da kimseye geçit vermedi! Hem Master hem DFO liderliğini aynı anda alarak ETML tarihine 'Çifte Taç' ile muazzam bir giriş yaptı." },
    skor: { name: "DOĞAÇ ALKAN", points: "6 İSABET", title: "SKOR KRALI", icon: "🎯", desc: "Avrupa kupalarındaki 24 zorlu maçın tam 6'sında skoru nokta atışı bildi! Kıta Avrupası'nın futbol aklını okuyan inanılmaz bir kâhinlik performansı." },
    tff: { name: "BEKLEMEDE", points: "0", title: "TFF FATİHİ", icon: "⏳", desc: "Türkiye liglerinde heyecan henüz başlamadı. Karargah, Anadolu sahalarından gelecek ilk düdüğü bekliyor..." }
  },
  2: {
    master: { name: "DOĞAÇ ALKAN", points: "37 PUAN", title: "MASTER LİDERİ", icon: "👑", desc: "İlk haftadaki skor başarılarının üstüne 13 puan daha ekleyip toplamda 37 puana ulaşarak Mehmet Ali Kara'dan liderlik asasını söküp aldı ve Master zirvesine tek başına kuruldu!" },
    dfo: { name: "DOĞAÇ ALKAN", points: "ZİRVE", title: "DFO ŞÖVALYESİ", icon: "🛡️", desc: "Avrupa sahalarında kelimenin tam anlamıyla Doğaç Alkan fırtınası esti. Kıtanın en zorlu maçlarında rakiplerini sürklase ederek DFO liderliğini de ele geçirdi." },
    skor: { name: "DOĞAÇ ALKAN", points: "LİDER", title: "SKOR KRALI", icon: "🎯", desc: "İlk haftadaki olağanüstü performansının tesadüf olmadığını kanıtladı. Skorları önceden sezme yeteneğiyle rakiplerine psikolojik üstünlük kurarak krallığını pekiştirdi." },
    tff: { name: "BEKLEMEDE", points: "0", title: "TFF FATİHİ", icon: "⏳", desc: "Süper Lig sahalarında çimler henüz sulanıyor. Türkiye ligleri heyecanının başlaması Karargah tarafından bekleniyor..." }
  },
  3: {
    master: { name: "DOĞAÇ ALKAN", points: "45 PUAN", title: "MASTER LİDERİ", icon: "👑", desc: "İkinci haftada ele geçirdiği liderlik koltuğunu bırakmadı! Arkasından 44 puanla amansızca takip eden Eyüp Karacaoğlu ve haftanın flaş ismi Sedat Sedat'ın nefesini ensesinde hissetmesine rağmen 45 puanla Master zirvesini korumayı başardı." },
    dfo: { name: "EYÜP KARACAOĞLU", points: "40 PUAN", title: "DFO ŞÖVALYESİ", icon: "🛡️", desc: "Avrupa arenalarındaki üstünlüğünü kanıtlayarak 40 puana ulaştı ve DFO liderliğini ele geçirdi! Kıta Avrupa'sındaki istikrarlı performansı onu 'DFO Şövalyesi' unvanına taşıdı." },
    skor: { name: "SEDAT SEDAT", points: "31 PUAN", title: "SKOR KRALI", icon: "🎯", desc: "Haftaya tam anlamıyla damga vuran isim! 5 maçı tam isabetle bilip müstakil liderlik ve bonuslarla birlikte o haftanın en yüksek skoru olan 31 puanı topladı. Zirveyi Doğaç Alkan'dan alamasa da, kendisini Skor Krallığı ile taçlandırdı." },
    tff: { name: "HAKAN AYAN", points: "10 PUAN", title: "TFF FATİHİ", icon: "⚔️", desc: "Türkiye liglerinin açılışıyla birlikte Anadolu sahalarını ne kadar iyi tanıdığını gösterdi! Avrupa'daki sessizliğini Süper Lig'in ilk 10 maçında topladığı puanlarla bozarak TFF'nin ilk lideri oldu." }
  },
  4: { 
    master: { name: "MEHMET ALİ KARA", points: "YENİDEN ZİRVEDE", title: "MASTER LİDERİ", icon: "👑", desc: "Sezonun ilk lideri olarak başladığı serüvende, 2. ve 3. haftalarda Doğaç Alkan'ın inadını bir türlü kıramamıştı. 4. haftada tam 23 maç boyunca süren Sedat Sedat fırtınasına ve baskısına boyun eğmedi; Anadolu (TFF) maçlarında yaptığı o usta işi kusursuz hamleyle, 24. maçın sonunda tüm rakiplerini şoka uğratarak Master tahtını muazzam bir geri dönüşle geri aldı! Gerçek bir satranç ustası!" },
    dfo: { name: "EYÜP KARACAOĞLU", points: "40 PUAN ⬆", title: "DFO ŞÖVALYESİ", icon: "🛡️", desc: "Avrupa'nın tek hakimi! Kıta arenalarında gösterdiği istikrarlı ve keskin öngörüleriyle 40 puana ulaşarak DFO liderliğini kimseye bırakmadı. Yükselişi durdurulamıyor." },
    skor: { name: "DOĞAÇ ALKAN", points: "MUTLAK KÂHİN", title: "SKOR KRALI", icon: "🎯", desc: "Master tahtını son virajda o muazzam hamleye devretse de, maçların skorunu önceden sezme konusundaki o eşsiz yeteneğiyle Skor Krallığı'na ambargo koydu. Rakiplerine bu kulvarda nefes aldırmıyor!" },
    tff: { name: "İSMAİL EKER", points: "20 PUAN ⚡", title: "TFF FATİHİ", icon: "⚔️", desc: "Süper Lig ve Anadolu sahalarındaki o zorlu maçların şifresini en iyi o çözdü. Yerel ligdeki rakiplerini ezip geçerek TFF Fatihi unvanını söke söke aldı!" },
    // DİKKAT ÇEKENİ (Spotlight) locası aynen korunuyor!
    spotlight: { name: "ŞENOL CAN ÇAKICI", points: "5 İSABET", title: "HAFTANIN DİKKAT ÇEKENİ", icon: "🔥", desc: "Tam 5 maçlık harika bir isabet serisi yakaladı! İlginç olan ise yabancı Avrupa takımlarını tamamen es geçip rotasını direkt Türkiye'ye çevirmesiydi: 1 Süper Lig ve 3 TFF 1. Lig maçını tam isabetle bildi. Avrupa arenasındaki tek isabeti ise yine bir Türk takımının, Fenerbahçe'nin maçı oldu. Yüzde yüz yerli ve milli performansıyla 4. haftanın en çok konuşulan gizli kahramanı!" }
  }
};

export default function KazananlarKulubu() {
  const [activeWeek, setActiveWeek] = useState<number>(4);
  const data = mockHeroesData[activeWeek];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100 p-4 sm:p-8 font-sans pb-24 relative overflow-hidden">
      
      {/* Arka Plan Efektleri */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent z-0 pointer-events-none"></div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[150px] rounded-full z-0 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 pt-4">
        
        {/* Başlık Alanı */}
        <div className="text-center mb-16">
          <span className="text-5xl sm:text-7xl block mb-4 drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">🏆</span>
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 tracking-tight uppercase drop-shadow-lg mb-3">
            LİDERLER KULÜBÜ
          </h1>
          <p className="text-amber-500/80 font-bold tracking-widest text-sm sm:text-base uppercase">
            ELİT TAHMİN MASTER LİG PERFORMANSLARI
          </p>
        </div>

        {/* Hafta Seçici */}
        <div className="flex justify-center mb-16">
          <div className="bg-slate-900/80 border border-slate-700/50 p-1.5 rounded-2xl flex gap-1 shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">
            {[1, 2, 3, 4].map(week => (
              <button
                key={week}
                onClick={() => setActiveWeek(week)}
                className={`px-6 py-2.5 rounded-xl font-black text-sm tracking-widest transition-all duration-300 ${
                  activeWeek === week 
                    ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-amber-500/30' 
                    : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800/50 transition-colors'
                }`}
              >
                {week}. HAFTA
              </button>
            ))}
          </div>
        </div>

        {data ? (
          <div key={activeWeek} className="flex flex-col items-center gap-8 w-full max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
            
            {/* 🔴 1. KAT (ZİRVE - MASTER LİDERİ) 🔴 */}
            <div className="w-full max-w-2xl group bg-gradient-to-b from-[#0a1120] to-[#050b14] border border-blue-500/50 hover:border-blue-400 rounded-3xl p-8 shadow-[0_0_40px_rgba(59,130,246,0.15)] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition-all duration-500 relative overflow-hidden text-center transform hover:-translate-y-2">
               <div className="absolute inset-0 bg-[url('/cl-bg.png')] opacity-10 mix-blend-screen bg-cover bg-center"></div>
               <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-9xl opacity-10 group-hover:opacity-20 transition-opacity duration-700 text-blue-500 blur-sm">{data.master.icon}</div>
               
               <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-blue-950/80 border border-blue-500/50 px-4 py-1.5 rounded-full mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                     <span className="text-xl">{data.master.icon}</span>
                     <h2 className="text-blue-400 font-black text-sm tracking-widest uppercase">{data.master.title}</h2>
                  </div>
                  
                  {/* Fotoğraf Yeri */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border-2 border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.4)] bg-slate-800 flex items-center justify-center overflow-hidden">
                     <span className="text-4xl text-slate-500 font-black">?</span>
                  </div>

                  <h3 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                     {data.master.name}
                  </h3>
                  <div className="text-blue-400 font-black text-xl mb-4 tracking-widest">{data.master.points}</div>
                  
                  <div className="w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent my-6"></div>
                  
                  <p className="text-slate-300 font-medium text-sm sm:text-base leading-relaxed max-w-lg mx-auto italic opacity-90">
                     "{data.master.desc}"
                  </p>
               </div>
            </div>

            {/* 🔴 2. KAT (3'LÜ KÜRSÜ - DFO / SKOR / TFF) 🔴 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-4">
              
              {/* DFO */}
              <div className="group bg-gradient-to-b from-[#0a1120] to-[#050b14] border border-amber-500/30 hover:border-amber-400/80 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] transition-all duration-500 relative overflow-hidden text-center">
                 <div className="absolute top-4 right-4 text-5xl opacity-10 text-amber-500">{data.dfo.icon}</div>
                 <div className="relative z-10">
                    <h2 className="text-amber-500 font-black text-xs tracking-widest uppercase mb-4">{data.dfo.title}</h2>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-amber-500/30 bg-slate-800 flex items-center justify-center">
                       <span className="text-2xl text-slate-500 font-black">?</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">{data.dfo.name}</h3>
                    <div className="text-amber-500 font-bold text-sm mb-3">{data.dfo.points}</div>
                    <p className="text-slate-400 text-xs leading-relaxed italic border-t border-slate-800/80 pt-3">"{data.dfo.desc}"</p>
                 </div>
              </div>

              {/* SKOR */}
              <div className="group bg-gradient-to-b from-[#0a1120] to-[#050b14] border border-emerald-500/30 hover:border-emerald-400/80 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all duration-500 relative overflow-hidden text-center transform md:-translate-y-4">
                 <div className="absolute top-4 right-4 text-5xl opacity-10 text-emerald-500">{data.skor.icon}</div>
                 <div className="relative z-10">
                    <h2 className="text-emerald-400 font-black text-xs tracking-widest uppercase mb-4">{data.skor.title}</h2>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-emerald-500/30 bg-slate-800 flex items-center justify-center">
                       <span className="text-2xl text-slate-500 font-black">?</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">{data.skor.name}</h3>
                    <div className="text-emerald-400 font-bold text-sm mb-3">{data.skor.points}</div>
                    <p className="text-slate-400 text-xs leading-relaxed italic border-t border-slate-800/80 pt-3">"{data.skor.desc}"</p>
                 </div>
              </div>

              {/* TFF */}
              <div className="group bg-gradient-to-b from-[#0a1120] to-[#050b14] border border-red-500/30 hover:border-red-400/80 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.2)] transition-all duration-500 relative overflow-hidden text-center">
                 <div className="absolute top-4 right-4 text-5xl opacity-10 text-red-500">{data.tff.icon}</div>
                 <div className="relative z-10">
                    <h2 className="text-red-400 font-black text-xs tracking-widest uppercase mb-4">{data.tff.title}</h2>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-red-500/30 bg-slate-800 flex items-center justify-center">
                       <span className="text-2xl text-slate-500 font-black">?</span>
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-wider mb-1">{data.tff.name}</h3>
                    <div className="text-red-400 font-bold text-sm mb-3">{data.tff.points}</div>
                    <p className="text-slate-400 text-xs leading-relaxed italic border-t border-slate-800/80 pt-3">"{data.tff.desc}"</p>
                 </div>
              </div>

            </div>

            {/* 🔴 3. KAT: HAFTANIN DİKKAT ÇEKENİ (SPOTLIGHT LOCASI) 🔴 */}
            {data.spotlight && (
              <div className="w-full max-w-4xl mt-6 group bg-gradient-to-r from-purple-900/40 via-[#0a1120] to-purple-900/40 border border-purple-500/30 hover:border-purple-400/80 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                 
                 {/* Arka Plan İkonu */}
                 <div className="absolute top-1/2 -translate-y-1/2 right-4 text-8xl opacity-[0.03] text-purple-500 pointer-events-none">
                   {data.spotlight.icon}
                 </div>
                 
                 {/* Fotoğraf Yeri */}
                 <div className="w-20 h-20 shrink-0 rounded-full border-2 border-purple-500/50 bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] relative z-10">
                     <span className="text-3xl text-slate-500 font-black">?</span>
                 </div>
                 
                 {/* Metin Alanı */}
                 <div className="relative z-10 flex-1">
                    <div className="inline-flex items-center gap-2 bg-purple-950/80 border border-purple-500/50 px-3 py-1 rounded-full mb-3">
                       <span className="text-sm">{data.spotlight.icon}</span>
                       <h2 className="text-purple-400 font-black text-[10px] sm:text-xs tracking-widest uppercase">{data.spotlight.title}</h2>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-end gap-2 mb-2">
                      <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                        {data.spotlight.name}
                      </h3>
                      <span className="text-purple-400 font-bold text-sm sm:mb-1">{data.spotlight.points}</span>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed italic border-t border-purple-900/50 pt-3 mt-2">
                      "{data.spotlight.desc}"
                    </p>
                 </div>
              </div>
            )}

          </div>
        ) : (
          <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-10 max-w-2xl mx-auto mt-10">
            <span className="text-5xl block mb-4 opacity-50">⏳</span>
            <h3 className="text-xl font-black text-slate-400 uppercase tracking-widest mb-2">Veriler Hazırlanıyor</h3>
            <p className="text-slate-500 text-sm">Bu haftanın lider tablosu Karargah tarafından henüz sisteme işlenmedi.</p>
          </div>
        )}

      </div>
    </div>
  );
}