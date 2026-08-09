'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const defaultUsers = [
  { id: "262740", name: "ABDULLAH DİK" },
  { id: "262705", name: "AHMET BİRCAN 🏆" },
  { id: "351925", name: "ALİOS GÖZTEPE" },
  { id: "262723", name: "AYHAN LUŞOĞLU" },
  { id: "262708", name: "BAYRAM YILMAZ" },
  { id: "262718", name: "BEKİR KARADAĞ" },
  { id: "262716", name: "BİROL DEMİREL" },
  { id: "262749", name: "B.VEYSELOĞLU EROL" },
  { id: "262703", name: "CEMALETTİN BELLİ" },
  { id: "262772", name: "CEMAL SİVRİKAYA 🏆" },
  { id: "262790", name: "CUMALİ SÖKER" },
  { id: "262755", name: "DOĞAÇ ALKAN" },
  { id: "262756", name: "EYÜP KARACAOĞLU" },
  { id: "262731", name: "FATİH AYAN" },
  { id: "262706", name: "GAZİ AYAN 🏆🏆" },
  { id: "262707", name: "HAKAN AYAN" },
  { id: "262726", name: "HUDAVER TOPARDIC" },
  { id: "262725", name: "İLYAS KAZDAL" },
  { id: "262744", name: "İLYAS UYGUN" },
  { id: "262714", name: "İSMAİL EKER 🏆" },
  { id: "262813", name: "KEMAL ERSOY" },
  { id: "262734", name: "LEVENT YILDIRIM" },
  { id: "262750", name: "MAHMUT CBR" },
  { id: "262736", name: "MEHMET ALİ KARA" },
  { id: "262758", name: "MELİH PINAR" },
  { id: "262738", name: "MEVLÜT EVLER" },
  { id: "262733", name: "MUHSİN ASİLKAN" },
  { id: "262717", name: "MURAT ALİ" },
  { id: "262712", name: "MURAT AYDEMİR" },
  { id: "262702", name: "MURAT KARA" },
  { id: "262721", name: "MUSTAFA GÜMÜŞÇÜ" },
  { id: "262763", name: "MUSTAFA ELMAS" },
  { id: "262787", name: "MUSTAFA TUCİ" },
  { id: "262754", name: "OSMAN ALİ AYDIN 🏆" },
  { id: "262770", name: "OZKAYA MAZAKALI BAYRAM" },
  { id: "262728", name: "ÖNDER ASLAN" },
  { id: "262730", name: "ÖNDER IŞIK" },
  { id: "262711", name: "RIDVAN DOGER" },
  { id: "262732", name: "R. İLHAN KARACA 🏆🏆" },
  { id: "262709", name: "SALİH KARACAOĞLU" },
  { id: "262747", name: "SAVAŞ ÇAĞLAYAN" },
  { id: "262816", name: "SEDAT SEDAT" },
  { id: "262786", name: "SEDAT DİŞLİ" },
  { id: "262737", name: "ŞAHİN GEZGİNCİ" },
  { id: "262715", name: "ŞEMSETTİN DÜGER" },
  { id: "262774", name: "ŞENOL CAN ÇAKICI" },
  { id: "262771", name: "ULAŞ ADIGÜZEL" },
  { id: "262739", name: "UĞUR GÜRBÜZ" },
  { id: "262719", name: "UĞUR VARDAR" },
  { id: "262704", name: "YAPAY ZEKA" },
  { id: "262782", name: "YUSUF ERBAY" },
  { id: "262753", name: "YUSUF KIZILTUĞ" }
];

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'menu' | 'skor'>('skor');
  const [selectedWeek, setSelectedWeek] = useState<number>(3);
  
  const [weeklySkors, setWeeklySkors] = useState<Record<string, Record<string, number>>>({});
  const [currentWeekData, setCurrentWeekData] = useState<Record<string, number>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  useEffect(() => {
    const session = localStorage.getItem('adminSession');
    if (!session) {
      router.push('/admin/login');
    } else {
      const parsed = JSON.parse(session);
      if (parsed.id !== '262728') {
        router.push('/admin/login');
      } else {
        setAdminUser(parsed);
      }
    }

    const savedWeekly = localStorage.getItem('skorWeeklyData');
    if (savedWeekly) {
      try {
        const parsed = JSON.parse(savedWeekly);
        setWeeklySkors(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [router]);

  useEffect(() => {
    const weekKey = `week${selectedWeek}`;
    const weekData = weeklySkors[weekKey] || {};
    
    const initialMap: Record<string, number> = {};
    defaultUsers.forEach(u => {
      initialMap[u.id] = weekData[u.id] || 0;
    });
    
    setCurrentWeekData(initialMap);
  }, [selectedWeek, weeklySkors]);

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    router.push('/admin/login');
  };

  const handleScoreChange = (userId: string, val: number) => {
    setCurrentWeekData(prev => ({
      ...prev,
      [userId]: val
    }));
  };

  const handleSaveSkor = () => {
    const weekKey = `week${selectedWeek}`;
    const updatedWeekly = {
      ...weeklySkors,
      [weekKey]: currentWeekData
    };

    setWeeklySkors(updatedWeekly);
    localStorage.setItem('skorWeeklyData', JSON.stringify(updatedWeekly));
    
    setSuccessMsg(`${selectedWeek}. Haftanın skorları başarıyla kaydedildi!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!adminUser) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center font-sans">
      {/* PANEL ÜST BİLGİ VE ÇIKIŞ BARI */}
      <div className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
            👑
          </div>
          <div>
            <h2 className="text-sm font-black text-amber-400 uppercase">
              {adminUser.name} ({adminUser.id})
            </h2>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              SÜPER YÖNETİCİ AKTİF
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'skor' && (
            <button
              onClick={() => setActiveTab('menu')}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-1.5 rounded-xl transition-all"
            >
              ← ANA PANEL
            </button>
          )}
          <button
            onClick={handleLogout}
            className="text-xs font-bold bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white border border-red-500/40 px-3.5 py-1.5 rounded-xl transition-all"
          >
            ÇIKIŞ YAP
          </button>
        </div>
      </div>

      {activeTab === 'menu' ? (
        /* KARTLAR */
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-md opacity-60">
            <div className="text-2xl mb-2">⚽</div>
            <h3 className="text-sm font-extrabold text-amber-400 uppercase mb-1">
              Günün Müsabakaları
            </h3>
            <p className="text-xs text-slate-400">Anasayfada görünen maç programı ve saatleri.</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-md opacity-60">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-sm font-extrabold text-amber-400 uppercase mb-1">
              Master & TFF Puanları
            </h3>
            <p className="text-xs text-slate-400">Haftalık puan durumları ve sıralamalar.</p>
          </div>

          <div 
            onClick={() => setActiveTab('skor')}
            className="bg-slate-900 border border-emerald-500/50 hover:border-emerald-400 p-5 rounded-2xl transition-all shadow-lg cursor-pointer transform hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="text-2xl">🎯</div>
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
                YÖNETİME BAŞLA →
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-amber-400 uppercase mb-1">
              Skor Durumu Yönetimi
            </h3>
            <p className="text-xs text-slate-400">
              Haftalık tam skor sayılarını girin, sistem toplamı otomatik hesaplasın.
            </p>
          </div>
        </div>
      ) : (
        /* HAFTALIK SKOR DÜZENLEME EKRANI (ALFABETİK SIRALI) */
        <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-slate-800 gap-4">
            <div>
              <h3 className="text-base font-extrabold text-amber-400 uppercase">
                🎯 Haftalık Skor Durumu Yönetimi
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Yarışmacılar alfabetik olarak sıralanmıştır. Haftayı seçip skorları girin.
              </p>
            </div>

            {/* HAFTA SEÇİM AÇILIR MENÜSÜ */}
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300 uppercase">
                HAFTA SEÇİN:
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(Number(e.target.value))}
                className="bg-slate-950 border border-amber-500/50 text-amber-400 font-black text-sm px-4 py-2 rounded-xl focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 48 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    {w}. HAFTA
                  </option>
                ))}
              </select>

              <button
                onClick={handleSaveSkor}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-xs uppercase tracking-wider"
              >
                💾 {selectedWeek}. HAFTAYI KAYDET
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-xl text-center">
              ✅ {successMsg}
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-amber-500/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {defaultUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <span className="block text-xs font-bold text-slate-100">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      ID: {user.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">
                      {selectedWeek}. Hafta Skor:
                    </span>
                    <input
                      type="number"
                      value={currentWeekData[user.id] || 0}
                      onChange={(e) =>
                        handleScoreChange(user.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-lg px-2 py-1 text-center font-black text-emerald-400 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}