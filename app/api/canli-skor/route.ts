import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get('home')?.toUpperCase() || '';
  const away = searchParams.get('away')?.toUpperCase() || '';

  if (!home || !away) {
    return NextResponse.json({ error: 'Eksik takim bilgisi' }, { status: 400 });
  }

  try {
    const datesToTry = [];
    const now = new Date();
    // Vercel Saat Dilimi (UTC) Kaymalarına Karşı: Dün, Bugün, Yarın
    for (let i = -1; i <= 1; i++) {
      const d = new Date(now.getTime() + (3 * 60 * 60 * 1000) + (i * 24 * 60 * 60 * 1000));
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      datesToTry.push(`${yyyy}${mm}${dd}`);
    }

    let matchFound = null;
    
    // 🔴 EKMEL NOKTA ATIŞI: Sadece ilk 4 harfe bakar ("KAIRAT" yerine "KAIR")
    // Böylece isimde ne kadar boşluk, tire veya farklılık olursa olsun ASLA kaçırmaz!
    const homeKeyword = home.substring(0, 4);
    const awayKeyword = away.substring(0, 4);

    for (const dateStr of datesToTry) {
      const targetUrl = `https://www.fotmob.com/api/matches?date=${dateStr}`;
      
      // 🔴 VERCEL (CLOUDFLARE) ENGELİNİ AŞAN PROXY TÜNELİ 🔴
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
      
      let response;
      try {
        response = await fetch(proxyUrl, { cache: 'no-store' });
      } catch (e) {
        // Proxy sunucusu o an mesgulse, direkt B planina gecip Vercel uzerinden sansimizi deneriz
        response = await fetch(targetUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' });
      }

      if (!response || !response.ok) continue;

      const data = await response.json();

      if (data && data.leagues) {
        for (const league of data.leagues) {
          if (!league.matches) continue;
          for (const m of league.matches) {
            const fotmobHome = (m.home?.name || '').toUpperCase();
            const fotmobAway = (m.away?.name || '').toUpperCase();

            // İlk 4 harf eşleşirse maçı bulduk demektir!
            if (fotmobHome.includes(homeKeyword) && fotmobAway.includes(awayKeyword)) {
              matchFound = m;
              break;
            }
          }
          if (matchFound) break;
        }
      }
      if (matchFound) break;
    }

    if (matchFound) {
      const isFinished = matchFound.status?.finished || matchFound.status?.type === 'finished';
      const isStarted = matchFound.status?.started || matchFound.status?.type === 'inprogress' || matchFound.status?.liveTime != null;
      const isCancelled = matchFound.status?.cancelled || matchFound.status?.type === 'cancelled';
      
      let status = 'NOT_STARTED';
      if (isFinished) status = 'FINISHED';
      else if (isStarted && !isCancelled) status = 'LIVE';

      let hScore = matchFound.home?.score ?? 0;
      let aScore = matchFound.away?.score ?? 0;
      
      // Fotmob bazen skoru object içinde değil, tek parça string olarak verir ("0 - 1" gibi), bunu da çözdük.
      if (matchFound.status?.scoreStr) {
         const scoreParts = matchFound.status.scoreStr.split('-');
         if (scoreParts.length === 2) {
            hScore = parseInt(scoreParts[0].trim());
            aScore = parseInt(scoreParts[1].trim());
         }
      }

      return NextResponse.json({
        status: status,
        homeScore: isNaN(hScore) ? 0 : hScore,
        awayScore: isNaN(aScore) ? 0 : aScore,
        matchTime: matchFound.status?.liveTime?.short || "1'"
      });
    }

    // Maçı listede bulamazsa
    return NextResponse.json({ status: 'NOT_FOUND' });

  } catch (error) {
    return NextResponse.json({ error: 'Sunucu baglanti hatasi' }, { status: 500 });
  }
}