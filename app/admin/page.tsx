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
  "DİĞER AVRUPA": ["AGNATIA", "AJAX", "ANDERLECHT", "AUDA RIGA", "BENFICA", "BRAGA", "BRANN", "CSKA 1948", "CSKA SOFYA", "DINAMO KIEV", "DINAMO ZAGREB", "FERENCVAROS", "GORNİK ZABRZE", "GOTEBORG", "HAJDUK SPLIT", "HAMMARBY", "HEART", "IBERIA 1999", "INTER TURKU", "KARABAĞ FK", "KIZILYILDIZ", "KOPENAG", "KUPS", "LARNE FC", "LEVADIA FC", "LEVSKI SOFYA", "MIDTJYLLAND", "NK CELJE", "NK CERCLE", "PAKSI FC", "PANATHINAIKOS", "PAOK", "PATOS", "POLISSYA", "RAPID WIEN", "SABAH FK", "SANTA COLOMA FC", "FCSB", "SLOVAN BRATISLAVA", "SPARTAK TRNAVA", "ST GALLEN", "STURM GRAZ", "THUN", "TWENTE", "UNIVERSITATEA CLUJ", "UNIVERSITATEA CRAIOVA", "VOJVODINA", "ZELEZNICAR PANCEVO", "DINAMO MINSK", "SHELBOURNE", "GENT", "DEBRECEN", "HRADEC KRALOVE", "PAIDE LINNAMEESKOND", "BODO-GLIMT", "USG", "SPARTA PRAG", "NEC NIJMEGEN", "OLIMPIYAKOS", "FK KAUNO ZALGIRIS"]
};

// Avrupa (DFO) maçları için "Milli Takımlar Hariç" Tüm Kulüpler Havuzu
const ALL_CLUBS = [
  ...LEAGUE_TEAMS["TÜRKİYE SÜPER LİG"], ...LEAGUE_TEAMS["TÜRKİYE 1.LİG"],
  ...LEAGUE_TEAMS["PREMIER LEAGUE"], ...LEAGUE_TEAMS["BUNDESLIGA"],
  ...LEAGUE_TEAMS["LIGUE 1"], ...LEAGUE_TEAMS["SERIE A"],
  ...LEAGUE_TEAMS["LA LIGA"], ...LEAGUE_TEAMS["DİĞER AVRUPA"]
];
const UNIQUE_CLUBS = [...new Set(ALL_CLUBS)].sort();

