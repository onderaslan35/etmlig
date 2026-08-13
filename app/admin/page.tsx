'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// KÜRESEL TAKIM DEPOSU VE LİG MANGALARI
// ----------------------------------------------------
const LEAGUE_TEAMS: Record<string, string[]> = {
  "TÜRKİYE SÜPER LİG": ["ALANYASPOR", "AMED SPOR", "BAŞAKŞEHİR", "BEŞİKTAŞ", "ÇAYKUR RİZE", "ÇORUM FK", "ERZURUMSPOR", "EYÜPSPOR", "FENERBAHÇE", "GALATASARAY", "GAZİANTEP FK", "GENÇLERBİRLİĞİ", "GÖZTEPE", "KASIMPAŞA", "KOCAELİSPOR", "KONYASPOR", "SAMSUNSPOR", "TRABZONSPOR"],
  "TÜRKİYE 1.LİG": ["ANTALYASPOR", "BANDIRMASPOR", "BATMAN PETROL SPOR", "BODRUMSPOR", "BOLUSPOR", "BURSASPOR", "EROKSPOR", "FATİH KARAGÜMRÜK", "IĞDIR FK", "İSTANBULSPOR", "KAYSERİSPOR", "KEÇİÖRENGÜCÜ", "MANİSA FK", "MARDİN 1969", "MUĞLASPOR", "PENDİKSPOR", "SARIYER", "SİVASSPOR", "ÜMRANİYESPOR", "VANSPOR FK"],
  "PREMIER LEAGUE": ["ARSENAL", "ASTON VILLA", "BOURNEMOUTH", "BRENTFORD", "BRIGHTON", "CHELSEA", "COVENTRY CITY", "CRYSTAL PALACE", "EVERTON", "FULHAM", "HULL CITY", "IPSWICH TOWN", "LEEDS UNITED", "LIVERPOOL", "MANCHESTER CITY", "MANCHESTER UNITED", "NEWCASTLE UNITED", "NOTTINGHAM FOREST", "SUNDERLAND", "TOTTENHAM HOTSPUR"],
  "BUNDESLIGA": ["AUGSBURG", "BAYER LEVERKUSEN", "BAYERN MUNCHEN", "BORUSSIA DORTMUND", "MÖNCHENGLADBACH", "EINTRACHT FRANKFURT", "ELVERSBERG", "FREIBURG", "HAMBURG", "HOFFENHEIM", "KÖLN", "MAINZ 05", "RB LEIPZIG", "SCHALKE 04", "STUTTGART", "UNION BERLIN", "WERDER BREMEN", "PADERBORN 07"],
  "LIGUE 1": ["ANGERS", "BREST", "LE MANS", "LENS", "LILLE", "LORIENT", "LYON", "MARSEILLE", "MONACO", "PARIS FC", "PARIS SAINT-GERMAIN", "RENNES", "STRASBOURG", "TOULOUSE", "TROYES", "NICE", "LE HAVRE", "AUXERRE"],
  "SERIE A": ["ATALANTA", "BOLOGNA", "CAGLIARI", "COMO", "FIORENTINA", "FROSINONE", "GENOA", "INTER", "JUVENTUS", "LAZIO", "LECCE", "MILAN", "NAPOLI", "PARMA", "ROMA", "SASSUOLO", "TORINO", "UDINESE", "VENEZIA", "MONZA"],
  "LA LIGA": ["ALAVÉS", "ATLÉTICO MADRID", "ATHLETIC BILBAO", "BARCELONA", "CELTA VIGO", "DEPORTIVO LA CORUÑA", "ELCHE", "ESPANYOL", "GETAFE", "LEVANTE", "OSASUNA", "RACING SANTANDER", "RAYO VALLECANO", "REAL BETIS", "REAL MADRID", "REAL SOCIEDAD", "SEVILLA", "VALENCIA", "VILLARREAL", "MALAGA"],
  "MİLLİ TAKIMLAR": ["ALMANYA", "AMERİKA", "ANDORRA", "ANGOLA", "ARJANTİN", "ARNAVUTLUK", "AVUSTRALYA", "AVUSTURYA", "AZERBAYCAN", "BAHREYN", "BANGLADEŞ", "BELARUS", "BELÇİKA", "BOSNA HERSEK", "BREZİLYA", "BRİTANYA VİRJİN ADALARI", "BUHUTAN", "BULGARİSTAN", "BURNİKA FASO", "BURUNDİ", "CEBELİTARIK", "CEZAYİR", "ÇEKYA", "ÇİN", "ÇİN HONG KONG", "ÇURAÇAO", "DANİMARKA", "DOMİNİK CUMHURİYETİ", "EKVADOR", "EKVATOR GİNESİ", "EL SALVADOR", "ENDONEZYA", "FAS", "FİLDİŞİ SAHİLİ", "FİNLANDİYA", "FRANSA", "GALLER", "GANA", "GİNE", "GUATEMELA", "GÜNEY AFRİKA", "GÜNEY KORE", "GÜRCİSTAN", "HAİTİ", "HIRVATİSTAN", "HİNDİSTAN", "HOLLANDA", "IRAK", "İNGİLTERE", "İRAN", "İSKOÇYA", "İSPANYA", "İSRAİL", "İSVEÇ", "İSVİÇRE", "İTALYA", "İZLANDA", "JAPONYA", "KAMBOÇYA", "KANADA", "KARADAĞ", "KATAR", "KENYA", "KIBRIS", "KOLOMBİYA", "KONGO DC", "KOSOVA", "KOSTA RİKA", "KUVEYT", "KUZEY İRLANDA", "KUZEY MAKEDONYA", "LESOTHO", "LİHTENŞTAYN", "LÜKSEMBURG", "MACARİSTAN", "MADAGASKAR", "MALDİVLER", "MALTA", "MEKSİKA", "MISIR", "MOĞOLİSTAN", "MOLDOVA", "MORİTANYA", "NİJERYA", "NORVEÇ", "ORTA AFRİKA CUMHURİYETİ", "ÖZBEKİSTAN", "PAKİSTAN", "PANAMA", "PARAGUAY", "POLONYA", "PORTEKİZ", "ROMANYA", "RUSYA", "SAN MARİNO", "SENEGAL", "SIRBİSTAN", "SİNGAPUR", "SLOVAKYA", "SLOVENYA", "SURİYE", "SUUDİ ARABİSTAN", "TACİKİSTAN", "TANZANYA", "TAYLAND", "TOGO", "TRİNİDAD AND TABAGO", "TUNUS", "TÜRKİYE", "UGANDA", "UKRAYNA", "UMMAN", "URUGUAY", "ÜRDÜN", "YENİ ZELANDA", "YEŞİL BURUN ADALARI", "YUNANİSTAN"],
  "DİĞER AVRUPA": ["AGNATIA", "AJAX", "ANDERLECHT", "AUDA RIGA", "BENFICA", "BRAGA", "BRANN", "CSKA 1948", "CSKA SOFYA", "DINAMO KIEV", "DINAMO ZAGREB", "FERENCVAROS", "GORNİK ZABRZE", "GOTEBORG", "HAJDUK SPLIT", "HAMMARBY", "HEART", "IBERIA 1999", "INTER TURKU", "KARABAĞ FK", "KIZILYILDIZ", "KOPENAG", "KUPS", "LARNE FC", "LEVADIA FC", "LEVSKI SOFYA", "MIDTJYLLAND", "NK CELJE", "NK CERCLE", "PAKSI FC", "PANATHINAIKOS", "PAOK", "PATOS", "POLISSYA", "RAPID WIEN", "SABAH FK", "SANTA COLOMA FC", "FCSB", "SLOVAN BRATISLAVA", "SPARTAK TRNAVA", "ST GALLEN", "STURM GRAZ", "THUN", "TWENTE", "UNIVERSITATEA CLUJ", "UNIVERSITATEA CRAIOVA", "VOJVODINA", "ZELEZNICAR PANCEVO", "DINAMO MINSK", "SHELBOURNE", "GENT", "DEBRECEN", "HRADEC KRALOVE", "PAIDE LINNAMEESKOND", "BODO-GLIMT", "USG", "SPARTA PRAG", "NEC NIJMEGEN", "OLIMPIYAKOS", "FK KAUNO ZALGIRIS", "OLIMPIC LYON"]
};

