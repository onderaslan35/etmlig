import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { staticPlayersList, isTffMatchCheck } from '@/utils/themeEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    console.log("🚀 OPERASYON: 3 GÜN TATİL MODU BAŞLADI");

    // 1. Bitmiş olan tüm canlı maçları çek
    const { data: allMatches } = await supabase
      .from('live_matches')
      .select('*')
      .in('status', ['FINISHED', 'FT']);

    if (!allMatches || allMatches.length === 0) {
        return NextResponse.json({ message: "Dağıtılacak bitmiş maç yok." });
    }

    // 2. Bülteni ve Oyuncuları Çek
    const { data: bulletinData } = await supabase.from('matches_bulletin').select('*');
    const { data: playersData } = await supabase.from('players').select('username, name');
    
    let mergedPlayers: Record<string, string> = { ...staticPlayersList };
    if (playersData) {
        playersData.forEach(p => mergedPlayers[String(p.username)] = p.name);
    }

    let distributedCount = 0;
    let processedWeeks = new Set<number>();

    for (const match of allMatches) {
        const weekNum = Math.floor(match.id / 100);
        const matchIndex = match.id % 100;
        processedWeeks.add(weekNum);

        const bMatch = bulletinData?.find(b => b.week_num === weekNum && b.match_index === matchIndex);
        if (!bMatch) continue;

        const homeTeam = bMatch.home_team;
        const awayTeam = bMatch.away_team;
        const category = bMatch.category;

        // Bu maç daha önce dağıtıldı mı?
        const { data: existingPoints } = await supabase
            .from('points')
            .select('id')
            .eq('hafta', weekNum)
            .eq('ev_sahibi', homeTeam)
            .eq('deplasman', awayTeam);

        if (existingPoints && existingPoints.length > 0) continue; // Zaten dağıtılmış, GEÇ!

        // 🔥 OTONOM DAĞITIM BAŞLIYOR 🔥
        const homeScore = match.home_score;
        const awayScore = match.away_score;
        if (homeScore === "-" || awayScore === "-") continue;

        const targetScore = `${homeScore}-${awayScore}`;

        // Tahminleri Çek
        const { data: predictions } = await supabase
            .from('player_predictions')
            .select('*')
            .eq('week_num', weekNum)
            .eq('match_index', matchIndex)
            .eq('predicted_score', targetScore);

        const isTff = isTffMatchCheck(category);
        const leagueName = isTff ? 'TFF' : 'DFO';

        let pts = 0;
        const wCount = predictions ? predictions.length : 0;
        if (wCount === 1) pts = 12;
        else if (wCount === 2) pts = 6;
        else if (wCount === 3) pts = 5;
        else if (wCount === 4) pts = 4;
        else if (wCount === 5) pts = 3;
        else if (wCount === 6) pts = 2;
        else if (wCount >= 7) pts = 1;

        if (wCount > 0 && predictions) {
            const inserts: any[] = [];
            for (const pred of predictions) {
                const userId = String(pred.user_id);
                const userName = mergedPlayers[userId] || "Bilinmeyen";

                const baseData = {
                    hafta: weekNum, user_name: userName, username: userId, ev_sahibi: homeTeam, deplasman: awayTeam,
                    gercek_ev: parseInt(homeScore), gercek_dep: parseInt(awayScore), tahmin_ev: homeScore, tahmin_dep: awayScore, puan: pts
                };
                inserts.push({ ...baseData, kategori: leagueName });
                inserts.push({ ...baseData, kategori: 'MASTER' });
            }

            await supabase.from('points').insert(inserts);

            // Standings (Kasa) güncellemesi
            for (const pred of predictions) {
                const userId = String(pred.user_id);
                const userName = mergedPlayers[userId] || "Bilinmeyen";

                const { data: stData } = await supabase.from('standings').select('*').eq('user_id', userId);
                if (stData) {
                    const lRow = stData.find((r: any) => r.league_type === leagueName);
                    if (lRow) await supabase.from('standings').update({ points: lRow.points + pts }).eq('id', lRow.id);
                    else await supabase.from('standings').insert({ user_id: userId, user_name: userName, league_type: leagueName, points: pts });

                    const mRow = stData.find((r: any) => r.league_type === 'MASTER');
                    if (mRow) await supabase.from('standings').update({ points: mRow.points + pts }).eq('id', mRow.id);
                    else await supabase.from('standings').insert({ user_id: userId, user_name: userName, league_type: 'MASTER', points: pts });
                }
            }
        } else {
            // Skoru bilen yoksa SİSTEM adına boş kayıt atılır ki otonom bot sonsuz döngüde bu maçı tekrar tekrar taramasın!
            await supabase.from('points').insert([{
                 hafta: weekNum, user_name: 'SİSTEM', username: '000000', kategori: 'SİSTEM', 
                 ev_sahibi: homeTeam, deplasman: awayTeam, gercek_ev: parseInt(homeScore), gercek_dep: parseInt(awayScore), tahmin_ev: '-', tahmin_dep: '-', puan: 0
            }]);
        }
        distributedCount++;
    }

    // 🚀 BONUS KONTROLÜ (İşlem Gören Haftalar İçin 24. Maç Bitti mi?) 🚀
    for (const w of Array.from(processedWeeks)) {
        const { data: weekMatches } = await supabase.from('live_matches').select('status').gte('id', w * 100).lt('id', (w + 1) * 100);
        const finished24 = weekMatches?.filter(m => m.status === 'FINISHED' || m.status === 'FT');
        
        // Eğer o haftanın 24 maçı da BİTTİYSE:
        if (finished24 && finished24.length >= 24) {
            // Bonuslar verilmiş mi kontrol et
            const { data: bonusPoints } = await supabase.from('points').select('id').eq('hafta', w).in('ev_sahibi', ['HAFTANIN', 'SKOR']);
            
            if (!bonusPoints || bonusPoints.length === 0) {
                const { data: weekPts } = await supabase.from('points').select('*').eq('hafta', w).eq('kategori', 'MASTER');
                
                const userStats: Record<string, { pts: number, exacts: number }> = {};
                weekPts?.forEach(pt => {
                    const uid = pt.username;
                    if (uid !== '000000') {
                       if (!userStats[uid]) userStats[uid] = { pts: 0, exacts: 0 };
                       userStats[uid].pts += Number(pt.puan);
                       userStats[uid].exacts += 1; 
                    }
                });

                let maxPts = 0, maxExacts = 0;
                Object.values(userStats).forEach(s => {
                    if (s.pts > maxPts) maxPts = s.pts;
                    if (s.exacts > maxExacts) maxExacts = s.exacts;
                });

                let pLeaders = Object.keys(userStats).filter(uid => userStats[uid].pts === maxPts);
                let sLeaders = Object.keys(userStats).filter(uid => userStats[uid].exacts === maxExacts);

                let bonusInserts = [];
                if (pLeaders.length === 1) {
                     bonusInserts.push({
                        hafta: w, user_name: mergedPlayers[pLeaders[0]], username: pLeaders[0], 
                        kategori: 'MASTER', ev_sahibi: 'HAFTANIN', deplasman: 'LİDERİ', gercek_ev: 0, gercek_dep: 0, tahmin_ev: 0, tahmin_dep: 0, puan: 3
                    });
                }
                if (sLeaders.length === 1) {
                     bonusInserts.push({
                        hafta: w, user_name: mergedPlayers[sLeaders[0]], username: sLeaders[0], 
                        kategori: 'MASTER', ev_sahibi: 'SKOR', deplasman: 'KRALI', gercek_ev: 0, gercek_dep: 0, tahmin_ev: 0, tahmin_dep: 0, puan: 3
                    });
                }

                if (bonusInserts.length > 0) {
                    await supabase.from('points').insert(bonusInserts);
                    for (const ins of bonusInserts) {
                        const { data: stData } = await supabase.from('standings').select('*').eq('user_id', ins.username);
                        if (stData) {
                            const mRow = stData.find((r: any) => r.league_type === 'MASTER');
                            if (mRow) await supabase.from('standings').update({ points: mRow.points + 3 }).eq('id', mRow.id);
                        }
                    }
                } else {
                    // Kimse bonus alamadıysa (veya beraberlik varsa) boş kayıt at ki döngü bir daha taranmasın
                    await supabase.from('points').insert([{
                         hafta: w, user_name: 'BERABERLİK', username: '000000', kategori: 'MASTER', 
                         ev_sahibi: 'HAFTANIN', deplasman: 'BERABERLİĞİ', gercek_ev: 0, gercek_dep: 0, tahmin_ev: '-', tahmin_dep: '-', puan: 0
                    }]);
                }
            }
        }
    }

    return NextResponse.json({ 
        success: true, 
        message: `🤖 TATİL MODU AKTİF: ${distributedCount} maç otonom olarak dağıtıldı.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}