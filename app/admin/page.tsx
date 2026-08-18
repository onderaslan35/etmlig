'use client';

import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase } from '@/utils/supabase';

// 🔴 54 ASLAN PARÇASI 🔴
const staticPlayersList: Record<string, string> = {
  "262736": "MEHMET ALİ KARA", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262756": "EYÜP KARACAOĞLU",
  "262786": "SEDAT DİŞLİ", "262719": "UĞUR VARDAR", "262733": "MUHSİN ASİLKAN", "262726": "HUDAVER TOPARDIC",
  "262714": "İSMAİL EKER 🏆", "262717": "MURAT ALİ", "262774": "ŞENOL CAN ÇAKICI", "262728": "ÖNDER ASLAN",
  "262709": "SALİH KARACAOĞLU", "262813": "KEMAL ERSOY", "262754": "OSMAN ALİ AYDIN 🏆", "262721": "MUSTAFA GÜMÜŞÇÜ",
  "262711": "RIDVAN DOGER", "262707": "HAKAN AYAN", "262771": "ULAŞ ADIGÜZEL", "262732": "R. İLHAN KARACA 🏆🏆",
  "262790": "CUMALİ SÖKER", "262730": "ÖNDER IŞIK", "262702": "MURAT KARA", "262753": "YUSUF KIZILTUĞ",
  "262738": "MEVLÜT EVLER", "262734": "LEVENT YILDIRIM", "262758": "MELİH PINAR", "262731": "FATİH AYAN",
  "262763": "MUSTAFA ELMAS", "262705": "AHMET BİRCAN 🏆", "262706": "GAZİ AYAN 🏆🏆", "262772": "CEMAL SİVRİKAYA 🏆",
  "262747": "SAVAŞ ÇAĞLAYAN", "262723": "AYHAN LUŞOĞLU", "351925": "ALİOS GÖZTEPE", "262750": "MAHMUT CBR",
  "262782": "YUSUF ERBAY", "262704": "YAPAY ZEKA", "262725": "İLYAS KAZDAL", "262716": "BİROL DEMİREL",
  "262740": "ABDULLAH DİK", "262749": "B.VEYSELOĞLU EROL", "262737": "ŞAHİN GEZGİNCİ", "262718": "BEKİR KARADAĞ",
  "262770": "OZKAYA MAZAKALI BAYRAM", "262703": "CEMALETTİN BELLİ", "262739": "UĞUR GÜRBÜZ", "262715": "ŞEMSETTIN DÜGER",
  "262708": "BAYRAM YILMAZ", "262744": "İLYAS UYGUN", "262787": "MUSTAFA TUCİ", "262712": "MURAT AYDEMİR",
  "262741": "SABAHATTİN ÇAYLAK", "262735": "AYGÜN AKKEÇELİ"
};

