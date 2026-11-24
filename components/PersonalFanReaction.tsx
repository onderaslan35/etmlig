'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { staticPlayersList } from '@/utils/themeEngine';

// İstersen public/reaksiyonlar/ klasörüne kendi komik GIF, PNG veya JPG dosyalarını koyabilirsin:
const CUSTOM_MEDIA = {
  WIN: '/reaksiyonlar/oley.gif',
  CLOSE: '/reaksiyonlar/heyecan.gif',
  LOSE: '/reaksiyonlar/yatti.gif'
};

type DemoMode = 'REAL' | 'WIN' | 'CLOSE' | 'LOSE' | 'OFF';

interface SharedFanState {
  isMaster: boolean;
  selectedUid: string;
  demoMode: DemoMode;
  predsByMatch: Record<string, string>; // "week-index" -> "2-1"
  scoresByMatch: Record<string, { h: number | null; a: number | null; status: string }>;
}

const fanState: SharedFanState = {
  isMaster: false,
  selectedUid: '',
  demoMode: 'REAL',
  predsByMatch: {},
  scoresByMatch: {}
};

const fanListeners = new Set<() => void>();
function emitFanChange() {
  fanListeners.forEach((fn) => fn());
}

/** Sadece Komutan'ın ekranında çalışan üst kontrol ve Demo Test çubuğu */
export function PersonalFanControlBar({ activeWeek }: { activeWeek: number }) {
  const [, forceRender] = useState(0);
  const [playersDict, setPlayersDict] = useState<Record<string, string>>(staticPlayersList);

  useEffect(() => {
    const sub = () => forceRender((n) => n + 1);
    fanListeners.add(sub);

    const masterCheck =
      typeof window !== 'undefined' &&
      (localStorage.getItem('etml_master_commander') === 'mankoman' ||
        sessionStorage.getItem('admin_role') === 'master');

    fanState.isMaster = masterCheck;

    if (masterCheck) {
      const savedUid = localStorage.getItem('etml_fan_test_uid') || Object.keys(staticPlayersList)[0] || '';
      fanState.selectedUid = savedUid;
      emitFanChange();

      supabase
        .from('etml_official_players')
        .select('user_id, full_name, is_active')
        .then(({ data }) => {
          if (data && data.length > 0) {
            const merged = { ...staticPlayersList };
            data.forEach((r: any) => {
              if (r.is_active === false) delete merged[String(r.user_id)];
              else if (r.full_name) merged[String(r.user_id)] = String(r.full_name);
            });
            setPlayersDict(merged);
          }
        });
    }

    return () => {
      fanListeners.delete(sub);
    };
  }, []);

  useEffect(() => {
    if (!fanState.isMaster || !fanState.selectedUid || !activeWeek) return;

    const loadPersonalTestData = async () => {
      const [predRes, liveRes, offRes] = await Promise.all([
        supabase
          .from('player_predictions')
          .select('week_num, match_index, predicted_score')
          .eq('user_id', fanState.selectedUid)
          .eq('week_num', activeWeek),
        supabase
          .from('live_matches')
          .select('id, home_score, away_score, status')
          .gte('id', activeWeek * 100)
          .lt('id', (activeWeek + 1) * 100),
        supabase
          .from('etml_official_matches')
          .select('week_num, match_index, home_score, away_score, status')
          .eq('week_num', activeWeek)
      ]);

      const nextPreds: Record<string, string> = {};
      (predRes.data || []).forEach((p: any) => {
        nextPreds[`${p.week_num}-${p.match_index}`] = String(p.predicted_score || '').replace(/\s+/g, '');
      });
      fanState.predsByMatch = nextPreds;

      const nextScores: Record<string, { h: number | null; a: number | null; status: string }> = {};
      (offRes.data || []).forEach((o: any) => {
        const h = o.home_score !== null && o.home_score !== '-' ? Number(o.home_score) : null;
        const a = o.away_score !== null && o.away_score !== '-' ? Number(o.away_score) : null;
        nextScores[`${o.week_num}-${o.match_index}`] = {
          h: Number.isNaN(h) ? null : h,
          a: Number.isNaN(a) ? null : a,
          status: String(o.status || 'NOT_STARTED')
        };
      });

      (liveRes.data || []).forEach((l: any) => {
        const wk = Math.floor(Number(l.id) / 100);
        const idx = Number(l.id) % 100;
        const key = `${wk}-${idx}`;
        if (nextScores[key]?.status === 'FINISHED') return;
        const h = l.home_score !== null && l.home_score !== '-' ? Number(l.home_score) : null;
        const a = l.away_score !== null && l.away_score !== '-' ? Number(l.away_score) : null;
        nextScores[key] = {
          h: Number.isNaN(h) ? null : h,
          a: Number.isNaN(a) ? null : a,
          status: String(l.status || 'NOT_STARTED')
        };
      });

      fanState.scoresByMatch = nextScores;
      emitFanChange();
    };

    loadPersonalTestData();

    const ch = supabase
      .channel('personal-fan-score-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, (payload: any) => {
        const row = payload.new;
        if (!row || !row.id) return;
        const wk = Math.floor(Number(row.id) / 100);
        const idx = Number(row.id) % 100;
        const h = row.home_score !== null && row.home_score !== '-' ? Number(row.home_score) : null;
        const a = row.away_score !== null && row.away_score !== '-' ? Number(row.away_score) : null;
        fanState.scoresByMatch[`${wk}-${idx}`] = {
          h: Number.isNaN(h) ? null : h,
          a: Number.isNaN(a) ? null : a,
          status: String(row.status || 'NOT_STARTED')
        };
        emitFanChange();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [activeWeek, fanState.selectedUid]);

  if (!fanState.isMaster) return null;

  const sortedPlayers = Object.entries(playersDict)
    .filter(([id]) => id !== 'mankoman')
    .sort((a, b) => a[1].localeCompare(b[1], 'tr'));

  return (
    <div className="w-full bg-gradient-to-r from-indigo-950/90 via-slate-900 to-fuchsia-950/90 border border-fuchsia-500/50 rounded-2xl p-3 shadow-xl flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-fuchsia-600 text-white text-[9.5px] font-black uppercase tracking-wider">
            🔒 SADECE SANA ÖZEL TEST MODÜLÜ
          </span>
          <span className="text-xs font-black text-fuchsia-200 uppercase">
            Kişisel Taraftar Reaksiyonu
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-300">KİMİN TAHMİNİ:</span>
          <select
            value={fanState.selectedUid}
            onChange={(e) => {
              fanState.selectedUid = e.target.value;
              localStorage.setItem('etml_fan_test_uid', e.target.value);
              emitFanChange();
            }}
            className="bg-slate-950 border border-fuchsia-400/60 text-amber-300 text-[11px] font-black px-2.5 py-1 rounded-lg outline-none cursor-pointer"
          >
            {sortedPlayers.map(([uid, pName]) => (
              <option key={uid} value={uid}>
                {pName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-white/10">
        <span className="text-[9.5px] font-black text-slate-400 uppercase mr-1">CANLI ÖNİZLEME:</span>
        {(
          [
            { key: 'REAL', label: '📡 Gerçek Skor Modu', cls: 'border-sky-400 bg-sky-950/80 text-sky-200' },
            { key: 'WIN', label: '🎉 Oley Demo (Tuttu)', cls: 'border-emerald-400 bg-emerald-950/80 text-emerald-200' },
            { key: 'CLOSE', label: '😬 Heyecan Demo (1 Gol Kaldı)', cls: 'border-amber-400 bg-amber-950/80 text-amber-200' },
            { key: 'LOSE', label: '😫 Saç Baş Yolma Demo (Yattı)', cls: 'border-rose-400 bg-rose-950/80 text-rose-200' },
            { key: 'OFF', label: '🙈 Kapat', cls: 'border-slate-600 bg-slate-900 text-slate-400' }
          ] as const
        ).map((btn) => (
          <button
            key={btn.key}
            type="button"
            onClick={() => {
              fanState.demoMode = btn.key;
              emitFanChange();
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all cursor-pointer ${
              fanState.demoMode === btn.key
                ? `${btn.cls} scale-[1.03] shadow-md`
                : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Maç kartının içine yerleşen animasyonlu taraftar tepki kutusu */
export function PersonalFanCardReaction({
  weekNum,
  matchIndex
}: {
  weekNum: number;
  matchIndex: number;
}) {
  const [, forceRender] = useState(0);
  const [customImgLoaded, setCustomImgLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const sub = () => forceRender((n) => n + 1);
    fanListeners.add(sub);
    return () => {
      fanListeners.delete(sub);
    };
  }, []);

  if (!fanState.isMaster || fanState.demoMode === 'OFF') return null;

  const key = `${weekNum}-${matchIndex}`;
  const rawPred = fanState.predsByMatch[key] || '';
  const hasValidPred = rawPred.includes('-') && rawPred !== 'PAS' && rawPred !== '---';
  const [pH, pA] = hasValidPred ? rawPred.split('-').map(Number) : [null, null];

  const matchSc = fanState.scoresByMatch[key];
  const st = String(matchSc?.status || 'NOT_STARTED').toUpperCase();
  const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(st);
  const isFinished = ['FINISHED', 'FT', 'AET', 'PEN'].includes(st);

  let reactionType: 'WIN' | 'CLOSE' | 'LOSE' | 'IDLE' = 'IDLE';

  if (fanState.demoMode === 'WIN' || fanState.demoMode === 'CLOSE' || fanState.demoMode === 'LOSE') {
    reactionType = fanState.demoMode;
  } else if (hasValidPred && pH !== null && pA !== null && matchSc && matchSc.h !== null && matchSc.a !== null) {
    const curH = matchSc.h;
    const curA = matchSc.a;

    if ((isLive || isFinished) && curH === pH && curA === pA) {
      reactionType = 'WIN';
    } else if (curH > pH || curA > pA || (isFinished && (curH !== pH || curA !== pA))) {
      // Takımlardan biri tahminden fazla gol attıysa maç bitmese bile matematiksel olarak yattı!
      reactionType = 'LOSE';
    } else if (isLive && curH <= pH && curA <= pA && pH - curH + (pA - curA) === 1) {
      reactionType = 'CLOSE';
    }
  }

  if (reactionType === 'IDLE') {
    if (!hasValidPred) return null;
    return (
      <div className="mx-3 mb-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-300">
        <span>🎭 SENİN TAHMİNİN:</span>
        <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
          {rawPred}
        </span>
      </div>
    );
  }

  const mediaUrl = CUSTOM_MEDIA[reactionType];
  const showCustomImg = Boolean(customImgLoaded[reactionType]);

  return (
    <div className="mx-2.5 mb-2.5">
      {/* gizli ön-yükleyici: public/reaksiyonlar/ altında GIF/PNG varsa otomatik devreye alır */}
      <img
        src={mediaUrl}
        alt=""
        className="hidden"
        onLoad={() => setCustomImgLoaded((prev) => ({ ...prev, [reactionType]: true }))}
        onError={() => setCustomImgLoaded((prev) => ({ ...prev, [reactionType]: false }))}
      />

      {reactionType === 'WIN' && (
        <div className="relative overflow-hidden rounded-xl border-2 border-emerald-400 bg-gradient-to-r from-emerald-950 via-emerald-900/90 to-teal-950 p-2.5 shadow-[0_0_20px_rgba(16,185,129,0.45)] flex items-center gap-3">
          {showCustomImg ? (
            <img src={mediaUrl} alt="Oley!" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-emerald-300" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-300/60 flex items-center justify-center text-3xl animate-bounce shrink-0">
              🙌
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] sm:text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎉 OLEY BE! TAM İSABET!</span>
              <span className="animate-ping inline-block w-2 h-2 rounded-full bg-amber-300" />
            </div>
            <p className="text-[10px] font-bold text-white mt-0.5">
              {hasValidPred ? `Tahminin (${rawPred}) cuk oturdu! ` : ''}
              {isFinished ? 'Puanlar kasaya yazıldı!' : 'Aman nazar değmesin, hakem bitir hocam!'}
            </p>
          </div>
          <span className="text-xl animate-spin shrink-0">⚽</span>
        </div>
      )}

      {reactionType === 'CLOSE' && (
        <div className="relative overflow-hidden rounded-xl border border-amber-400/80 bg-gradient-to-r from-amber-950/95 via-orange-950/90 to-amber-950/95 p-2.5 shadow-[0_0_16px_rgba(245,158,11,0.3)] flex items-center gap-3">
          {showCustomImg ? (
            <img src={mediaUrl} alt="Heyecan!" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-amber-300" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-3xl animate-pulse shrink-0">
              😬
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] sm:text-xs font-black text-amber-300 uppercase tracking-wider">
              🔥 TIRNAKLAR YENİYOR! SADECE 1 GOL KALDI!
            </div>
            <p className="text-[10px] font-bold text-amber-100/90 mt-0.5">
              {hasValidPred ? `Hedef skor ${rawPred} • ` : ''}1 gol daha gelirse tam isabet patlıyor!
            </p>
          </div>
        </div>
      )}

      {reactionType === 'LOSE' && (
        <div className="relative overflow-hidden rounded-xl border border-rose-500/70 bg-gradient-to-r from-rose-950/95 via-[#2a0610] to-slate-950 p-2.5 shadow-[0_0_16px_rgba(225,29,72,0.3)] flex items-center gap-3">
          {showCustomImg ? (
            <img src={mediaUrl} alt="Saç baş yolma!" className="w-14 h-14 rounded-lg object-cover shrink-0 border border-rose-400" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/50 flex items-center justify-center text-3xl animate-pulse shrink-0">
              🤦‍♂️
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] sm:text-xs font-black text-rose-300 uppercase tracking-wider">
              😫 SAÇ BAŞ YOLUNDU! BİZİM SKOR YATTI...
            </div>
            <p className="text-[10px] font-bold text-slate-300 mt-0.5">
              {hasValidPred ? `Tahminin ${rawPred} idi ama ` : ''}bu maçtan bize ekmek çıkmadı, önümüzdeki maçlara!
            </p>
          </div>
          <span className="text-lg shrink-0 opacity-80">💸</span>
        </div>
      )}
    </div>
  );
}