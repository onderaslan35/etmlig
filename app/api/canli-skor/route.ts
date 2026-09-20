import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTffMatchCheck } from '@/utils/themeEngine'; // 🔥 TFF AYRIMI İÇİN FRONTEND'İN KENDİ BEYNİ ÇAĞRILDI!

export const revalidate = 0; 
export const maxDuration = 60; 

const API_KEY = "933e5ccc09194d0db30171e2bca20ca9";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

function parseDateLocalCustom(dateStr: string) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split('.');
    if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
    return new Date(dateStr);
}

export async function GET(request: Request) {
  const nowUTC = new Date();
  const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
  const d = String(todayTurkey.getUTCDate()).padStart(2, '0');
  const m = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
  const y = todayTurkey.getUTCFullYear();
  const todayStr = `${d}.${m}.${y}`; 

  const { data: bulten } = await supabase.from('matches_bulletin').select('match_index, week_num, match_date');
  if (!bulten) return NextResponse.json({ message: 'Bülten çekilemedi.' });
  
  const todaysMatches = bulten.filter(match => match.match_date === todayStr);

  if (todaysMatches.length > 0) {
      const matchIds = todaysMatches.map(match => (match.week_num * 100) + match.match_index);
      const { data: liveData } = await supabase.from('live_matches').select('api_match_id, status').in('id', matchIds).neq('status', 'FINISHED').not('api_match_id', 'is', null);

      if (liveData && liveData.length > 0) {
          const apiIds = liveData.map(l => l.api_match_id).join('-');
          const HEDEF = `https://v3.football.api-sports.io/fixtures?ids=${apiIds}`;
          
          try {
            const res = await fetch(HEDEF, { method: 'GET', headers: { 'x-apisports-key': API_KEY, 'x-rapidapi-host': 'v3.football.api-sports.io' }, cache: 'no-store' });
            if (res.ok) {
                const sonuc = await res.json();
                const maclar = sonuc.response || [];
                for (const mac of maclar) {
                    const macId = mac.fixture.id; 
                    const evSkor = mac.goals.home ?? 0;
                    const depSkor = mac.goals.away ?? 0;
                    const durum = mac.fixture.status.short; 
                    
                    const dakikaElapsed = mac.fixture.status.elapsed || 0; 
                    const dakikaExtra = mac.fixture.status.extra || null;
                    
                    let statu = 'NOT_STARTED';
                    if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
                    else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';

                    const homeTeamId = mac.teams?.home?.id;
                    const safOlaylar = (mac.events || [])
                      .filter((e: any) => ['Goal', 'Card', 'subst'].includes(e.type))
                      .map((e: any) => {
                        let girenOyuncu = null;
                        if (e.type === 'subst') { girenOyuncu = { name: e.assist?.name }; }
                        return {
                          time: { elapsed: e.time?.elapsed }, team: { id: e.team?.id, name: e.team?.name }, player: { name: e.player?.name },
                          assist: girenOyuncu, type: e.type, detail: e.detail, isHome: e.team?.id === homeTeamId
                        };
                      });

                    if (dakikaExtra) safOlaylar.push({ type: 'SystemTime', detail: dakikaExtra.toString() });
                    await supabase.from('live_matches').update({ home_score: evSkor.toString(), away_score: depSkor.toString(), status: statu, elapsed: dakikaElapsed, events: safOlaylar }).eq('api_match_id', macId);
                }
            }
          } catch (e) {
              console.log("API Cekim Hatasi", e);
          }
      }
  }

  try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const mergedAccounts: Record<string, { name: string }> = {};
      mergedAccounts["262730"] = { name: "🏆 DİNÇER ASLAN" };
      mergedAccounts["262782"] = { name: "MUSTAFA ELMAS" };
      
      if (dbPlayers) {
          dbPlayers.forEach(p => {
              mergedAccounts[String(p.username || p.id).trim()] = { name: p.name || p.full_name };
          });
      }

      const fetchTable = async (t: string) => { const { data } = await supabase.from(t).select('*'); return data || []; };
      
      const [dfoData, masterData, skorDfoData, skorTffData, tffPointsData, manualPointsData, dbBulletinMatches, dbLiveMatches] = await Promise.all([
          fetchTable('dfo_weekly_points'), fetchTable('master_weekly_points'), fetchTable('dfo_weekly_scores'),
          fetchTable('tff_weekly_scores'), fetchTable('tff_weekly_points'), fetchTable('points'),
          supabase.from('matches_bulletin').select('*').gte('week_num', 5).order('match_index', { ascending: true }).then(res => res.data || []),
          fetchTable('live_matches')
      ]);

      let allPredictions: any[] = [];
      let from = 0; let step = 999; let keepFetching = true;
      while(keepFetching) {
          const { data } = await supabase.from('player_predictions').select('*').gte('week_num', 5).range(from, from + step);
          if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length <= step) keepFetching = false; else from += step + 1; } 
          else keepFetching = false;
      }

      const st: Record<string, { TFF: number, DFO: number, MASTER: number, SKOR: number }> = {};
      Object.keys(mergedAccounts).forEach(uid => { st[uid] = { TFF: 0, DFO: 0, MASTER: 0, SKOR: 0 }; });

      const getDict = (data: any[]) => {
          const dict: Record<string, any> = {};
          data.forEach(r => dict[String(r.username || r.user_id || r.id).trim()] = {w1:r.w1||0, w2:r.w2||0, w3:r.w3||0, w4:r.w4||0});
          return dict;
      };

      const masterDict = getDict(masterData); 
      const dfoDict = getDict(dfoData);
      const skorDfoDict = getDict(skorDfoData); 
      const skorTffDict = getDict(skorTffData);
      const tffDict = getDict(tffPointsData); 

      Object.keys(mergedAccounts).forEach(uid => {
          if (!st[uid]) return;
          const md = masterDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].MASTER += (Number(md.w1) + Number(md.w2) + Number(md.w3) + Number(md.w4));
          const dd = dfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].DFO += (Number(dd.w1) + Number(dd.w2) + Number(dd.w3) + Number(dd.w4));
          const sd = skorDfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const stff = skorTffDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].SKOR += (Number(sd.w1) + Number(sd.w2) + Number(sd.w3) + Number(sd.w4)) + (Number(stff.w1) + Number(stff.w2) + Number(stff.w3) + Number(stff.w4));
          
          const td = tffDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          st[uid].TFF += (Number(td.w1) + Number(td.w2) + Number(td.w3) + Number(td.w4));
      });

      const pDict: Record<string, string> = {};
      allPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          if (uid === 'mankoman') return;
          pDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
      });

      const liveMap: Record<number, any> = {};
      (dbLiveMatches || []).forEach(row => liveMap[row.id] = row); 

      const catDict: Record<string, string> = {};
      (dbBulletinMatches || []).forEach(m => { catDict[`${m.week_num}-${m.match_index}`] = m.category; });

      Object.values(liveMap).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;
          if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
              const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${weekNum}-${matchIndex}`] === targetScore);
              
              let pts = 1;
              if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
              else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
              else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
              else if(winnerIds.length >= 7) pts = 1; else pts = 0;

              const category = catDict[`${weekNum}-${matchIndex}`] || "";
              // 🔥 ASIL ÇÖZÜM BURADA: Frontend'in birebir kendi ayrım formülünü (isTffMatchCheck) kullandık!
              const isTff = isTffMatchCheck(category);

              const isLiveOrFinished = ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);
              if (isLiveOrFinished) {
                  winnerIds.forEach(wId => {
                      if (st[wId]) {
                          if (isTff) st[wId].TFF += pts; 
                          if (!isTff) st[wId].DFO += pts;
                          st[wId].MASTER += pts;
                          st[wId].SKOR += 1;
                      }
                  });
              }
          }
      });

      manualPointsData.forEach(row => {
          const ev = String(row.ev_sahibi || '').toUpperCase();
          if (ev === 'HAFTANIN' || ev === 'SKOR') {
              const uid = String(row.username || row.user_id || row.id || '').trim();
              const cat = String(row.kategori || row.league_type || 'MASTER').toUpperCase().trim();
              const pts = Number(row.puan ?? row.points ?? row.totalPoints) || 0;
              if (pts !== 0 && st[uid]) { if (cat === 'MASTER') st[uid].MASTER += pts; }
          }
      });

      let dynamicBonusPoints: Record<string, number> = {};
      const todayMidnightMs = new Date(todayTurkey.getUTCFullYear(), todayTurkey.getUTCMonth(), todayTurkey.getUTCDate()).getTime();
      const upcomingMatches = (dbBulletinMatches || []).filter(d => parseDateLocalCustom(d.match_date).getTime() >= todayMidnightMs).sort((a,b) => parseDateLocalCustom(a.match_date).getTime() - parseDateLocalCustom(b.match_date).getTime());
      
      let actWeek = 6;
      if (upcomingMatches.length > 0) actWeek = upcomingMatches[0].week_num;
      else {
          const weeks = Array.from(new Set((dbBulletinMatches || []).map(d => d.week_num)));
          if (weeks.length > 0) actWeek = Math.max(...weeks);
      }

      for (let w = 5; w <= actWeek; w++) {
          const match24 = liveMap[(w * 100) + 24];
          const isLiveNow = match24 && ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(match24.status);
          
          if (isLiveNow) {
              let wkMaster: any = {}, wkSkor: any = {};
              (dbBulletinMatches || []).filter(m => m.week_num === w).forEach(m => {
                  const dbM = liveMap[(w * 100) + m.match_index];
                  if (dbM && ['FINISHED', 'FT', 'AET', 'PEN', 'LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbM.status) && dbM.home_score !== '-') {
                      const targetScore = `${dbM.home_score}-${dbM.away_score}`.replace(/\s+/g, '');
                      const winnerIds = Object.keys(mergedAccounts).filter(id => pDict[`${id}-${w}-${m.match_index}`] === targetScore);
                      let pts = 1; if(winnerIds.length===1)pts=12; else if(winnerIds.length===2)pts=6; else if(winnerIds.length===3)pts=5; else if(winnerIds.length===4)pts=4; else if(winnerIds.length===5)pts=3; else if(winnerIds.length===6)pts=2; else if(winnerIds.length>=7)pts=1; else pts=0;
                      winnerIds.forEach(id => { wkMaster[id] = (wkMaster[id]||0) + pts; wkSkor[id] = (wkSkor[id]||0) + 1; });
                  }
              });

              const applyBonus = (wkScores: any) => {
                  let maxP = -1; let leaders: string[] = [];
                  Object.keys(wkScores).forEach(id => {
                      if (wkScores[id] > maxP) { maxP = wkScores[id]; leaders = [id]; }
                      else if (wkScores[id] === maxP) leaders.push(id);
                  });
                  if (leaders.length === 1 && maxP > 0) { dynamicBonusPoints[leaders[0]] = (dynamicBonusPoints[leaders[0]] || 0) + 3; }
              };
              applyBonus(wkMaster); applyBonus(wkSkor);
          }
      }

      Object.keys(dynamicBonusPoints).forEach(id => { if (st[id]) st[id].MASTER += dynamicBonusPoints[id]; });

      let arrTFF: any[] = [], arrDFO: any[] = [], arrMASTER: any[] = [], arrSKOR: any[] = [];
      Object.keys(st).forEach(id => {
          const name = mergedAccounts[id]?.name || '';
          arrTFF.push({ id, name, pts: st[id].TFF });
          arrDFO.push({ id, name, pts: st[id].DFO });
          arrMASTER.push({ id, name, pts: st[id].MASTER });
          arrSKOR.push({ id, name, pts: st[id].SKOR });
      });

      const sortFunc = (a: any, b: any) => b.pts - a.pts || a.name.localeCompare(b.name, 'tr');
      arrTFF.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrDFO.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrMASTER.sort(sortFunc).forEach((x, i) => x.rank = i + 1);
      arrSKOR.sort(sortFunc).forEach((x, i) => x.rank = i + 1);

      const upsertData = Object.keys(st).map(id => {
          const tffData = arrTFF.find(x => x.id === id);
          const dfoData = arrDFO.find(x => x.id === id);
          const masterData = arrMASTER.find(x => x.id === id);
          const skorData = arrSKOR.find(x => x.id === id);
          
          return {
              id: id,
              name: mergedAccounts[id].name,
              tff_pts: st[id].TFF,
              dfo_pts: st[id].DFO,
              master_pts: st[id].MASTER,
              skor_pts: st[id].SKOR,
              tff_rank: tffData?.rank || 0,
              dfo_rank: dfoData?.rank || 0,
              master_rank: masterData?.rank || 0,
              skor_rank: skorData?.rank || 0,
              updated_at: new Date().toISOString()
          };
      });

      if (upsertData.length > 0) {
          await supabase.from('live_leaderboard').upsert(upsertData, { onConflict: 'id' });
      }

  } catch (e) {
      console.error("Mutfak Hesaplama Hatasi:", e);
      return NextResponse.json({ message: 'Atis Basarili Ama Mutfak Coktu', error: e });
  }

  return NextResponse.json({ message: 'ŞİMŞEK: TFF Maç Ayrımı Frontend Beyni İle Kusursuz Çözüldü!' });
}