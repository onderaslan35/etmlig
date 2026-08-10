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

export default function AdminPage() {
  const [activeWeek, setActiveWeek] = useState<number>(4);
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [approvedMatches, setApprovedMatches] = useState<Record<string, any>>({});
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // 🔴 ÇİFT TIKLAMA KALKANI

  const getExactScorePoints = (count: number) => {
    if (count === 1) return 12;
    if (count === 2) return 6;
    if (count === 3) return 5;
    if (count === 4) return 4;
    if (count === 5) return 3;
    if (count === 6) return 2;
    return 1;
  };

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    setApprovedMatches(store);
  }, []);

  useEffect(() => {
    async function loadWeekData() {
      setLoading(true);
      try {
        const matchesRes = await fetch(`/data/week${activeWeek}_matches.json?v=${Date.now()}`);
        if (matchesRes.ok) {
          const mData = await matchesRes.json();
          setMatches(Array.isArray(mData) ? mData : []);
        } else {
          setMatches([]);
        }

        const predRes = await fetch(`/data/week${activeWeek}_predictions.json?v=${Date.now()}`);
        if (predRes.ok) {
          const pData = await predRes.json();
          setPredictions(pData);
        } else {
          setPredictions(null);
        }
      } catch (err) {
        console.error("Hafta verisi yükleme hatası:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWeekData();
  }, [activeWeek]);

  const handleScoreChange = (matchId: string | number, team: 'home' | 'away', val: string) => {
    setScores(prev => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { home: '', away: '' }), [team]: val }
    }));
  };

  const getUserPrediction = (userId: string, matchId: string | number) => {
    if (!predictions) return null;
    const matchKey = String(matchId);
    if (Array.isArray(predictions)) {
      const userObj = predictions.find((p: any) => String(p.id) === String(userId));
      return userObj?.predictions?.[matchKey] || null;
    } else if (typeof predictions === 'object') {
      return predictions[userId]?.[matchKey] || null;
    }
    return null;
  };

  const getMatchExactWinners = (matchId: string | number, homeStr: string, awayStr: string) => {
    if (!predictions || homeStr === '' || awayStr === '') return [];
    const rH = Number(homeStr);
    const rA = Number(awayStr);

    // 🔴 JSON DOSYASINDAKİ ÇİFT KAYITLARI SİLEN KALKAN
    let playerIds: string[] = Array.isArray(predictions) ? predictions.map((p: any) => String(p.id)) : Object.keys(predictions);
    playerIds = [...new Set(playerIds)]; 

    const exactMatches = playerIds.filter(uId => {
      const pred = getUserPrediction(uId, matchId);
      if (!pred || !pred.includes('-')) return false;
      const [pH, pA] = pred.split('-').map(Number);
      return pH === rH && pA === rA;
    });

    const ptsForExact = getExactScorePoints(exactMatches.length);
    return exactMatches.map(uId => ({
      name: allPlayersList[uId] || uId,
      pts: ptsForExact
    }));
  };

  const calculateWeeklyLeaders = (store: any) => {
    let weeklyStats: Record<string, { pts: number, exacts: number }> = {};
    
    Object.values(store).filter((m: any) => m.week === activeWeek).forEach((m: any) => {
      const exacts = getMatchExactWinners(m.matchId, m.homeScore, m.awayScore);
      exacts.forEach(winner => {
        const uId = Object.keys(allPlayersList).find(key => allPlayersList[key] === winner.name);
        if (uId) {
          if (!weeklyStats[uId]) weeklyStats[uId] = { pts: 0, exacts: 0 };
          weeklyStats[uId].pts += winner.pts;
          weeklyStats[uId].exacts += 1;
        }
      });
    });

    let maxPts = 0, ptLeaders: string[] = [];
    let maxExacts = 0, exLeaders: string[] = [];

    Object.keys(weeklyStats).forEach(uId => {
      const st = weeklyStats[uId];
      if (st.pts > maxPts) { maxPts = st.pts; ptLeaders = [uId]; }
      else if (st.pts === maxPts) { ptLeaders.push(uId); }

      if (st.exacts > maxExacts) { maxExacts = st.exacts; exLeaders = [uId]; }
      else if (st.exacts === maxExacts) { exLeaders.push(uId); }
    });

    return {
      pWinnerId: ptLeaders.length === 1 ? ptLeaders[0] : null,
      eWinnerId: exLeaders.length === 1 ? exLeaders[0] : null
    };
  };

  const handleApprove = (matchId: string | number) => {
    if (isProcessing) return; 
    setIsProcessing(true); // 🔴 SİSTEMİ KİLİTLE (Çift Tıklamayı Engeller)

    const mScores = scores[matchId];
    if (!mScores || mScores.home === '' || mScores.away === '') {
      alert("Lütfen önce ev sahibi ve deplasman skorlarını seçin!");
      setIsProcessing(false);
      return;
    }

    const matchObj = matches.find(m => m.id === matchId);
    if (!matchObj) { setIsProcessing(false); return; }

    // 🔴 GERÇEK ZAMANLI KONTROL KALKANI
    const freshStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    if (freshStore[String(matchId)]) {
        setIsProcessing(false);
        return; // Maç zaten onaylanmış, gizlice durdur.
    }

    const newApproval = {
      matchId: String(matchId),
      week: activeWeek,
      league: matchObj.league,
      homeScore: mScores.home,
      awayScore: mScores.away,
      approvedAt: new Date().toISOString()
    };

    const updatedStore = { ...freshStore, [String(matchId)]: newApproval };
    let leaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
    const exacts = getMatchExactWinners(matchId, mScores.home, mScores.away);
    const isTff = matchObj.league.toUpperCase().includes('TFF') || matchObj.league.toUpperCase().includes('TÜRKİYE');

    exacts.forEach(winner => {
       const uId = Object.keys(allPlayersList).find(key => allPlayersList[key] === winner.name);
       if (uId) {
           if (!leaderboard[uId]) leaderboard[uId] = { tff: 0, dfo: 0, master: 0, skor: 0, icons: "" };
           if (isTff) leaderboard[uId].tff += winner.pts;
           else leaderboard[uId].dfo += winner.pts;
           leaderboard[uId].master += winner.pts;
           leaderboard[uId].skor = (leaderboard[uId].skor || 0) + 1; 
       }
    });

    let bonusMessage = "";
    
    const weekMatchesInStore = Object.values(updatedStore).filter((m: any) => m.week === activeWeek);
    if (weekMatchesInStore.length === matches.length && matches.length > 0) {
       const bonusKey = `bonus_applied_week_${activeWeek}`;
       if (localStorage.getItem(bonusKey) !== "true") {
           const { pWinnerId, eWinnerId } = calculateWeeklyLeaders(updatedStore);
           
           if (pWinnerId && eWinnerId && pWinnerId === eWinnerId) {
               if (!leaderboard[pWinnerId]) leaderboard[pWinnerId] = { tff: 0, dfo: 0, master: 0, skor: 0, icons: "" };
               leaderboard[pWinnerId].master += 6;
               leaderboard[pWinnerId].icons = (leaderboard[pWinnerId].icons || "") + " 👑🎯";
               bonusMessage += `\n👑 Hem Zirve Hem Skor Kralı (+6 Puan): ${allPlayersList[pWinnerId]}`;
           } else {
               if (pWinnerId) {
                   if (!leaderboard[pWinnerId]) leaderboard[pWinnerId] = { tff: 0, dfo: 0, master: 0, skor: 0, icons: "" };
                   leaderboard[pWinnerId].master += 3;
                   leaderboard[pWinnerId].icons = (leaderboard[pWinnerId].icons || "") + " 🏔️";
                   bonusMessage += `\n🏔️ Zirve Bonusu (+3 Puan): ${allPlayersList[pWinnerId]}`;
               }
               if (eWinnerId) {
                   if (!leaderboard[eWinnerId]) leaderboard[eWinnerId] = { tff: 0, dfo: 0, master: 0, skor: 0, icons: "" };
                   leaderboard[eWinnerId].master += 3;
                   leaderboard[eWinnerId].icons = (leaderboard[eWinnerId].icons || "") + " 🎯";
                   bonusMessage += `\n🎯 Skor Kralı Bonusu (+3 Puan): ${allPlayersList[eWinnerId]}`;
               }
           }
           localStorage.setItem(bonusKey, "true");
       }
    }

    localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
    
    // 🔴 1 SANİYE SONRA SİSTEMİ AÇ
    setTimeout(() => { setIsProcessing(false); }, 1000);
    alert(`Maç onaylandı! Puanlar cüzdanlara, Skor Sayacına işlendi.${bonusMessage ? '\n' + bonusMessage : ''}`);
  };

  const handleResetSingleMatch = (matchId: string | number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const freshStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    const matchToReset = freshStore[String(matchId)];
    if (!matchToReset) { setIsProcessing(false); return; }

    let leaderboard = JSON.parse(localStorage.getItem('elitTahmin_Leaderboard') || '{}');
    const exacts = getMatchExactWinners(matchId, matchToReset.homeScore, matchToReset.awayScore);
    const isTff = matchToReset.league.toUpperCase().includes('TFF') || matchToReset.league.toUpperCase().includes('TÜRKİYE');

    exacts.forEach(winner => {
       const uId = Object.keys(allPlayersList).find(key => allPlayersList[key] === winner.name);
       if (uId && leaderboard[uId]) {
           if (isTff) leaderboard[uId].tff -= winner.pts;
           else leaderboard[uId].dfo -= winner.pts;
           leaderboard[uId].master -= winner.pts;
           leaderboard[uId].skor = (leaderboard[uId].skor || 1) - 1;
       }
    });

    const bonusKey = `bonus_applied_week_${activeWeek}`;
    if (localStorage.getItem(bonusKey) === "true") {
        const { pWinnerId, eWinnerId } = calculateWeeklyLeaders(freshStore);
        
        if (pWinnerId && eWinnerId && pWinnerId === eWinnerId) {
            if (leaderboard[pWinnerId]) {
                leaderboard[pWinnerId].master -= 6;
                leaderboard[pWinnerId].icons = leaderboard[pWinnerId].icons.replace(" 👑🎯", "");
            }
        } else {
            if (pWinnerId && leaderboard[pWinnerId]) {
                leaderboard[pWinnerId].master -= 3;
                leaderboard[pWinnerId].icons = leaderboard[pWinnerId].icons.replace(" 🏔️", "");
            }
            if (eWinnerId && leaderboard[eWinnerId]) {
                leaderboard[eWinnerId].master -= 3;
                leaderboard[eWinnerId].icons = leaderboard[eWinnerId].icons.replace(" 🎯", "");
            }
        }
        
        localStorage.removeItem(bonusKey);
        alert("Müstakil Bonuslar (varsa) Master tablosundan geri çekildi ve simgeler silindi!");
    }

    const updatedStore = { ...freshStore };
    delete updatedStore[String(matchId)];
    
    localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(leaderboard));
    localStorage.setItem('elitTahmin_ApprovedMatches', JSON.stringify(updatedStore));
    setApprovedMatches(updatedStore);
    setTimeout(() => { setIsProcessing(false); }, 1000);
  };

  const handleResetAll = () => {
    if (window.confirm("TÜM SİSTEMİ VE ONAYLARI SIFIRLAMAK İSTEDİĞİNİZE EMİN MİSİNİZ?")) {
      localStorage.removeItem('elitTahmin_ApprovedMatches');
      localStorage.removeItem('elitTahmin_Leaderboard');
      [1, 2, 3, 4].forEach(w => localStorage.removeItem(`bonus_applied_week_${w}`));
      setApprovedMatches({});
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 text-slate-100 font-sans">
      <div className="w-full bg-[#0d1527]/90 border border-slate-800/90 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center justify-between shadow-2xl">
        <div className="text-center md:text-left z-10">
          <h1 className="text-2xl md:text-3xl font-black text-amber-400 uppercase tracking-wider flex items-center justify-center md:justify-start gap-2">
            <span>⚡</span> ADMIN TAHMİNMATİK
          </h1>
          <div className="flex gap-2 mt-3 justify-center md:justify-start">
            {[1, 2, 3, 4].map(w => (
              <button
                key={w}
                onClick={() => setActiveWeek(w)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${
                  activeWeek === w
                    ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-950/80 text-slate-400 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {w}. HAFTA
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleResetAll}
          className="mt-4 md:mt-0 z-10 px-4 py-2 bg-rose-950/60 border border-rose-800/80 text-rose-300 font-black text-xs rounded-xl shadow-lg hover:bg-rose-900/80 transition-colors"
        >
          <span>📌</span> SİSTEMİ & PUANLARI SIFIRLA
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-sm">
          ⏳ {activeWeek}. Hafta maçları yükleniyor...
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {matches.map((m) => {
            const isApproved = !!approvedMatches[String(m.id)];
            const curHomeScore = isApproved ? approvedMatches[String(m.id)].homeScore : (scores[m.id]?.home ?? '');
            const curAwayScore = isApproved ? approvedMatches[String(m.id)].awayScore : (scores[m.id]?.away ?? '');
            const exacts = getMatchExactWinners(m.id, curHomeScore, curAwayScore);

            return (
              <div
                key={m.id}
                className="bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wide truncate">
                    {m.week}. HAFTA - {m.id}. MAÇ
                  </span>
                  <span className="text-[9px] font-black text-slate-300 bg-slate-950 px-2 py-1 rounded-md border border-slate-800/80 truncate max-w-[180px]">
                    {m.league}
                  </span>
                </div>

                <div className="flex items-center justify-between my-3">
                  <span className="font-extrabold text-sm text-slate-100 uppercase w-2/5 truncate">
                    {m.home}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <select
                      disabled={isApproved || isProcessing}
                      value={curHomeScore}
                      onChange={(e) => handleScoreChange(m.id, 'home', e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs p-1.5 rounded-lg outline-none focus:border-amber-400 disabled:opacity-70"
                    >
                      <option value="">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span className="text-slate-600 font-black">-</span>
                    <select
                      disabled={isApproved || isProcessing}
                      value={curAwayScore}
                      onChange={(e) => handleScoreChange(m.id, 'away', e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs p-1.5 rounded-lg outline-none focus:border-amber-400 disabled:opacity-70"
                    >
                      <option value="">-</option>
                      {[0,1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <span className="font-extrabold text-sm text-slate-100 uppercase w-2/5 text-right truncate">
                    {m.away}
                  </span>
                </div>

                {(curHomeScore !== '' && curAwayScore !== '') && (
                  <div className="my-3 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                    <span className="font-black text-amber-400 flex items-center gap-1">
                      🎯 Skoru Bilenler [{exacts.length} Kişi]:
                    </span>
                    {exacts.length > 0 ? (
                      <p className="text-slate-200 font-bold mt-1 text-[11px] leading-relaxed">
                        {exacts.map(e => `${e.name} (+${e.pts})`).join(', ')}
                      </p>
                    ) : (
                      <p className="text-slate-500 italic mt-0.5 text-[10px]">Tam skoru bilen bulunamadı.</p>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500">
                    Durum: <span className={isApproved ? "text-emerald-400 font-black" : "text-amber-500"}>
                      {isApproved ? 'Tamamlandı' : 'Bekliyor'}
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    {isApproved && (
                      <button
                        disabled={isProcessing}
                        onClick={() => handleResetSingleMatch(m.id)}
                        className="py-1.5 px-3 bg-rose-950/80 text-rose-300 border border-rose-800/80 font-extrabold text-xs rounded-xl hover:bg-rose-900 transition-colors disabled:opacity-50"
                      >
                        🔄 SIFIRLA
                      </button>
                    )}
                    <button
                      disabled={isApproved || isProcessing}
                      onClick={() => handleApprove(m.id)}
                      className="py-1.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ONAYLA & DAĞIT
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 font-bold text-sm bg-[#0b1329]/90 border border-slate-800/90 rounded-2xl">
          ⚠️ {activeWeek}. Haftaya ait maç verisi bulunamadı.
        </div>
      )}
    </div>
  );
}