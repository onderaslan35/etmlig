'use client';

import React, { useState, useEffect } from "react";
import { supabase } from '@/utils/supabase';

// ----------------------------------------------------
// 🔴 LİGLERE GÖRE KESİN TAKIM KÜMELERİ (ÖNDER ABİ'NİN LİSTESİ) 🔴
// ----------------------------------------------------
const LEAGUE_TEAMS: Record<string, string[]> = {
  "TÜRKİYE SÜPER LİG": [
    "ALANYASPOR", "AMED SPOR", "BAŞAKŞEHİR", "BEŞİKTAŞ", "ÇAYKUR RİZE", "ÇORUM FK",
    "ERZURUMSPOR", "EYÜPSPOR", "FENERBAHÇE", "GALATASARAY", "GAZİANTEP FK",
    "GENÇLERBİRLİĞİ", "GÖZTEPE", "KASIMPAŞA", "KOCAELİSPOR", "KONYASPOR",
    "SAMSUNSPOR", "TRABZONSPOR"
  ],
  "TÜRKİYE 1.LİG": [
    "ANTALYASPOR", "BANDIRMASPOR", "BATMAN PETROL SPOR", "BODRUMSPOR", "BOLUSPOR",
    "BURSASPOR", "EROKSPOR", "FATİH KARAGÜMRÜK", "IĞDIR FK", "İSTANBULSPOR",
    "KAYSERİSPOR", "KEÇİÖRENGÜCÜ", "MANİSA FK", "MARDİN 1969", "MUĞLASPOR",
    "PENDİKSPOR", "SARIYER", "SİVASSPOR", "ÜMRANİYESPOR", "VANSPOR FK"
  ],
  "İNGİLTERE PREMIER LİG": [
    "ARSENAL", "ASTON VILLA", "BOURNEMOUTH", "BRENTFORD", "BRIGHTON", "CHELSEA",
    "COVENTRY CITY", "CRYSTAL PALACE", "EVERTON", "FULHAM", "HULL CITY", "IPSWICH TOWN",
    "LEEDS UNITED", "LIVERPOOL", "MANCHESTER CITY", "MANCHESTER UNITED",
    "NEWCASTLE UNITED", "NOTTINGHAM FOREST", "SUNDERLAND", "TOTTENHAM HOTSPUR"
  ],
  "ALMANYA BUNDESLIGA": [
    "AUGSBURG", "BAYER LEVERKUSEN", "BAYERN MUNCHEN", "BORUSSIA DORTMUND",
    "MÖNCHENGLADBACH", "EINTRACHT FRANKFURT", "ELVERSBERG", "FREIBURG", "HAMBURG",
    "HOFFENHEIM", "KÖLN", "MAINZ 05", "RB LEIPZIG", "SCHALKE 04", "STUTTGART",
    "UNION BERLIN", "WERDER BREMEN", "PADERBORN 07"
  ],
  "FRANSA LIGUE 1": [
    "ANGERS", "BREST", "LE MANS", "LENS", "LILLE", "LORIENT", "LYON", "MARSEILLE",
    "MONACO", "PARIS FC", "PARIS SAINT-GERMAIN", "RENNES", "STRASBOURG", "TOULOUSE",
    "TROYES", "NICE", "LE HAVRE", "AUXERRE"
  ],
  "İTALYA SERIE A": [
    "ATALANTA", "BOLOGNA", "CAGLIARI", "COMO", "FIORENTINA", "FROSINONE", "GENOA",
    "INTER", "JUVENTUS", "LAZIO", "LECCE", "MILAN", "NAPOLI", "PARMA", "ROMA",
    "SASSUOLO", "TORINO", "UDINESE", "VENEZIA", "MONZA"
  ],
  "İSPANYA LA LIGA": [
    "ALAVÉS", "ATLÉTICO MADRID", "ATHLETIC BILBAO", "BARCELONA", "CELTA VIGO",
    "DEPORTIVO LA CORUÑA", "ELCHE", "ESPANYOL", "GETAFE", "LEVANTE", "OSASUNA",
    "RACING SANTANDER", "RAYO VALLECANO", "REAL BETIS", "REAL MADRID",
    "REAL SOCIEDAD", "SEVILLA", "VALENCIA", "VILLARREAL", "MALAGA"
  ],
  "MİLLİ TAKIMLAR": [
    "ALMANYA", "AMERİKA", "ANDORRA", "ANGOLA", "ARJANTİN", "ARNAVUTLUK", "AVUSTRALYA",
    "AVUSTURYA", "AZERBAYCAN", "BAHREYN", "BANGLADEŞ", "BELARUS", "BELÇİKA",
    "BOSNA HERSEK", "BREZİLYA", "BRİTANYA VİRJİN ADALARI", "BUHUTAN", "BULGARİSTAN",
    "BURNİKA FASO", "BURUNDİ", "CEBELİTARIK", "CEZAYİR", "ÇEKYA", "ÇİN", "ÇİN HONG KONG",
    "ÇURAÇAO", "DANİMARKA", "DOMİNİK CUMHURİYETİ", "EKVADOR", "EKVATOR GİNESİ",
    "EL SALVADOR", "ENDONEZYA", "FAS", "FİLDİŞİ SAHİLİ", "FİNLANDİYA", "FRANSA",
    "GALLER", "GANA", "GİNE", "GUATEMELA", "GÜNEY AFRİKA", "GÜNEY KORE", "GÜRCİSTAN",
    "HAİTİ", "HIRVATİSTAN", "HİNDİSTAN", "HOLLANDA", "IRAK", "İNGİLTERE", "İRAN",
    "İSKOÇYA", "İSPANYA", "İSRAİL", "İSVEÇ", "İSVİÇRE", "İTALYA", "İZLANDA", "JAPONYA",
    "KAMBOÇYA", "KANADA", "KARADAĞ", "KATAR", "KENYA", "KIBRIS", "KOLOMBİYA",
    "KONGO DC", "KOSOVA", "KOSTA RİKA", "KUVEYT", "KUZEY İRLANDA", "KUZEY MAKEDONYA",
    "LESOTHO", "LİHTENŞTAYN", "LÜKSEMBURG", "MACARİSTAN", "MADAGASKAR", "MALDİVLER",
    "MALTA", "MEKSİKA", "MISIR", "MOĞOLİSTAN", "MOLDOVA", "MORİTANYA", "NİJERYA",
    "NORVEÇ", "ORTA AFRİKA CUMHURİYETİ", "ÖZBEKİSTAN", "PAKİSTAN", "PANAMA",
    "PARAGUAY", "POLONYA", "PORTEKİZ", "ROMANYA", "RUSYA", "SAN MARİNO", "SENEGAL",
    "SIRBİSTAN", "SİNGAPUR", "SLOVAKYA", "SLOVENYA", "SURİYE", "SUUDİ ARABİSTAN",
    "TACİKİSTAN", "TANZANYA", "TAYLAND", "TOGO", "TRİNİDAD AND TABAGO", "TUNUS",
    "TÜRKİYE", "UGANDA", "UKRAYNA", "UMMAN", "URUGUAY", "ÜRDÜN", "YENİ ZELANDA",
    "YEŞİL BURUN ADALARI", "YUNANİSTAN"
  ],
  "ÇEŞİTLİ AVRUPA TAKIMLARI": [
    "AGNATIA", "AJAX", "ANDERLECHT", "AUDA RIGA", "BAŞAKŞEHİR", "BENFICA", "BEŞİKTAŞ",
    "BRAGA", "BRANN", "CSKA 1948", "CSKA SOFYA", "DINAMO KIEV", "DINAMO ZAGREB",
    "FENERBAHÇE", "FERENCVAROS", "GORNİK ZABRZE", "GOTEBORG", "HAJDUK SPLIT",
    "HAMMARBY", "HEART", "IBERIA 1999", "INTER TURKU", "KARABAĞ FK", "KIZILYILDIZ",
    "KOPENAG", "KUPS", "LARNE FC", "LEVADIA FC", "LEVSKI SOFYA", "MIDTJYLLAND",
    "NK CELJE", "NK CERCLE", "PAKSI FC", "PANATHINAIKOS", "PAOK", "PATOS", "POLISSYA",
    "RAPID WIEN", "SABAH FK", "SANTA COLOMA FC", "FCSB", "SLOVAN BRATISLAVA",
    "SPARTAK TRNAVA", "ST GALLEN", "STURM GRAZ", "THUN", "TWENTE", "UNIVERSITATEA CLUJ",
    "UNIVERSITATEA CRAIOVA", "VOJVODINA", "ZELEZNICAR PANCEVO", "DINAMO MINSK",
    "SHELBOURNE", "GENT", "DEBRECEN", "HRADEC KRALOVE", "PAIDE LINNAMEESKOND",
    "BODO-GLIMT", "USG", "OLIMPIC LYON", "SPARTA PRAG", "NEC NIJMEGEN", "OLIMPIYAKOS",
    "FK ZALGIRIS"
  ]
};

