import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0;
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const API_KEY = '933e5ccc09194d0db30171e2bca20ca9';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const teamDict: Record<string, string> = {
  'TÜRKİYE': 'Turkey', 'ALMANYA': 'Germany', 'İNGİLTERE': 'England',
  'FRANSA': 'France', 'İSPANYA': 'Spain', 'İTALYA': 'Italy',
  'GÜRCİSTAN': 'Georgia', 'KUZEY İRLANDA': 'Northern Ireland', 'HOLLANDA': 'Netherlands',
  'BELÇİKA': 'Belgium', 'İSVEÇ': 'Sweden', 'UKRAYNA': 'Ukraine',
  'POLONYA': 'Poland', 'MACARİSTAN': 'Hungary', 'GALLER': 'Wales',
  'İZLANDA': 'Iceland', 'KARADAĞ': 'Montenegro', 'ÇEKYA': 'Czech Republic',
  'HIRVATİSTAN': 'Croatia', 'İSVİÇRE': 'Switzerland', 'DANİMARKA': 'Denmark',
  'SIRBİSTAN': 'Serbia', 'PORTEKİZ': 'Portugal', 'İSKOÇYA': 'Scotland',
  'ANDORRA': 'Andorra', 'MALTA': 'Malta', 'NORVEÇ': 'Norway', 'KOSOVA': 'Kosovo',
  'İRLANDA': 'Republic of Ireland', 'LİHTENŞTAYN': 'Liechtenstein', 'LİTVANYA': 'Lithuania',
  'BOSNA-HERSEK': 'Bosnia & Herzegovina', 'ROMANYA': 'Romania', 'KIBRIS': 'Cyprus',
  'SLOVENYA': 'Slovenia', 'SAN MARİNO': 'San Marino', 'FİNLANDİYA': 'Finland',
  'FAROE ADALARI': 'Faroe Islands', 'KAZAKİSTAN': 'Kazakhstan', 'BULGARİSTAN': 'Bulgaria',
  'AVUSTURYA': 'Austria', 'LETONYA': 'Latvia', 'CEBELİTARIK': 'Gibraltar',
  'LÜKSEMBURG': 'Luxembourg', 'ESTONYA': 'Estonia', 'KUZEY MAKEDONYA': 'North Macedonia',
  'ARNAVUTLUK': 'Albania', 'BELARUS': 'Belarus', 'SLOVAKYA': 'Slovakia', 'MOLDOVA': 'Moldova'
};

function isTffMatchCheck(category: string) {
  if (!category) return false;
  const c = category.toUpperCase();
  return (
    c.includes('TÜRKİYE') || c.includes('TURKİYE') || c.includes('TURKIYE') ||
    c.includes('TFF') || c.includes('SÜPER LİG') || c.includes('SÜPER LIG') ||
    c.includes('SUPER LİG') || c.includes('SUPER LIG') || c.includes('1. LİG') ||
    c.includes('1. LIG') || c.includes('1.LİG') || c.includes('1.LIG') ||
    c.includes('AMATÖR') || c.includes('PTT') || c.includes('2.LİG') || c.includes('3.LİG')
  );
}

