import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get('home')?.toUpperCase();
  const away = searchParams.get('away')?.toUpperCase();

  if (!home || !away) {
    return NextResponse.json({ error: 'Eksik takim bilgisi' }, { status: 400 });
  }

  try {
    // 🔴 EKMEL DOKUNUŞU: Vercel İngiltere saatindedir, biz Türkiye saatini (UTC+3) zorluyoruz ki tarih şaşmasın!
    const today = new Date();
    const trTime = new Date(today.getTime() + (3 * 60 * 60 * 1000));
    const yyyy = trTime.getFullYear();
    const mm = String(trTime.getMonth() + 1).padStart(2, '0');
    const dd = String(trTime.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // 🔴 EKMEL DOKUNUŞU: FotMob, Vercel'i bot sanmasın diye sahte Chrome Tarayıcı kimliği (Headers) takıyoruz!
    const response = await fetch(`https://www.fotmob.com/api/matches?date=${dateStr}`, {
      headers: {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
       return NextResponse.json({ error: `FotMob API Engeli. Status: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    let matchFound = null;

    if (data && data.leagues) {
      for (const league of data.leagues) {
        for (const m of league.matches) {
          const fotmobHome = m.home.name.toUpperCase();
          const fotmobAway = m.away.name.toUpperCase();

          if (
            (fotmobHome.includes(home) || home.includes(fotmobHome)) &&
            (fotmobAway.includes(away) || away.includes(fotmobAway))
          ) {
            matchFound = m;
            break;
          }
        }
        if (matchFound) break;
      }
    }

    if (matchFound) {
      const isFinished = matchFound.status.finished;
      const isStarted = matchFound.status.started;
      const isCancelled = matchFound.status.cancelled;
      
      let status = 'NOT_STARTED';
      if (isFinished) status = 'FINISHED';
      else if (isStarted && !isCancelled) status = 'LIVE';

      return NextResponse.json({
        status: status,
        homeScore: matchFound.home.score ?? 0,
        awayScore: matchFound.away.score ?? 0,
        matchTime: matchFound.status.liveTime?.short || "1'"
      });
    } else {
      return NextResponse.json({ error: 'Mac listede bulunamadi', home, away }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Sunucu baglanti hatasi' }, { status: 500 });
  }
}