// Takım ismi yazıldığında tüm listelerde arayıp resmini bulabilmesi için logo havuzu 
// (Eksik olanları şimdilik default.png yapıyoruz, isimler tutarlı olsun yeter)
const getLogoForTeam = (teamName: string) => {
   // Burası ileride logoları genişletmek için boş bırakıldı, şimdilik sadece var olanları döner
   return `/logos/default.png`; 
};

// Admin panelinde takımları rahat okuyabilmesi için dev logo listesini (yukarıdaki localTeamLogos gibi) 
// sisteme yük tutmaması adına temizliyoruz, Admin kısmına sadece isimler lazım.

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
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

const getPlayerIdByName = (name: string) => {
  return Object.keys(allPlayersList).find(key => allPlayersList[key] === name) || null;
};

// Admin canlı skor yönetimi ekranında 4. haftayı çizebilmek için (Statik olarak kalıyor)
const week4Matches = [
  { id: 1, weekLabel: "4. Hafta - 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. Hafta - 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, weekLabel: "4. Hafta - 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, weekLabel: "4. Hafta - 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, weekLabel: "4. Hafta - 5. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "14.08.2026", time: "21:30", homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" },
  { id: 6, weekLabel: "4. Hafta - 6. MAÇ", category: "TÜRKİYE 1.LİG", date: "14.08.2026", time: "21:30", homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, weekLabel: "4. Hafta - 7. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" },
  { id: 8, weekLabel: "4. Hafta - 8. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "19:00", homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, weekLabel: "4. Hafta - 9. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" },
  { id: 10, weekLabel: "4. Hafta - 10. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "19:00", homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, weekLabel: "4. Hafta - 11. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" },
  { id: 12, weekLabel: "4. Hafta - 12. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "15.08.2026", time: "21:30", homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, weekLabel: "4. Hafta - 13. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" },
  { id: 14, weekLabel: "4. Hafta - 14. MAÇ", category: "TÜRKİYE 1.LİG", date: "15.08.2026", time: "21:30", homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, weekLabel: "4. Hafta - 15. MAÇ", category: "İNGİLTERE SÜPER KUPA", date: "16.08.2026", time: "17:00", homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" },
  { id: 16, weekLabel: "4. Hafta - 16. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "19:00", homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, weekLabel: "4. Hafta - 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, weekLabel: "4. Hafta - 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, weekLabel: "4. Hafta - 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, weekLabel: "4. Hafta - 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, weekLabel: "4. Hafta - 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, weekLabel: "4. Hafta - 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, weekLabel: "4. Hafta - 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, weekLabel: "4. Hafta - 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];


// 🔴 YENİ SAAT SEÇENEKLERİ (00:00'dan başlayıp 23:45'ten 12:00'a doğru inen motor)
const generateTimeOptions = () => {
  const times = ["00:00"];
  for (let h = 23; h >= 12; h--) {
      for (let m = 45; m >= 0; m -= 15) {
          times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
  }
  return times;
};
const timeOptionsArr = generateTimeOptions();

// 🔴 YENİ DİNAMİK TARİH MOTORU (Sonsuz Algoritma: 5. Hafta 18 Ağustos'tan başlar, her hafta +7 gün ekler)
const generateWeekDates = (weekNum: number) => {
  const baseDate = new Date(2026, 7, 18); // 18 Ağustos 2026
  const diffDays = (weekNum - 5) * 7;
  baseDate.setDate(baseDate.getDate() + diffDays);
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      dates.push(`${day}.${month}.${year}`);
  }
  return dates;
};


export default function AdminRadarPortal() {
  
  const [activeTab, setActiveTab] = useState<'live' | 'bulletin'>('live');

  // --- CANLI OPERASYON STATELERİ ---
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({
    1: { home: "0", away: "1" }, 2: { home: "2", away: "1" }, 3: { home: "2", away: "0" }, 4: { home: "1", away: "0" },
  });
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({
    1: true, 2: true, 3: true, 4: true
  });
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({
    1: true, 2: true, 3: true, 4: true 
  });

  // --- BÜLTEN ÜRETİM FABRİKASI STATELERİ ---
  const [bulletinWeek, setBulletinWeek] = useState<number>(5);
  const [currentWeekDates, setCurrentWeekDates] = useState<string[]>(generateWeekDates(5));
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  
  // Tüm kategori başlıkları (Kombine edilmiş geniş liste)
  const categoriesList = [
    "TÜRKİYE SÜPER LİG", "TÜRKİYE 1.LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE KADINLAR SÜPER LİG",
    "İNGİLTERE PREMIER LİG", "ALMANYA BUNDESLIGA", "FRANSA LIGUE 1", "İTALYA SERIE A", "İSPANYA LA LIGA",
    "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ",
    "UEFA AVRUPA LİGİ GURUP AŞAMASI", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ", "UEFA A.L. PLAY OFF RÖVANŞ",
    "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
    "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ",
    "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ",
    "İNGİLTERE SÜPER KUPA", "UEFA SÜPER KUPA",
    "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", "EREDIVISIE", "FA CUP", "SCOTTISH PREMIER LEAGUE", "PORTEKİZ LİGİ",
    "FIFA DÜNYA KUPASI", "MİLLİ TAKIM MAÇI"
  ];
  
  const [bulletinMatches, setBulletinMatches] = useState(
    Array.from({ length: 24 }, (_, i) => ({
      match_index: i + 1,
      category: 'TÜRKİYE SÜPER LİG',
      match_date: generateWeekDates(5)[0],
      match_time: '21:00',
      home_team: '',
      away_team: ''
    }))
  );

  // Hafta değiştiğinde dinamik tarih listesini güncelle
  useEffect(() => {
    const newDates = generateWeekDates(bulletinWeek);
    setCurrentWeekDates(newDates);
    // Takvimi ilk güne ayarla ama maçları sıfırlama (Kullanıcı yanlışlıkla hafta değiştirirse takımlar uçmasın)
    setBulletinMatches(prev => prev.map(m => ({ ...m, match_date: newDates[0] })));
  }, [bulletinWeek]);

  // --- CANLI OPERASYON FONKSİYONLARI ---
  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  const handleScoreChange = (matchId: number, team: 'home' | 'away', score: string) => {
    setAdminScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: "-", away: "-" }), [team]: score } }));
  };
  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  
  const isTffMatchCheck = (category: string) => {
    const uppercaseCat = category.toUpperCase();
    return ( uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE KUPASI") || 
             uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA") || 
             uppercaseCat.includes("TÜRKİYE KADINLAR SÜPER LİG") || uppercaseCat.includes("TFF") );
  };

  const handleAction = async (action: string, matchId: number, matchData: any, currentWinners: string[], displayPoints: number) => {
    if (action === 'Skoru Güncelle') {
      const homeScore = adminScores[matchId]?.home || "-";
      const awayScore = adminScores[matchId]?.away || "-";
      const { error: liveError } = await supabase.from('live_matches').upsert({ id: matchId, home_score: homeScore, away_score: awayScore, status: 'LIVE' }, { onConflict: 'id' });
      if (liveError) alert("Canlı skor tablosu güncellenirken hata: " + liveError.message);
      else alert(`✅ ${matchId}. Maçın skoru "live_matches" tablosuna işlendi! Artık canlı ekranda görünecek.`);
      return;
    }

    if (action === 'Maçı Onayla (Puan Dağıt)') {
      if (currentWinners.length === 0) {
        alert("Bu skoru bilen aslan parçası yok. Dağıtılacak puan bulunamadı.");
        return;
      }
      const isTff = isTffMatchCheck(matchData.category);
      const leagueName = isTff ? 'TFF' : 'DFO';
      const confirmMsg = `${currentWinners.length} kişiye ${displayPoints} puan dağıtılacak.\n\nMotor 1: 'points' tablosuna fiş kesilecek.\nMotor 2: 'standings' tablosundaki (MASTER ve ${leagueName}) bakiyesi güncellenecek.\n\nOnaylıyor musun Kumandanım?`;
      if (!window.confirm(confirmMsg)) return;

      try {
        const homeScore = adminScores[matchId]?.home || "0";
        const awayScore = adminScores[matchId]?.away || "0";
        await supabase.from('live_matches').upsert({ id: matchId, home_score: homeScore, away_score: awayScore, status: 'FINISHED' }, { onConflict: 'id' });

        const inserts = currentWinners.map(winnerName => {
          const userId = getPlayerIdByName(winnerName);
          return {
            hafta: 4, user_name: winnerName, username: userId, kategori: leagueName, ev_sahibi: matchData.homeTeam, deplasman: matchData.awayTeam,
            gercek_ev: parseInt(homeScore, 10), gercek_dep: parseInt(awayScore, 10), tahmin_ev: homeScore, tahmin_dep: awayScore, puan: displayPoints
          };
        });

        const { error: insertError } = await supabase.from('points').insert(inserts);
        if (insertError) { alert(`❌ HATA! Fişler eklenemedi.\nMesaj: ${insertError.message}`); return; }

        let standingsUpdateSuccess = 0;
        for (const winnerName of currentWinners) {
          const userId = getPlayerIdByName(winnerName);
          if (!userId) continue;
          const { data: stData } = await supabase.from('standings').select('*').eq('user_id', userId);
          if (stData) {
            const lRow = stData.find(r => r.league_type === leagueName);
            if (lRow) await supabase.from('standings').update({ points: lRow.points + displayPoints }).eq('id', lRow.id);
            else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: leagueName, points: displayPoints });

            const mRow = stData.find(r => r.league_type === 'MASTER');
            if (mRow) await supabase.from('standings').update({ points: mRow.points + displayPoints }).eq('id', mRow.id);
            else await supabase.from('standings').insert({ user_id: userId, user_name: winnerName, league_type: 'MASTER', points: displayPoints });
            standingsUpdateSuccess++;
          }
        }
        alert(`✅ ÇİFT MOTOR İŞLEMİ BAŞARILI!\n\n1. Motor: ${inserts.length} adet fiş kesildi.\n2. Motor: ${standingsUpdateSuccess} yarışmacının kasasına +${displayPoints} eklendi!`);
        setDistributedMatches(prev => ({...prev, [matchId]: true})); 
      } catch (error: any) { alert("❌ BEKLENMEYEN HATA: " + error.message); }
      return;
    }

    if (action === 'Geri Al' || action === 'Resetle') {
      const isLocked = distributedMatches[matchId];
      if (isLocked) {
        const confirmUndo = window.confirm(`DİKKAT: Bu maçın puanları daha önce dağıtılmıştı!\n\nEğer onaylarsan; bu maçtan kazanılan puanlar 'standings' (kasa) tablosundan DÜŞÜLECEK, 'points' tablosundaki fişler SİLİNECEK ve maç tekrar MÜDAHALEYE AÇILACAK.\n\nBunu yapmak istediğine emin misin?`);
        if (!confirmUndo) return;

        try {
          const isTff = isTffMatchCheck(matchData.category);
          const leagueName = isTff ? 'TFF' : 'DFO';
          const { data: existingPoints } = await supabase.from('points').select('*').eq('hafta', 4).eq('ev_sahibi', matchData.homeTeam).eq('deplasman', matchData.awayTeam);

          if (existingPoints && existingPoints.length > 0) {
            for (const row of existingPoints) {
              const pts = row.puan; const uid = row.username;
              const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
              if (stData) {
                const lRow = stData.find(r => r.league_type === leagueName);
                if (lRow) await supabase.from('standings').update({ points: Math.max(0, lRow.points - pts) }).eq('id', lRow.id);
                const mRow = stData.find(r => r.league_type === 'MASTER');
                if (mRow) await supabase.from('standings').update({ points: Math.max(0, mRow.points - pts) }).eq('id', mRow.id);
              }
            }
            await supabase.from('points').delete().eq('hafta', 4).eq('ev_sahibi', matchData.homeTeam).eq('deplasman', matchData.awayTeam);
          }
          alert("✅ GERİ ALMA BAŞARILI! Puanlar kasadan düşüldü ve fişler silindi.");
        } catch (error: any) { alert("❌ HATA: " + error.message); return; }
      }
      await supabase.from('live_matches').upsert({ id: matchId, home_score: '-', away_score: '-', status: 'NOT_STARTED' }, { onConflict: 'id' });
      setAdminScores(prev => ({ ...prev, [matchId]: { home: "-", away: "-" } }));
      setOpenWinnersMap(prev => ({ ...prev, [matchId]: false })); 
      setDistributedMatches(prev => ({ ...prev, [matchId]: false })); 
      if(!isLocked) alert("✅ Skor sıfırlandı.");
    }
  };

  const getEliteTheme = (category: string) => {
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    else if (isTffMatchCheck(category)) return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
  };

  // --- 🔴 YENİ SİSTEM: AKILLI TAKIM KİLİTLEME MOTORU 🔴 ---
  
  // Hangi kategorinin hangi kümeye ait olduğunu bulan fonksiyon
  const getLeagueKey = (category: string) => {
    const upCat = category.toUpperCase();
    if (upCat.includes("TÜRKİYE SÜPER LİG")) return "TÜRKİYE SÜPER LİG";
    if (upCat.includes("TÜRKİYE 1.LİG")) return "TÜRKİYE 1.LİG";
    if (upCat.includes("İNGİLTERE PREMIER LİG")) return "İNGİLTERE PREMIER LİG";
    if (upCat.includes("ALMANYA BUNDESLIGA")) return "ALMANYA BUNDESLIGA";
    if (upCat.includes("FRANSA LIGUE 1")) return "FRANSA LIGUE 1";
    if (upCat.includes("İTALYA SERIE A")) return "İTALYA SERIE A";
    if (upCat.includes("İSPANYA LA LIGA")) return "İSPANYA LA LIGA";
    if (upCat.includes("MİLLİ TAKIM")) return "MİLLİ TAKIMLAR";
    // UEFA veya diğerleri için serbest Avrupa havuzu
    return "ÇEŞİTLİ AVRUPA TAKIMLARI"; 
  };

  const getAvailableTeams = (currentIndex: number, isHome: boolean) => {
    const currentMatch = bulletinMatches[currentIndex];
    const leagueKey = getLeagueKey(currentMatch.category);
    
    // O ligin tam listesini al (Eğer bulunamazsa boş dizi)
    const baseTeams = LEAGUE_TEAMS[leagueKey] || [];
    
    // 🔴 Avrupa/Kupa Maçlarında Kilitleme Yok, Tüm Havuz Serbest 🔴
    if (leagueKey === "ÇEŞİTLİ AVRUPA TAKIMLARI") {
        const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;
        return baseTeams.filter(t => t !== opponent); // Sadece kendi rakibi olamaz
    }

    // 🔴 TÜRKİYE VE DİĞER DAR LİGLER İÇİN KİLİTLEME MOTORU 🔴
    const usedTeamsInThisLeague = new Set<string>();
    
    bulletinMatches.forEach((m, idx) => {
        // Eğer aynı ligdeyse (örneğin Süper Lig) ve farklı bir maçtaysa takımları "KULLANILDI" listesine ekle
        if (idx !== currentIndex && getLeagueKey(m.category) === leagueKey) {
            if (m.home_team) usedTeamsInThisLeague.add(m.home_team);
            if (m.away_team) usedTeamsInThisLeague.add(m.away_team);
        }
    });

    return baseTeams.filter(team => {
        // Zaten bu ligde başka bir maça atanmışsa listeden tamamen çıkar!
        if (usedTeamsInThisLeague.has(team)) return false;
        
        // Kendi maçında, aynı takım hem ev hem deplasman olamaz
        const opponent = isHome ? currentMatch.away_team : currentMatch.home_team;
        if (team === opponent) return false;
        
        return true; // Sınavı geçen takımları göster
    });
  };

  const handleBulletinChange = (index: number, field: string, value: string) => {
    const newMatches = [...bulletinMatches];
    (newMatches[index] as any)[field] = value;
    
    // Kategori (Lig) değiştiğinde, takımları sıfırla ki yanlış ligin takımı o kutuda kalmasın!
    if (field === 'category') {
        newMatches[index].home_team = '';
        newMatches[index].away_team = '';
    }
    
    setBulletinMatches(newMatches);
  };

  const copyDateTimeToAll = () => {
    const firstDate = bulletinMatches[0].match_date;
    const firstTime = bulletinMatches[0].match_time;
    if(!firstDate || !firstTime) return alert("Önce 1. maçın tarih ve saatini doldurun!");
    const updated = bulletinMatches.map(m => ({ ...m, match_date: firstDate, match_time: firstTime }));
    setBulletinMatches(updated);
  };

  const saveBulletinToDB = async () => {
    const hasEmpty = bulletinMatches.some(m => !m.home_team.trim() || !m.away_team.trim());
    if (hasEmpty) {
       if(!window.confirm("Bazı takımlar seçilmemiş (Boş bırakılmış). Yine de bülteni kaydedip yayınlamak istiyor musun? (Boş olanlar Maç Arşivinde eksik görünür)")) return;
    }

    setIsPublishing(true);
    try {
      const payload = bulletinMatches.map(m => ({
         week_num: bulletinWeek,
         match_index: m.match_index,
         category: m.category,
         match_date: m.match_date,
         match_time: m.match_time,
         home_team: m.home_team.trim().toUpperCase(),
         away_team: m.away_team.trim().toUpperCase()
      }));

      const { error } = await supabase.from('matches_bulletin').upsert(payload, { onConflict: 'week_num,match_index' });
      if (error) throw error;
      
      alert(`✅ BAŞARILI! ${bulletinWeek}. Hafta Bülteni füzeyle fırlatıldı ve veritabanına mühürlendi!\n\nArtık "Maç Arşivi" ve "Tahminmatik" sayfalarında otomatik olarak boş (- : -) formatında canlı yayındadır.`);
    } catch (e: any) {
      alert("❌ HATA: Bülten kaydedilemedi! Detay: " + e.message);
    }
    setIsPublishing(false);
  };


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24">

      <div className="max-w-7xl mx-auto">
        
        {/* 🔴 ÜST TAB MENÜSÜ 🔴 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 shadow-xl">
           <button 
             onClick={() => setActiveTab('live')}
             className={`flex-1 py-4 rounded-xl font-black text-sm tracking-widest transition-all ${activeTab === 'live' ? 'bg-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
           >
             🔴 CANLI MAÇ & PUAN YÖNETİMİ
           </button>
           <button 
             onClick={() => setActiveTab('bulletin')}
             className={`flex-1 py-4 rounded-xl font-black text-sm tracking-widest transition-all ${activeTab === 'bulletin' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)] scale-[1.02]' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
           >
             🛠️ YENİ BÜLTEN OLUŞTUR
           </button>
        </div>

        {/* ========================================================================================= */}
        {/* 1. CEPHE: CANLI MAÇ OPERASYONU (Eski Sistem) */}
        {/* ========================================================================================= */}
        {activeTab === 'live' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-amber-400 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  🔴 KÖK KOMUTA MERKEZİ / CANLI RADAR
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  4. Hafta Tam Teşekküllü Yönetim (Canlı Skor, Puan Dağıtım, Geri Al)
                </p>
              </div>
              <div className="bg-amber-500 text-slate-950 font-black px-4 py-2 rounded-lg shadow-lg text-xs sm:text-sm tracking-widest border border-amber-600">
                4. HAFTA AKTİF
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {week4Matches.map((match) => {
                const isWinnersOpen = !!openWinnersMap[match.id];
                const isTffMatch = isTffMatchCheck(match.category);
                const homeLogoUrl = `/logos/default.png`;
                const awayLogoUrl = `/logos/default.png`;

                const homeScore = adminScores[match.id]?.home || "-";
                const awayScore = adminScores[match.id]?.away || "-";
                
                let currentWinners: string[] = [];
                let winnersCount = 0;
                let displayPoints = 0;

                if (homeScore !== "-" && awayScore !== "-") {
                  currentWinners = []; 
                  winnersCount = currentWinners.length;
                  displayPoints = 0;
                }

                const theme = getEliteTheme(match.category);
                const isLocked = distributedMatches[match.id];

                return (
                  <div key={match.id} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      {theme.bgImg && (
                        <>
                          <div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div>
                          <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
                        </>
                      )}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md backdrop-blur-sm">
                            {match.weekLabel}
                          </span>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            🏆 {match.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-0 sm:px-4">
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-20">
                              <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                            <span className="text-white font-extrabold text-[10px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.homeTeam}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-32 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select disabled={isLocked} value={homeScore} onChange={e => handleScoreChange(match.id, 'home', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80">
                                {scoreOptions.map(opt => <option key={`h-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                              </select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select disabled={isLocked} value={awayScore} onChange={e => handleScoreChange(match.id, 'away', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer drop-shadow-md disabled:opacity-80">
                                {scoreOptions.map(opt => <option key={`a-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}
                              </select>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center relative z-20">
                              <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-lg" />
                            </div>
                            <span className="text-white font-extrabold text-[10px] sm:text-[12px] text-center uppercase tracking-wide drop-shadow-lg leading-tight px-1">{match.awayTeam}</span>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2 mt-5 min-h-[32px] items-center">
                          {isLocked ? (
                            <div className="flex flex-col gap-2 w-full mt-2">
                              <div className="bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-[11px] font-black px-6 py-2 rounded-lg border border-emerald-500/30 uppercase tracking-widest shadow-inner text-center">
                                ✅ BU MAÇIN PUANLARI DAĞITILDI
                              </div>
                              <button onClick={() => handleAction('Geri Al', match.id, match, currentWinners, displayPoints)} className="bg-red-900/80 hover:bg-red-700 text-red-200 text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-red-500/50 transition-all shadow-[0_0_10px_rgba(220,38,38,0.3)] mx-auto w-3/4">
                                İptal Et & Puanları Geri Al
                              </button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleAction('Skoru Güncelle', match.id, match, currentWinners, displayPoints)} className="bg-blue-600/80 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-blue-400 transition-all">Skoru Güncelle</button>
                              <button onClick={() => handleAction('Maçı Onayla (Puan Dağıt)', match.id, match, currentWinners, displayPoints)} className="bg-emerald-600/80 hover:bg-emerald-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.5)]">Maçı Bitir (Dağıt)</button>
                              <button onClick={() => handleAction('Resetle', match.id, match, currentWinners, displayPoints)} className="bg-red-600/80 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-3 py-1.5 rounded uppercase border border-red-400 transition-all">Resetle</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================================= */}
        {/* 2. CEPHE: YENİ BÜLTEN ÜRETİM FABRİKASI */}
        {/* ========================================================================================= */}
        {activeTab === 'bulletin' && (
          <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-black text-indigo-400 tracking-tight flex items-center justify-center sm:justify-start gap-3 uppercase">
                  <span className="text-3xl">🏭</span> BÜLTEN ÜRETİM FABRİKASI
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Seçilen liglerde (Örn: Süper Lig) bir takım yalnızca 1 kez seçilebilir. Liste otomatik eksilir.
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 <span className="text-slate-400 font-bold text-sm">HEDEF HAFTA:</span>
                 <select 
                   value={bulletinWeek} 
                   onChange={e => setBulletinWeek(Number(e.target.value))}
                   className="bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-black text-xl px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.3)] outline-none cursor-pointer"
                 >
                    <option value={4}>4. HAFTA</option>
                    <option value={5}>5. HAFTA</option>
                    <option value={6}>6. HAFTA</option>
                    <option value={7}>7. HAFTA</option>
                    <option value={8}>8. HAFTA</option>
                    <option value={9}>9. HAFTA</option>
                    <option value={10}>10. HAFTA</option>
                 </select>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 shadow-2xl">
               
               <div className="flex justify-end mb-4">
                  <button 
                    onClick={copyDateTimeToAll} 
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  >
                     👇 1. Maçın Tarih/Saatini Tümüne Kopyala
                  </button>
               </div>

               <div className="overflow-x-auto custom-scrollbar pb-6">
                  <table className="w-full text-left border-collapse min-w-[900px]">
                     <thead>
                        <tr className="bg-slate-950 border-y border-slate-700">
                           <th className="p-3 text-amber-500 font-black text-sm w-12 text-center">NO</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-48">Kategori / LİG</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-36">Tarih</th>
                           <th className="p-3 text-slate-400 font-bold text-xs uppercase tracking-widest w-28">Saat</th>
                           <th className="p-3 text-emerald-400 font-bold text-xs uppercase tracking-widest">Ev Sahibi (Akıllı Liste)</th>
                           <th className="p-3 text-red-400 font-bold text-xs uppercase tracking-widest">Deplasman (Akıllı Liste)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {bulletinMatches.map((m, idx) => (
                           <tr key={m.match_index} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                              <td className="p-2 text-center font-black text-slate-500">{m.match_index}</td>
                              
                              <td className="p-2">
                                 <select 
                                   value={m.category} 
                                   onChange={e => handleBulletinChange(idx, 'category', e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-[11px] font-bold px-2 py-2.5 rounded outline-none focus:border-indigo-500 cursor-pointer"
                                 >
                                    {categoriesList.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.match_date} 
                                   onChange={e => handleBulletinChange(idx, 'match_date', e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-slate-300 font-bold text-xs px-2 py-2.5 rounded outline-none focus:border-indigo-500 text-center cursor-pointer"
                                 >
                                    {currentWeekDates.map(d => <option key={d} value={d}>{d}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.match_time} 
                                   onChange={e => handleBulletinChange(idx, 'match_time', e.target.value)}
                                   className="w-full bg-slate-950 border border-slate-700 text-amber-400 font-black text-xs px-2 py-2.5 rounded outline-none focus:border-indigo-500 text-center cursor-pointer"
                                 >
                                    {timeOptionsArr.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.home_team} 
                                   onChange={e => handleBulletinChange(idx, 'home_team', e.target.value)}
                                   className="w-full bg-slate-950 border border-emerald-900/50 focus:border-emerald-500 text-white font-bold text-[11px] px-2 py-2.5 rounded outline-none cursor-pointer uppercase shadow-inner"
                                 >
                                    <option value="" className="text-slate-500">-- TAKIM SEÇİNİZ --</option>
                                    {getAvailableTeams(idx, true).map(t => <option key={`h-${t}`} value={t}>{t}</option>)}
                                 </select>
                              </td>

                              <td className="p-2">
                                 <select 
                                   value={m.away_team} 
                                   onChange={e => handleBulletinChange(idx, 'away_team', e.target.value)}
                                   className="w-full bg-slate-950 border border-red-900/50 focus:border-red-500 text-white font-bold text-[11px] px-2 py-2.5 rounded outline-none cursor-pointer uppercase shadow-inner"
                                 >
                                    <option value="" className="text-slate-500">-- TAKIM SEÇİNİZ --</option>
                                    {getAvailableTeams(idx, false).map(t => <option key={`a-${t}`} value={t}>{t}</option>)}
                                 </select>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="mt-8 flex justify-center pb-4">
                  <button 
                    onClick={saveBulletinToDB}
                    disabled={isPublishing}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-black text-lg md:text-xl px-12 py-5 rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.5)] transition-all hover:scale-105 border border-indigo-400/50 flex items-center gap-3"
                  >
                     {isPublishing ? '📡 VERİLER SUNUCUYA İLETİLİYOR...' : `🚀 ${bulletinWeek}. HAFTA BÜLTENİNİ MÜHÜRLE VE YAYINLA`}
                  </button>
               </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}