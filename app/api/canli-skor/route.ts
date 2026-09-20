import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isTffMatchCheck } from '@/utils/themeEngine';

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
                    
                    let statu = 'NOT_STARTED';
                    if (durum === 'FT' || durum === 'AET' || durum === 'PEN') statu = 'FINISHED';
                    else if (['1H','2H','HT','ET','P'].includes(durum)) statu = 'LIVE';

                    await supabase.from('live_matches').update({ home_score: evSkor.toString(), away_score: depSkor.toString(), status: statu }).eq('api_match_id', macId);
                }
            }
          } catch (e) {
              console.log("API Cekim Hatasi", e);
          }
      }
  }

  try {
      const { data: dbPlayers } = await supabase.from('players').select('*');
      const playersList: Record<string, string> = {};
      
      if (dbPlayers) {
          dbPlayers.forEach(p => {
              const pid = p.username || p.id;
              if (pid !== 'mankoman') playersList[pid] = p.name || p.full_name;
          });
      }

      const fetchTable = async (t: string) => { const { data } = await supabase.from(t).select('*'); return data || []; };
      
      const [dfoData, masterData, skorDfoData, skorTffData, tffPointsData, manualPointsData, dbBulletinMatches, dbLiveMatches] = await Promise.all([
          fetchTable('dfo_weekly_points'), fetchTable('master_weekly_points'), fetchTable('dfo_weekly_scores'),
          fetchTable('tff_weekly_scores'), fetchTable('tff_weekly_points'), fetchTable('points'),
          supabase.from('matches_bulletin').select('*').gte('week_num', 5).order('match_index', { ascending: true }).then(res => res.data || []),
          fetchTable('live_matches')
      ]);

      // 🔥 MANUEL (MÜHÜRLÜ) BONUSLARI HAFTA HAFTA YAKALIYORUZ (Yusuf Erbay vb. için)
      const dynamicBonuses: Record<number, Record<string, number>> = {};
      manualPointsData.forEach(b => {
          if (String(b.kategori).toUpperCase() === 'MASTER') {
              if (!dynamicBonuses[b.hafta]) dynamicBonuses[b.hafta] = {};
              if (!dynamicBonuses[b.hafta][b.username]) dynamicBonuses[b.hafta][b.username] = 0;
              dynamicBonuses[b.hafta][b.username] += b.puan;
          }
      });

      let allPredictions: any[] = [];
      let from = 0; let step = 999; let keepFetching = true;
      while(keepFetching) {
          const { data } = await supabase.from('player_predictions').select('*').gte('week_num', 5).range(from, from + step);
          if (data && data.length > 0) { allPredictions = [...allPredictions, ...data]; if (data.length <= step) keepFetching = false; else from += step + 1; } 
          else keepFetching = false;
      }

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

      // 🔥 BÜTÜN KASALAR (Geçmiş + Canlı + Base + Admin Bonus)
      let st: Record<string, any> = {};
      Object.keys(playersList).forEach(uid => {
          const md = masterDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const dd = dfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const td = tffDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const sd = skorDfoDict[uid] || {w1:0, w2:0, w3:0, w4:0};
          const stff = skorTffDict[uid] || {w1:0, w2:0, w3:0, w4:0};

          st[uid] = { 
              MASTER: Number(md.w1) + Number(md.w2) + Number(md.w3) + Number(md.w4),
              MASTER_W1_W4: Number(md.w1) + Number(md.w2) + Number(md.w3) + Number(md.w4),
              DFO: Number(dd.w1) + Number(dd.w2) + Number(dd.w3) + Number(dd.w4),
              TFF: Number(td.w1) + Number(td.w2) + Number(td.w3) + Number(td.w4),
              SKOR: (Number(sd.w1) + Number(sd.w2) + Number(sd.w3) + Number(sd.w4)) + (Number(stff.w1) + Number(stff.w2) + Number(stff.w3) + Number(stff.w4)),
              dynMasterBase: 0,
              dynMasterLive: 0,
              liveMasterBonus: 0
          };
      });

      const pDict: Record<string, string> = {};
      allPredictions.forEach(pred => {
          const uid = String(pred.user_id);
          pDict[`${uid}-${pred.week_num}-${pred.match_index}`] = pred.predicted_score.replace(/\s+/g, '');
      });

      const liveMap: Record<number, any> = {};
      (dbLiveMatches || []).forEach(row => liveMap[row.id] = row); 

      const catDict: Record<string, string> = {};
      (dbBulletinMatches || []).forEach(m => { catDict[`${m.week_num}-${m.match_index}`] = m.category; });

      // 🔥 5. HAFTADAN İTİBAREN MAÇLARI HESAPLA 🔥
      Object.values(liveMap).forEach(dbMatch => {
          const weekNum = Math.floor(dbMatch.id / 100);
          const matchIndex = dbMatch.id % 100;
          
          if (weekNum >= 5 && weekNum <= 38 && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`.replace(/\s+/g, '');
              const winnerIds = Object.keys(playersList).filter(id => pDict[`${id}-${weekNum}-${matchIndex}`] === targetScore);
              
              let pts = 1;
              if(winnerIds.length === 1) pts = 12; else if(winnerIds.length === 2) pts = 6;
              else if(winnerIds.length === 3) pts = 5; else if(winnerIds.length === 4) pts = 4;
              else if(winnerIds.length === 5) pts = 3; else if(winnerIds.length === 6) pts = 2;
              else if(winnerIds.length >= 7) pts = 1; else pts = 0;

              const category = catDict[`${weekNum}-${matchIndex}`] || "";
              const isTff = isTffMatchCheck(category);
              const isFinished = dbMatch.status === 'FINISHED' || dbMatch.status === 'FT';
              const isLive = ['LIVE', '1H', '2H', 'HT', 'ET', 'P', 'WAITING_APPROVAL'].includes(dbMatch.status);

              winnerIds.forEach(wId => {
                  if (st[wId]) {
                      if (isFinished) {
                          if (isTff) st[wId].TFF += pts; 
                          if (!isTff) st[wId].DFO += pts;
                          st[wId].dynMasterBase += pts;
                          st[wId].SKOR += 1;
                      } else if (isLive) {
                          st[wId].dynMasterLive += pts;
                      }
                  }
              });
          }
      });

      let highestWeekFound = 6; 
      const weeks = Array.from(new Set((dbBulletinMatches || []).map((d: any) => d.week_num)));
      if (weeks.length > 0) highestWeekFound = Math.max(...(weeks as number[]));

      // 🔴 FRONTEND'İN BİREBİR OK VE TREND MANTIĞI: (Sadece Bitmiş Maçlar + Admin Bonusları vs Canlı Maçlar Dahil)
      
      const calcBase = (uid: string) => {
          let totalAdminBonus = 0;
          for (let w = 5; w <= highestWeekFound; w++) {
              if (dynamicBonuses[w] && dynamicBonuses[w][uid]) totalAdminBonus += dynamicBonuses[w][uid];
          }
          return st[uid].MASTER_W1_W4 + st[uid].dynMasterBase + totalAdminBonus;
      };

      const calcFinal = (uid: string) => {
          return calcBase(uid) + st[uid].dynMasterLive + st[uid].liveMasterBonus;
      };

      const baseList = Object.keys(st).map(id => ({ id, name: playersList[id] || "", baseScore: calcBase(id) }));
      const prevRefList = [...baseList].sort((a, b) => b.baseScore - a.baseScore || a.name.localeCompare(b.name, 'tr'));
      
      const prevRanks: Record<string, number> = {};
      prevRefList.forEach((player, index) => { prevRanks[player.id] = index + 1; });

      const finalRefList = Object.keys(st).map(id => ({ id, name: playersList[id] || "", finalScore: calcFinal(id) }))
                                         .sort((a, b) => b.finalScore - a.finalScore || a.name.localeCompare(b.name, 'tr'));

      const upsertData = finalRefList.map((player, index) => {
          const currentRank = index + 1;
          const prevRank = prevRanks[player.id];
          
          let trend = 'same', trendDiff = 0; 
          if (currentRank < prevRank) { trend = 'up'; trendDiff = prevRank - currentRank; } 
          else if (currentRank > prevRank) { trend = 'down'; trendDiff = currentRank - prevRank; }

          return {
              id: player.id,
              name: player.name,
              master_pts: player.finalScore,
              master_rank: currentRank,
              trend_direction: trend,     // 🔥 OK YÖNÜ TEPSİYE YAZILIYOR
              trend_diff: trendDiff,      // 🔥 FARK TEPSİYE YAZILIYOR
              
              // Diğerlerini de unutmuyoruz
              tff_pts: st[player.id].TFF,
              dfo_pts: st[player.id].DFO,
              skor_pts: st[player.id].SKOR,
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

  return NextResponse.json({ message: 'ŞİMŞEK MASTER MANTIĞI: Trend Okları ve Admin Bonusları Kusursuz Çalışıyor!' });
}