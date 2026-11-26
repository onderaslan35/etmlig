'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import {
  TEST_ACCOUNTS,
  normalizeTurkish,
  getEliteTheme,
  cleanTeamName,
  getMatchTimeMs,
  getWeekLabel,
  customWeekNames
} from '@/utils/themeEngine';
import FavoriteTeamSelector from '@/components/FavoriteTeamSelector';
import { getStandardCardPalette, isStrictTffMatch } from '@/utils/tffDetector';
import {
  PORTAL_SESSION_EVENT,
  PortalSession,
  readPortalSession
} from '@/components/PortalAuthGate';

const NON_COMPETING_IDS = new Set(['mankoman', '272727', '262787', '600060']);
const MAX_SAME_SCORE_LIMIT = 6;

export default function PredictionPortal() {
  const [portalSession, setPortalSession] = useState<PortalSession | null>(null);
  const [playerSubTab, setPlayerSubTab] = useState<'entry' | 'status' | 'declaration' | 'tahminmatik'>('entry');

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'A-Z' | 'Z-A' | 'ZAMAN'>('A-Z');

  const [bulletinMap, setBulletinMap] = useState<Record<number, any[]>>({});
  const [predictions, setPredictions] = useState<Record<number, { home: string; away: string }>>({});
  const [savedSnapshot, setSavedSnapshot] = useState<Record<number, { home: string; away: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [tahminmatikScores, setTahminmatikScores] = useState<Record<number, { home: string; away: string }>>({});

  // FOTMOB TARZI SKOR SEÇİCİ STATE'LERİ
  const [activePickerMatchId, setActivePickerMatchId] = useState<number | null>(null);
  const [activePickerSide, setActivePickerSide] = useState<'home' | 'away'>('home');
  const [autoAdvanceNext, setAutoAdvanceNext] = useState<boolean>(true);
  const [showHighScores, setShowHighScores] = useState<boolean>(false);
  const [pickerQuotaWarning, setPickerQuotaWarning] = useState<string>('');

  const [activeBulletinWeek, setActiveBulletinWeek] = useState<number>(0);
  const [selectedTahminWeek, setSelectedTahminWeek] = useState<number>(0);

  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string; name: string }>>(TEST_ACCOUNTS);

  const [liveMatchStatus, setLiveMatchStatus] = useState<Record<number, { status: string; score: string }>>({});
  const [livePredictionsData, setLivePredictionsData] = useState<Record<number, Record<string, string[]>>>({});

  const [missingPlayersNeon, setMissingPlayersNeon] = useState<string[]>([]);
  const [submittedPlayersNeon, setSubmittedPlayersNeon] = useState<string[]>([]);

  const scoreOptionsArr = ['-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];
  const quickDigits = ['0', '1', '2', '3', '4', '5'];
  const highDigits = ['6', '7', '8', '9', '10', '11', '12', '13', '14', '15'];

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
    const sync = () => setPortalSession(readPortalSession());
    sync();
    window.addEventListener(PORTAL_SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PORTAL_SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isVisitor = !portalSession || portalSession.role === 'visitor';
  const loggedUserId = portalSession?.role === 'player' ? String(portalSession.userId || '').trim() : '';
  const loggedUserName = portalSession?.role === 'player' ? portalSession.name : '';

  const effectiveView = isVisitor ? 'declaration' : playerSubTab;

  useEffect(() => {
    const fetchDbPlayers = async () => {
      const [playersRes, officialRes] = await Promise.all([
        supabase.from('players').select('*'),
        supabase.from('etml_official_players').select('*')
      ]);

      const newAccounts: Record<string, { pass: string; name: string }> = { ...TEST_ACCOUNTS };

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
            week_num: row.week_num,
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
    if (isVisitor || !loggedUserId || !activeBulletinWeek) return;
    const bData = bulletinMap[activeBulletinWeek] || [];
    if (bData.length === 0) return;

    let active = true;
    (async () => {
      const { data: pData } = await supabase
        .from('player_predictions')
        .select('match_index, predicted_score')
        .eq('week_num', activeBulletinWeek)
        .eq('user_id', loggedUserId);

      if (!active) return;

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
          initialPreds[m.id] = { home: h ?? '-', away: a ?? '-' };
        } else {
          initialPreds[m.id] = { home: '-', away: '-' };
        }
      });
      setPredictions(initialPreds);
      setSavedSnapshot(JSON.parse(JSON.stringify(initialPreds)));
    })();

    return () => {
      active = false;
    };
  }, [isVisitor, loggedUserId, activeBulletinWeek, bulletinMap]);

  useEffect(() => {
    if (effectiveView !== 'tahminmatik' || !selectedTahminWeek || isVisitor) return;

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
  }, [selectedTahminWeek, effectiveView, isVisitor]);

  useEffect(() => {
    if (effectiveView !== 'status' || isVisitor || activeBulletinWeek === 0 || Object.keys(mergedAccounts).length === 0) {
      return;
    }

    const fetchPlayerStatus = async () => {
      const { data: preds } = await supabase
        .from('player_predictions')
        .select('user_id')
        .eq('week_num', activeBulletinWeek)
        .lte('match_index', 6)
        .limit(500);

      const submittedUserIds = new Set((preds || []).map((p) => String(p.user_id)));
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

      const allUserIds = Object.keys(mergedAccounts).filter((id) => !NON_COMPETING_IDS.has(id));
      const missingIds = allUserIds.filter((id) => !submittedUserIds.has(id));
      const submittedIds = allUserIds.filter((id) => submittedUserIds.has(id));

      setMissingPlayersNeon(
        missingIds.map((id) => mergedAccounts[id].name).sort((a, b) => a.localeCompare(b, 'tr'))
      );
      setSubmittedPlayersNeon(
        submittedIds.map((id) => mergedAccounts[id].name).sort((a, b) => a.localeCompare(b, 'tr'))
      );
    };

    fetchPlayerStatus();
  }, [activeBulletinWeek, mergedAccounts, effectiveView, isVisitor]);

  useEffect(() => {
    if ((effectiveView !== 'declaration' && effectiveView !== 'tahminmatik') || !selectedTahminWeek) return;
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
          if (NON_COMPETING_IDS.has(uid)) return;
          if (!weekMap[uid]) weekMap[uid] = Array(24).fill('PAS');
          weekMap[uid][row.match_index - 1] = row.predicted_score;
        });
        setLivePredictionsData((prev) => ({ ...prev, [selectedTahminWeek]: weekMap }));
      }
    };

    fetchLivePreds();
  }, [selectedTahminWeek, effectiveView, livePredictionsData]);

  const activeMatchesList = useMemo(() => bulletinMap[activeBulletinWeek] || [], [bulletinMap, activeBulletinWeek]);
  const selectedWeekMatchesList = useMemo(() => bulletinMap[selectedTahminWeek] || [], [bulletinMap, selectedTahminWeek]);

  const isMatchLockedFn = useCallback(
    (m: any) => {
      if (!m) return true;
      const kMs = getMatchTimeMs(m.date, m.time);
      return kMs > 0 && now >= kMs - 60000;
    },
    [now]
  );

  const openFotmobPicker = (matchId: number, initialSide: 'home' | 'away' = 'home') => {
    const mObj = activeMatchesList.find((x: any) => x.id === matchId);
    if (!mObj || isMatchLockedFn(mObj)) return;
    setPickerQuotaWarning('');
    setShowHighScores(false);
    setActivePickerMatchId(matchId);
    setActivePickerSide(initialSide);
  };

  const goToAdjacentUnlockedMatch = useCallback(
    (dir: 1 | -1) => {
      if (activePickerMatchId === null) return;
      const unlocked = activeMatchesList.filter((m: any) => !isMatchLockedFn(m));
      if (unlocked.length === 0) return;
      const curIdx = unlocked.findIndex((m: any) => m.id === activePickerMatchId);
      const nextIdx = curIdx === -1 ? 0 : (curIdx + dir + unlocked.length) % unlocked.length;
      setPickerQuotaWarning('');
      setShowHighScores(false);
      setActivePickerMatchId(unlocked[nextIdx].id);
      setActivePickerSide('home');
    },
    [activePickerMatchId, activeMatchesList, isMatchLockedFn]
  );

  const handleFotmobDigitSelect = useCallback(
    (digitStr: string) => {
      if (activePickerMatchId === null) return;
      const mObj = activeMatchesList.find((x: any) => x.id === activePickerMatchId);
      if (!mObj || isMatchLockedFn(mObj)) return;

      const cur = predictions[activePickerMatchId] || { home: '-', away: '-' };
      const nextHome = activePickerSide === 'home' ? digitStr : cur.home;
      const nextAway = activePickerSide === 'away' ? digitStr : cur.away;

      // İki taraf da dolduysa 6 skor kotasını kontrol et
      if (nextHome !== '-' && nextAway !== '-') {
        const candidateScore = `${nextHome}-${nextAway}`;
        let usedElsewhere = 0;
        Object.keys(predictions).forEach((k) => {
          const idNum = Number(k);
          if (idNum !== activePickerMatchId) {
            const p = predictions[idNum];
            if (p && `${p.home}-${p.away}` === candidateScore) {
              usedElsewhere++;
            }
          }
        });

        if (usedElsewhere >= MAX_SAME_SCORE_LIMIT) {
          setPickerQuotaWarning(
            `⚠️ "${candidateScore}" skorunu bültende zaten ${MAX_SAME_SCORE_LIMIT} kez kullandınız! (%25 Kuralı)`
          );
          return;
        }
      }

      setPickerQuotaWarning('');
      setPredictions((prev) => ({
        ...prev,
        [activePickerMatchId]: { home: nextHome, away: nextAway }
      }));

      if (activePickerSide === 'home') {
        setActivePickerSide('away');
      } else if (autoAdvanceNext) {
        // Deplasman da girildiyse FotMob gibi yumuşakça sıradaki boş (veya kilitlenmemiş) maça geç
        setTimeout(() => {
          const unlocked = activeMatchesList.filter((m: any) => !isMatchLockedFn(m));
          const curPos = unlocked.findIndex((m: any) => m.id === activePickerMatchId);
          if (curPos !== -1 && curPos + 1 < unlocked.length) {
            setActivePickerMatchId(unlocked[curPos + 1].id);
            setActivePickerSide('home');
            setShowHighScores(false);
          }
        }, 240);
      }
    },
    [activePickerMatchId, activePickerSide, activeMatchesList, autoAdvanceNext, isMatchLockedFn, predictions]
  );

  const handleClearMatchScore = useCallback((matchIndex: number) => {
    setPickerQuotaWarning('');
    setPredictions((prev) => ({
      ...prev,
      [matchIndex]: { home: '-', away: '-' }
    }));
    setActivePickerSide('home');
  }, []);

  // Bilgisayar klavyesinden hızlı giriş desteği (0-9, Ok tuşları, Backspace, Enter, Esc)
  useEffect(() => {
    if (activePickerMatchId === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleFotmobDigitSelect(e.key);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActivePickerSide('home');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActivePickerSide('away');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleClearMatchScore(activePickerMatchId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        goToAdjacentUnlockedMatch(1);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActivePickerMatchId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activePickerMatchId, handleFotmobDigitSelect, handleClearMatchScore, goToAdjacentUnlockedMatch]);

  const scoreUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.values(predictions).forEach((p) => {
      if (p.home !== '-' && p.away !== '-') {
        const key = `${p.home}-${p.away}`;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  }, [predictions]);

  const overLimitScores = useMemo(() => {
    return Object.entries(scoreUsageCounts).filter(([, cnt]) => cnt > MAX_SAME_SCORE_LIMIT);
  }, [scoreUsageCounts]);

  const hasUnsavedChanges = useMemo(() => {
    return Object.keys(predictions).some((k) => {
      const idx = Number(k);
      const cur = predictions[idx];
      const old = savedSnapshot[idx] || { home: '-', away: '-' };
      return cur?.home !== old.home || cur?.away !== old.away;
    });
  }, [predictions, savedSnapshot]);

  const handleTahminmatikChange = (matchId: number, type: 'home' | 'away', val: string) => {
    setTahminmatikScores((prev) => ({
      ...prev,
      [matchId]: { ...(prev[matchId] || { home: '-', away: '-' }), [type]: val }
    }));
  };

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
          const h = Math.floor(Math.random() * 4);
          const a = Math.floor(Math.random() * 4);
          const s = `${h}-${a}`;
          if ((scoreCounts[s] || 0) < MAX_SAME_SCORE_LIMIT) {
            scoreCounts[s] = (scoreCounts[s] || 0) + 1;
            return { home: h.toString(), away: a.toString() };
          }
          attempts++;
        }
        return { home: '1', away: '0' };
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
    if (!loggedUserId) return;

    if (overLimitScores.length > 0) {
      const [badSc, badCnt] = overLimitScores[0];
      alert(
        `⚠️ KOTA AŞIMI!\n"${badSc}" skorunu bültende ${badCnt} kez seçtiniz.\nBir bültende aynı skoru en fazla ${MAX_SAME_SCORE_LIMIT} kez kullanabilirsiniz! (%25 Kuralı)`
      );
      return;
    }

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
            user_id: loggedUserId,
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

      setSavedSnapshot(JSON.parse(JSON.stringify(predictions)));
      setLivePredictionsData((prev) => {
        const next = { ...prev };
        delete next[activeBulletinWeek];
        return next;
      });
      setActivePickerMatchId(null);
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
    let allIds = Object.keys(mergedAccounts).filter((id) => !NON_COMPETING_IDS.has(id));
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
          !NON_COMPETING_IDS.has(id) &&
          selectedWeekData[id] &&
          selectedWeekData[id].some((s) => s !== 'PAS' && s !== '-')
      )
      .sort((a, b) => mergedAccounts[a].name.localeCompare(mergedAccounts[b].name, 'tr'));
  }, [selectedTahminWeek, livePredictionsData, mergedAccounts]);

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

  const filledCount = Object.values(predictions).filter((p) => p.home !== '-' && p.away !== '-').length;

  // Açık olan FotMob Seçici Maç Bilgisi
  const pickerMatchObj =
    activePickerMatchId !== null ? activeMatchesList.find((m: any) => m.id === activePickerMatchId) || null : null;

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 px-2 sm:px-4 pt-3 pb-28 font-sans">
      {/* KAYIT BAŞARILI MODALI */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#050b14]/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-7 max-w-md w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-black text-emerald-400 mb-2 tracking-widest">MÜHÜRLENDİ!</h3>
            <p className="text-slate-300 font-medium mb-6 text-xs sm:text-sm leading-relaxed">
              Tahminleriniz sisteme kaydedildi. Maç saatine 1 dakika kalana kadar istediğiniz maça dokunarak skorunuzu güncelleyebilirsiniz.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 rounded-xl uppercase cursor-pointer"
            >
              TAMAM
            </button>
          </div>
        </div>
      )}

      {/* ===================== FOTMOB TARZI HIZLI SKOR GİRİŞ PANELİ ===================== */}
      {pickerMatchObj && !isVisitor && (() => {
        const pPalette = getStandardCardPalette(
          pickerMatchObj.category,
          pickerMatchObj.homeTeam,
          pickerMatchObj.awayTeam
        );
        const pIsTff = pPalette.isTff;
        const pRawCat = String(
          pickerMatchObj.category && pickerMatchObj.category !== 'GENEL'
            ? pickerMatchObj.category
            : pIsTff
            ? 'TÜRKİYE SÜPER LİG'
            : 'AVRUPA FUTBOLU'
        ).trim();
        const pTheme: any = getEliteTheme(
          pIsTff && !pRawCat.toLocaleUpperCase('tr-TR').includes('TÜRKİYE') && !pRawCat.toUpperCase().includes('TFF')
            ? `TÜRKİYE ${pRawCat}`
            : pRawCat,
          String(pickerMatchObj.homeTeam || '').toUpperCase(),
          String(pickerMatchObj.awayTeam || '').toUpperCase()
        );
        const pCur = predictions[pickerMatchObj.id] || { home: '-', away: '-' };
        const pIsFilled = pCur.home !== '-' && pCur.away !== '-';
        const pKey = pIsFilled ? `${pCur.home}-${pCur.away}` : '';
        const pUsedCnt = pKey ? scoreUsageCounts[pKey] || 0 : 0;

        return (
          <div
            onClick={() => setActivePickerMatchId(null)}
            className="fixed inset-0 z-[115] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-t-2 sm:border-2 p-4 sm:p-5 shadow-[0_-10px_50px_rgba(0,0,0,0.9)] flex flex-col gap-3.5 select-none ${pPalette.cardOuterCls}`}
            >
              {/* ÜST GEZİNME ÇUBUĞU */}
              <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/15">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => goToAdjacentUnlockedMatch(-1)}
                    className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/80 border border-white/15 text-xs font-black text-white cursor-pointer"
                  >
                    ← Önceki
                  </button>
                  <button
                    type="button"
                    onClick={() => goToAdjacentUnlockedMatch(1)}
                    className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/80 border border-white/15 text-xs font-black text-white cursor-pointer"
                  >
                    Sonraki →
                  </button>
                </div>

                <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
                  {pickerMatchObj.id} / {activeMatchesList.length}. MAÇ
                </span>

                <button
                  type="button"
                  onClick={() => setActivePickerMatchId(null)}
                  className="w-7 h-7 rounded-full bg-black/60 hover:bg-rose-700 border border-white/20 text-white text-xs font-black flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* TAKIMLAR VE ORTA FOTMOB SKOR KUTULARI */}
              <div className="grid grid-cols-3 items-center gap-2 py-1">
                <div
                  onClick={() => setActivePickerSide('home')}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <img
                    src={pTheme.homeLogo}
                    alt={pickerMatchObj.homeTeam}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                  />
                  <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                    {cleanTeamName(pickerMatchObj.homeTeam)}
                  </span>
                </div>

                {/* İKİLİ AKTİF SKOR KUTUSU */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePickerSide('home')}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl tabular-nums transition-all cursor-pointer border-2 ${
                      activePickerSide === 'home'
                        ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.45)] scale-105'
                        : 'bg-black/70 text-white border-white/20 hover:border-white/50'
                    }`}
                  >
                    {pCur.home}
                  </button>

                  <span className="text-white/60 font-black text-xl">:</span>

                  <button
                    type="button"
                    onClick={() => setActivePickerSide('away')}
                    className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl font-black text-2xl sm:text-3xl tabular-nums transition-all cursor-pointer border-2 ${
                      activePickerSide === 'away'
                        ? 'bg-black text-emerald-300 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.45)] scale-105'
                        : 'bg-black/70 text-white border-white/20 hover:border-white/50'
                    }`}
                  >
                    {pCur.away}
                  </button>
                </div>

                <div
                  onClick={() => setActivePickerSide('away')}
                  className="flex flex-col items-center gap-1.5 cursor-pointer"
                >
                  <img
                    src={pTheme.awayLogo}
                    alt={pickerMatchObj.awayTeam}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.6)]"
                  />
                  <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                    {cleanTeamName(pickerMatchObj.awayTeam)}
                  </span>
                </div>
              </div>

              {/* REHBER & KOTA BİLGİSİ */}
              <div className="text-center">
                {pickerQuotaWarning ? (
                  <div className="px-3 py-1.5 rounded-xl bg-rose-950/90 border border-rose-400 text-rose-200 text-[11px] font-black">
                    {pickerQuotaWarning}
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-2 text-[10.5px] font-black">
                    <span className="text-emerald-300">
                      {activePickerSide === 'home' ? '👉 Ev Sahibi Golünü Seçin' : '👉 Deplasman Golünü Seçin'}
                    </span>
                    {pIsFilled ? (
                      <span className="text-amber-300">
                        {pKey} Kotası: {pUsedCnt}/{MAX_SAME_SCORE_LIMIT}
                      </span>
                    ) : (
                      <span className="text-slate-300">{pickerMatchObj.time}</span>
                    )}
                  </div>
                )}
              </div>

              {/* FOTMOB HIZLI RAKAM TUŞ TAKIMI (0 - 5 ANA SATIR) */}
              <div className="grid grid-cols-6 gap-2">
                {quickDigits.map((d) => {
                  const isSelectedNow =
                    (activePickerSide === 'home' && pCur.home === d) ||
                    (activePickerSide === 'away' && pCur.away === d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleFotmobDigitSelect(d)}
                      className={`h-12 sm:h-13 rounded-xl font-black text-lg sm:text-xl transition-all active:scale-95 cursor-pointer border ${
                        isSelectedNow
                          ? 'bg-emerald-500 text-slate-950 border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                          : 'bg-[#050c1a]/90 hover:bg-slate-800 text-white border-white/15'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>

              {/* YÜKSEK SKORLAR (6 - 15) AÇILIR ALANI */}
              {showHighScores && (
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {highDigits.map((hd) => (
                    <button
                      key={hd}
                      type="button"
                      onClick={() => handleFotmobDigitSelect(hd)}
                      className="h-9 rounded-lg bg-[#050c1a]/90 hover:bg-slate-800 text-amber-300 border border-amber-500/30 font-black text-xs cursor-pointer"
                    >
                      {hd}
                    </button>
                  ))}
                </div>
              )}

              {/* ALT KONTROLLER: 6+ GOL, SIFIRLA, OTO-GEÇİŞ VE TAMAM */}
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15">
                <button
                  type="button"
                  onClick={() => setShowHighScores((prev) => !prev)}
                  className="px-2.5 py-2 rounded-xl bg-black/55 hover:bg-black/80 border border-white/15 text-[10px] font-black text-amber-300 cursor-pointer"
                >
                  {showHighScores ? '6+ Gizle ▲' : '6+ Gol ▼'}
                </button>

                <button
                  type="button"
                  onClick={() => handleClearMatchScore(pickerMatchObj.id)}
                  className="px-2.5 py-2 rounded-xl bg-black/55 hover:bg-rose-950 border border-white/15 text-[10px] font-black text-rose-300 cursor-pointer"
                >
                  ⌫ Sıfırla
                </button>

                <button
                  type="button"
                  onClick={() => setAutoAdvanceNext((prev) => !prev)}
                  className={`px-2.5 py-2 rounded-xl border text-[10px] font-black cursor-pointer ${
                    autoAdvanceNext
                      ? 'bg-sky-950/80 border-sky-400/60 text-sky-200'
                      : 'bg-black/50 border-white/15 text-slate-400'
                  }`}
                >
                  Oto-Geçiş: {autoAdvanceNext ? 'AÇIK' : 'KAPALI'}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePickerMatchId(null)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-6xl mx-auto space-y-4">
        {!isVisitor && (
          <div className="bg-[#071126] border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2 bg-[#040917] border border-amber-500/50 rounded-xl px-3 py-1.5">
              <span className="text-[10px] sm:text-xs font-black text-amber-400 uppercase">BÜLTEN:</span>
              <select
                value={activeBulletinWeek}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setActiveBulletinWeek(w);
                  setSelectedTahminWeek(w);
                }}
                className="bg-transparent text-white text-xs font-black outline-none cursor-pointer"
              >
                {availableWeeks.map((w) => (
                  <option key={w} value={w} className="bg-[#071126] text-white">
                    {getDisplayWeek(w)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { key: 'entry', label: '⚽ TAHMİNLERİM' },
                  { key: 'declaration', label: '📜 RESMİ DEKLARASYON' },
                  { key: 'tahminmatik', label: '⚡ TAHMİNMATİK' },
                  { key: 'status', label: '📋 YAPANLAR / EKSİKLER' }
                ] as const
              ).map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => {
                    setPlayerSubTab(t.key);
                    setSelectedTahminWeek(activeBulletinWeek);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider border transition-colors cursor-pointer ${
                    playerSubTab === t.key
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                      : 'bg-[#040917] text-slate-300 border-slate-800 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ===================== 1. FOTMOB TİPİ TEMİZ MAÇ KARTLARI ===================== */}
        {effectiveView === 'entry' && !isVisitor && (
          <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-[#071126] p-4 sm:p-5 rounded-2xl border border-amber-500/35 shadow-lg max-w-5xl mx-auto">
              <div className="flex flex-col items-center sm:items-start gap-1.5">
                <h2 className="text-base sm:text-xl font-black text-amber-400 tracking-wider uppercase">
                  {getDisplayWeek(activeBulletinWeek)} • TAHMİN KARTLARI
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Yarışmacı: <span className="text-white font-black uppercase">{loggedUserName}</span>
                </p>
                <FavoriteTeamSelector userId={loggedUserId} playerName={loggedUserName} />
              </div>

              <div className="flex flex-col items-center sm:items-end gap-2">
                <span className="text-xs font-black text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 px-3.5 py-1 rounded-full">
                  DOLDURULAN: {filledCount} / {activeMatchesList.length} MAÇ
                </span>
                <button
                  type="button"
                  onClick={handleTahminMatikRastgele}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer"
                >
                  🎲 Boş Maçları Rastgele Doldur
                </button>
              </div>
            </div>

            {/* 24 MAÇ KARTI - BİREBİR ARŞİV / CANLI GÖRÜNÜMÜ + FOTMOB DOKUNMATİK SKOR KUTUSU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {activeMatchesList.map((match: any) => {
                const isLocked = isMatchLockedFn(match);

                const palette = getStandardCardPalette(match.category, match.homeTeam, match.awayTeam);
                const isTff = palette.isTff;

                const rawCat = String(
                  match.category && match.category !== 'GENEL'
                    ? match.category
                    : isTff
                    ? 'TÜRKİYE SÜPER LİG'
                    : 'AVRUPA FUTBOLU'
                ).trim();

                const theme: any = getEliteTheme(
                  isTff && !rawCat.toLocaleUpperCase('tr-TR').includes('TÜRKİYE') && !rawCat.toUpperCase().includes('TFF')
                    ? `TÜRKİYE ${rawCat}`
                    : rawCat,
                  String(match.homeTeam || '').toUpperCase(),
                  String(match.awayTeam || '').toUpperCase()
                );

                const leagueTitle = String(
                  theme?.leagueName || theme?.title || rawCat || (isTff ? 'TÜRKİYE TFF' : 'DFO AVRUPA')
                ).toUpperCase();

                const leagueLogo = String(
                  theme?.leagueLogo || theme?.catLogo || theme?.tournamentLogo || ''
                ).trim();

                const curPred = predictions[match.id] || { home: '-', away: '-' };
                const isFilled = curPred.home !== '-' && curPred.away !== '-';
                const curScoreKey = isFilled ? `${curPred.home}-${curPred.away}` : '';
                const sameScoreCount = curScoreKey ? scoreUsageCounts[curScoreKey] || 0 : 0;
                const isOverQuota = sameScoreCount > MAX_SAME_SCORE_LIMIT;

                return (
                  <div
                    key={match.id}
                    onClick={() => {
                      if (!isLocked) openFotmobPicker(match.id, 'home');
                    }}
                    className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col gap-3 transition-all select-none ${palette.cardOuterCls} ${
                      isLocked
                        ? 'opacity-70 saturate-75 cursor-not-allowed'
                        : isOverQuota
                        ? 'ring-2 ring-rose-500 cursor-pointer'
                        : isFilled
                        ? 'ring-2 ring-emerald-400/75 cursor-pointer hover:brightness-110'
                        : 'cursor-pointer hover:brightness-110'
                    }`}
                  >
                    {/* ÜST HAFTA VE SAAT ŞERİDİ */}
                    <div className="flex items-center justify-center text-[10px] sm:text-[10.5px] font-black tracking-wider text-slate-200 uppercase">
                      <span>
                        {activeBulletinWeek}. HAFTA {match.id}. MAÇ
                        {match.date ? ` • ${match.date}` : ''}
                        {match.time ? ` ${match.time}` : ''}
                      </span>
                    </div>

                    {/* LİG BANNER */}
                    <div
                      className={`w-full py-1.5 px-3 rounded-xl border text-center text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate ${palette.bannerCls}`}
                    >
                      {leagueTitle}
                    </div>

                    {/* ORTA 3 SÜTUN: EV SAHİBİ - FOTMOB SKOR PİLL - DEPLASMAN */}
                    <div className="grid grid-cols-3 items-center gap-2 py-1.5">
                      <div className="flex flex-col items-center gap-2 min-w-0">
                        <img
                          src={theme.homeLogo}
                          alt={match.homeTeam}
                          className="w-[66px] h-[66px] sm:w-[76px] sm:h-[76px] object-contain shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                          loading="lazy"
                        />
                        <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                          {cleanTeamName(match.homeTeam)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-1.5">
                        {leagueLogo && (
                          <img
                            src={leagueLogo}
                            alt={leagueTitle}
                            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow"
                            loading="lazy"
                          />
                        )}

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            isLocked
                              ? 'bg-slate-900/90 text-slate-400 border-slate-700'
                              : isFilled
                              ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400/70'
                              : 'bg-amber-950/80 text-amber-300 border-amber-400/60'
                          }`}
                        >
                          {isLocked ? '🔒 KİLİTLİ' : isFilled ? '✓ TAHMİNİN' : 'SKOR GİR'}
                        </span>

                        {/* FOTMOB İKİLİ DOKUNMATİK SKOR KUTUSU */}
                        <div
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-xl border shadow-inner transition-transform ${
                            isFilled
                              ? 'bg-black/85 border-emerald-400/70'
                              : 'bg-black/70 border-white/20 hover:border-amber-400/80'
                          }`}
                        >
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              openFotmobPicker(match.id, 'home');
                            }}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-black text-lg sm:text-xl tabular-nums flex items-center justify-center cursor-pointer ${
                              isFilled
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-amber-300/80 hover:bg-white/15'
                            }`}
                          >
                            {curPred.home}
                          </button>

                          <span className="text-slate-400 font-black text-base">:</span>

                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              openFotmobPicker(match.id, 'away');
                            }}
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-black text-lg sm:text-xl tabular-nums flex items-center justify-center cursor-pointer ${
                              isFilled
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-amber-300/80 hover:bg-white/15'
                            }`}
                          >
                            {curPred.away}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 min-w-0">
                        <img
                          src={theme.awayLogo}
                          alt={match.awayTeam}
                          className="w-[66px] h-[66px] sm:w-[76px] sm:h-[76px] object-contain shrink-0 drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)]"
                          loading="lazy"
                        />
                        <span className="text-[10.5px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                          {cleanTeamName(match.awayTeam)}
                        </span>
                      </div>
                    </div>

                    {/* ALT BAR */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/15 text-[10px] font-black">
                      {isLocked ? (
                        <span className="text-slate-400">🔒 Maç başladı / kilitli</span>
                      ) : isOverQuota ? (
                        <span className="text-rose-300 animate-pulse">
                          ⚠️ {curScoreKey} skoru {sameScoreCount}/{MAX_SAME_SCORE_LIMIT} kez oldu!
                        </span>
                      ) : isFilled ? (
                        <span className="text-emerald-300">
                          Kota: {sameScoreCount}/{MAX_SAME_SCORE_LIMIT} • Değiştirmek için dokun
                        </span>
                      ) : (
                        <span className="text-slate-300">Skor girmek için karta dokun</span>
                      )}

                      <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase tracking-wider ${palette.poolPillCls}`}>
                        {isTff ? 'TFF MAÇI' : 'DFO MAÇI'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EKRAN ALTI SABİT MÜHÜRLEME ÇUBUĞU */}
            <div className="fixed bottom-14 sm:bottom-4 left-1/2 -translate-x-1/2 z-[85] w-[94%] max-w-xl bg-[#040a18]/95 backdrop-blur-md border-2 border-emerald-500/70 rounded-2xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3">
              <div className="text-left min-w-0">
                <div className="text-[11px] sm:text-xs font-black text-white truncate">
                  {hasUnsavedChanges
                    ? '⚡ Kaydedilmemiş tahminleriniz var!'
                    : `✓ ${filledCount}/${activeMatchesList.length} maç hazır`}
                </div>
                <div className="text-[9.5px] font-bold text-emerald-300">
                  {overLimitScores.length > 0
                    ? `⚠️ ${overLimitScores[0][0]} skoru sınırı aştı (${overLimitScores[0][1]}/${MAX_SAME_SCORE_LIMIT})`
                    : `Aynı skor kotası uygun (Maks. ${MAX_SAME_SCORE_LIMIT})`}
                </div>
              </div>

              <button
                type="button"
                disabled={isSaving || overLimitScores.length > 0}
                onClick={savePredictions}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.45)] cursor-pointer transition-all"
              >
                {isSaving ? 'KAYDEDİLİYOR...' : '✅ TAHMİNLERİ MÜHÜRLE'}
              </button>
            </div>
          </div>
        )}

        {/* ===================== 2. YAPANLAR / EKSİKLER ===================== */}
        {effectiveView === 'status' && !isVisitor && (
          <div className="max-w-4xl mx-auto bg-[#071126] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
            <h2 className="text-center text-sm sm:text-lg font-black text-amber-400 uppercase tracking-widest mb-4">
              ⚡ {getDisplayWeek(activeBulletinWeek)} TAHMİN DURUM PANOSU
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-emerald-600/60 rounded-2xl bg-emerald-950/20 overflow-hidden">
                <div className="bg-emerald-950/80 text-emerald-300 text-xs font-black text-center py-2.5 border-b border-emerald-800/50">
                  🟢 YAPANLAR ({submittedPlayersNeon.length})
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2.5 space-y-1.5">
                  {submittedPlayersNeon.map((nm, i) => (
                    <div key={i} className="bg-emerald-950/40 border border-emerald-800/40 py-1.5 px-3 rounded-lg text-[11px] font-black text-emerald-200 text-center">
                      {nm}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-rose-600/60 rounded-2xl bg-rose-950/20 overflow-hidden">
                <div className="bg-rose-950/80 text-rose-300 text-xs font-black text-center py-2.5 border-b border-rose-800/50">
                  🔴 EKSİKLER ({missingPlayersNeon.length})
                </div>
                <div className="max-h-[420px] overflow-y-auto p-2.5 space-y-1.5">
                  {missingPlayersNeon.map((nm, i) => (
                    <div key={i} className="bg-rose-950/40 border border-rose-800/40 py-1.5 px-3 rounded-lg text-[11px] font-black text-rose-200 text-center">
                      {nm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== 3. RESMİ DEKLARASYON ===================== */}
        {effectiveView === 'declaration' && (
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-blue-800/50">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-xl font-black text-sky-300 tracking-widest uppercase">
                  📜 {getDisplayWeek(selectedTahminWeek)} RESMİ DEKLARASYON
                </h2>
                <select
                  value={selectedTahminWeek}
                  onChange={(e) => setSelectedTahminWeek(Number(e.target.value))}
                  className="bg-slate-950 border border-blue-500/50 text-sky-300 text-xs font-black px-3 py-1.5 rounded-xl outline-none cursor-pointer"
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
                  className="bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-black px-3 py-2 rounded-xl border border-slate-700 cursor-pointer"
                >
                  Sıra: {sortOrder}
                </button>
                {!isVisitor && (
                  <button
                    onClick={downloadJPEG}
                    disabled={isDownloading}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3.5 py-2 rounded-xl uppercase cursor-pointer"
                  >
                    {isDownloading ? 'İndiriliyor...' : '📸 JPG İndir'}
                  </button>
                )}
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
                    {selectedWeekMatchesList.map((m: any) => {
                      const isTffCol = isStrictTffMatch(m.category, m.homeTeam, m.awayTeam);
                      return (
                        <th
                          key={`th-${m.id}`}
                          className={`py-2 px-1.5 text-center font-black min-w-[54px] border-l border-slate-800/70 ${
                            isTffCol ? 'bg-rose-950/35' : ''
                          }`}
                          title={`${m.homeTeam} - ${m.awayTeam}`}
                        >
                          <div className={`text-[10px] ${isTffCol ? 'text-rose-400' : 'text-amber-400'}`}>
                            #{m.id}
                          </div>
                          <div className="text-[8.5px] text-slate-400 truncate max-w-[52px]">
                            {m.homeTeam?.slice(0, 3)}-{m.awayTeam?.slice(0, 3)}
                          </div>
                        </th>
                      );
                    })}
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

        {/* ===================== 4. TAHMİNMATİK ===================== */}
        {effectiveView === 'tahminmatik' && !isVisitor && (
          <div className="w-full space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 p-4 sm:p-5 rounded-2xl border border-emerald-800/50 max-w-5xl mx-auto">
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
                    : liveInfo?.score && liveInfo.score.includes('-') && liveInfo.score !== '---'
                    ? liveInfo.score
                    : '';

                const matchedNames =
                  isStarted && activeTargetScore
                    ? activePlayersForJPEG
                        .filter((uid) => livePredictionsData[selectedTahminWeek]?.[uid]?.[m.id - 1] === activeTargetScore)
                        .map((uid) => mergedAccounts[uid]?.name)
                    : [];

                const palette = getStandardCardPalette(m.category, m.homeTeam, m.awayTeam);
                const isTff = palette.isTff;
                const rawCat = String(
                  m.category && m.category !== 'GENEL'
                    ? m.category
                    : isTff
                    ? 'TÜRKİYE SÜPER LİG'
                    : 'AVRUPA FUTBOLU'
                ).trim();

                const theme: any = getEliteTheme(
                  isTff && !rawCat.toLocaleUpperCase('tr-TR').includes('TÜRKİYE') && !rawCat.toUpperCase().includes('TFF')
                    ? `TÜRKİYE ${rawCat}`
                    : rawCat,
                  String(m.homeTeam || '').toUpperCase(),
                  String(m.awayTeam || '').toUpperCase()
                );

                const leagueTitle = String(
                  theme?.leagueName || theme?.title || rawCat || (isTff ? 'TÜRKİYE TFF' : 'DFO AVRUPA')
                ).toUpperCase();

                return (
                  <div
                    key={`tm-${m.id}`}
                    className={`rounded-2xl border p-3.5 sm:p-4 flex flex-col gap-2.5 ${palette.cardOuterCls}`}
                  >
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-200 uppercase">
                      <span>
                        {selectedTahminWeek}. HAFTA {m.id}. MAÇ • {m.date} {m.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] ${palette.poolPillCls}`}>
                        {isTff ? 'TFF MAÇI' : 'DFO MAÇI'}
                      </span>
                    </div>

                    <div
                      className={`w-full py-1 px-2.5 rounded-xl border text-center text-[10px] font-black uppercase tracking-widest truncate ${palette.bannerCls}`}
                    >
                      {leagueTitle}
                    </div>

                    <div className="grid grid-cols-3 items-center gap-2 py-1">
                      <div className="flex flex-col items-center gap-1.5 min-w-0">
                        <img
                          src={theme.homeLogo}
                          alt={m.homeTeam}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow"
                          loading="lazy"
                        />
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                          {cleanTeamName(m.homeTeam)}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-1.5">
                        {liveInfo?.score && liveInfo.score !== '---' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 text-[9px] font-black">
                            CANLI: {liveInfo.score}
                          </span>
                        )}
                        <div className={`flex items-center gap-1 p-1.5 rounded-xl border ${palette.scoreBoxCls}`}>
                          <select
                            disabled={!isStarted}
                            value={customSc.home}
                            onChange={(e) => handleTahminmatikChange(m.id, 'home', e.target.value)}
                            className="w-10 h-9 sm:w-11 sm:h-10 bg-black/80 border border-slate-700 rounded-lg text-center text-xs sm:text-sm font-black text-emerald-300 outline-none"
                          >
                            {scoreOptionsArr.map((s) => (
                              <option key={s} value={s} className="bg-slate-950 text-white">
                                {s}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-400 font-black">:</span>
                          <select
                            disabled={!isStarted}
                            value={customSc.away}
                            onChange={(e) => handleTahminmatikChange(m.id, 'away', e.target.value)}
                            className="w-10 h-9 sm:w-11 sm:h-10 bg-black/80 border border-slate-700 rounded-lg text-center text-xs sm:text-sm font-black text-emerald-300 outline-none"
                          >
                            {scoreOptionsArr.map((s) => (
                              <option key={s} value={s} className="bg-slate-950 text-white">
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-1.5 min-w-0">
                        <img
                          src={theme.awayLogo}
                          alt={m.awayTeam}
                          className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow"
                          loading="lazy"
                        />
                        <span className="text-[10px] sm:text-xs font-black text-white uppercase text-center leading-tight line-clamp-2">
                          {cleanTeamName(m.awayTeam)}
                        </span>
                      </div>
                    </div>

                    {!isStarted ? (
                      <div className="text-[10px] text-slate-300/80 italic text-center pt-1.5 border-t border-white/10">
                        🔒 Maç başladığında simülasyon açılır
                      </div>
                    ) : (
                      <div className="text-[10px] text-emerald-300 bg-[#031214]/85 border border-emerald-500/40 rounded-xl p-2 mt-1">
                        {matchedNames.length > 0 ? (
                          <span>
                            <strong>{matchedNames.length} kişi tam isabet:</strong> {matchedNames.join(', ')}
                          </span>
                        ) : (
                          <span className="text-slate-300">Bu skoru bilen yok</span>
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