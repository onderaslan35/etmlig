'use client';
import { OnlineVisitorsAdminModule, OnlineCountPill } from '@/components/OnlineVisitorsRadar';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  normalizeTurkish,
  isTffMatchCheck,
  getEliteTheme,
  cleanTeamName,
  getMatchTimeMs,
  getWeekLabel,
  customWeekNames
} from '@/utils/themeEngine';
import FavoriteTeamSelector from '@/components/FavoriteTeamSelector';

export default function PredictionPortal() {
  const [view, setView] = useState<'lobby' | 'declaration' | 'entry' | 'tahminmatik'>('lobby');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z');

  const [bulletinMap, setBulletinMap] = useState<Record<number, any[]>>({});
  const [predictions, setPredictions] = useState<Record<number, { home: string; away: string }>>({});
  const [oldPredictions, setOldPredictions] = useState<Record<number, { home: string; away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string; away: string }>>({});

  const [activeBulletinWeek, setActiveBulletinWeek] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'live' | 'bulletin' | 'players' | 'visitors'>('live');
  const [selectedTahminWeek, setSelectedTahminWeek] = useState<number>(0);

  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string; name: string }>>(TEST_ACCOUNTS);

  const [liveMatchStatus, setLiveMatchStatus] = useState<Record<number, { status: string; score: string }>>({});
  const [livePredictionsData, setLivePredictionsData] = useState<Record<number, Record<string, string[]>>>({});

  const [missingPlayersNeon, setMissingPlayersNeon] = useState<string[]>([]);
  const [submittedPlayersNeon, setSubmittedPlayersNeon] = useState<string[]>([]);

  const scoreOptionsArr = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

  const getDisplayWeek = (week: number) => {
    if (customWeekNames[week]) return customWeekNames[week];
    return getWeekLabel(week);
  };

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchDbPlayers = async () => {
      const [playersRes, officialRes] = await Promise.all([
        supabase.from('players').select('*'),
        supabase.from('etml_official_players').select('*')
      ]);

      const newAccounts: Record<string, { pass: string; name: string }> = { ...TEST_ACCOUNTS };

      // Önce eski players tablosundan şifre ve isimleri al
      if (playersRes.data) {
        playersRes.data.forEach((p: any) => {
          const pid = String(p.username || '').trim();
          if (!pid) return;
          if (newAccounts[pid]) {
            newAccounts[pid] = {
              pass: p.password || newAccounts[pid].pass,
              name: p.name || p.full_name || newAccounts[pid].name
            };
          } else {
            newAccounts[pid] = { pass: p.password || '', name: p.name || p.full_name || pid };
          }
        });
      }

      // Sonra resmi tablodan aktiflik ve güncel isimleri baskın olarak uygula
      if (officialRes.data) {
        officialRes.data.forEach((op: any) => {
          const pid = String(op.user_id || '').trim();
          if (!pid) return;
          if (op.is_active === false) {
            delete newAccounts[pid];
          } else if (op.full_name) {
            newAccounts[pid] = {
              pass: newAccounts[pid]?.pass || '',
              name: op.full_name
            };
          }
        });
      }

      setMergedAccounts(newAccounts);
    };
    fetchDbPlayers();
  }, []);

  const availableWeeks = useMemo(() => {
    return Object.keys(bulletinMap)
      .map(Number)
      .filter((w) => w >= 6)
      .sort((a, b) => b - a);
  }, [bulletinMap]);

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: bultenData } = await supabase
        .from('matches_bulletin')
        .select('week_num, match_index, category, match_date, match_time, home_team, away_team')
        .gte('week_num', 41)
        .limit(500);
      if (bultenData) {
        const newMap: Record<number, any[]> = {};
        let maxWeek = 0;
        bultenData.forEach((row) => {
          if (!newMap[row.week_num]) newMap[row.week_num] = [];
          newMap[row.week_num].push({
            id: row.match_index,
            weekLabel: `${getDisplayWeek(row.week_num)} - ${row.match_index}. MAÇ`,
            category: row.category,
            date: row.match_date,
            time: row.match_time,
            homeTeam: row.home_team,
            awayTeam: row.away_team
          });
          if (row.week_num > maxWeek) maxWeek = row.week_num;
        });

        Object.keys(newMap).forEach((week) => {
          newMap[Number(week)].sort((a, b) => a.id - b.id);
        });
        setBulletinMap(newMap);

        if (maxWeek > 0) {
          setActiveBulletinWeek(maxWeek);
          setSelectedTahminWeek(maxWeek);
        }
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    // Sadece Tahminmatik ekranında canlı skorlara ihtiyaç var (entry ve declaration ekranlarında boşuna çekme!)
    if (view !== 'tahminmatik' || !selectedTahminWeek) return;

    const fetchLiveMatchStatuses = async () => {
      const { data } = await supabase
        .from('live_matches')
        .select('id, status, home_score, away_score')
        .gte('id', selectedTahminWeek * 100)
        .lt('id', (selectedTahminWeek + 1) * 100);

      if (data) {
        const statusMap: Record<number, { status: string; score: string }> = {};
        data.forEach((m) => {
          const matchIndex = m.id % 100;
          statusMap[matchIndex] = {
            status: m.status,
            score: `${m.home_score}-${m.away_score}`.replace(/\s+/g, '')
          };
        });
        setLiveMatchStatus(statusMap);
      }
    };

    fetchLiveMatchStatuses();
  }, [selectedTahminWeek, view]);

  useEffect(() => {
    // Sadece Lobi ekranındayken Yapanlar / Eksikler panosunu güncelle
    if (view !== 'lobby' || activeBulletinWeek === 0 || Object.keys(mergedAccounts).length === 0) return;

    const fetchPlayerStatus = async () => {
      // 1.300 satırı çekmek yerine ilk 3 maçtan herhangi birine tahmin girmiş olanları çek (~54-150 satır = %90 Egress tasarrufu + 1000 satır limitine takılmaz!)
      const { data: preds } = await supabase
        .from('player_predictions')
        .select('user_id')
        .eq('week_num', activeBulletinWeek)
        .lte('match_index', 6)
        .limit(500);

      const submittedUserIds = new Set((preds || []).map((p) => String(p.user_id)));
      // Parça kayıt ihtimaline karşı son maçlara girmiş olan varsa ve sayı 54'ten azsa tek hafif kontrol daha yap
      if (submittedUserIds.size < 45) {
        const { data: latePreds } = await supabase
          .from('player_predictions')
          .select('user_id')
          .eq('week_num', activeBulletinWeek)
          .gt('match_index', 6)
          .lte('match_index', 15)
          .limit(500);
        (latePreds || []).forEach((p) => submittedUserIds.add(String(p.user_id)));
      }

      const allUserIds = Object.keys(mergedAccounts).filter(
        (id) => id !== 'mankoman' && id !== '272727' && id !== '262787'
      );

      const missingIds = allUserIds.filter((id) => !submittedUserIds.has(id));
      const submittedIds = allUserIds.filter((id) => submittedUserIds.has(id));

      const missingNames = missingIds
        .map((id) => mergedAccounts[id].name)
        .sort((a, b) => a.localeCompare(b, 'tr'));
      const submittedNames = submittedIds
        .map((id) => mergedAccounts[id].name)
        .sort((a, b) => a.localeCompare(b, 'tr'));

      setMissingPlayersNeon(missingNames);
      setSubmittedPlayersNeon(submittedNames);
    };

    fetchPlayerStatus();
  }, [activeBulletinWeek, mergedAccounts, view]);

  useEffect(() => {
    if ((view !== 'declaration' && view !== 'tahminmatik') || !selectedTahminWeek) return;

    // Aynı haftanın deklarasyon verisi zaten hafızadaysa ve son 2 dakikada çekildiyse tekrar 1.300 satır indirme!
    if (livePredictionsData[selectedTahminWeek] && Object.keys(livePredictionsData[selectedTahminWeek]).length > 0) {
      return;
    }

    const fetchLivePreds = async () => {
      let allData: any[] = [];
      let from = 0;
      const step = 1000;
      let keepFetching = true;
      while (keepFetching) {
        const { data } = await supabase
          .from('player_predictions')
          .select('user_id, week_num, match_index, predicted_score')
          .eq('week_num', selectedTahminWeek)
          .range(from, from + step - 1);
        if (data && data.length > 0) {
          allData = [...allData, ...data];
          if (data.length < step) keepFetching = false;
          else from += step;
        } else {
          keepFetching = false;
        }
      }
      if (allData.length > 0) {
        const weekMap: Record<string, string[]> = {};
        allData.forEach((row) => {
          const uid = String(row.user_id);
          if (uid === 'mankoman' || uid === '272727' || uid === '262787') return;
          if (!weekMap[uid]) weekMap[uid] = Array(24).fill('PAS');
          weekMap[uid][row.match_index - 1] = row.predicted_score;
        });
        setLivePredictionsData((prev) => ({ ...prev, [selectedTahminWeek]: weekMap }));
      }
    };

    fetchLivePreds();
  }, [selectedTahminWeek, view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!username.trim() || !password.trim()) {
      setLoginError('Lütfen ID ve Şifrenizi boş bırakmayın.');
      return;
    }

    if (username.trim().toLowerCase() === 'mankoman') {
      setLoginError('❌ DİKKAT! Yönetici hesaplarıyla tahmine girilemez!');
      return;
    }

    const userKey = username.trim();
    const passKey = password.trim();
    const account = mergedAccounts[userKey];

    if (account && String(passKey) === String(account.pass)) {
      setDisplayName(account.name);
      try {
     localStorage.setItem('etml_visitor_identity', JSON.stringify({ userId: userKey, name: account.name }));
     window.dispatchEvent(new CustomEvent('etml-identity-updated'));
   } catch {}
      await fetchBulletinAndPredictions(userKey);
      setView('entry');
    } else {
      setLoginError('ID veya Şifre Hatalı! Lütfen bilgilerinizi kontrol ediniz.');
    }
  };

  const fetchBulletinAndPredictions = async (currentUsername: string) => {
    const bData = bulletinMap[activeBulletinWeek] || [];
    const { data: pData } = await supabase
      .from('player_predictions')
      .select('match_index, predicted_score')
      .eq('week_num', activeBulletinWeek)
      .eq('user_id', currentUsername);
    if (bData && bData.length > 0) {
      const initialPreds: Record<number, { home: string; away: string }> = {};
      bData.forEach((m: any) => {
        const existingPred = pData?.find((p) => p.match_index === m.id);
        if (
          existingPred &&
          existingPred.predicted_score &&
          existingPred.predicted_score !== 'PAS' &&
          existingPred.predicted_score !== '---'
        ) {
          const [h, a] = existingPred.predicted_score.split('-');
          initialPreds[m.id] = { home: h || '-', away: a || '-' };
        } else {
          initialPreds[m.id] = { home: '-', away: '-' };
        }
      });
      setPredictions(initialPreds);
      setOldPredictions(JSON.parse(JSON.stringify(initialPreds)));
    }
  };

  // KOTA SİSTEMİ: BİR SKOR EN FAZLA 6 KERE SEÇİLEBİLİR (%25 Kuralı)
  const handleScoreChange = (matchIndex: number, team: 'home' | 'away', score: string) => {
    setPredictions((prev) => {
      const currentMatch = prev[matchIndex] || { home: '-', away: '-' };
      const newHome = team === 'home' ? score : currentMatch.home;
      const newAway = team === 'away' ? score : currentMatch.away;

      if (newHome !== '-' && newAway !== '-') {
        const proposedScore = `${newHome}-${newAway}`;
        let usageCount = 0;
        Object.keys(prev).forEach((key) => {
          if (Number(key) !== matchIndex) {
            const m = prev[Number(key)];
            if (`${m.home}-${m.away}` === proposedScore) {
              usageCount++;
            }
          }
        });

        if (usageCount >= 6) {
          alert(
            `⚠️ DİKKAT SAYIN TAHMİNCİM !!!\nBir bültende aynı skoru (Örn: ${proposedScore}) en fazla 6 kere kullanabilirsiniz!\n\n(%25 Kuralı)`
          );
          return prev;
        }
      }

      return { ...prev, [matchIndex]: { home: newHome, away: newAway } };
    });
  };

  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => {
    setTahminmatikScores((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val }
    }));
  };

  // KAOS MOTORU: BOŞ MAÇLARI RASTGELE DOLDURUR VE 6 LİMİTİNE UYAR
  const handleTahminMatikRastgele = () => {
    setPredictions((prev) => {
      const newPreds = { ...prev };
      const scoreCounts: Record<string, number> = {};

      Object.keys(newPreds).forEach((key) => {
        const m = newPreds[Number(key)];
        if (m.home !== '-' && m.away !== '-') {
          const s = `${m.home}-${m.away}`;
          scoreCounts[s] = (scoreCounts[s] || 0) + 1;
        }
      });

      const generateValidRandomScore = () => {
        let attempts = 0;
        while (attempts < 200) {
          const isAbsurd = Math.random() > 0.3;
          let h, a;

          if (isAbsurd) {
            const absurdPool = [
              [5, 4],
              [4, 5],
              [8, 7],
              [7, 8],
              [10, 9],
              [9, 10],
              [4, 3],
              [3, 4],
              [6, 5],
              [5, 6],
              [7, 5],
              [5, 7],
              [11, 10],
              [10, 11],
              [9, 3],
              [12, 1],
              [8, 8],
              [5, 5]
            ];
            const pick = absurdPool[Math.floor(Math.random() * absurdPool.length)];
            h = pick[0];
            a = pick[1];
          } else {
            h = Math.floor(Math.random() * 4);
            a = Math.floor(Math.random() * 4);
          }

          const s = `${h}-${a}`;
          if ((scoreCounts[s] || 0) < 6) {
            scoreCounts[s] = (scoreCounts[s] || 0) + 1;
            return { home: h.toString(), away: a.toString() };
          }
          attempts++;
        }
        return { home: '1', away: '1' };
      };

      Object.keys(newPreds).forEach((matchIndex) => {
        const matchObj = bulletinMap[activeBulletinWeek]?.find((m: any) => m.id === Number(matchIndex));
        const isLocked = matchObj && now >= getMatchTimeMs(matchObj.date, matchObj.time) - 60000;

        if (!isLocked && (newPreds[Number(matchIndex)].home === '-' || newPreds[Number(matchIndex)].away === '-')) {
          newPreds[Number(matchIndex)] = generateValidRandomScore();
        }
      });
      return newPreds;
    });
  };

  const savePredictions = async () => {
    setIsSaving(true);
    try {
      const payload = Object.keys(predictions)
        .map((matchIndex) => {
          const matchObj = bulletinMap[activeBulletinWeek]?.find((m: any) => m.id === Number(matchIndex));
          const isLocked = matchObj && now >= getMatchTimeMs(matchObj.date, matchObj.time) - 60000;

          if (isLocked) return null;

          const hVal = predictions[Number(matchIndex)].home;
          const aVal = predictions[Number(matchIndex)].away;
          if (hVal === '-' || aVal === '-') return null;

          return {
            user_id: username.trim(),
            week_num: activeBulletinWeek,
            match_index: Number(matchIndex),
            predicted_score: `${hVal}-${aVal}`
          };
        })
        .filter((p) => p !== null);

      if (payload.length > 0) {
        const { error } = await supabase
          .from('player_predictions')
          .upsert(payload, { onConflict: 'user_id,week_num,match_index' });
        if (error) throw error;
      }
      setLivePredictionsData((prev) => {
        const next = { ...prev };
        delete next[activeBulletinWeek];
        return next;
      });
      setShowSuccessModal(true);

      setShowSuccessModal(true);
    } catch {
      alert('❌ Kayıt sırasında bir hata oluştu!');
    }
    setIsSaving(false);
  };

  const toggleSortOrder = () => {
    if (sortOrder === 'A-Z') setSortOrder('Z-A');
    else if (sortOrder === 'Z-A') setSortOrder('ZAMAN');
    else setSortOrder('A-Z');
  };

  const finalPlayersList = useMemo(() => {
    let allIds = Object.keys(mergedAccounts).filter(
      (id) => id !== 'mankoman' && id !== '272727' && id !== '262787'
    );
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};

    if (searchTerm) {
      const normalizedSearch = normalizeTurkish(searchTerm);
      allIds = allIds.filter((id) => {
        const pName = normalizeTurkish(mergedAccounts[id]?.name || '');
        return pName.includes(normalizedSearch);
      });
    }
    const submittedIds = allIds.filter(
      (id) => selectedWeekData[id] && selectedWeekData[id].some((s) => s !== 'PAS' && s !== '-')
    );

    if (sortOrder === 'A-Z') {
      submittedIds.sort((a, b) => mergedAccounts[a].name.localeCompare(mergedAccounts[b].name, 'tr'));
    } else if (sortOrder === 'Z-A') {
      submittedIds.sort((a, b) => mergedAccounts[b].name.localeCompare(mergedAccounts[a].name, 'tr'));
    }
    return submittedIds;
  }, [searchTerm, sortOrder, selectedTahminWeek, livePredictionsData, mergedAccounts]);

  const activePlayersForJPEG = useMemo(() => {
    const selectedWeekData = livePredictionsData[selectedTahminWeek] || {};
    return Object.keys(mergedAccounts)
      .filter(
        (id) =>
          id !== 'mankoman' &&
          id !== '272727' &&
          id !== '262787' &&
          selectedWeekData[id] &&
          selectedWeekData[id].some((s) => s !== 'PAS' && s !== '-')
      )
      .sort((a, b) => mergedAccounts[a].name.localeCompare(mergedAccounts[b].name, 'tr'));
  }, [selectedTahminWeek, livePredictionsData, mergedAccounts]);

  const ghostColumns = Array.from({ length: 10 });

  const downloadJPEG = async () => {
    setIsDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const htmlToImage = await import('html-to-image');
      const element = document.getElementById('jpeg-export-container');
      if (!element) throw new Error('Stüdyo elementi bulunamadı');
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        backgroundColor: '#050b14',
        pixelRatio: 1.5
      });
      const link = document.createElement('a');
      link.download = `ETM_Lig_${selectedTahminWeek}_Hafta_Tahminler.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      alert('HATA: Fotoğraf motoru bir engele takıldı. Detay: ' + error.message);
    }
    setIsDownloading(false);
  };

  const activeMatchesList = bulletinMap[activeBulletinWeek] || [];
  const selectedWeekMatchesList = bulletinMap[selectedTahminWeek] || [];

  const filledCount = Object.values(predictions).filter((p) => p.home !== '-' && p.away !== '-').length;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24 transition-opacity duration-500">
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
            <div className="text-6xl mb-6 mt-2 drop-shadow-lg">🏆</div>
            <h3 className="text-3xl font-black text-emerald-400 mb-3 tracking-widest">TEBRİKLER!</h3>
            <p className="text-slate-300 font-medium mb-8 text-sm leading-relaxed">
              Tahminleriniz sisteme kaydedilmiştir. (İsterseniz daha sonra kilitlenmemiş maçlarınızı güncelleyebilirsiniz.)
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setView('lobby');
                setUsername('');
                setPassword('');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase"
            >
              TAMAM
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto pt-6 sm:pt-10">
        {view === 'lobby' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 tracking-tighter mb-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                ETM LİGİ MERKEZ PORTALI
              </h1>
              <p className="text-amber-500 font-bold tracking-widest text-sm md:text-base">
                Lütfen tahminlerinizi buradan yapın.
              </p>
              <div className="mt-6 animate-bounce">
                <span className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(37,99,235,0.6)]">
                  ⬇️
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto items-stretch">
              {/* 1. KÜP (ÜST SOL): GİRİŞ KUTUSU */}
              <div className="bg-[#0b1120] border border-amber-500/50 rounded-3xl p-8 relative flex flex-col justify-center items-center shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-400 hover:shadow-[0_0_40px_rgba(245,158,11,0.3)] transition-all h-[400px]">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-950 text-amber-400 px-6 py-1 rounded-full text-xs font-black tracking-widest border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.5)] whitespace-nowrap">
                  TAHMİNLER AÇIK (PARÇA KAYIT)
                </div>

                <form onSubmit={handleLogin} className="w-full max-w-[280px] flex flex-col gap-4 mt-4">
                  <div className="flex flex-col items-center gap-1.5 w-full relative group">
                    <span className="text-[10px] text-amber-500 font-black tracking-widest uppercase flex items-center gap-2">
                      <span className="animate-bounce text-base">⬇️</span> DİKKAT: HAFTAYI SEÇ{' '}
                      <span className="animate-bounce text-base">⬇️</span>
                    </span>

                    <div className="w-full relative flex items-center justify-center">
                      <span className="absolute -left-7 text-xl animate-pulse hidden sm:block">👉</span>
                      {availableWeeks.length > 0 ? (
                        <select
                          value={activeBulletinWeek}
                          onChange={(e) => setActiveBulletinWeek(Number(e.target.value))}
                          className="w-full bg-slate-950 border-2 border-amber-500 text-amber-400 text-sm font-black px-4 py-2.5 rounded-xl outline-none focus:border-amber-400 text-center tracking-widest cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all appearance-none"
                          style={{ textAlignLast: 'center' }}
                        >
                          {availableWeeks.map((w) => (
                            <option key={`opt-${w}`} value={w}>
                              {getDisplayWeek(w)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full bg-slate-950 border-2 border-slate-700 text-amber-400 text-sm font-black px-4 py-2.5 rounded-xl outline-none text-center tracking-widest cursor-not-allowed">
                          BÜLTEN BEKLENİYOR
                        </div>
                      )}
                      <span className="absolute -right-7 text-xl animate-pulse hidden sm:block">👈</span>
                    </div>

                    <p className="text-[8px] sm:text-[9px] font-black text-rose-400 tracking-wide text-center mt-1 bg-rose-950/40 px-2 py-1.5 rounded-lg border border-rose-900/50 leading-tight">
                      ⚠️ TIKLA VE DEĞİŞTİR! SONRA ÜZÜLME!
                    </p>
                  </div>

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-widest text-sm shadow-inner placeholder:text-slate-400 placeholder:font-bold lowercase"
                    placeholder="ID GİRİNİZ"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent text-slate-900 px-4 py-2.5 rounded-xl outline-none focus:border-blue-500 text-center font-black tracking-[0.4em] text-lg shadow-inner placeholder:text-slate-400 placeholder:font-bold placeholder:tracking-normal"
                    placeholder="ŞİFRE"
                  />
                  {loginError && (
                    <p className="text-[10px] text-red-400 font-bold text-center bg-red-950/50 py-1.5 px-2 rounded-lg border border-red-500/30 leading-tight">
                      {loginError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black tracking-widest py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] mt-1 uppercase text-sm"
                  >
                    GİRİŞ YAP VE DOLDUR
                  </button>
                </form>
              </div>

              {/* 2. KÜP (ÜST SAĞ): ÇİFT TARAFLI DURUM PANOSU */}
              <div className="bg-[#0a0f16] border border-slate-700 rounded-3xl p-6 relative flex flex-col justify-start items-center shadow-xl h-[400px]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-slate-300 px-8 py-2 rounded-full text-[11px] font-black tracking-[0.2em] border border-slate-600 shadow-[0_0_15px_rgba(0,0,0,0.8)] whitespace-nowrap">
                  ⚡ {activeBulletinWeek}. HAFTA TAHMİN DURUMU ⚡
                </div>

                <div className="mt-6 flex flex-row gap-3 w-full h-full overflow-hidden">
                  {/* YAPANLAR */}
                  <div className="flex-1 flex flex-col border border-emerald-600 rounded-xl bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden">
                    <div className="bg-emerald-950/80 text-emerald-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-emerald-800/50 sticky top-0 z-10">
                      🟢 YAPANLAR ({submittedPlayersNeon.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 h-full">
                      {submittedPlayersNeon.map((name, idx) => (
                        <div
                          key={`sub-${idx}`}
                          className="bg-emerald-950/40 border border-emerald-800/40 px-2 py-1.5 rounded text-[9px] font-black text-emerald-300 tracking-wider truncate text-center shadow-inner shrink-0"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* YAPMAYANLAR */}
                  <div className="flex-1 flex flex-col border border-red-600 rounded-xl bg-red-950/20 shadow-[0_0_15px_rgba(220,38,38,0.2)] overflow-hidden">
                    <div className="bg-red-950/80 text-red-400 text-[10px] font-black tracking-widest text-center py-2.5 border-b border-red-800/50 sticky top-0 z-10">
                      🔴 EKSİKLER ({missingPlayersNeon.length})
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5 h-full">
                      {missingPlayersNeon.map((name, idx) => (
                        <div
                          key={`mis-${idx}`}
                          className="bg-red-950/40 border border-red-800/40 px-2 py-1.5 rounded text-[9px] font-black text-red-300 tracking-wider truncate text-center shadow-inner shrink-0"
                        >
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. KÜP (ALT SOL): RESMİ DEKLARASYON */}
              <div className="bg-[#0b1120] border border-blue-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(30,58,138,0.2)] hover:border-blue-700 transition-all h-[300px]">
                <div className="w-16 h-16 bg-blue-950 rounded-full flex items-center justify-center mb-4 shadow-inner border border-blue-800">
                  <span className="text-3xl drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">📜</span>
                </div>
                <h2 className="text-blue-400 font-black tracking-widest text-lg mb-2">RESMİ DEKLARASYON</h2>
                <p className="text-slate-400 text-[10px] font-bold mb-3 bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-900/50 tracking-widest uppercase">
                  Şu ana kadar {submittedPlayersNeon.length} kişi hedefini belirledi
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mb-5">
                  Maçı başlayan yarışmacıların skor tercihleri şeffaf bir şekilde sergilenir. Başlamamış maçlar gizlidir.
                </p>
                <button
                  onClick={() => {
                    setView('declaration');
                    setSelectedTahminWeek(activeBulletinWeek);
                  }}
                  className="bg-blue-950 hover:bg-blue-900 text-blue-400 font-bold tracking-widest py-3 px-8 rounded-xl border border-blue-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  RESMİ DEKLARASYONU AÇ
                </button>
              </div>

              {/* 4. KÜP (ALT SAĞ): TAHMİNMATİK */}
              <div className="bg-[#05100a] border border-emerald-900 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(6,78,59,0.2)] hover:border-emerald-700 transition-all h-[300px]">
                <div className="w-16 h-16 bg-emerald-950 rounded-full flex items-center justify-center mb-4 shadow-inner border border-emerald-800">
                  <span className="text-3xl drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">⚡</span>
                </div>
                <h2 className="text-emerald-500 font-black tracking-widest text-lg mb-2">TAHMİNMATİK</h2>
                <p className="text-slate-400 text-[10px] font-bold mb-3 bg-emerald-950/50 px-3 py-1 rounded-lg border border-emerald-900/50 tracking-widest uppercase">
                  Canlı Radar ve Skor Bildirim Merkezi
                </p>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-[280px] mb-5">
                  Maç başladığı an kilit kalkar, skoru kimin tahmin ettiğini ve alınan puanları anında görürsünüz.
                </p>
                <button
                  onClick={() => {
                    setView('tahminmatik');
                    setSelectedTahminWeek(activeBulletinWeek);
                  }}
                  className="bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-500 font-bold tracking-widest py-3 px-8 rounded-xl border border-emerald-800/50 transition-all text-xs uppercase shadow-md hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                >
                  TAHMİNMATİK CANLI İZLE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================== ELİT TAHMİN GİRİŞ PORTALI (ŞİFRELİ YARIŞMACI EKRANI) ===================== */}
        {view === 'entry' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 bg-slate-900/60 p-5 sm:p-6 rounded-2xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <div className="text-center sm:text-left flex flex-col items-center sm:items-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-500 tracking-widest uppercase">
                  {getDisplayWeek(activeBulletinWeek)} GÖREV KAĞIDI
                </h2>
                <p className="text-slate-400 text-sm">
                  Yarışmacı: <span className="text-white font-bold">{displayName}</span>
                </p>
                {/* FAVORİ KULÜP ARMASI SEÇİCİ */}
                <FavoriteTeamSelector userId={username.trim()} playerName={displayName} />
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2">
                <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-600/40 px-3 py-1 rounded-full tracking-wider">
                  DOLDURULAN: {filledCount} / {activeMatchesList.length} MAÇ
                </span>
                <button
                  onClick={() => {
                    setView('lobby');
                    setUsername('');
                    setPassword('');
                  }}
                  className="text-red-400 hover:text-red-300 font-bold bg-red-950/30 px-5 py-2.5 rounded-xl border border-red-900/50 shadow-md text-xs uppercase tracking-wider"
                >
                  Oturumu Kapat
                </button>
              </div>
            </div>

            <div className="w-full max-w-4xl mx-auto bg-blue-950/40 border border-blue-500/30 p-3.5 rounded-xl mb-6 text-center shadow-inner">
              <p className="text-xs sm:text-sm font-bold text-sky-200">
                ⏳ Her maç kendi başlama saatinden <span className="text-amber-400 font-black">1 dakika önce</span> otomatik kilitlenir. Aynı skoru en fazla <span className="text-amber-400 font-black">6 kez</span> kullanabilirsiniz.
              </p>
            </div>

            {/* 24 MAÇLIK KART IZGARASI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto mb-8">
              {activeMatchesList.map((match: any) => {
                const kickoffMs = getMatchTimeMs(match.date, match.time);
                const isLocked = kickoffMs > 0 && now >= kickoffMs - 60000;
                const isTff = isTffMatchCheck(match.category);
                const theme = getEliteTheme(
                  isTff && !String(match.category || '').toUpperCase().includes('TÜRKİYE')
                    ? `TÜRKİYE ${match.category}`
                    : match.category,
                  match.homeTeam?.toUpperCase(),
                  match.awayTeam?.toUpperCase()
                );

                const curPred = predictions[match.id] || { home: '-', away: '-' };
                const isFilled = curPred.home !== '-' && curPred.away !== '-';

                return (
                  <div
                    key={match.id}
                    className={`rounded-2xl border p-4 relative overflow-hidden transition-all ${
                      isLocked
                        ? 'bg-slate-950/80 border-slate-800 opacity-75'
                        : isFilled
                        ? 'bg-[#071528] border-emerald-500/50 shadow-md'
                        : 'bg-[#081020] border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-black tracking-wider mb-3 pb-2 border-b border-slate-800/80">
                      <span className="text-slate-400">
                        {match.id}. MAÇ • {match.date} {match.time}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded uppercase ${
                          isTff
                            ? 'bg-rose-950/70 text-rose-400 border border-rose-800/60'
                            : 'bg-sky-950/70 text-sky-400 border border-sky-800/60'
                        }`}
                      >
                        {isTff ? 'TFF' : 'DFO'}
                      </span>
                    </div>

                    <div className="text-center mb-2">
                      <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">
                        {match.category}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      {/* EV SAHİBİ */}
                      <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                        <img
                          src={theme.homeLogo}
                          alt={match.homeTeam}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                        <span className="text-[10.5px] sm:text-xs font-black text-white text-center uppercase leading-tight line-clamp-2">
                          {cleanTeamName(match.homeTeam)}
                        </span>
                      </div>

                      {/* SKOR SEÇİCİ */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          disabled={isLocked}
                          value={curPred.home}
                          onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                          className={`w-12 h-11 sm:w-14 sm:h-12 rounded-xl text-center font-black text-base sm:text-lg outline-none border transition-colors ${
                            isLocked
                              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-950 border-amber-500/60 text-amber-400 focus:border-amber-300 cursor-pointer'
                          }`}
                        >
                          {scoreOptionsArr.map((sc) => (
                            <option key={`h-${match.id}-${sc}`} value={sc}>
                              {sc}
                            </option>
                          ))}
                        </select>

                        <span className="text-slate-500 font-black text-lg">:</span>

                        <select
                          disabled={isLocked}
                          value={curPred.away}
                          onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                          className={`w-12 h-11 sm:w-14 sm:h-12 rounded-xl text-center font-black text-base sm:text-lg outline-none border transition-colors ${
                            isLocked
                              ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-slate-950 border-amber-500/60 text-amber-400 focus:border-amber-300 cursor-pointer'
                          }`}
                        >
                          {scoreOptionsArr.map((sc) => (
                            <option key={`a-${match.id}-${sc}`} value={sc}>
                              {sc}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* DEPLASMAN */}
                      <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                        <img
                          src={theme.awayLogo}
                          alt={match.awayTeam}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                        />
                        <span className="text-[10.5px] sm:text-xs font-black text-white text-center uppercase leading-tight line-clamp-2">
                          {cleanTeamName(match.awayTeam)}
                        </span>
                      </div>
                    </div>

                    {isLocked && (
                      <div className="mt-2.5 text-center">
                        <span className="text-[9.5px] font-black text-rose-400 bg-rose-950/60 border border-rose-800/60 px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                          🔒 KİLİTLİ (MAÇ BAŞLADI)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ALT KAYDET VE RASTGELE DOLDUR BUTONLARI */}
            <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
              <button
                type="button"
                onClick={handleTahminMatikRastgele}
                className="px-6 py-4 rounded-2xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-lg transition-all"
              >
                🎲 BOŞLARI RASTGELE DOLDUR
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={savePredictions}
                className="px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all"
              >
                {isSaving ? 'KAYDEDİLİYOR...' : '✅ TAHMİNLERİMİ MÜHÜRLE'}
              </button>
            </div>
          </div>
        )}

        {/* ===================== RESMİ DEKLARASYON ===================== */}
        {view === 'declaration' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-blue-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-blue-400 tracking-widest uppercase">
                  📜 {getDisplayWeek(selectedTahminWeek)} RESMİ DEKLARASYON
                </h2>
                <select
                  value={selectedTahminWeek}
                  onChange={(e) => setSelectedTahminWeek(Number(e.target.value))}
                  className="bg-slate-950 border border-blue-500/50 text-sky-300 text-xs font-black px-3 py-1.5 rounded-xl outline-none"
                >
                  {availableWeeks.map((w) => (
                    <option key={`dec-w-${w}`} value={w}>
                      {getDisplayWeek(w)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Yarışmacı ara..."
                  className="bg-slate-950 border border-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl outline-none focus:border-sky-400"
                />
                <button
                  onClick={toggleSortOrder}
                  className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-black px-3 py-2 rounded-xl border border-slate-700"
                >
                  Sıra: {sortOrder}
                </button>
                <button
                  onClick={downloadJPEG}
                  disabled={isDownloading}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl uppercase"
                >
                  {isDownloading ? 'İndiriliyor...' : '📸 JPG İndir'}
                </button>
                <button
                  onClick={() => setView('lobby')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-4 py-2 rounded-xl border border-slate-700"
                >
                  ← Geri
                </button>
              </div>
            </div>

            <div
              id="jpeg-export-container"
              className="overflow-x-auto bg-[#071126] border border-slate-800 rounded-2xl p-2 sm:p-4 shadow-xl"
            >
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#040a18] text-sky-200 border-b border-slate-800">
                    <th className="py-2.5 px-3 font-black sticky left-0 bg-[#040a18] z-20 min-w-[150px]">
                      YARIŞMACI ({finalPlayersList.length})
                    </th>
                    {selectedWeekMatchesList.map((m: any) => (
                      <th
                        key={`th-${m.id}`}
                        className="py-2 px-1.5 text-center font-black min-w-[54px] border-l border-slate-800/70"
                        title={`${m.homeTeam} - ${m.awayTeam}`}
                      >
                        <div className="text-[10px] text-amber-400">#{m.id}</div>
                        <div className="text-[8.5px] text-slate-400 truncate max-w-[52px]">
                          {m.homeTeam?.slice(0, 3)}-{m.awayTeam?.slice(0, 3)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {finalPlayersList.map((uid, rIdx) => {
                    const userPredArr = livePredictionsData[selectedTahminWeek]?.[uid] || [];
                    return (
                      <tr key={uid} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 font-black text-white sticky left-0 bg-[#071126] z-10 border-r border-slate-800 whitespace-nowrap">
                          <span className="text-slate-500 mr-1.5">{rIdx + 1}.</span>
                          {mergedAccounts[uid]?.name}
                        </td>
                        {selectedWeekMatchesList.map((m: any) => {
                          const kickoffMs = getMatchTimeMs(m.date, m.time);
                          const isStarted = kickoffMs > 0 && now >= kickoffMs;
                          const pred = userPredArr[m.id - 1] || '-';
                          return (
                            <td
                              key={`td-${uid}-${m.id}`}
                              className="py-1.5 px-1.5 text-center font-bold border-l border-slate-800/50"
                            >
                              {isStarted ? (
                                <span className="text-sky-300">{pred}</span>
                              ) : (
                                <span className="text-slate-600">🔒</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================== TAHMİNMATİK RADAR ===================== */}
        {view === 'tahminmatik' && (
          <div className="w-full animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-emerald-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-xl font-black text-emerald-400 tracking-widest uppercase">
                  ⚡ {getDisplayWeek(selectedTahminWeek)} TAHMİNMATİK RADAR
                </h2>
                <select
                  value={selectedTahminWeek}
                  onChange={(e) => setSelectedTahminWeek(Number(e.target.value))}
                  className="bg-slate-950 border border-emerald-500/50 text-emerald-300 text-xs font-black px-3 py-1.5 rounded-xl outline-none"
                >
                  {availableWeeks.map((w) => (
                    <option key={`tm-w-${w}`} value={w}>
                      {getDisplayWeek(w)}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setView('lobby')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black px-4 py-2 rounded-xl border border-slate-700"
              >
                ← Geri
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {selectedWeekMatchesList.map((m: any) => {
                const kickoffMs = getMatchTimeMs(m.date, m.time);
                const isStarted = kickoffMs > 0 && now >= kickoffMs;
                const liveInfo = liveMatchStatus[m.id];
                const customSc = tahminmatikScores[m.id] || { home: '-', away: '-' };
                const activeTargetScore =
                  customSc.home !== '-' && customSc.away !== '-'
                    ? `${customSc.home}-${customSc.away}`
                    : liveInfo?.score && !liveInfo.score.includes('-') === false && liveInfo.score !== '---'
                    ? liveInfo.score
                    : '';

                const matchedNames =
                  isStarted && activeTargetScore
                    ? activePlayersForJPEG
                        .filter((uid) => livePredictionsData[selectedTahminWeek]?.[uid]?.[m.id - 1] === activeTargetScore)
                        .map((uid) => mergedAccounts[uid]?.name)
                    : [];

                return (
                  <div key={`tm-${m.id}`} className="bg-[#071126] border border-slate-800 rounded-2xl p-4">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
                      <span>
                        #{m.id} • {m.date} {m.time}
                      </span>
                      {liveInfo?.score && (
                        <span className="text-emerald-400 font-black">Canlı: {liveInfo.score}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-black text-white flex-1 truncate">{m.homeTeam}</span>
                      <div className="flex items-center gap-1">
                        <select
                          disabled={!isStarted}
                          value={customSc.home}
                          onChange={(e) => handleTahminmatikChange(m.id, 'home', e.target.value)}
                          className="w-11 h-9 bg-slate-950 border border-slate-700 rounded-lg text-center text-xs font-black text-emerald-300"
                        >
                          {scoreOptionsArr.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-500 font-black">:</span>
                        <select
                          disabled={!isStarted}
                          value={customSc.away}
                          onChange={(e) => handleTahminmatikChange(m.id, 'away', e.target.value)}
                          className="w-11 h-9 bg-slate-950 border border-slate-700 rounded-lg text-center text-xs font-black text-emerald-300"
                        >
                          {scoreOptionsArr.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <span className="text-xs font-black text-white flex-1 text-right truncate">{m.awayTeam}</span>
                    </div>

                    {!isStarted ? (
                      <div className="text-[10px] text-slate-500 italic text-center">
                        🔒 Maç başladığında simülasyon açılır
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-300 bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-2">
                        {matchedNames.length > 0 ? (
                          <span>
                            <strong>{matchedNames.length} kişi:</strong> {matchedNames.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-400">Bu skoru bilen yok</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}