// 🔴 YEREL & BULUT LOGO BANKASI (MAÇ ARŞİVİNDEN BİREBİR KOPYALANDI) 🔴
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
  "IBERIA 1999": "https://de.wikipedia.org/wiki/Special:FilePath/Iberia_1999_Tiflis.svg",
  "SLOVAN BRATISLAVA": "https://commons.wikimedia.org/wiki/Special:FilePath/SK_Slovan_Bratislava_logo.svg",
  "KUPS": "https://en.wikipedia.org/wiki/Special:FilePath/KuPS_logo.svg",
  "SABAH FK": "https://en.wikipedia.org/wiki/Special:FilePath/Sabah_FC_(Azerbaijan).png",
  "GORNİK ZABRZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gornik_Zabrze.svg",
  "THUN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_Thun_Logo_2011.svg",
  "DINAMO ZAGREB": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "HEART": "https://it.wikipedia.org/wiki/Special:FilePath/Hearts_FC.svg",
  "LARNE FC": "https://fr.wikipedia.org/wiki/Special:FilePath/Larne_FC_(logo).svg",
  "KIZILYILDIZ": "https://en.wikipedia.org/wiki/Special:FilePath/Red_Star_Belgrade_crest.svg",
  "LEVADIA FC": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Levadia_Tallinnin.png",
  "LEVSKI SOFYA": "https://en.wikipedia.org/wiki/Special:FilePath/Levski_Sofia_crest_(2026).svg",
  "UNIVERSITATEA CRAIOVA": "https://ro.wikipedia.org/wiki/Special:FilePath/CS_Universitatea_Craiova.svg",
  "POLISSYA": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Polissya_Zhytomyr.png",
  "KOPENAG": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_K%C3%B8benhavn.png",
  "KOPENHAG": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_K%C3%B8benhavn.png",
  "SANTA COLOMA FC": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Santa_Coloma_logo.svg",
  "RAPID WIEN": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Rapid_Wien_Logo.svg",
  "FCSB": "https://tr.wikipedia.org/wiki/Special:FilePath/Fcsb-logo.svg",
  "AUDA RIGA": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Auda_logo.png",
  "BRANN": "https://en.wikipedia.org/wiki/Special:FilePath/Brann_logo.svg",
  "PAKSI FC": "https://tr.wikipedia.org/wiki/Special:FilePath/Paksi_FC_(Logo).svg",
  "PANATHINAIKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Panathinaikos.svg",
  "ZELEZNICAR PANCEVO": "https://en.wikipedia.org/wiki/Special:FilePath/FK_%C5%BDelezni%C4%8Dar_Pan%C4%8Devo_logo.png",
  "MIDTJYLLAND": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_Midtjylland.png",
  "HAJDUK SPLIT": "https://tr.wikipedia.org/wiki/Special:FilePath/Hajduk_Split.png",
  "PATOS": "https://en.wikipedia.org/wiki/Special:FilePath/Pafos_FC_crest.svg",
  "CSKA SOFYA": "https://tr.wikipedia.org/wiki/Special:FilePath/CSKA_Sofia_logo.svg",
  "ST GALLEN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_St._Gallen_logo.svg",
  "SPARTAK TRNAVA": "https://tr.wikipedia.org/wiki/Special:FilePath/Spartak_Trnava_current_logo.png",
  "CSKA 1948": "https://tr.wikipedia.org/wiki/Special:FilePath/CSKA_1948_logo.png",
  "INTER TURKU": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Inter_Turku_logo.svg",
  "GOTEBORG": "https://en.wikipedia.org/wiki/Special:FilePath/IFK_Goteborg_logo.svg",
  "UNIVERSITATEA CLUJ": "https://ro.wikipedia.org/wiki/Special:FilePath/U_Cluj.svg",
  "BODO-GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "NEC NIJMEGEN": "https://en.wikipedia.org/wiki/Special:FilePath/NEC_Nijmegen_logo.svg",
  "USG": "https://en.wikipedia.org/wiki/Special:FilePath/Royale_Union_Saint-Gilloise_logo.svg",
  "PAIDE LINNAMEESKOND": "https://en.wikipedia.org/wiki/Special:FilePath/Paide_Linnameeskond_logo.png",
  "DEBRECEN": "https://fr.wikipedia.org/wiki/Special:FilePath/Debreceni_VSC_(logo).svg",
  "SHELBOURNE": "https://tr.wikipedia.org/wiki/Special:FilePath/Shelbourne_logo.png",
  "DINAMO MINSK": "https://tr.wikipedia.org/wiki/Special:FilePath/Dinamo-Minsk.png",

  "ESPANYOL": "https://upload.wikimedia.org/wikipedia/de/a/a7/RCD_Espanyol_De_Barcelona.svg",
  "REAL MADRID": "https://upload.wikimedia.org/wikipedia/sco/5/56/Real_Madrid_CF.svg",
  "FROSINONE": "https://upload.wikimedia.org/wikipedia/de/2/2b/Frosinone_Calcio.svg",
  "JUVENTUS": "https://upload.wikimedia.org/wikipedia/commons/e/ef/Juventus_FC_-_pictogram_white_%28Italy%2C_2017%29.svg",
  
  "MALAGA": "https://upload.wikimedia.org/wikipedia/en/thumb/0/05/M%C3%A1laga_CF.svg/200px-M%C3%A1laga_CF.svg.png",
  "DEPORTIVO LA CORUÑA": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/RC_Deportivo_La_Coru%C3%B1a_logo.svg/200px-RC_Deportivo_La_Coru%C3%B1a_logo.svg.png",
  "MONACO": "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/AS_Monaco_FC.svg/200px-AS_Monaco_FC.svg.png",
  "LILLE": "https://upload.wikimedia.org/wikipedia/en/thumb/3/3f/Lille_OSC_2018_logo.svg/200px-Lille_OSC_2018_logo.svg.png",
  "NOTTINGHAM FOREST": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e5/Nottingham_Forest_F.C._logo.svg/200px-Nottingham_Forest_F.C._logo.svg.png",
  "LIVERPOOL": "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png",
  "FULHAM": "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Fulham_FC_%28shield%29.svg/200px-Fulham_FC_%28shield%29.svg.png",
  "EVERTON": "https://upload.wikimedia.org/wikipedia/en/thumb/f/fc/Everton_FC_logo.svg/200px-Everton_FC_logo.svg.png",
  "FK KAUNO ZALGIRIS": "https://images.fotmob.com/image_resources/logo/teamlogo/439132.png",

  // Yerel Logolar
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  
  "OLYMPIC LYON": "/logos/lyon.png",
  "OLYMPIQUE LYON": "/logos/lyon.png",
  "OLYMPIQUE LYONNAIS": "/logos/lyon.png",
  "LYON": "/logos/lyon.png"
};

const getTodayDateString = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const getUniqueMatchId = (week: number, index: number) => {
    if (week === 4) return index; 
    return (week * 100) + index;
};

const cleanTeamName = (name: string) => {
    if(!name) return "";
    return name.trim().toUpperCase();
};