const ALL_CLUBS = [
  ...LEAGUE_TEAMS["TÜRKİYE SÜPER LİG"], ...LEAGUE_TEAMS["TÜRKİYE 1.LİG"],
  ...LEAGUE_TEAMS["PREMIER LEAGUE"], ...LEAGUE_TEAMS["BUNDESLIGA"],
  ...LEAGUE_TEAMS["LIGUE 1"], ...LEAGUE_TEAMS["SERIE A"],
  ...LEAGUE_TEAMS["LA LIGA"], ...LEAGUE_TEAMS["DİĞER AVRUPA"]
];
// Bu değişken geçici olarak "Filtresiz" durumu sağlamak için tüm takımları tutuyor
const UNIQUE_CLUBS = [...new Set(ALL_CLUBS)].sort();

// ----------------------------------------------------
// LOGOLAR (KAYIP OLANLAR EKLENDİ)
// ----------------------------------------------------
const localTeamLogos: Record<string, string> = {
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "GALATASARAY": "https://de.wikipedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026_5-stars.svg",
  "KASIMPAŞA": "https://de.wikipedia.org/wiki/Special:FilePath/Kasimpasa_Logo.svg",
  "TRABZONSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Trabzonspor_2022.svg",
  "KONYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Konyaspor_(logo).svg",
  "ÇAYKUR RİZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Caykur_Rizespor_(logo).svg",
  "FATİH KARAGÜMRÜK": "https://fr.wikipedia.org/wiki/Special:FilePath/Fatih_Karag%C3%BCmr%C3%BCk_SK_(logo).svg",
  "ÜMRANİYESPOR": "https://el.wikipedia.org/wiki/Special:FilePath/%C3%9Cmraniyespor_(logo).svg",
  "GAZİANTEP FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gaziantep_FK.svg",
  "FENERBAHÇE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Fenerbah%C3%A7e_SK_-_120_Yil_(1907-2027).svg",
  "ALANYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Alanyaspor_(logo).svg",
  "GENÇLERBİRLİĞİ": "https://fr.wikipedia.org/wiki/Special:FilePath/Gen%C3%A7lerbirli%C4%9Fi_S.K._(logo).svg",
  "IĞDIR FK": "https://ar.wikipedia.org/wiki/Special:FilePath/I%C4%9Fd%C4%B1r_FK.svg",
  "VANSPOR FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Vanspor_FK_(2019).svg",
  "MANİSA FK": "https://tr.wikipedia.org/wiki/Special:FilePath/Manisa_FK.png",
  "BAŞAKŞEHİR": "https://de.wikipedia.org/wiki/Special:FilePath/Istanbul_Basaksehir_FK_Logo.svg",
  "KAYSERİSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Kayserispor.svg",
  "SİVASSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Sivasspor_-_Logo.svg",
  "AMED SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Amed_SK.png",
  "MARDİN 1969": "https://tr.wikipedia.org/wiki/Special:FilePath/Mardin_1969_SK.png",
  "ANTALYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Antalyaspor.svg",
  "BATMAN PETROL SPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Batman_Petrolspor.png",
  "KEÇİÖRENGÜCÜ": "https://tr.wikipedia.org/wiki/Special:FilePath/Ankara_Ke%C3%A7i%C3%B6reng%C3%BCc%C3%BC_SK.png",
  "BURSASPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Bursaspor_Logo.svg",
  "SAMSUNSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Samsunspor_2020.svg",
  "GÖZTEPE": "https://de.wikipedia.org/wiki/Special:FilePath/G%C3%B6ztepe.svg",
  "MANCHESTER CITY": "https://sco.wikipedia.org/wiki/Special:FilePath/Manchester_City_FC_badge.svg",
  "SPARTA PRAG": "https://tr.wikipedia.org/wiki/Special:FilePath/AC-Sparta-LOGO2021.svg",
  "OLIMPIYAKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Olympiacos_F.C_Emblem.svg",
  "KOCAELİSPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Kocaelispor.svg",
  "EYÜPSPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Ey%C3%BCpspor_Logosu.png",
  "HRADEC KRALOVE": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Hradec_Kralove.png",
  "PARIS SG": "https://en.wikipedia.org/wiki/Special:FilePath/Paris_Saint-Germain_F.C..svg",
  "ASTON VILLA": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Aston_Villa_FC_2024.svg",
  "STURM GRAZ": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Sturm_Graz_logo.svg",
  "DINAMO KIEV": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Dynamo_Kyiv_logo.svg",
  "REAL MADRID": "https://tr.wikipedia.org/wiki/Special:FilePath/Real_Madrid_CF_logo.svg",
  "JUVENTUS": "https://tr.wikipedia.org/wiki/Special:FilePath/Juventus_FC_-_Logo_2017.svg",
  "ROMA": "https://tr.wikipedia.org/wiki/Special:FilePath/AS_Roma_logo_(2017).svg",
  "ESPANYOL": "https://tr.wikipedia.org/wiki/Special:FilePath/RCD_Espanyol_logo.svg",
  
  // 🔴 YENİ EKLENEN VE DÜZELTİLEN LOGOLAR 🔴
  "OLIMPIC LYON": "https://tr.wikipedia.org/wiki/Special:FilePath/Olympique_Lyonnais_Logo_2022.svg",
  "FERENCVAROS": "https://tr.wikipedia.org/wiki/Special:FilePath/Ferencv%C3%A1rosi_TC_logo.svg",
  "MALAGA": "https://tr.wikipedia.org/wiki/Special:FilePath/M%C3%A1laga_CF_logo.svg",
  "DEPORTIVO LA CORUÑA": "https://tr.wikipedia.org/wiki/Special:FilePath/Real_Club_Deportivo_de_La_Coru%C3%B1a_logo.svg",
  "LILLE": "https://tr.wikipedia.org/wiki/Special:FilePath/Lille_OSC_2018_logo.svg",
  "BELÇİKA": "https://tr.wikipedia.org/wiki/Special:FilePath/Royal_Belgian_FA_logo_2019.svg",
  "BOSNA HERSEK": "https://tr.wikipedia.org/wiki/Special:FilePath/Football_Association_of_Bosnia_and_Herzegovina_logo.svg",
  "FK KAUNO ZALGIRIS": "https://upload.wikimedia.org/wikipedia/en/2/25/FK_Kauno_%C5%BDalgiris_logo.png", // Düzeltilmiş Link

  "ÇORUM FK": "/logos/corum-fk.png", "EROKSPOR": "/logos/erokspor.png", "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", 
  "BOLUSPOR": "/logos/boluspor.png", "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", "ARSENAL": "/logos/arsenal.png"
};