function parseTurkeyKickoffMs(dateStr: string, timeStr: string): number {
  const dParts = String(dateStr || '').trim().split('.');
  const tParts = String(timeStr || '20:00').trim().split(':');
  if (dParts.length !== 3) return 0;
  const day = parseInt(dParts[0], 10);
  const month = parseInt(dParts[1], 10);
  const year = parseInt(dParts[2], 10);
  const hour = parseInt(tParts[0] || '20', 10);
  const minute = parseInt(tParts[1] || '0', 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return 0;
  // Türkiye UTC+3 saatini UTC milisaniyesine çevir
  return Date.UTC(year, month - 1, day, hour - 3, minute, 0);
}

function calcMatchPts(winnerCount: number): number {
  if (winnerCount === 1) return 12;
  if (winnerCount === 2) return 6;
  if (winnerCount === 3) return 5;
  if (winnerCount === 4) return 4;
  if (winnerCount === 5) return 3;
  if (winnerCount === 6) return 2;
  if (winnerCount >= 7) return 1;
  return 0;
}

export async function GET() {
  const nowUTC = new Date();
  const nowMs = nowUTC.getTime();
  const todayTurkey = new Date(nowMs + 3 * 60 * 60 * 1000);
  const yesterdayTurkey = new Date(todayTurkey.getTime() - 24 * 60 * 60 * 1000);

  const d = String(todayTurkey.getUTCDate()).padStart(2, '0');
  const m = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
  const y = todayTurkey.getUTCFullYear();
  const todayStr = `${d}.${m}.${y}`;
  const apiDateStr = `${y}-${m}-${d}`;

  const yd = String(yesterdayTurkey.getUTCDate()).padStart(2, '0');
  const ym = String(yesterdayTurkey.getUTCMonth() + 1).padStart(2, '0');
  const yy = yesterdayTurkey.getUTCFullYear();
  const yesterdayStr = `${yd}.${ym}.${yy}`;

  const hh = String(todayTurkey.getUTCHours()).padStart(2, '0');
  const mm = String(todayTurkey.getUTCMinutes()).padStart(2, '0');
  const ss = String(todayTurkey.getUTCSeconds()).padStart(2, '0');
  const timeString = `${hh}:${mm}:${ss}`;

  // 1. SADECE dün (gece sarkan maçlar için) ve bugünün bülten maçlarını çek (~0-40 satır)
  const { data: dayBulten } = await supabase
    .from('matches_bulletin')
    .select('match_index, week_num, match_date, match_time, category, home_team, away_team, api_match_id')
    .in('match_date', [yesterdayStr, todayStr]);

  if (!dayBulten || dayBulten.length === 0) {
    return NextResponse.json({ message: 'Bugun bultende mac yok, sifir Egress ile cikildi.' });
  }

  // Sadece başlama saatine 10 dk kalmış ve üzerinden 6 saatten fazla geçmemiş maçları aday al
  const candidateMatches = dayBulten.filter((bm: any) => {
    const kMs = parseTurkeyKickoffMs(bm.match_date, bm.match_time);
    if (!kMs) return bm.match_date === todayStr;
    return nowMs >= kMs - 10 * 60 * 1000 && nowMs <= kMs + 6 * 60 * 60 * 1000;
  });

  if (candidateMatches.length === 0) {
    return NextResponse.json({ message: 'Su an aktif mac penceresinde oynanan mac yok, kota korundu.' });
  }

  const candidateIds = candidateMatches.map((bm: any) => bm.week_num * 100 + bm.match_index);

  const { data: existingLive } = await supabase
    .from('live_matches')
    .select('id, api_match_id, status, home_score, away_score, elapsed')
    .in('id', candidateIds);

  const existingMap = new Map<number, any>();
  (existingLive || []).forEach((l: any) => existingMap.set(Number(l.id), l));

  // Eksik satırları tek seferde oluştur (bültende api_match_id varsa doğrudan bağla)
  const missingRows = candidateMatches
    .filter((bm: any) => !existingMap.has(bm.week_num * 100 + bm.match_index))
    .map((bm: any) => {
      const id = bm.week_num * 100 + bm.match_index;
      const validApiId =
        bm.api_match_id && !String(bm.api_match_id).startsWith('manuel-')
          ? Number(bm.api_match_id)
          : null;
      const row = {
        id,
        api_match_id: validApiId,
        status: 'NOT_STARTED',
        home_score: '-',
        away_score: '-',
        elapsed: 0
      };
      existingMap.set(id, row);
      return row;
    });

  if (missingRows.length > 0) {
    await supabase.from('live_matches').insert(missingRows);
  }

  // FINISHED veya WAITING_APPROVAL (zaten FT olmuş) maçları tekrar API'den sorgulama!
  const activeToPoll = Array.from(existingMap.values()).filter(
    (l: any) => !['FINISHED', 'WAITING_APPROVAL', 'POSTPONED'].includes(String(l.status || ''))
  );

  if (activeToPoll.length === 0) {
    return NextResponse.json({ message: 'Aktif penceredeki tum maclar tamamlandi, sorgu yapilmadi.' });
  }

  // api_match_id eksik olan bugünkü maçlar varsa eşleştir ve bültene de kaydet
  const missingApiMatches = activeToPoll.filter((l: any) => !l.api_match_id);
  if (missingApiMatches.length > 0) {
    try {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${apiDateStr}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' },
        cache: 'no-store'
      });
      const json = await res.json();
      const apiFixtures = json.response || [];

      for (const missing of missingApiMatches) {
        const bm = candidateMatches.find((m: any) => m.week_num * 100 + m.match_index === missing.id);
        if (bm && bm.home_team) {
          const homeTr = String(bm.home_team).toUpperCase().trim();
          const homeEn = teamDict[homeTr] || homeTr;
          const found = apiFixtures.find(
            (f: any) =>
              String(f.teams?.home?.name || '').toUpperCase().includes(homeEn.toUpperCase()) ||
              String(f.teams?.home?.name || '').toUpperCase().includes(homeTr)
          );
          if (found) {
            const fixId = found.fixture.id;
            missing.api_match_id = fixId;
            await supabase.from('live_matches').update({ api_match_id: fixId }).eq('id', missing.id);
            await supabase
              .from('matches_bulletin')
              .update({ api_match_id: fixId })
              .eq('week_num', bm.week_num)
              .eq('match_index', bm.match_index);
          }
        }
      }
    } catch {}
  }

  const validPollList = activeToPoll.filter((l: any) => l.api_match_id);
  let updatedMatchCount = 0;

  // API-Sports ?ids= parametresi en fazla 20 ID kabul ettiği için 20'li paketlerle çek
  for (let i = 0; i < validPollList.length; i += 20) {
    const chunk = validPollList.slice(i, i + 20);
    const apiIds = chunk.map((l: any) => l.api_match_id).join('-');
    try {
      const res = await fetch(`https://v3.football.api-sports.io/fixtures?ids=${apiIds}`, {
        method: 'GET',
        headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' },
        cache: 'no-store'
      });
      if (res.ok) {
        const sonuc = await res.json();
        const maclar = sonuc.response || [];

        for (const mac of maclar) {
          const macId = mac.fixture.id;
          const durum = String(mac.fixture.status.short || '');
          const dakika = mac.fixture.status.elapsed ?? null;
          const rawEvents = Array.isArray(mac.events) ? mac.events : [];

          let statu = 'NOT_STARTED';
          if (['FT', 'AET', 'PEN', 'Match Finished', 'Finished'].includes(durum)) {
            statu = 'WAITING_APPROVAL';
          } else if (['HT', 'Halftime'].includes(durum)) {
            statu = 'HT';
          } else if (['1H', '2H', 'ET', 'P', 'LIVE', 'IN PLAY'].includes(durum)) {
            statu = 'LIVE';
          }

          const prevInfo = chunk.find((l: any) => Number(l.api_match_id) === Number(macId));
          if (prevInfo && (prevInfo.status === 'LIVE' || prevInfo.status === 'HT') && statu === 'NOT_STARTED') {
            statu = prevInfo.status;
          }

          let evSkorStr = '-';
          let depSkorStr = '-';
          if (statu !== 'NOT_STARTED') {
            evSkorStr = String(mac.goals.home ?? 0);
            depSkorStr = String(mac.goals.away ?? 0);
          }

          // Hiçbir şey değişmediyse veritabanına boşuna yazma!
          const isUnchanged =
            prevInfo &&
            String(prevInfo.status) === statu &&
            String(prevInfo.home_score) === evSkorStr &&
            String(prevInfo.away_score) === depSkorStr &&
            Number(prevInfo.elapsed || 0) === Number(dakika || 0);

          if (isUnchanged) continue;

          // Events JSON boyutunu %85 küçült
          const slimEvents = rawEvents.map((ev: any) => ({
            type: ev.type,
            detail: ev.detail,
            time: { elapsed: ev.time?.elapsed },
            team: { id: ev.team?.id, name: ev.team?.name },
            player: { name: ev.player?.name },
            assist: ev.assist?.name ? { name: ev.assist.name } : undefined
          }));

          await supabase
            .from('live_matches')
            .update({
              home_score: evSkorStr,
              away_score: depSkorStr,
              status: statu,
              elapsed: dakika,
              updated_at: timeString,
              updated_by: 'OTONOM_RADAR',
              events: JSON.stringify(slimEvents)
            })
            .eq('api_match_id', macId);

          if (prevInfo) {
            prevInfo.status = statu;
            prevInfo.home_score = evSkorStr;
            prevInfo.away_score = depSkorStr;
          }
          updatedMatchCount++;
        }
      }
    } catch {}
  }

  // 2. SADECE skor/durum güncellendiyse Resmi Kasa (54 satır) üzerinden live_leaderboard güncelle!
  if (updatedMatchCount > 0) {
    try {
      const { data: summaryRows } = await supabase
        .from('etml_standings_summary')
        .select('master_sira, user_id, oyuncu_adi, dfo_puan, tff_puan, master_puan, tam_isabet')
        .order('master_sira', { ascending: true });

      if (summaryRows && summaryRows.length > 0) {
        const activeWeeks = Array.from(new Set<number>(candidateMatches.map((m: any) => Number(m.week_num))));
        const { data: liveNowRows } = await supabase
          .from('live_matches')
          .select('id, status, home_score, away_score')
          .in('id', candidateIds)
          .in('status', ['LIVE', 'HT', 'WAITING_APPROVAL']);

        const pDict: Record<string, string> = {};
        if (liveNowRows && liveNowRows.length > 0 && activeWeeks.length > 0) {
          for (const wk of activeWeeks) {
            const { data: preds } = await supabase
              .from('player_predictions')
              .select('user_id, week_num, match_index, predicted_score')
              .eq('week_num', wk)
              .limit(1500);
            (preds || []).forEach((pr: any) => {
              pDict[`${pr.user_id}-${pr.week_num}-${pr.match_index}`] = String(pr.predicted_score || '').replace(/\s+/g, '');
            });
          }
        }

        const liveAddMap: Record<string, { m: number; dfo: number; tff: number; sk: number }> = {};
        const playerIds = summaryRows.map((r: any) => String(r.user_id));
        playerIds.forEach((uid: string) => {
          liveAddMap[uid] = { m: 0, dfo: 0, tff: 0, sk: 0 };
        });

        (liveNowRows || []).forEach((lm: any) => {
          if (!lm.home_score || lm.home_score === '-' || !lm.away_score || lm.away_score === '-') return;
          const wk = Math.floor(Number(lm.id) / 100);
          const idx = Number(lm.id) % 100;
          const bm = candidateMatches.find((m: any) => m.week_num === wk && m.match_index === idx);
          const isTff = isTffMatchCheck(bm?.category || '');
          const targetSc = `${lm.home_score}-${lm.away_score}`.replace(/\s+/g, '');

          const winners = playerIds.filter((uid: string) => pDict[`${uid}-${wk}-${idx}`] === targetSc);
          const pts = calcMatchPts(winners.length);
          winners.forEach((uid: string) => {
            liveAddMap[uid].m += pts;
            liveAddMap[uid].sk += 1;
            if (isTff) liveAddMap[uid].tff += pts;
            else liveAddMap[uid].dfo += pts;
          });
        });

        const enriched = summaryRows.map((r: any) => {
          const uid = String(r.user_id);
          const add = liveAddMap[uid] || { m: 0, dfo: 0, tff: 0, sk: 0 };
          return {
            id: uid,
            name: String(r.oyuncu_adi || uid),
            prevRank: Number(r.master_sira || 99),
            master_pts: Number(r.master_puan || 0) + add.m,
            dfo_pts: Number(r.dfo_puan || 0) + add.dfo,
            tff_pts: Number(r.tff_puan || 0) + add.tff,
            skor_pts: Number(r.tam_isabet || 0) + add.sk
          };
        });

        enriched.sort((a: any, b: any) => b.master_pts - a.master_pts || b.skor_pts - a.skor_pts || a.name.localeCompare(b.name, 'tr'));

        const upsertData = enriched.map((p: any, idx: number) => {
          const newRank = idx + 1;
          const diff = p.prevRank - newRank;
          return {
            id: p.id,
            name: p.name,
            master_pts: p.master_pts,
            master_rank: newRank,
            trend_direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same',
            trend_diff: Math.abs(diff),
            dfo_pts: p.dfo_pts,
            dfo_trend_direction: 'same',
            dfo_trend_diff: 0,
            tff_pts: p.tff_pts,
            tff_trend_direction: 'same',
            tff_trend_diff: 0,
            skor_pts: p.skor_pts,
            skor_trend_direction: 'same',
            skor_trend_diff: 0,
            dfo_skor_pts: 0,
            dfo_skor_trend_direction: 'same',
            dfo_skor_trend_diff: 0,
            tff_skor_pts: 0,
            tff_skor_trend_direction: 'same',
            tff_skor_trend_diff: 0,
            updated_at: new Date().toISOString()
          };
        });

        await supabase.from('live_leaderboard').upsert(upsertData, { onConflict: 'id' });
      }
    } catch {}
  }

  return NextResponse.json({
    message: 'Otonom radar hafifletilmis Egress kalkanıyla basariyla calisti.',
    updatedMatches: updatedMatchCount
  });
}