export default function AdminRadarPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'master' | 'skorcum01' | 'skorcum06' | 'skorcum34' | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'live' | 'bulletin' | 'predictions'>('live');
  const [mergedPlayers] = useState<Record<string, string>>(staticPlayersList);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const previousScoresRef = useRef<Record<string, number>>({});
  const [skorcuStatusMap, setSkorcuStatusMap] = useState<Record<string, boolean>>({
     'skorcum01': true, 'skorcum06': true, 'skorcum34': true
  });
  const [showOnlyToday, setShowOnlyToday] = useState<boolean>(false);
  const [selectedLiveWeek, setSelectedLiveWeek] = useState<number>(5); 
  const [liveMatchesDB, setLiveMatchesDB] = useState<any[]>([]);
  const [adminScores, setAdminScores] = useState<Record<number, { home: string, away: string }>>({});
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [distributedMatches, setDistributedMatches] = useState<{ [key: number]: boolean }>({});
  const [predictionsDB, setPredictionsDB] = useState<Record<string, string[]>>({}); 
  const [liveInfoStateMap, setLiveInfoStateMap] = useState<Record<number, any>>({}); 

  // MAÇ ARŞİVİNDE BÜLTEN KATEGORİSİ/EDİTLEME VS OLMADIĞI İÇİN BURALARI SADELEŞTİRDİM.
  // SADECE CANLI SKOR GİRİŞİ YAPACAKSINIZ
  const [bulletinWeek, setBulletinWeek] = useState<number>(5);
  const [selectedPredictionWeek, setSelectedPredictionWeek] = useState<number>(5);
  const [submittedPlayers, setSubmittedPlayers] = useState<string[]>([]);
  const [missingPlayers, setMissingPlayers] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
       const auth = sessionStorage.getItem('admin_auth');
       const role = sessionStorage.getItem('admin_role') as any;
       if (auth === 'true' && role) {
          setIsAuthenticated(true);
          setUserRole(role);
       }
    }
  }, []);

  const fetchSkorcuStatus = async () => {
     try {
       const { data } = await supabase.from('skorcu_auth').select('*');
       if (data) {
          const newMap: Record<string, boolean> = {};
          data.forEach(row => { newMap[row.username] = row.is_active; });
          setSkorcuStatusMap(prev => ({...prev, ...newMap}));
       }
     } catch (e) {}
  };

  useEffect(() => {
    if (isAuthenticated && userRole === 'master') {
       fetchSkorcuStatus();
    }
  }, [isAuthenticated, userRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput === 'mankoman' && passwordInput === '24351324Yurt.') {
       setIsAuthenticated(true);
       setUserRole('master');
       sessionStorage.setItem('admin_auth', 'true');
       sessionStorage.setItem('admin_role', 'master');
       return;
    } 
    const validSkorcular: Record<string, string> = { 'skorcum01': '150101', 'skorcum06': '191006', 'skorcum34': '192306' };
    if (validSkorcular[usernameInput]) {
       if (passwordInput === validSkorcular[usernameInput]) {
          try {
             const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', usernameInput).single();
             if (data && data.is_active === false) {
                 alert("❌ YETKİLERİNİZ DONDURULDU!"); return;
             }
          } catch(err) {}
          setIsAuthenticated(true); setUserRole(usernameInput as any);
          sessionStorage.setItem('admin_auth', 'true'); sessionStorage.setItem('admin_role', usernameInput);
          setActiveTab('live'); return;
       }
    }
    alert("❌ Erişim Reddedildi! Hatalı Kullanıcı Adı veya Şifre."); setPasswordInput('');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth'); sessionStorage.removeItem('admin_role');
    setIsAuthenticated(false); setUserRole(null); setUsernameInput(''); setPasswordInput('');
  };

  const toggleSkorcuAccess = async (skorcuName: string, currentStatus: boolean) => {
     const newStatus = !currentStatus;
     setSkorcuStatusMap(prev => ({...prev, [skorcuName]: newStatus}));
     try { await supabase.from('skorcu_auth').upsert({ username: skorcuName, is_active: newStatus }, { onConflict: 'username' }); } catch (e) {}
  };

  const getPlayerIdByName = (name: string) => Object.keys(mergedPlayers).find(key => mergedPlayers[key] === name) || null;

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchLiveAdminData = async () => {
      if (userRole && userRole.startsWith('skorcum')) {
         try {
           const { data } = await supabase.from('skorcu_auth').select('is_active').eq('username', userRole).single();
           if (data && data.is_active === false) { handleLogout(); return; }
         } catch(e) {}
      }

      // MAÇ ARŞİVİ GİBİ BULLETİN ÇEKİLİYOR
      const { data: bultenData } = await supabase.from('matches_bulletin').select('*').eq('week_num', selectedLiveWeek).order('match_index', { ascending: true });
      const { data: liveData } = await supabase.from('live_matches').select('*');
      const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', selectedLiveWeek);

      let currentBulten = bultenData || [];
      setLiveMatchesDB(currentBulten);

      const initialScores: Record<number, { home: string, away: string }> = {};
      const lockedMatches: Record<number, boolean> = {};
      const infoMap: Record<number, any> = {}; 
      let goalHappened = false;

      currentBulten.forEach(m => {
         const uniqueId = getUniqueMatchId(selectedLiveWeek, m.match_index);
         const liveInfo = liveData?.find(l => l.id === uniqueId);
         if (liveInfo) {
           initialScores[m.match_index] = { home: liveInfo.home_score, away: liveInfo.away_score };
           infoMap[m.match_index] = liveInfo; 
           if (liveInfo.status === 'FINISHED') lockedMatches[m.match_index] = true;
           if (liveInfo.home_score !== '-' && liveInfo.away_score !== '-') {
             const newTotal = parseInt(liveInfo.home_score) + parseInt(liveInfo.away_score);
             const prevTotal = previousScoresRef.current[uniqueId];
             if (prevTotal !== undefined && newTotal > prevTotal) goalHappened = true;
             previousScoresRef.current[uniqueId] = newTotal;
           }
         } else { initialScores[m.match_index] = { home: "-", away: "-" }; }
      });
      setAdminScores(initialScores); setDistributedMatches(lockedMatches); setLiveInfoStateMap(infoMap);

      if (goalHappened && isSoundEnabled) { const audio = new Audio('/sounds/goal.mp3'); audio.play().catch(e => console.log("Ses çalınamadı:", e)); }

      if (pData) {
         const pMap: Record<string, string[]> = {};
         pData.forEach(row => {
            const rowUserId = String(row.user_id);
            if(!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
         setPredictionsDB(pMap);
      }
    };
    
    if (activeTab === 'live') {
        fetchLiveAdminData();
        const channel = supabase.channel('public:live_matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, payload => { fetchLiveAdminData(); })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }
  }, [activeTab, selectedLiveWeek, isAuthenticated, isSoundEnabled, userRole]);


  useEffect(() => {
    if (!isAuthenticated || userRole !== 'master') return;
    if (activeTab !== 'predictions') return;
    const fetchPredictionData = async () => {
      const { data: pData } = await supabase.from('player_predictions').select('*').eq('week_num', selectedPredictionWeek);
      const pMap: Record<string, string[]> = {};
      const allUserIds = Object.keys(mergedPlayers);
      if (pData) {
         pData.forEach(row => {
            const rowUserId = String(row.user_id);
            if (!pMap[rowUserId]) pMap[rowUserId] = Array(24).fill('-');
            pMap[rowUserId][row.match_index - 1] = row.predicted_score;
         });
      }
      const submitted: string[] = []; const missing: string[] = [];
      allUserIds.forEach(id => { if (pMap[id]) submitted.push(id); else missing.push(id); });
      submitted.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));
      missing.sort((a, b) => (mergedPlayers[a] || '').localeCompare(mergedPlayers[b] || '', 'tr'));
      setPlayerPredictionsMap(pMap); setSubmittedPlayers(submitted); setMissingPlayers(missing);
    };
    fetchPredictionData();
  }, [activeTab, selectedPredictionWeek, isAuthenticated, userRole, mergedPlayers]);

  const toggleWinners = (matchId: number) => setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  const handleScoreChange = (matchId: number, team: 'home' | 'away', score: string) => { setAdminScores(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || { home: "-", away: "-" }), [team]: score } })); };
  
  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15"];
  
  const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return (
      uppercaseCat.includes("TÜRKİYE SÜPER LİG") ||
      uppercaseCat.includes("TÜRKİYE KUPASI") ||
      uppercaseCat.includes("TÜRKİYE 1.LİG") ||
      uppercaseCat.includes("TÜRKİYE SÜPER KUPA") ||
      uppercaseCat.includes("TÜRKİYE KADINLAR SÜPER LİG") ||
      uppercaseCat.includes("TFF")
    );
  };

  const weeklyStats = useMemo(() => {
     const stats: Record<string, { points: number, exactScores: number }> = {};
     Object.keys(mergedPlayers).forEach(uid => { stats[uid] = { points: 0, exactScores: 0 }; });
     liveMatchesDB.forEach(match => {
         const hScore = adminScores[match.match_index]?.home || "-"; const aScore = adminScores[match.match_index]?.away || "-";
         if (hScore !== "-" && aScore !== "-") {
             const targetScore = `${hScore}-${aScore}`;
             const winners = Object.keys(predictionsDB).filter(uid => predictionsDB[uid] && predictionsDB[uid][match.match_index - 1] === targetScore);
             const wCount = winners.length;
             let pts = 0;
             if (wCount === 1) pts = 12; else if (wCount === 2) pts = 6; else if (wCount === 3) pts = 5; else if (wCount === 4) pts = 4; else if (wCount === 5) pts = 3; else if (wCount === 6) pts = 2; else if (wCount >= 7) pts = 1;
             winners.forEach(uid => { if (stats[uid]) { stats[uid].points += pts; stats[uid].exactScores += 1; } });
         }
     });
     let maxPts = 0; let maxScores = 0; let pointsLeader = null; let scoreLeader = null;
     Object.values(stats).forEach(s => { if (s.points > maxPts) maxPts = s.points; if (s.exactScores > maxScores) maxScores = s.exactScores; });
     if (maxPts > 0) { const pLeaders = Object.keys(stats).filter(uid => stats[uid].points === maxPts); if (pLeaders.length === 1) pointsLeader = pLeaders[0]; }
     if (maxScores > 0) { const sLeaders = Object.keys(stats).filter(uid => stats[uid].exactScores === maxScores); if (sLeaders.length === 1) scoreLeader = sLeaders[0]; }
     return { pointsLeader, scoreLeader, stats, maxPts, maxScores };
  }, [adminScores, predictionsDB, liveMatchesDB, mergedPlayers, selectedLiveWeek]);

  const handleAction = async (action: string, matchId: number, matchData: any, currentWinners: string[], displayPoints: number) => {
    const homeScore = adminScores[matchId]?.home || "-"; const awayScore = adminScores[matchId]?.away || "-";
    const uniqueId = getUniqueMatchId(selectedLiveWeek, matchId);
    const now = new Date(); const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    if (action === 'Skoru Güncelle') {
      const { error: liveError } = await supabase.from('live_matches').upsert({ id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'LIVE', updated_by: userRole, updated_at: timeString }, { onConflict: 'id' });
      if (liveError) alert("Hata: " + liveError.message); else alert(`✅ Canlı güncellendi.`);
      return;
    }

    if (action === 'Maçı Onayla (Puan Dağıt)') {
      if (homeScore === "-" || awayScore === "-") { alert("Skor girin!"); return; }
      const leagueName = isTffMatchCheck(matchData.category) ? 'TFF' : 'DFO';
      let confirmMsg = matchId === 24 ? `FİNAL ONAYI\nOnaylıyor musun?` : `${currentWinners.length} kişiye ${displayPoints} puan dağıtılacak.\nOnaylıyor musun?`;
      if (!window.confirm(confirmMsg)) return;

      try {
        await supabase.from('live_matches').upsert({ id: uniqueId, home_score: homeScore, away_score: awayScore, status: 'FINISHED', updated_by: userRole, updated_at: timeString }, { onConflict: 'id' });
        if (currentWinners.length > 0) {
          const inserts = currentWinners.map(wName => {
            const uid = getPlayerIdByName(wName);
            return { hafta: selectedLiveWeek, user_name: wName, username: uid, kategori: leagueName, ev_sahibi: matchData.home_team, deplasman: matchData.away_team, gercek_ev: parseInt(homeScore), gercek_dep: parseInt(awayScore), tahmin_ev: homeScore, tahmin_dep: awayScore, puan: displayPoints };
          });
          await supabase.from('points').insert(inserts);
          for (const wName of currentWinners) {
            const uid = getPlayerIdByName(wName); if (!uid) continue;
            const { data: stData } = await supabase.from('standings').select('*').eq('user_id', uid);
            if (stData) {
              const lRow = stData.find(r => r.league_type === leagueName);
              if (lRow) await supabase.from('standings').update({ points: lRow.points + displayPoints }).eq('id', lRow.id); else await supabase.from('standings').insert({ user_id: uid, user_name: wName, league_type: leagueName, points: displayPoints });
              const mRow = stData.find(r => r.league_type === 'MASTER');
              if (mRow) await supabase.from('standings').update({ points: mRow.points + displayPoints }).eq('id', mRow.id); else await supabase.from('standings').insert({ user_id: uid, user_name: wName, league_type: 'MASTER', points: displayPoints });
            }
          }
        }
        setDistributedMatches(prev => ({...prev, [matchId]: true})); alert(`✅ İŞLEM BAŞARILI!`);
      } catch (error: any) { alert("❌ HATA: " + error.message); }
      return;
    }

    if (action === 'Geri Al' || action === 'Resetle') {
      const isLocked = distributedMatches[matchId];
      if (isLocked) {
        if (!window.confirm(`DİKKAT: Puanlar düşülecek. Emin misin?`)) return;
        try {
          const leagueName = isTffMatchCheck(matchData.category) ? 'TFF' : 'DFO';
          const { data: existingPoints } = await supabase.from('points').select('*').eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          if (existingPoints && existingPoints.length > 0) {
            for (const row of existingPoints) {
              const { data: stData } = await supabase.from('standings').select('*').eq('user_id', row.username);
              if (stData) {
                const lRow = stData.find(r => r.league_type === leagueName);
                if (lRow) await supabase.from('standings').update({ points: Math.max(0, lRow.points - row.puan) }).eq('id', lRow.id);
                const mRow = stData.find(r => r.league_type === 'MASTER');
                if (mRow) await supabase.from('standings').update({ points: Math.max(0, mRow.points - row.puan) }).eq('id', mRow.id);
              }
            }
            await supabase.from('points').delete().eq('hafta', selectedLiveWeek).eq('ev_sahibi', matchData.home_team).eq('deplasman', matchData.away_team);
          }
        } catch (error: any) { alert("❌ HATA: " + error.message); return; }
      }
      await supabase.from('live_matches').upsert({ id: uniqueId, home_score: '-', away_score: '-', status: 'NOT_STARTED', updated_by: userRole, updated_at: timeString }, { onConflict: 'id' });
      setAdminScores(prev => ({ ...prev, [matchId]: { home: "-", away: "-" } })); setOpenWinnersMap(prev => ({ ...prev, [matchId]: false })); setDistributedMatches(prev => ({ ...prev, [matchId]: false }));
      if(!isLocked) alert("✅ Sıfırlandı.");
    }
  };

  const getEliteTheme = (category: string) => {
    if(!category) return { bgImg: null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900" };
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) return { bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) return { bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) return { bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    else if (isTffMatchCheck(upCat)) return { bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    return { bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
  };

  if (!isAuthenticated) return ( <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4"> <div className="bg-slate-900 border border-slate-700 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"> <span className="text-5xl mb-4 block">🛡️</span> <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6"> <input type="text" value={usernameInput} onChange={e => setUsernameInput(e.target.value)} className="bg-slate-950 border border-slate-700 text-slate-300 px-4 py-3 rounded-xl outline-none text-center" placeholder="ID" /> <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="bg-slate-950 border border-slate-700 text-amber-400 px-4 py-3 rounded-xl outline-none text-center" placeholder="ŞİFRE" /> <button type="submit" className="bg-amber-600 text-white font-black py-3 rounded-xl">KAPIYI AÇ</button> </form> </div> </div> );

  const displayedMatches = liveMatchesDB.filter(match => userRole === 'master' ? (showOnlyToday ? match.match_date === getTodayDateString() : true) : match.match_date === getTodayDateString());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-sans pb-24">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8 bg-slate-900/50 p-3 rounded-2xl border border-slate-800 shadow-xl overflow-x-auto custom-scrollbar flex-wrap">
           <button onClick={() => setActiveTab('live')} className={`flex-1 min-w-[160px] py-3 rounded-xl font-black text-xs lg:text-sm tracking-widest ${activeTab === 'live' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800/50 text-slate-400'}`}>🔴 CANLI YÖNETİM</button>
           {userRole === 'master' && (
             <>
               <button onClick={() => setActiveTab('predictions')} className={`flex-1 min-w-[160px] py-3 rounded-xl font-black text-xs lg:text-sm tracking-widest ${activeTab === 'predictions' ? 'bg-emerald-600 text-white' : 'bg-slate-800/50 text-slate-400'}`}>📊 TAHMİNLER</button>
             </>
           )}
        </div>

        {activeTab === 'live' && (
          <div className="animate-fade-in">
            {userRole === 'master' && (
               <div className="mb-6 bg-slate-900 border border-slate-700/80 rounded-2xl p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-2"><span className="text-2xl drop-shadow-md">⚔️</span><div><h2 className="text-white font-black tracking-widest uppercase text-sm">SKORCU DİSİPLİN PANELİ</h2></div></div>
                     <div className="flex gap-3 flex-wrap justify-center">
                        {['skorcum01', 'skorcum06', 'skorcum34'].map(sk => {
                           const isActive = skorcuStatusMap[sk] !== false; 
                           return ( <button key={sk} onClick={() => toggleSkorcuAccess(sk, isActive)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs ${isActive ? 'bg-emerald-950/80 text-emerald-400' : 'bg-rose-950/80 text-rose-400'}`}><span className="uppercase">{sk}</span><div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div></button> )
                        })}
                     </div>
                  </div>
               </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-4">
              <div className="text-center sm:text-left"><h1 className="text-xl sm:text-2xl font-bold text-amber-400">🔴 KÖK KOMUTA MERKEZİ</h1></div>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3">
                 <button onClick={handleLogout} className="px-4 py-2 bg-rose-950 text-rose-400 text-xs font-bold rounded-xl border border-rose-900/50">🔒 KİLİTLE ÇIK</button>
                 <button onClick={() => setIsSoundEnabled(!isSoundEnabled)} className={`px-4 py-2 rounded-xl font-bold text-xs border ${isSoundEnabled ? 'bg-emerald-900/50 text-emerald-400' : 'bg-slate-800/50 text-slate-500'}`}>{isSoundEnabled ? '🔊 GOL SESİ AÇIK' : '🔇 GOL SESİ KAPALI'}</button>
                 <div className="flex items-center gap-2 ml-0 sm:ml-2">
                    {userRole === 'master' && ( <button onClick={() => setShowOnlyToday(!showOnlyToday)} className={`px-3 py-1.5 rounded-xl font-bold text-xs border ${showOnlyToday ? 'bg-indigo-900/80 text-indigo-300' : 'bg-slate-800/50 text-slate-400'}`}>{showOnlyToday ? '📅 SADECE BUGÜN' : '📋 TÜM LİSTE'}</button> )}
                    <div className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-2">
                       <span className="text-slate-400 font-bold text-xs tracking-wider">AKTİF HAFTA:</span>
                       {userRole === 'master' ? ( <select value={selectedLiveWeek} onChange={(e) => setSelectedLiveWeek(Number(e.target.value))} className="bg-amber-500 border border-amber-600 text-slate-950 font-black text-sm px-2 py-0.5 rounded cursor-pointer"> <option value={4}>4. HAFTA</option><option value={5}>5. HAFTA</option><option value={6}>6. HAFTA</option> </select> ) : ( <div className="bg-amber-500 text-slate-950 font-black text-sm px-3 py-1 rounded">{selectedLiveWeek}. HAFTA</div> )}
                    </div>
                 </div>
              </div>
            </div>

            {displayedMatches.length === 0 ? (
                 <div className="w-full py-20 text-center bg-slate-900/50 border border-slate-800 rounded-2xl">
                    <span className="text-5xl mb-4 block opacity-50">⏳</span><h2 className="text-xl font-bold text-slate-400 mb-2 tracking-widest">{selectedLiveWeek}. HAFTA BÜLTENİ BULUNAMADI</h2>
                 </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {displayedMatches.map((match) => {
                const isWinnersOpen = !!openWinnersMap[match.match_index];
                const isTffMatch = isTffMatchCheck(match.category);
                
                const homeTeamUpper = cleanTeamName(match.home_team || match.homeTeam);
                const awayTeamUpper = cleanTeamName(match.away_team || match.awayTeam);

                // 🚀 BİREBİR MAÇ ARŞİVİNDEN KOPYALANAN LOGO MANTIĞI 🚀
                const homeLogoUrl = localTeamLogos[homeTeamUpper] || "/logos/default.png";
                const awayLogoUrl = localTeamLogos[awayTeamUpper] || "/logos/default.png";

                const homeScore = adminScores[match.match_index]?.home || "-";
                const awayScore = adminScores[match.match_index]?.away || "-";
                
                let currentWinners: string[] = []; let winnersCount = 0; let displayPoints = 0;

                if (homeScore !== "-" && awayScore !== "-") {
                  const targetScore = `${homeScore}-${awayScore}`;
                  currentWinners = Object.keys(predictionsDB).filter(uid => predictionsDB[uid] && predictionsDB[uid][match.match_index - 1] === targetScore).map(uid => mergedPlayers[uid] || "Bilinmeyen").sort((a, b) => a.localeCompare(b, 'tr'));
                  winnersCount = currentWinners.length;
                  if(winnersCount === 1) displayPoints = 12; else if(winnersCount === 2) displayPoints = 6; else if(winnersCount === 3) displayPoints = 5; else if(winnersCount === 4) displayPoints = 4; else if(winnersCount === 5) displayPoints = 3; else if(winnersCount === 6) displayPoints = 2; else if(winnersCount >= 7) displayPoints = 1; else displayPoints = 0;
                }

                const theme = getEliteTheme(match.category);
                const isLocked = distributedMatches[match.match_index];
                const logInfo = liveInfoStateMap[match.match_index];

                return (
                  <div key={match.match_index} className={`w-full mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${theme.containerBorder} ${theme.containerShadow} ${theme.containerBg}`}>
                    <div className="p-4 sm:p-6 relative flex-grow overflow-hidden flex flex-col justify-center">
                      {theme.bgImg && ( <><div className="absolute inset-0 z-0 opacity-100" style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}></div><div className="absolute inset-0 bg-slate-900/40 z-0"></div></> )}
                      <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex flex-col items-center justify-center mb-2 sm:mb-4 gap-1.5 sm:gap-2">
                          <span className="text-[9px] sm:text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase">{match.week_num}. Hafta - {match.match_index}. MAÇ</span>
                          <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border text-center flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>🏆 {match.category}</span>
                        </div>
                        <div className="flex items-center justify-between px-0 sm:px-4">
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={homeLogoUrl} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase drop-shadow-lg">{homeTeamUpper}</span>
                          </div>
                          <div className="flex flex-col items-center justify-center mx-1.5 sm:mx-4 w-24 sm:w-36 z-30">
                            <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2.5 sm:py-3.5 rounded-xl flex items-center justify-center gap-1 sm:gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                              <select disabled={isLocked} value={homeScore} onChange={e => handleScoreChange(match.match_index, 'home', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer disabled:opacity-80" style={{textAlignLast: 'center'}}>{scoreOptions.map(opt => <option key={`h-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}</select>
                              <span className={`text-base sm:text-xl font-bold ${theme.colonText}`}>:</span>
                              <select disabled={isLocked} value={awayScore} onChange={e => handleScoreChange(match.match_index, 'away', e.target.value)} className="bg-transparent text-xl sm:text-3xl font-black text-amber-400 outline-none appearance-none text-center cursor-pointer disabled:opacity-80" style={{textAlignLast: 'center'}}>{scoreOptions.map(opt => <option key={`a-${opt}`} value={opt} className="bg-slate-900 text-base">{opt}</option>)}</select>
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center flex-1 gap-1.5 sm:gap-3">
                             <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20"><img src={awayLogoUrl} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" /></div>
                            <span className="text-white font-extrabold text-[9px] sm:text-[12px] text-center uppercase drop-shadow-lg">{awayTeamUpper}</span>
                          </div>
                        </div>
                        {logInfo?.updated_by && ( <div className="mt-4 flex justify-center"> <div className="bg-slate-950/80 border border-slate-700/50 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-inner"> <span className="text-[10px] sm:text-xs">📝</span> <span className="text-[9px] sm:text-[10px] text-slate-400">Son İşlem: <strong className="text-amber-400 uppercase">{logInfo.updated_by}</strong> / <span className="text-slate-300">{logInfo.updated_at}</span></span> </div> </div> )}
                        <div className="flex justify-center gap-2 mt-5 min-h-[32px] items-center">
                          {isLocked ? (
                            <div className="w-full text-center">
                              <div className="bg-emerald-950/80 text-emerald-400 text-[10px] sm:text-[11px] font-black px-6 py-2 rounded-lg border border-emerald-500/30 uppercase">✅ BU MAÇIN PUANLARI DAĞITILDI</div>
                              <button onClick={() => handleAction('Geri Al', match.match_index, match, currentWinners, displayPoints)} className="bg-red-900/80 text-red-200 text-[9px] font-bold px-3 py-1.5 rounded uppercase mt-2 w-3/4 mx-auto block">İPTAL ET & PUANLARI GERİ AL</button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => handleAction('Skoru Güncelle', match.match_index, match, currentWinners, displayPoints)} className="bg-blue-600/80 text-white text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-blue-400">1. CANLIYA YANSIT</button>
                              <button onClick={() => handleAction('Maçı Onayla (Puan Dağıt)', match.match_index, match, currentWinners, displayPoints)} className="bg-emerald-600/80 text-white text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-emerald-400">2. MAÇI BİTİR</button>
                              <button onClick={() => handleAction('Resetle', match.match_index, match, currentWinners, displayPoints)} className="bg-red-600/80 text-white text-[9px] font-bold px-3 py-1.5 rounded uppercase border border-red-400">SIFIRLA</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`${theme.bottomBar} border-t px-4 py-4 w-full backdrop-blur-md z-10 relative min-h-[90px]`}>
                      <div className="flex items-center justify-between mb-3 w-full">
                         <div className="flex items-center gap-2"><span className="text-red-500 text-sm drop-shadow-md">🎯</span> <span className="text-amber-500 font-bold text-[10px] sm:text-xs tracking-widest uppercase">{winnersCount > 0 ? `${winnersCount} KİŞİ BİLDİ (${displayPoints} Puan)` : "BU SKORU BİLEN YOK"}</span></div>
                         <span className={`text-[9px] font-black tracking-widest px-2.5 py-0.5 rounded border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>{isTffMatch ? "TFF MAÇI" : "DFO MAÇI"}</span>
                         {winnersCount > 0 && ( <button onClick={() => toggleWinners(match.match_index)} className="text-blue-400 hover:text-blue-300 font-medium text-[10px] sm:text-xs whitespace-nowrap">{isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}</button> )}
                      </div>
                      {isWinnersOpen && winnersCount > 0 && ( <div className="flex items-center justify-center border-t border-slate-700/50 pt-3 animate-fadeIn"> <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2"> {currentWinners.map((p, i) => ( <span key={i} className="bg-slate-950/80 border px-2 py-1 rounded text-[9px] sm:text-[10px] font-bold text-white shadow-sm uppercase border-slate-600/50">{p}</span> ))} </div> </div> )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}

        {/* 🚀 3. CEPHE: TAHMİNLER DURUM PANELİ 🚀 */}
        {activeTab === 'predictions' && userRole === 'master' && (
           <div className="animate-fade-in">
              <h2 className="text-xl font-black text-emerald-400 mb-4 border-b border-slate-800 pb-2">📊 TAHMİNLER</h2>
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-rose-400 font-bold mb-2">EKSİKLER ({missingPlayers.length})</h3>
                    {missingPlayers.map(id => <div key={id} className="text-xs text-slate-300 py-1">{mergedPlayers[id]}</div>)}
                 </div>
                 <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-emerald-400 font-bold mb-2">GİRENLER ({submittedPlayers.length})</h3>
                    {submittedPlayers.map(id => <div key={id} className="text-xs text-slate-300 py-1">{mergedPlayers[id]}</div>)}
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
}