// Radarda Logo görebilmek için mevcut olanları tanımlıyoruz, olmayanlar "default.png" kullanır
const localTeamLogos: Record<string, string> = {
  "REAL MADRİD": "https://tr.wikipedia.org/wiki/Special:FilePath/Real_Madrid_CF_logo.svg",
  "JUVENTUS": "https://tr.wikipedia.org/wiki/Special:FilePath/Juventus_FC_-_Logo_2017.svg",
  "GALATASARAY": "https://de.wikipedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026_5-stars.svg",
  "FENERBAHÇE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Fenerbah%C3%A7e_SK_-_120_Yil_(1907-2027).svg",
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  // (Eski logoları buraya istersen ekleyebilirsin, sistem logo bulamazsa default kalkanı atar)
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

// ----------------------------------------------------
// AKILLI FİLTRE VE EKSİLTME ALGORİTMALARI (DİNÇER KURALI)
// ----------------------------------------------------
const isCategoryDFO = (cat: string) => {
  if (!cat) return false;
  return cat.includes("ŞAMPİYONLAR") || cat.includes("AVRUPA LİGİ") || cat.includes("KONFERANS") || cat.includes("A.L.") || cat.includes("K.L.");
};

const isCategoryNational = (cat: string) => {
  return cat === "FIFA DÜNYA KUPASI" || cat === "UEFA AVRUPA ULUSLAR LİGİ";
};

const getBaseListForCategory = (cat: string) => {
  if (!cat) return UNIQUE_CLUBS;
  if (isCategoryDFO(cat)) return UNIQUE_CLUBS;
  if (isCategoryNational(cat)) return LEAGUE_TEAMS["MİLLİ TAKIMLAR"];
  
  if (cat.includes("SÜPER LİG") && !cat.includes("İNGİLTERE") && !cat.includes("SCOTTISH") && !cat.includes("KADINLAR")) return LEAGUE_TEAMS["TÜRKİYE SÜPER LİG"];
  if (cat.includes("1.LİG")) return LEAGUE_TEAMS["TÜRKİYE 1.LİG"];
  if (cat === "PREMIER LEAGUE" || cat === "FA CUP") return LEAGUE_TEAMS["PREMIER LEAGUE"];
  if (cat === "BUNDESLIGA" || cat === "DFB POKAL") return LEAGUE_TEAMS["BUNDESLIGA"];
  if (cat === "LIGUE 1" || cat === "COUPE DE FRANCE") return LEAGUE_TEAMS["LIGUE 1"];
  if (cat === "SERIE A" || cat === "COPPA ITALIA") return LEAGUE_TEAMS["SERIE A"];
  if (cat === "LA LIGA" || cat === "COPA DEL REY") return LEAGUE_TEAMS["LA LIGA"];
  
  return UNIQUE_CLUBS; // Yakalanamayan özel kupalar için tüm kulüpler
};

// TFF Tema kontrolü
const isTffMatchCheck = (category: string) => {
  const tffKeywords = ["TÜRKİYE 1.LİG", "TÜRKİYE KADINLAR SÜPER LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE SÜPER LİG"];
  return tffKeywords.includes(category.trim().toUpperCase());
};

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

const TIME_OPTIONS: string[] = [];
for (let h = 12; h <= 23; h++) {
  for (let m = 0; m < 60; m += 15) {
    TIME_OPTIONS.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
}

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
    } else {
      setLoginError('Hatalı yetki bilgileri!');
    }
  };

  // 🔴 HAFIZALI EDİTÖR SİSTEMİ 🔴
  useEffect(() => {
    const fetchBulletinMemory = async () => {
      if (!isAuthenticated) return;
      setActiveMessage(`⏳ ${bulletinWeek}. Hafta Arşivi Aranıyor...`);
      const { data, error } = await supabase
        .from('matches_bulletin')
        .select('*')
        .eq('week_num', bulletinWeek)
        .order('match_index', { ascending: true });

      const newDates = getDatesForWeek(bulletinWeek);
      
      if (data && data.length > 0) {
        // Hafızadan Geri Yükle
        const restored = Array(24).fill(null).map((_, i) => {
          const dbM = data.find(m => m.match_index === i + 1);
          if (dbM) {
            return { category: dbM.category, date: dbM.match_date, time: dbM.match_time, home_team: dbM.home_team, away_team: dbM.away_team };
          }
          return { category: CATEGORIES[0], date: newDates[0], time: '19:00', home_team: '', away_team: '' };
        });
        setBulletinMatches(restored);
        setActiveMessage(`✅ ${bulletinWeek}. Hafta Kayıtları Başarıyla Yüklendi!`);
      } else {
        // Boş Şablon
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
    
    // Eğer Kategori değişirse Ev ve Deplasmanı Sıfırla (Çünkü havuz değişti)
    if (field === 'category') {
      newMatches[index].home_team = '';
      newMatches[index].away_team = '';
    }
    setBulletinMatches(newMatches);
  };

  const getAvailableTeams = (matchIndex: number, position: 'home' | 'away', category: string) => {
    const baseList = getBaseListForCategory(category);
    const isDFO = isCategoryDFO(category);
    const isNational = isCategoryNational(category);
    const usedTeams = new Set<string>();

    // 1. KURAL: Diğer satırlardaki mantığı kontrol et
    bulletinMatches.forEach((m, idx) => {
      if (idx === matchIndex) return; 
      
      const mIsDFO = isCategoryDFO(m.category);
      const mIsNational = isCategoryNational(m.category);

      if (isNational && mIsNational) {
        if (m.home_team) usedTeams.add(m.home_team);
        if (m.away_team) usedTeams.add(m.away_team);
      } else if (!isNational && !mIsNational) {
        // Eğer her iki maç da kulüp maçıysa;
        // İkisi de Yerel (Domestic) ise VEYA ikisi de Avrupa (DFO) ise çakışırlar!
        if (isDFO === mIsDFO) { 
          if (m.home_team) usedTeams.add(m.home_team);
          if (m.away_team) usedTeams.add(m.away_team);
        }
      }
    });

    // 2. KURAL: Kendi satırında, rakibi seçemez (Erzurum vs Erzurum olamaz)
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

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-200 p-4 font-sans pb-24">
      <div className="max-w-[1400px] mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="relative z-10 text-center md:text-left">
            <h1 className="text-2xl font-black text-amber-500 tracking-wider">🛠 ETML OPERASYON MERKEZİ 5.0</h1>
            <p className="text-slate-400 text-sm mt-1">Akıllı Filtre & Hafızalı Editör <span className="text-emerald-400 font-bold">AKTİF</span></p>
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
          <div className="w-full py-20 text-center bg-slate-900/30 rounded-2xl border border-slate-800 border-dashed">
            <h3 className="text-xl font-bold text-slate-400">Canlı Radar Ekranı</h3>
            <p className="text-slate-500 mt-2">Bülteni hazırladıktan sonra radar aktifleşir.</p>
          </div>
        )}

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
                const homeOptions = getAvailableTeams(idx, 'home', match.category);
                const awayOptions = getAvailableTeams(idx, 'away', match.category);

                return (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-800 group-hover:bg-indigo-500 transition-colors"></div>

                    <div className="flex justify-between items-center pl-2 border-b border-slate-800 pb-2">
                      <span className="font-black text-slate-300 text-sm tracking-widest">{bulletinWeek}. HAFTA / {matchNum}. MAÇ</span>
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
                          {/* Eğer veritabanından gelen takım havuzda yoksa (kayıtlıysa) onu da listeye koy ki kaybolmasın */}
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