const CATEGORIES = [
  "BUNDESLIGA", "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", "EREDIVISIE",
  "FA CUP", "FIFA DÜNYA KUPASI", "LA LIGA", "LIGUE 1", "PORTEKİZ LİGİ", "PREMIER LEAGUE",
  "SCOTTISH PREMIER LEAGUE", "SERIE A", "TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG",
  "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG", "UEFA AVRUPA LİGİ GURUP AŞAMASI",
  "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ",
  "UEFA A.L. PLAY OFF RÖVANŞ", "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ",
  "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ",
  "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ",
  "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ",
  "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ",
  "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ",
  "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ"
];

// Arka plandaki DFO/TFF etiketlerini koruyan kodlar:
const isCategoryDFO = (cat: string) => cat.includes("ŞAMPİYONLAR") || cat.includes("AVRUPA LİGİ") || cat.includes("KONFERANS") || cat.includes("A.L.") || cat.includes("K.L.") || cat.includes("Ş.L.");
const isCategoryNational = (cat: string) => cat === "FIFA DÜNYA KUPASI" || cat === "UEFA AVRUPA ULUSLAR LİGİ";
const isTffMatchCheck = (category: string) => ["TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG"].includes(category.trim().toUpperCase());

const getDatesForWeek = (weekNum: number): string[] => {
  const dates = [];
  const weekDiff = weekNum - 5; 
  const startDate = new Date(2026, 7, 18); 
  startDate.setDate(startDate.getDate() + (weekDiff * 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    dates.push(`${day}.${month}.${year}`);
  }
  return dates;
};

const checkHasStarted = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false;
  const [day, month, year] = dateStr.split('.');
  const [hour, minute] = timeStr.split(':');
  const now = new Date();
  const matchDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  return now >= matchDate;
};

