import { NextResponse } from 'next/server';

// 🔴 EKMEL DOKUNUŞU: Bu sayede Next.js skoru hafızaya almaz (cache yapmaz), her saniye güncel çeker!
export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const home = searchParams.get('home')?.toUpperCase();
  const away = searchParams.get('away')?.toUpperCase();

  if (!home || !away) {
    return NextResponse.json({ error: 'Eksik takim bilgisi' }, { status: 400 });
  }

  try {
    // Bugünün tarihini FotMob'un anladığı formata (YYYYMMDD) çeviriyoruz
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    // FotMob'un Günlük Canlı Maçlar Sistemine Sızıyoruz
    const response = await fetch(`https://www.fotmob.com/api/matches?date=${dateStr}`, {
      headers: {
        'Cache-Control': 'no-cache',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
      }
    });
    
    const data = await response.json();
    let matchFound = null;

    // FotMob'un o devasa lig listesi içinde bizim Kairat Almaty'yi arıyoruz
    if (data && data.leagues) {
      for (const league of data.leagues) {
        for (const m of league.matches) {
          const fotmobHome = m.home.name.toUpperCase();
          const fotmobAway = m.away.name.toUpperCase();

          // Kısmi eşleşme: İsimlerin bir kısmı uysa bile yakalar (Örn: "KAIRAT ALMATY" ile "Kairat")
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

    // EĞER MAÇI BULDUYSAK VİTRİNE GÖNDER!
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
      return NextResponse.json({ error: 'Mac henüz FotMob listesine dusmedi veya bulunamadi.' }, { status: 404 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'FotMob baglanti hatasi' }, { status: 500 });
  }
}