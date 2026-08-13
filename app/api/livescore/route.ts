// app/api/livescore/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// BİZİM SİSTEMDEKİ İSİM : DIŞ SİTELERDEKİ OLASI İSİMLER (Genişletilmiş)
const teamDictionary: Record<string, string[]> = {
  "KARABAĞ FK": ["qarabag", "qarabağ", "qarabag fk", "karabağ"],
  "DINAMO KIEV": ["dynamo kyiv", "dinamo kiev", "dinamo kyiv"],
  "BEŞİKTAŞ": ["besiktas", "beşiktaş", "besiktas jk"],
  "HRADEC KRALOVE": ["hradec kralove", "fc hradec kralove"],
  "STURM GRAZ": ["sturm graz", "sk sturm graz"],
  "FENERBAHÇE": ["fenerbahce", "fenerbahçe", "fenerbahce sk"],
  "PARIS SG": ["psg", "paris saint germain", "paris sg", "paris"],
  "ASTON VILLA": ["aston villa"],
  "GALATASARAY": ["galatasaray", "galatasaray sk"],
  "TRABZONSPOR": ["trabzonspor"]
};

// İstihbarat Timi'nin sızacağı çoklu kaynaklar (Hedefler)
const SOURCES = [
  { url: 'https://m.mackolik.com/canli-sonuclar', name: 'Kaynak 1 (Yerel)' },
  { url: 'https://www.bbc.com/sport/football/scores-fixtures', name: 'Kaynak 2 (Global)' },
  { url: 'https://www.skysports.com/football/live-scores', name: 'Kaynak 3 (Yedek)' }
];

export async function GET() {
  const liveScores: Record<string, string> = {};
  let successfulSource = "Bulunamadı";
  let agentLog = "";

  for (const source of SOURCES) {
    try {
      // Ajanımız sivil (gerçek bir tarayıcı) gibi davranmak için kılık değiştiriyor
      const response = await axios.get(source.url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7'
        },
        timeout: 5000 // 5 saniye içinde cevap alamazsa diğer siteye geçer
      });

      const $ = cheerio.load(response.data);
      let foundMatches = 0;

      // GENEL TARAMA ALGORİTMASI: Sitedeki tüm yazıları metin olarak alıp parçalamaya çalışıyoruz.
      // Çünkü her sitenin class (sınıf) isimleri farklıdır. Bordo Bereli ajanımız anahtar kelime arar.
      
      const pageText = $('body').text().toLowerCase();

      Object.keys(teamDictionary).forEach(homeTeam => {
        teamDictionary[homeTeam].forEach(homeAlias => {
          Object.keys(teamDictionary).forEach(awayTeam => {
            if (homeTeam === awayTeam) return;
            
            teamDictionary[awayTeam].forEach(awayAlias => {
              // Eğer sayfada hem ev sahibi hem deplasman takımı adı geçiyorsa
              if (pageText.includes(homeAlias) && pageText.includes(awayAlias)) {
                // Etrafındaki skor sayılarını bulmak için çok basit bir RegExp kullanıyoruz
                // Örneğin: "besiktas 1 - 0 hradec" veya "besiktas 1-0 hradec"
                const regex = new RegExp(`${homeAlias}.*?(\\d)\\s*-\\s*(\\d).*?${awayAlias}`, 'i');
                const match = pageText.match(regex);
                
                if (match) {
                  liveScores[`${homeTeam}-${awayTeam}`] = `${match[1]}-${match[2]}`;
                  foundMatches++;
                }
              }
            });
          });
        });
      });

      if (foundMatches > 0) {
        successfulSource = source.name;
        agentLog = `Ajan ${source.name} hedefine sızdı ve ${foundMatches} maç skoru buldu!`;
        break; // Skor bulduysa diğer siteleri yormaya gerek yok, döngüden çık.
      } else {
        agentLog += `[${source.name}: Skor Yok] `;
      }

    } catch (error) {
      agentLog += `[${source.name}: Kalkanlara Çarptı] `;
      continue; // Bu site engellediyse/çöktüyse hemen sonrakine geç
    }
  }

  // Eğer ajan tüm kaynakları gezip hiçbir şey bulamadıysa (Siteler JavaScript kalkanı veya Cloudflare açtıysa)
  if (Object.keys(liveScores).length === 0) {
    return NextResponse.json({ 
      success: false, 
      scores: {}, 
      message: "🚨 Ajan tüm kaynakları taradı ancak skor bulamadı. Siteler anti-bot kalkanı açmış olabilir.",
      log: agentLog
    });
  }

  return NextResponse.json({ 
    success: true, 
    scores: liveScores, 
    message: agentLog
  });
}