const TIME_OPTIONS: string[] = [];
for (let h = 12; h <= 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

// ----------------------------------------------------
// 🔴 4. HAFTA SABİT VERİLERİ
// ----------------------------------------------------
const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. HAFTA 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, weekLabel: "4. HAFTA 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, weekLabel: "4. HAFTA 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, weekLabel: "4. HAFTA 5. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, weekLabel: "4. HAFTA 6. MAÇ", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, weekLabel: "4. HAFTA 7. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, weekLabel: "4. HAFTA 8. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, weekLabel: "4. HAFTA 9. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" },
  { id: 10, weekLabel: "4. HAFTA 10. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, weekLabel: "4. HAFTA 11. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" },
  { id: 12, weekLabel: "4. HAFTA 12. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, weekLabel: "4. HAFTA 13. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" },
  { id: 14, weekLabel: "4. HAFTA 14. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, weekLabel: "4. HAFTA 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" },
  { id: 16, weekLabel: "4. HAFTA 16. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, weekLabel: "4. HAFTA 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, weekLabel: "4. HAFTA 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, weekLabel: "4. HAFTA 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, weekLabel: "4. HAFTA 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, weekLabel: "4. HAFTA 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, weekLabel: "4. HAFTA 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, weekLabel: "4. HAFTA 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, weekLabel: "4. HAFTA 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "DİNÇER KARACA 🏆🏆", 
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA",
  "262723": "AYHAN LUŞOĞLU"
};

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"], "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"], "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"], "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"], "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"], "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"], "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"], "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"], "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"], "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"], "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"], "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"], "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"], "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"], "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"], "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"], "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"], "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"], "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"], "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"], "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"], "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"], "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"], "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"], "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"], "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"], "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"], "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"], "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"], "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"], "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"], "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"], "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"], "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"], "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"], "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"], "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"], "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"], "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"], "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"], "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"], "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"], "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"], "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"], "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"], "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 🔴 ŞAMPİYONLAR LİGİ TEMASI "Ş.L." İÇİN DÜZELTİLDİ 🔴
const getEliteTheme = (category: string) => {
  const upCat = category.toUpperCase();
  if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) {
    return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-white/30", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
  } else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) {
    return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-orange-600/40", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
  } else if (upCat.includes("KONFERANS") || upCat.includes("K.L.")) {
    return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-emerald-600/40", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
  } else if (isTffMatchCheck(category)) {
    return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-red-600/40", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
  }
  return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", scoreBorder: "border-blue-600/40", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
};

type BulletinMatch = { category: string; date: string; time: string; home_team: string; away_team: string; };

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState<'live' | 'bulletin'>('live');
  const [activeMessage, setActiveMessage] = useState('');

  const [radarWeek, setRadarWeek] = useState<number>(4); 
  const [liveRadarMatches, setLiveRadarMatches] = useState<any[]>([]); 
  const [dbScores, setDbScores] = useState<Record<number, any>>({});
  const [localScores, setLocalScores] = useState<Record<number, { home: string, away: string }>>({});

  const [bulletinWeek, setBulletinWeek] = useState(5);
  const bulletinDates = getDatesForWeek(bulletinWeek);
  const [bulletinMatches, setBulletinMatches] = useState<BulletinMatch[]>(
    Array(24).fill(null).map(() => ({ category: CATEGORIES[0], date: bulletinDates[0], time: '19:00', home_team: '', away_team: '' }))
  );

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'mankoman' && password === '123456') {
      setIsAuthenticated(true);
      fetchRadarData();
    } else {
      setLoginError('Hatalı yetki bilgileri!');
    }
  };

  const fetchRadarData = async () => {
    if (!isAuthenticated) return;
    try {
      let matchesDataToProcess: any[] = [];
      const isWeek4 = radarWeek === 4;

      if (isWeek4) {
        matchesDataToProcess = week4Matches.map(m => ({
          globalId: m.id, 
          match_index: m.id,
          weekLabel: m.weekLabel,
          category: m.category,
          date: m.date,
          time: m.time,
          home_team: m.homeTeam,
          away_team: m.awayTeam
        }));
      } else {
        const { data: bData, error: bError } = await supabase
          .from('matches_bulletin')
          .select('*')
          .eq('week_num', radarWeek)
          .order('match_index', { ascending: true });

        if (bError || !bData || bData.length === 0) {
          setLiveRadarMatches([]); 
          setDbScores({});
          return;
        }

        matchesDataToProcess = bData.map(m => ({
          globalId: ((radarWeek - 1) * 24) + m.match_index,
          match_index: m.match_index,
          weekLabel: `${radarWeek}. HAFTA ${m.match_index}. MAÇ`,
          category: m.category,
          date: m.match_date,
          time: m.match_time,
          home_team: m.home_team,
          away_team: m.away_team
        }));
      }

      setLiveRadarMatches(matchesDataToProcess);

      const { data: sData } = await supabase.from('live_matches').select('*');
      const uniqueScores: Record<number, any> = {};
      const scoresLocal: Record<number, { home: string, away: string }> = {};
      let autoStartedAny = false;

      if (sData) sData.forEach(match => { uniqueScores[match.id] = match; });

      for (const m of matchesDataToProcess) {
        const globalMatchId = m.globalId; 
        const hasStarted = checkHasStarted(m.date, m.time);
        const dbMatch = uniqueScores[globalMatchId];
        
        if (hasStarted && (!dbMatch || dbMatch.home_score === '-' || !dbMatch.home_score)) {
          supabase.from('live_matches').upsert({ id: globalMatchId, home_score: '0', away_score: '0', status: 'LIVE' }).then();
          uniqueScores[globalMatchId] = { id: globalMatchId, home_score: '0', away_score: '0', status: 'LIVE' };
          scoresLocal[globalMatchId] = { home: '0', away: '0' };
          autoStartedAny = true;
        } else {
          scoresLocal[globalMatchId] = { 
            home: dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' ? dbMatch.home_score : '-', 
            away: dbMatch && dbMatch.away_score && dbMatch.away_score !== '-' ? dbMatch.away_score : '-' 
          };
        }
      }

      setDbScores(uniqueScores);
      setLocalScores(scoresLocal);

      if(autoStartedAny) {
         setActiveMessage(`⏰ Sistem saati gelen maçları otonom başlattı!`);
         setTimeout(() => setActiveMessage(''), 4000);
      }

    } catch (e) {
      console.log('Veri çekme hatası');
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'live') {
      fetchRadarData();
      const interval = setInterval(() => { fetchRadarData(); }, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab, radarWeek]); 

  const sendAgentToField = async () => {
    const liveMatchExists = Object.values(dbScores).some(m => m.status === 'LIVE' || m.status === 'HT');
    if (!liveMatchExists) return;

    try {
      setActiveMessage("🕵️‍♀️ Siber Ajan dışarıda skor arıyor...");
      const res = await fetch('/api/livescore');
      const data = await res.json();

      if (data.success && data.scores) {
        let updatedAny = false;
        for (const [matchKey, scrapedScore] of Object.entries(data.scores)) {
          const [scrapedHome, scrapedAway] = (scrapedScore as string).split('-');
          for (const m of liveRadarMatches) {
            const globalMatchId = m.globalId; 
            const dbMatch = dbScores[globalMatchId];
            if (dbMatch && (dbMatch.status === 'LIVE' || dbMatch.status === 'HT')) {
              const ourMatchKey = `${m.home_team}-${m.away_team}`;
              if (ourMatchKey === matchKey) {
                if (dbMatch.home_score !== scrapedHome || dbMatch.away_score !== scrapedAway) {
                  await supabase.from('live_matches').upsert({ id: globalMatchId, home_score: scrapedHome, away_score: scrapedAway, status: 'LIVE' });
                  updatedAny = true;
                  setActiveMessage(`🚨 AJAN MÜDAHALESİ: ${m.home_team} maçı ${scrapedHome}-${scrapedAway} yapıldı!`);
                }
              }
            }
          }
        }
        if (updatedAny) fetchRadarData();
        else {
          setActiveMessage("✅ Ajan Döndü: Yeni bir skor değişimi yok.");
          setTimeout(() => setActiveMessage(''), 2000);
        }
      }
    } catch (error) { console.log("Ajan başarısız"); }
  };

  const handleScoreChange = (id: number, type: 'home' | 'away', value: string) => {
    setLocalScores(prev => ({ ...prev, [id]: { ...prev[id], [type]: value } }));
  };

  const updateMatchScoreOnly = async (id: number) => {
    setActiveMessage(`Maç skoru güncelleniyor...`);
    const hScore = localScores[id]?.home || '-';
    const aScore = localScores[id]?.away || '-';
    try {
      await supabase.from('live_matches').upsert({ id: id, home_score: hScore, away_score: aScore, status: 'LIVE' });
      setActiveMessage(`✅ Maç CANLI olarak güncellendi!`);
      setTimeout(() => setActiveMessage(''), 2000);
      fetchRadarData();
    } catch (e) { setActiveMessage(`❌ Güncelleme hatası`); }
  };

  const finalizeMatch = async (id: number, homeTeam: string, awayTeam: string) => {
    const hScore = localScores[id]?.home || '-';
    const aScore = localScores[id]?.away || '-';
    if (hScore === '-' || aScore === '-') return alert("Maç skoru boş!");

    if (window.confirm(`DİKKAT: ${homeTeam} ${hScore} - ${aScore} ${awayTeam} maçını onaylıyor musunuz?`)) {
      setActiveMessage(`Maç onaylanıyor...`);
      try {
        await supabase.from('live_matches').upsert({ id: id, home_score: hScore, away_score: aScore, status: 'FINISHED' });
        setActiveMessage(`✅ Maç tamamlandı!`);
        setTimeout(() => setActiveMessage(''), 3000);
        fetchRadarData();
      } catch (e) { setActiveMessage(`❌ Onaylama hatası`); }
    }
  };

  const resetSingleMatch = async (id: number, homeTeam: string, awayTeam: string) => {
    if (window.confirm(`DİKKAT: ${homeTeam} - ${awayTeam} silinecek. Emin misiniz?`)) {
      setActiveMessage(`Maç siliniyor...`);
      try {
        await supabase.from('live_matches').delete().eq('id', id);
        setLocalScores(prev => ({ ...prev, [id]: { home: '-', away: '-' } }));
        setActiveMessage(`✅ Maç sıfırlandı!`);
        setTimeout(() => setActiveMessage(''), 3000);
        fetchRadarData();
      } catch (e) { setActiveMessage(`❌ Silme hatası`); }
    }
  };

  useEffect(() => {
    const fetchBulletinMemory = async () => {
      if (!isAuthenticated) return;
      setActiveMessage(`⏳ ${bulletinWeek}. Hafta Arşivi Aranıyor...`);
      const { data, error } = await supabase.from('matches_bulletin').select('*').eq('week_num', bulletinWeek).order('match_index', { ascending: true });
      const newDates = getDatesForWeek(bulletinWeek);
      
      if (data && data.length > 0) {
        const restored = Array(24).fill(null).map((_, i) => {
          const dbM = data.find(m => m.match_index === i + 1);
          if (dbM) return { category: dbM.category, date: dbM.match_date, time: dbM.match_time, home_team: dbM.home_team, away_team: dbM.away_team };
          return { category: CATEGORIES[0], date: newDates[0], time: '19:00', home_team: '', away_team: '' };
        });
        setBulletinMatches(restored);
        setActiveMessage(`✅ ${bulletinWeek}. Hafta Kayıtları Başarıyla Yüklendi!`);
      } else {
        setBulletinMatches(Array(24).fill(null).map(() => ({ category: CATEGORIES[0], date: newDates[0], time: '19:00', home_team: '', away_team: '' })));
        setActiveMessage(`📝 ${bulletinWeek}. Hafta İçin Yeni Boş Şablon Açıldı.`);
      }
      setTimeout(() => setActiveMessage(''), 3000);
    };

    if (activeTab === 'bulletin') {
      fetchBulletinMemory();
    }
  }, [bulletinWeek, activeTab, isAuthenticated]);

  const handleBulletinChange = (index: number, field: keyof BulletinMatch, value: string) => {
    const newMatches = [...bulletinMatches];
    newMatches[index] = { ...newMatches[index], [field]: value };
    if (field === 'category') {
      newMatches[index].home_team = '';
      newMatches[index].away_team = '';
    }
    setBulletinMatches(newMatches);
  };

  // 🔴 "AKILLI FİLTRE" BU HAFTALIK İPTAL EDİLDİ - SADECE AYNI TAKIMIN 2 KERE SEÇİLMESİ ENGELLENDİ 🔴
  const getAvailableTeams = (matchIndex: number, position: 'home' | 'away', category: string) => {
    const baseList = UNIQUE_CLUBS; // Kategori fark etmeksizin TÜM takımlar gelsin!
    const usedTeams = new Set<string>();

    bulletinMatches.forEach((m, idx) => {
      if (idx === matchIndex) return; 
      // Sadece aynı takımı tekrar seçmeyi engelle
      if (m.home_team) usedTeams.add(m.home_team);
      if (m.away_team) usedTeams.add(m.away_team);
    });

    const opposingTeam = position === 'home' ? bulletinMatches[matchIndex].away_team : bulletinMatches[matchIndex].home_team;
    if (opposingTeam) usedTeams.add(opposingTeam);

    return baseList.filter(team => !usedTeams.has(team)).sort();
  };

  const saveBulletinToDatabase = async () => {
    const emptyMatchIndex = bulletinMatches.findIndex(m => !m.home_team || !m.away_team);
    if (emptyMatchIndex !== -1) {
      alert(`HATA: ${emptyMatchIndex + 1}. Maçın takımları eksik!`);
      return;
    }
    if (!window.confirm(`🚨 DİKKAT: ${bulletinWeek}. Hafta Bülteni (24 Maç) Veritabanına Yüklenecek!\n\nEmin misiniz?`)) return;
    setActiveMessage("Bülten veritabanına mühürleniyor...");

    try {
      const payload = bulletinMatches.map((m, index) => ({
        week_num: bulletinWeek,
        match_index: index + 1,
        category: m.category,
        match_date: m.date,
        match_time: m.time,
        home_team: m.home_team,
        away_team: m.away_team,
        league_type: isTffMatchCheck(m.category) ? 'TFF' : 'DFO'
      }));

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      setActiveMessage(`✅ BAŞARILI! ${bulletinWeek}. Hafta Bülteni Kaydedildi!`);
      setTimeout(() => setActiveMessage(''), 5000);
    } catch (error) {
      setActiveMessage(`❌ HATA: Yükleme Başarısız!`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <h1 className="text-2xl font-black text-amber-500 mb-6 text-center tracking-widest">ETML KUMANDA</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input type="text" placeholder="Kullanıcı Adı" value={username} onChange={e => setUsername(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500" />
            <input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} className="bg-slate-950 border border-slate-700 px-4 py-3 rounded-xl text-white outline-none focus:border-amber-500" />
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg mt-2 tracking-widest">SİSTEME GİRİŞ YAP</button>
          </form>
        </div>
      </div>
    );
  }

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-2xl font-black text-amber-500 tracking-wider">🛠 ETML OPERASYON MERKEZİ 5.1</h1>
            <p className="text-slate-400 text-sm mt-1">Canlı Radar, Tüm Takımlar & Hafızalı Editör <span className="text-emerald-400 font-bold">AKTİF</span></p>
          </div>
          <div className="relative z-10 mt-4 md:mt-0 h-10 flex items-center">
             {activeMessage && <div className="text-sm font-bold text-emerald-400 animate-pulse bg-emerald-950/80 px-4 py-2 rounded-lg border border-emerald-500 shadow-lg">{activeMessage}</div>}
          </div>
        </div>

        <div className="w-full flex gap-2 mb-8 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button onClick={() => setActiveTab('live')} className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all ${activeTab === 'live' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            📡 CANLI SKOR RADARI
          </button>
          <button onClick={() => setActiveTab('bulletin')} className={`flex-1 py-3 rounded-lg font-black text-sm tracking-widest transition-all ${activeTab === 'bulletin' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            📅 YENİ BÜLTEN & ARŞİV MERKEZİ
          </button>
        </div>

        {activeTab === 'live' && (
          <>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-amber-500 font-bold uppercase tracking-widest text-sm">RADAR HAFTASI:</span>
                <select 
                  value={radarWeek} 
                  onChange={e => setRadarWeek(Number(e.target.value))}
                  className="bg-amber-950 border border-amber-500/50 text-amber-300 font-black text-lg px-4 py-1.5 rounded-xl outline-none shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>{w}. HAFTA MAÇLARI</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <button onClick={sendAgentToField} className="bg-purple-900/80 hover:bg-purple-800 text-purple-200 px-4 py-2 rounded-xl text-sm font-bold border border-purple-700 shadow-lg flex items-center gap-2"><span className="animate-pulse">🕵️‍♀️</span> Ajanı Zorla Yolla</button>
                <button onClick={fetchRadarData} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-bold border border-slate-600 shadow-lg flex items-center gap-2"><span className="animate-spin-slow">🔄</span> Yenile</button>
              </div>
            </div>

            {liveRadarMatches.length === 0 ? (
              <div className="w-full py-20 text-center bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
                <span className="text-4xl block mb-4">📭</span>
                <h3 className="text-xl font-bold text-slate-400">Veritabanında Kayıt Yok</h3>
                <p className="text-slate-500 mt-2">{radarWeek}. Hafta bülteni henüz sisteme girilmemiş. "Yeni Bülten" sekmesinden hazırlayabilirsin.</p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {liveRadarMatches.map(match => {
                  const globalMatchId = match.globalId; 
                  const dbMatch = dbScores[globalMatchId];
                  const status = dbMatch?.status || 'NOT_STARTED';
                  const isFinished = status === 'FINISHED';
                  
                  const homeLogoUrl = localTeamLogos[match.home_team] || "/logos/default.png";
                  const awayLogoUrl = localTeamLogos[match.away_team] || "/logos/default.png";
                  const theme = getEliteTheme(match.category);
                  const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ') || match.category.toUpperCase().includes('Ş.L.');

                  const hScore = localScores[globalMatchId]?.home || '-';
                  const aScore = localScores[globalMatchId]?.away || '-';
                  
                  let currentWinners: string[] = [];
                  if (hScore !== '-' && aScore !== '-') {
                    const targetScore = `${hScore}-${aScore}`;
                    if (radarWeek === 4) {
                      currentWinners = Object.keys(week4PredictionsData)
                        .filter(id => week4PredictionsData[id][match.match_index - 1] === targetScore)
                        .map(id => allPlayersList[id])
                        .sort((a, b) => a.localeCompare(b, 'tr'));
                    }
                  }
                  
                  const winnersCount = currentWinners.length;
                  let displayPoints = 1;
                  if(winnersCount === 1) displayPoints = 12;
                  else if(winnersCount === 2) displayPoints = 6;
                  else if(winnersCount === 3) displayPoints = 5;
                  else if(winnersCount === 4) displayPoints = 4;
                  else if(winnersCount === 5) displayPoints = 3;
                  else if(winnersCount === 6) displayPoints = 2;
                  else if(winnersCount >= 7) displayPoints = 1;
                  else displayPoints = 0;

                  return (
                    <div key={globalMatchId} className={`w-full mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                      {theme.bgImg && (
                        <>
                          <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                          <div className="absolute inset-0 bg-slate-900/70 z-0"></div>
                        </>
                      )}
                      <div className="relative z-10 flex flex-col h-full">
                        
                        {/* 🔴 RADAR KARTINA TARİH VE SAAT EKLENDİ 🔴 */}
                        <div className="w-full flex justify-between items-center px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">{match.weekLabel}</span>
                          <span className="text-[10px] font-bold text-slate-300 bg-slate-900/50 px-2 py-1 rounded">{match.date} - {match.time}</span>
                          {isFinished ? <span className="text-[9px] font-black text-emerald-500 bg-emerald-950/50 px-2 py-1 rounded border border-emerald-800/50">ONAYLANDI</span> : status === 'LIVE' ? <span className="text-[9px] font-black text-red-500 bg-red-950/50 px-2 py-1 rounded border border-red-800/50 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">CANLI YAYINDA</span> : <span className="text-[9px] font-black text-slate-500 bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">BEKLEMEDE</span>}
                        </div>

                        <div className="w-full text-center px-2 mt-1">
                          <span className={`inline-block px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>{match.category}</span>
                        </div>

                        <div className="flex items-center justify-between px-4 pt-3 pb-4">
                          <div className="flex flex-col items-center justify-center flex-1 gap-2">
                            <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={homeLogoUrl} alt={match.home_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.home_team}</span>
                          </div>

                          <div className="flex flex-col items-center justify-center gap-2 mx-2 w-40 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select value={hScore} onChange={e => handleScoreChange(globalMatchId, 'home', e.target.value)} disabled={isFinished} className={`w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-white outline-none focus:border-amber-500 disabled:opacity-50 cursor-pointer appearance-none shadow-inner ${status === 'LIVE' ? 'text-amber-400' : ''}`} style={{ textAlignLast: 'center' }}>
                                {scoreOptions.map(opt => (<option key={`h-${opt}`} value={opt}>{opt}</option>))}
                              </select>
                              <span className={`text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                              <select value={aScore} onChange={e => handleScoreChange(globalMatchId, 'away', e.target.value)} disabled={isFinished} className={`w-12 h-10 bg-slate-950 border border-slate-700 rounded-lg font-black text-xl text-white outline-none focus:border-amber-500 disabled:opacity-50 cursor-pointer appearance-none shadow-inner ${status === 'LIVE' ? 'text-amber-400' : ''}`} style={{ textAlignLast: 'center' }}>
                                {scoreOptions.map(opt => (<option key={`a-${opt}`} value={opt}>{opt}</option>))}
                              </select>
                            </div>
                          </div>

                          <div className="flex flex-col items-center justify-center flex-1 gap-2">
                            <div className="w-16 h-16 flex items-center justify-center relative z-20"><img src={awayLogoUrl} alt={match.away_team} className="w-full h-full object-contain drop-shadow-lg" /></div>
                            <span className="text-white font-extrabold text-[10px] text-center uppercase tracking-wide drop-shadow-md">{match.away_team}</span>
                          </div>
                        </div>

                        {!isFinished && (
                          <div className="grid grid-cols-3 gap-2 px-4 pb-4 z-20 relative">
                            <button onClick={() => updateMatchScoreOnly(globalMatchId)} className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-2.5 rounded-lg border border-slate-600 shadow-md">Skoru Güncelle</button>
                            <button onClick={() => resetSingleMatch(globalMatchId, match.home_team, match.away_team)} className="bg-red-900/80 hover:bg-red-800 text-red-200 text-[10px] font-bold py-2.5 rounded-lg border border-red-700 shadow-md">Resetle</button>
                            <button onClick={() => finalizeMatch(globalMatchId, match.home_team, match.away_team)} className="bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-black py-2.5 rounded-lg border border-emerald-600 shadow-md">Onayla</button>
                          </div>
                        )}

                        <div className={`${theme.bottomBar} border-t px-4 py-3 w-full backdrop-blur-md z-10 relative mt-auto`}>
                          <div className="flex justify-between items-center w-full mb-2">
                            <span className="text-[10px] font-bold text-slate-300">ANLIK RADAR</span>
                            {radarWeek === 4 && (
                               <span className={`text-[9px] font-black tracking-widest px-2 py-0.5 rounded border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>Kişi Başı: {displayPoints} Puan</span>
                            )}
                          </div>
                          {(hScore === '-' || aScore === '-') ? (
                            <span className="text-[10px] font-medium text-slate-500 italic block text-center py-2">Skor bekleniyor...</span>
                          ) : radarWeek !== 4 ? (
                             <span className="text-[10px] font-medium text-amber-500 italic block text-center py-2">Kullanıcı tahminleri veritabanına eklendiğinde liste aktif olur.</span>
                          ) : winnersCount === 0 ? (
                            <span className="text-[10px] font-medium text-slate-500 italic block text-center py-2">Şu anki skoru bilen yok.</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto pr-1 custom-scrollbar">
                              {currentWinners.map((w, idx) => (<span key={idx} className="bg-blue-900/60 text-white border border-blue-500/50 px-1.5 py-0.5 rounded text-[9px] font-medium shadow-sm">{w}</span>))}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ===================== BÜLTEN EDİTÖRÜ TABI ===================== */}
        {activeTab === 'bulletin' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-black text-indigo-400">📅 MAÇ BÜLTENİ EDİTÖRÜ</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-300 font-bold uppercase tracking-widest text-sm">Hangi Hafta?</span>
                <select 
                  value={bulletinWeek} 
                  onChange={e => setBulletinWeek(Number(e.target.value))}
                  className="bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-black text-xl px-4 py-2 rounded-xl outline-none"
                >
                  {[5,6,7,8,9,10,11,12].map(w => <option key={w} value={w}>{w}. HAFTA</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bulletinMatches.map((match, idx) => {
                const matchNum = idx + 1;
                const isTff = isTffMatchCheck(match.category);
                const homeOptions = getAvailableTeams(idx, 'home', match.category);
                const awayOptions = getAvailableTeams(idx, 'away', match.category);

                return (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-indigo-500 transition-colors"></div>

                    <div className="flex justify-between items-center pl-2 border-b border-slate-800 pb-2">
                      <span className="font-black text-slate-300 text-sm tracking-widest">{bulletinWeek}. HAFTA / {matchNum}. MAÇ</span>
                      <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded shadow-sm ${isTff ? 'bg-red-950/80 text-red-400 border border-red-500/50' : 'bg-blue-950/80 text-blue-400 border border-blue-500/50'}`}>
                        {isTff ? '[TFF OTOMATİK]' : '[DFO OTOMATİK]'}
                      </span>
                    </div>

                    <div className="grid grid-cols-12 gap-3 pl-2">
                      <div className="col-span-12 md:col-span-6">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Kategori / Turnuva</label>
                        <select value={match.category} onChange={e => handleBulletinChange(idx, 'category', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-200 outline-none focus:border-indigo-500">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Tarih</label>
                        <select value={match.date} onChange={e => handleBulletinChange(idx, 'date', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-emerald-400 outline-none focus:border-indigo-500">
                          {bulletinDates.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div className="col-span-6 md:col-span-3">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 block">Saat</label>
                        <select value={match.time} onChange={e => handleBulletinChange(idx, 'time', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs font-bold text-amber-400 outline-none focus:border-indigo-500">
                          {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pl-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800/50">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">🏠 EV SAHİBİ</label>
                        <select value={match.home_team} onChange={e => handleBulletinChange(idx, 'home_team', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2.5 text-[11px] font-bold text-white outline-none focus:border-indigo-500">
                          <option value="">-- {homeOptions.length} TAKIM BULUNDU --</option>
                          {match.home_team && !homeOptions.includes(match.home_team) && <option value={match.home_team}>{match.home_team}</option>}
                          {homeOptions.map(t => <option key={`h-${t}`} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">✈️ DEPLASMAN</label>
                        <select value={match.away_team} onChange={e => handleBulletinChange(idx, 'away_team', e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-2.5 text-[11px] font-bold text-white outline-none focus:border-indigo-500 text-right" style={{ direction: 'rtl' }}>
                          <option value="">-- {awayOptions.length} TAKIM BULUNDU --</option>
                          {match.away_team && !awayOptions.includes(match.away_team) && <option value={match.away_team}>{match.away_team}</option>}
                          {awayOptions.map(t => <option key={`a-${t}`} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 pt-6 border-t border-slate-800 flex justify-center sticky bottom-4 z-50">
              <button 
                onClick={saveBulletinToDatabase}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-lg md:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-indigo-400/50"
              >
                🚀 {bulletinWeek}. HAFTA BÜLTENİNİ YAYINLA VE KAYDET
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}