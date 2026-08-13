// app/api/livescore/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// BİZİM SİSTEMDEKİ İSİM : DIŞ SİTEDEKİ İSİM (Küçük harflerle eşleşme)
const teamDictionary: Record<string, string[]> = {
  "KARABAĞ FK": ["qarabag", "qarabağ", "qarabag fk"],
  "DINAMO KIEV": ["dynamo kyiv", "dinamo kiev"],
  "BEŞİKTAŞ": ["besiktas", "beşiktaş"],
  "HRADEC KRALOVE": ["hradec kralove", "fc hradec kralove"],
  "STURM GRAZ": ["sturm graz", "sk sturm graz"],
  "FENERBAHÇE": ["fenerbahce", "fenerbahçe"],
  "PARIS SG": ["psg", "paris saint germain", "paris sg"],
  "ASTON VILLA": ["aston villa"]
};

export async function GET() {
  try {
    // Güvenilir, hafif ve kazıması kolay bir canlı skor sitesine sızıyoruz
    // Not: Bu deneysel bir URL'dir. Gerçekte BBC Sport, Google vb. kullanılabilir.
    // Şimdilik test amaçlı global bir spor haberleri arama sayfası mantığı kullanıyoruz.
    const response = await axios.get('https://www.livescore.com/en/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
    });

    const $ = cheerio.load(response.data);
    const liveScores: Record<string, string> = {};

    // Sitedeki maç bloklarını tarama (Site tasarımına göre değişebilir, şu an genel bir yakalayıcı)
    $('.MatchRow_container__3sS5w').each((i, element) => {
      const homeTeamRaw = $(element).find('.MatchRowTimeScore_home__1yq9O').text().toLowerCase().trim();
      const awayTeamRaw = $(element).find('.MatchRowTimeScore_away__1Kz5T').text().toLowerCase().trim();
      const scoreStr = $(element).find('.MatchRowTimeScore_score__1_Q6_').text().trim(); // "1 - 0" veya "0 - 0"

      if (scoreStr && scoreStr.includes('-')) {
        const scores = scoreStr.split('-');
        const hScore = scores[0].trim();
        const aScore = scores[1].trim();

        // Sözlükte eşleşme arama
        let matchedHome = "";
        let matchedAway = "";

        Object.keys(teamDictionary).forEach(ourTeam => {
          if (teamDictionary[ourTeam].some(alias => homeTeamRaw.includes(alias))) matchedHome = ourTeam;
          if (teamDictionary[ourTeam].some(alias => awayTeamRaw.includes(alias))) matchedAway = ourTeam;
        });

        if (matchedHome && matchedAway) {
          liveScores[`${matchedHome}-${matchedAway}`] = `${hScore}-${aScore}`;
        }
      }
    });

    return NextResponse.json({ success: true, scores: liveScores });

  } catch (error) {
    console.error("Ajan sahada vuruldu:", error);
    return NextResponse.json({ success: false, error: "İstihbarat alınamadı" });
  }
}