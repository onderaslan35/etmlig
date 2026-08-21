'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 ANA YARIŞMACI LİSTESİ (SABİT BETON KADRO) 🔴
const TEST_ACCOUNTS: Record<string, { pass: string, name: string }> = {
  "mankoman": { pass: "123456", name: "MANKOMAN (ADMİN)" },
  "262702": { pass: "00000", name: "MURAT KARA" },
  "262703": { pass: "00000", name: "CEMALETTİN BELLİ" },
  "262704": { pass: "00000", name: "YAPAY ZEKA" },
  "262705": { pass: "00000", name: "AHMET BİRCAN 🏆" },
  "262706": { pass: "00000", name: "GAZİ AYAN 🏆🏆" },
  "262707": { pass: "00000", name: "HAKAN AYAN" },
  "262708": { pass: "00000", name: "BAYRAM YILMAZ" },
  "262709": { pass: "00000", name: "SALİH KARACAOĞLU" },
  "262711": { pass: "00000", name: "RIDVAN DOGER" },
  "262712": { pass: "00000", name: "MURAT AYDEMİR" },
  "262714": { pass: "00000", name: "İSMAİL EKER 🏆" },
  "262715": { pass: "00000", name: "ŞEMSETTIN DÜGER" },
  "262716": { pass: "00000", name: "BİROL DEMİREL" },
  "262717": { pass: "00000", name: "MURAT ALİ" },
  "262718": { pass: "00000", name: "BEKİR KARADAĞ" },
  "262719": { pass: "00000", name: "UĞUR VARDAR" },
  "262721": { pass: "00000", name: "MUSTAFA GÜMÜŞÇÜ" },
  "262723": { pass: "00000", name: "AYHAN LUŞOĞLU" },
  "262725": { pass: "00000", name: "İLYAS KAZDAL" },
  "262726": { pass: "00000", name: "HUDAVER TOPARDIC" },
  "262728": { pass: "00000", name: "ÖNDER ASLAN" },
  "262730": { pass: "00000", name: "ÖNDER IŞIK" },
  "262731": { pass: "00000", name: "FATİH AYAN" },
  "262732": { pass: "00000", name: "R. İLHAN KARACA 🏆🏆" },
  "262733": { pass: "00000", name: "MUHSİN ASİLKAN" },
  "262734": { pass: "00000", name: "LEVENT YILDIRIM" },
  "262735": { pass: "00000", name: "AYGÜN AKKEÇELİ" },
  "262736": { pass: "00000", name: "MEHMET ALİ KARA" },
  "262737": { pass: "00000", name: "ŞAHİN GEZGİNCİ" },
  "262738": { pass: "00000", name: "MEVLÜT EVLER" },
  "262739": { pass: "00000", name: "UĞUR GÜRBÜZ" },
  "262740": { pass: "00000", name: "ABDULLAH DİK" },
  "262741": { pass: "00000", name: "SABAHATTİN ÇAYLAK" },
  "262744": { pass: "00000", name: "İLYAS UYGUN" },
  "262747": { pass: "00000", name: "SAVAŞ ÇAĞLAYAN" },
  "262749": { pass: "00000", name: "B.VEYSELOĞLU EROL" },
  "262750": { pass: "00000", name: "MAHMUT CBR" },
  "262753": { pass: "00000", name: "YUSUF KIZILTUĞ" },
  "262754": { pass: "00000", name: "OSMAN ALİ AYDIN 🏆" },
  "262755": { pass: "00000", name: "DOĞAÇ ALKAN" },
  "262756": { pass: "00000", name: "EYÜP KARACAOĞLU" },
  "262758": { pass: "00000", name: "MELİH PINAR" },
  "262763": { pass: "00000", name: "MUSTAFA ELMAS" },
  "262770": { pass: "00000", name: "OZKAYA MAZAKALI BAYRAM" },
  "262771": { pass: "00000", name: "ULAŞ ADIGÜZEL" },
  "262772": { pass: "00000", name: "CEMAL SİVRİKAYA 🏆" },
  "262774": { pass: "00000", name: "ŞENOL CAN ÇAKICI" },
  "262782": { pass: "00000", name: "YUSUF ERBAY" },
  "262786": { pass: "00000", name: "SEDAT DİŞLİ" },
  "262787": { pass: "00000", name: "MUSTAFA TUCİ" },
  "262790": { pass: "00000", name: "CUMALİ SÖKER" },
  "262813": { pass: "00000", name: "KEMAL ERSOY" },
  "262816": { pass: "00000", name: "SEDAT SEDAT" },
  "351925": { pass: "00000", name: "ALİOS GÖZTEPE" }
};

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
  "FK KAUNO ZALGIRIS": "https://images.fotmob.com/image_resources/logo/teamlogo/439132.png",

  // 🔴 ALMANYA BUNDESLIGA TAKIMLARI (FOTMOB ÖZEL)
  "BAYERN MÜNİH": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
  "BAYERN MUNICH": "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png",
  "BORUSSIA DORTMUND": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
  "B. DORTMUND": "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png",
  "BAYER LEVERKUSEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9788.png",
  "LEVERKUSEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9788.png",
  "RB LEIPZIG": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
  "LEIPZIG": "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png",
  "STUTTGART": "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png",
  "EINTRACHT FRANKFURT": "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png",
  "FRANKFURT": "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png",
  "FREIBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9784.png",
  "MÖNCHENGLADBACH": "https://images.fotmob.com/image_resources/logo/teamlogo/9786.png",
  "BORUSSIA MÖNCHENGLADBACH": "https://images.fotmob.com/image_resources/logo/teamlogo/9786.png",
  "WERDER BREMEN": "https://images.fotmob.com/image_resources/logo/teamlogo/9799.png",
  "WOLFSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9721.png",
  "MAINZ 05": "https://images.fotmob.com/image_resources/logo/teamlogo/9781.png",
  "MAINZ": "https://images.fotmob.com/image_resources/logo/teamlogo/9781.png",
  "HOFFENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/10223.png",
  "AUGSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8406.png",
  "UNION BERLIN": "https://images.fotmob.com/image_resources/logo/teamlogo/9795.png",
  "BOCHUM": "https://images.fotmob.com/image_resources/logo/teamlogo/8322.png",
  "HEIDENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/156973.png",
  "ST. PAULI": "https://images.fotmob.com/image_resources/logo/teamlogo/10202.png",
  "HOLSTEIN KIEL": "https://images.fotmob.com/image_resources/logo/teamlogo/8276.png",

  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png",
  // 🔴 PORTEKİZ LİGİ (PRIMEIRA LIGA)
  "SPORTING CP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "SPORTİNG LİZBON": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "PORTO": "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png",
  "BENFİCA": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
  
  // 🔴 HOLLANDA LİGİ (EREDIVISIE)
  "PSV": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
  "PSV EINDHOVEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png",
  "FEYENOORD": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
 
  "AZ ALKMAAR": "https://images.fotmob.com/image_resources/logo/teamlogo/10229.png",
 

  // 🔴 BELÇİKA LİGİ (PRO LEAGUE)
  "CLUB BRUGGE": "https://images.fotmob.com/image_resources/logo/teamlogo/8392.png",
  
  "GENK": "https://images.fotmob.com/image_resources/logo/teamlogo/9987.png",
  "UNION SG": "https://images.fotmob.com/image_resources/logo/teamlogo/6806.png",
 
  "ANTWERP": "https://images.fotmob.com/image_resources/logo/teamlogo/10141.png",

  // 🔴 İSKOÇYA LİGİ (PREMIERSHIP)
  "CELTIC": "https://images.fotmob.com/image_resources/logo/teamlogo/9827.png",
  "RANGERS": "https://images.fotmob.com/image_resources/logo/teamlogo/8548.png",
  "HEARTS": "https://images.fotmob.com/image_resources/logo/teamlogo/8274.png",
  "ABERDEEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8485.png",
  
  "OLİMPİC LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "OLİMPİQUE LYON": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "OLYMPIC LYON": "https://www.etmlig.com.tr/logos/lyon.png",
  "OLYMPIQUE LYON": "/logos/lyon.png",
  "OLYMPIQUE LYONNAIS": "https://upload.wikimedia.org/wikipedia/en/c/c6/Olympique_Lyonnais.svg",
  "LYON": "/logos/lyon.png",
  
  "YOUNG BOYS": "https://en.wikipedia.org/wiki/Special:FilePath/BSC_Young_Boys_logo.svg",
  "BODO/GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "LILLE": "https://en.wikipedia.org/wiki/Special:FilePath/LOSC_Lille_logo.svg",
  "SLAVIA PRAG": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Slavia_Praha_logo.svg",
  "DINAMO ZAGREP": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "LUGANO": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Lugano_logo.svg",
  "LENS": "https://en.wikipedia.org/wiki/Special:FilePath/RC_Lens_logo.svg",
  "FC HEIDENHEIM": "https://en.wikipedia.org/wiki/Special:FilePath/1._FC_Heidenheim_1846.svg",
  "HACKEN": "https://en.wikipedia.org/wiki/Special:FilePath/BK_H%C3%A4cken_logo.png"
};

const getActiveWeekByDate = () => {
  const nowUTC = new Date();
  const nowTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
  const baseDate = new Date(Date.UTC(2026, 7, 18, 0, 0, 0)).getTime(); 
  
  const diffTime = nowTurkey.getTime() - baseDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 4; 
  return 5 + Math.floor(diffDays / 7);
};

const getUniqueMatchId = (week: number, index: number) => {
    if (week === 4) return index; 
    return (week * 100) + index;
};

const getLocalLogoUrl = (teamName: string) => {
  if (!teamName || teamName === '') return '/logos/default.png';
  const slug = teamName
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
    
  return `/logos/${slug}.png`;
};

export default function LiveMatchCard() {
  const [activeWeek, setActiveWeek] = useState(getActiveWeekByDate());
  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [predictionsData, setPredictionsData] = useState<Record<string, string[]>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [isLiveAccordionOpen, setIsLiveAccordionOpen] = useState<boolean>(true); 
  const [isFinishedAccordionOpen, setIsFinishedAccordionOpen] = useState<boolean>(false);
  
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [openPossibleMap, setOpenPossibleMap] = useState<{ [key: number]: boolean }>({});
  const [openEliminatedMap, setOpenEliminatedMap] = useState<{ [key: number]: boolean }>({});

  const [expandedMatches, setExpandedMatches] = useState<Record<number, boolean>>({});

  const [mergedAccounts, setMergedAccounts] = useState<Record<string, { pass: string, name: string }>>(TEST_ACCOUNTS);

  useEffect(() => {
     const fetchDbPlayers = async () => {
        const { data } = await supabase.from('players').select('*');
        if (data) {
           const newAccounts = { ...TEST_ACCOUNTS };
           data.forEach(p => {
               newAccounts[String(p.user_id)] = { pass: p.password, name: p.full_name };
           });
           setMergedAccounts(newAccounts);
        }
     };
     fetchDbPlayers();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
        setNow(new Date().getTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isTffMatchCheck = (category: string) => {
    if(!category) return false;
    const uppercaseCat = category.toUpperCase();
    return (
      uppercaseCat.includes("TÜRKİYE") ||
      uppercaseCat.includes("TFF") ||
      uppercaseCat.includes("AMATÖR") ||
      uppercaseCat.includes("PTT") ||
      uppercaseCat.includes("2.LİG") ||
      uppercaseCat.includes("3.LİG")
    );
  };

  const getEliteTheme = (category: string, homeTeam: string, awayTeam: string) => {
    const upCat = category ? category.toUpperCase() : '';
    const homeLogoUrl = localTeamLogos[homeTeam] || getLocalLogoUrl(homeTeam);
    const awayLogoUrl = localTeamLogos[awayTeam] || getLocalLogoUrl(awayTeam);

    let leagueLogoUrl = null;
    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/42.png";
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/73.png";
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/10216.png";
    else if (upCat.includes("TÜRKİYE SÜPER LİG") || upCat.includes("TRENDYOL SÜPER LİG")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/71.png";
    else if (upCat.includes("TÜRKİYE 1.LİG") || upCat.includes("1. LİG") || upCat.includes("1.LİG")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/165.png";
    else if (upCat.includes("TÜRKİYE KUPASI")) leagueLogoUrl = "https://upload.wikimedia.org/wikipedia/tr/e/ee/Ziraat_T%C3%BCrkiye_Kupasi_logo.png";
    else if (upCat.includes("İSPANYA") || upCat.includes("LA LIGA")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/87.png";
    else if (upCat.includes("İNGİLTERE") || upCat.includes("PREMIER")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/47.png";
    else if (upCat.includes("İTALYA") || upCat.includes("SERIE A")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/55.png";
    else if (upCat.includes("ALMANYA") || upCat.includes("BUNDESLIGA")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/54.png";
    else if (upCat.includes("FRANSA") || upCat.includes("LIGUE 1")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/53.png";
    else if (upCat.includes("PORTEKİZ") || upCat.includes("PRIMEIRA LIGA") || upCat.includes("LIGA NOS")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/61.png";
    else if (upCat.includes("HOLLANDA") || upCat.includes("EREDIVISIE")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/57.png";
    else if (upCat.includes("BELÇİKA") || upCat.includes("PRO LEAGUE")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/40.png";
    else if (upCat.includes("İSKOÇYA") || upCat.includes("PREMIERSHIP")) leagueLogoUrl = "https://images.fotmob.com/image_resources/logo/leaguelogo/46.png";

    

    let theme = { bgImg: null as string | null, containerBorder: "border-slate-500", containerShadow: "shadow-none", containerBg: "bg-slate-900", badgeBg: "", badgeText: "text-slate-300", badgeBorder: "", catText: "text-slate-400", scoreBorder: "border-slate-700", colonText: "text-slate-500", tagText: "text-slate-400", tagBg: "bg-slate-800", tagBorder: "border-slate-600", bottomBar: "bg-slate-900", homeLogo: homeLogoUrl, awayLogo: awayLogoUrl, leagueLogo: leagueLogoUrl };

    if (upCat.includes("ŞAMPİYONLAR LİGİ") || upCat.includes("Ş.L.")) theme = { ...theme, bgImg: "url('/cl-bg.png')", containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]", containerBg: "bg-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-indigo-300", badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-white/30", colonText: "text-white/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    else if (upCat.includes("AVRUPA LİGİ") || upCat.includes("A.L.")) theme = { ...theme, bgImg: "url('/el-bg.png')", containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]", containerBg: "bg-[#140805]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-orange-400", badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]", catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]", scoreBorder: "border-orange-600/40", colonText: "text-orange-400/50", tagText: "text-orange-300", tagBg: "bg-orange-950/90", tagBorder: "border-orange-400/80", bottomBar: "bg-[#140805]/90 border-orange-900/30" };
    else if (upCat.includes("KONFERANS LİGİ") || upCat.includes("K.L.")) theme = { ...theme, bgImg: "url('/uecl-bg.png')", containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]", containerBg: "bg-[#05140b]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-emerald-400", badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]", catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]", scoreBorder: "border-emerald-600/40", colonText: "text-emerald-400/50", tagText: "text-emerald-300", tagBg: "bg-emerald-950/90", tagBorder: "border-emerald-400/80", bottomBar: "bg-[#05140b]/90 border-emerald-900/30" };
    else if (isTffMatchCheck(upCat)) theme = { ...theme, bgImg: "url('/tff-bg.png')", containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]", containerBg: "bg-[#140505]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-red-400", badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]", catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]", scoreBorder: "border-red-600/40", colonText: "text-red-400/50", tagText: "text-red-400", tagBg: "bg-red-950/90", tagBorder: "border-red-500/80", bottomBar: "bg-[#140505]/90 border-red-900/30" };
    else theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
    
    return theme;
  };

  useEffect(() => {
    const fetchMatchesAndPredictions = async () => {
      const { data: dbBulletinMatches } = await supabase
        .from('matches_bulletin')
        .select('*')
        .eq('week_num', activeWeek)
        .order('match_index', { ascending: true });

      const { data: dbLiveMatches } = await supabase
        .from('live_matches')
        .select('*');

      // 🔴 İŞTE MUCİZE BURADA! 1000'ER 1000'ER ÇEKME MOTORU (LİMİT YOK) 🔴
      let allPredictions: any[] = [];
      let from = 0;
      let step = 999;
      let keepFetching = true;

      while(keepFetching) {
          const { data } = await supabase
              .from('player_predictions')
              .select('*')
              .eq('week_num', activeWeek)
              .range(from, from + step);
          
          if (data && data.length > 0) {
              allPredictions = [...allPredictions, ...data];
              if (data.length <= step) keepFetching = false;
              else from += step + 1;
          } else {
              keepFetching = false;
          }
      }

      const predDict: Record<string, string[]> = {};
      if (allPredictions.length > 0) {
        allPredictions.forEach(pred => {
          const rowUserId = String(pred.user_id);
          
          // 🔴 EKMEL ZIRHI 3: ADMİNİ (mankoman) RADARDAN VE LİSTEDEN GİZLE!
          if (rowUserId === 'mankoman') return;
          
          if (!predDict[rowUserId]) {
            predDict[rowUserId] = Array(24).fill('-');
          }
          predDict[rowUserId][pred.match_index - 1] = pred.predicted_score;
        });
      }
      setPredictionsData(predDict);

      if (dbBulletinMatches) {
        const nowUTC = new Date();
        const todayTurkey = new Date(nowUTC.getTime() + (3 * 60 * 60 * 1000));
        
        const dd = String(todayTurkey.getUTCDate()).padStart(2, '0');
        const mm = String(todayTurkey.getUTCMonth() + 1).padStart(2, '0');
        const yyyy = todayTurkey.getUTCFullYear();
        const todayFormatted = `${dd}.${mm}.${yyyy}`;

        const currentWeekMatches = dbBulletinMatches.map((m, idx) => ({
          id: m.match_index,
          weekLabel: `${activeWeek}. HAFTA ${m.match_index}. MAÇ`,
          category: m.category,
          date: m.match_date,
          time: m.match_time,
          homeTeam: m.home_team,
          awayTeam: m.away_team
        }));

        const todaysMatches = currentWeekMatches.filter(m => m.date === todayFormatted);
        setTodaysMatchesList(todaysMatches);
        
        const liveMap: Record<number, any> = {};
        if (dbLiveMatches) {
          dbLiveMatches.forEach(row => liveMap[row.id] = row); 
        }
        setLiveMatchesData(liveMap);

        let currentBoard: Record<string, any> = {}; 
        let hasLiveScores = false;

        todaysMatches.forEach(match => {
          const uniqueId = getUniqueMatchId(activeWeek, match.id);
          const dbMatch = liveMap[uniqueId];
          
          if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
            hasLiveScores = true;
            const isTff = isTffMatchCheck(match.category);
            const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
            
            const winnerIds = Object.keys(predDict).filter(id => predDict[id][match.id - 1] === targetScore);
            
            let points = 1;
            if(winnerIds.length === 1) points = 12;
            else if(winnerIds.length === 2) points = 6;
            else if(winnerIds.length === 3) points = 5;
            else if(winnerIds.length === 4) points = 4;
            else if(winnerIds.length === 5) points = 3;
            else if(winnerIds.length === 6) points = 2;
            else points = 1;

            winnerIds.forEach(wId => {
              if(!currentBoard[wId]) currentBoard[wId] = { dfo: 0, tff: 0, master: 0, skor: 0 };
              if (isTff) currentBoard[wId].tff += points;
              else currentBoard[wId].dfo += points;
              currentBoard[wId].master += points;
              currentBoard[wId].skor += 1;
            });
          }
        });

        if (hasLiveScores) {
          localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
        } else {
          localStorage.removeItem('elitTahmin_Leaderboard');
        }
        window.dispatchEvent(new Event('leaderboardUpdate')); 
      }
    };

    fetchMatchesAndPredictions(); 
    const interval = setInterval(fetchMatchesAndPredictions, 5000); 
    return () => clearInterval(interval);
  }, [activeWeek]);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  };
  const togglePossible = (matchId: number) => {
    setOpenPossibleMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };
  const toggleEliminated = (matchId: number) => {
    setOpenEliminatedMap((prev) => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const toggleMatchExpansion = (matchId: number) => {
    setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const getMatchTimeMs = (dateStr: string, timeStr: string) => {
    const [d, m, y] = dateStr.split('.');
    const [hr, min] = timeStr.split(':');
    const matchTime = new Date(Date.UTC(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hr) - 3, parseInt(min), 0));
    return matchTime.getTime();
  };

  if (todaysMatchesList.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
        <div className="w-full text-center py-10 bg-slate-900/30 border border-slate-800/50 rounded-2xl">
          <span className="text-3xl mb-2 block opacity-50">🗓️</span>
          <p className="text-slate-400 text-sm font-medium tracking-widest">BUGÜN PLANLANAN BİR MAÇ BULUNMUYOR</p>
        </div>
      </div>
    );
  }

  const activeMatches = todaysMatchesList.filter(match => {
     const uniqueId = getUniqueMatchId(activeWeek, match.id);
     const dbMatch = liveMatchesData[uniqueId] || {};
     return dbMatch.status !== 'FINISHED';
  });

  const finishedMatches = todaysMatchesList.filter(match => {
     const uniqueId = getUniqueMatchId(activeWeek, match.id);
     const dbMatch = liveMatchesData[uniqueId] || {};
     return dbMatch.status === 'FINISHED';
  });

  const renderMatchCard = (match: any, isFinishedGroup: boolean = false) => {
      const homeTeamUpper = match.homeTeam?.toUpperCase() || match.home_team?.toUpperCase();
      const awayTeamUpper = match.awayTeam?.toUpperCase() || match.away_team?.toUpperCase();

      const isWinnersOpen = openWinnersMap[match.id] !== false;
      const isPossibleOpen = openPossibleMap[match.id] || false;
      const isEliminatedOpen = openEliminatedMap[match.id] || false;
      const isExpanded = expandedMatches[match.id] !== undefined ? expandedMatches[match.id] : isFinishedGroup;

      const uniqueId = getUniqueMatchId(activeWeek, match.id);
      const dbMatch = liveMatchesData[uniqueId] || {};
      
      let matchStatus = dbMatch.status || 'NOT_STARTED';
      let homeScore = dbMatch.home_score || '-';
      let awayScore = dbMatch.away_score || '-';

      const matchTimeMs = getMatchTimeMs(match.date, match.time);
      const twoHoursMs = 2 * 60 * 60 * 1000;
      
      if (matchStatus !== 'FINISHED') {
        if (now >= matchTimeMs && now < matchTimeMs + twoHoursMs) {
          matchStatus = 'LIVE';
        } else if (now >= matchTimeMs + twoHoursMs) {
          matchStatus = 'WAITING_APPROVAL'; 
        }
      }

      if (matchStatus === 'LIVE' || matchStatus === 'WAITING_APPROVAL') {
         if (homeScore === '-') homeScore = '0';
         if (awayScore === '-') awayScore = '0';
      }

      const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
      const isTffMatch = isTffMatchCheck(match.category);
      const theme = getEliteTheme(match.category, homeTeamUpper, awayTeamUpper);
      const isFinished = matchStatus === 'FINISHED'; 

      let exactWinners: {name: string, score: string}[] = [];
      let possibleWinners: {name: string, score: string}[] = [];
      let eliminatedPlayers: {name: string, score: string}[] = [];

      if ((matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'WAITING_APPROVAL') && homeScore !== '-' && awayScore !== '-') {
        const currentH = parseInt(homeScore);
        const currentA = parseInt(awayScore);

        Object.keys(predictionsData).forEach(id => {
          const preds = predictionsData[id];
          if (!preds) return;
          const predStr = preds[match.id - 1];
          if (!predStr || predStr === '-' || predStr === 'PAS') return;

          const name = mergedAccounts[id]?.name;
          if (!name) return;

          const [pHStr, pAStr] = predStr.split('-');
          const pH = parseInt(pHStr);
          const pA = parseInt(pAStr);

          if (pH === currentH && pA === currentA) {
             exactWinners.push({ name, score: predStr });
          } else if (pH >= currentH && pA >= currentA && !isFinished && matchStatus !== 'WAITING_APPROVAL') {
             possibleWinners.push({ name, score: predStr });
          } else {
             eliminatedPlayers.push({ name, score: predStr });
          }
        });

        exactWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        possibleWinners.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
        eliminatedPlayers.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
      }
      
      const winnersCount = exactWinners.length;

      let displayPoints = 1;
      if(winnersCount === 1) displayPoints = 12;
      else if(winnersCount === 2) displayPoints = 6;
      else if(winnersCount === 3) displayPoints = 5;
      else if(winnersCount === 4) displayPoints = 4;
      else if(winnersCount === 5) displayPoints = 3;
      else if(winnersCount === 6) displayPoints = 2;
      else if(winnersCount >= 7) displayPoints = 1;
      else displayPoints = 0;

      let countdownText = "";
      if (now < matchTimeMs && matchStatus === 'NOT_STARTED') {
        const distance = matchTimeMs - now;
        if (distance > 0) {
          const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
      }

      return (
        <div 
          key={match.id} 
          className={`w-full max-w-lg mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${
            isExpanded 
              ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg 
              : theme.containerBorder + ' shadow-md hover:shadow-[0_0_15px_currentColor] ' + theme.badgeText + ' ' + (theme.bgImg ? '' : 'bg-slate-950')
          }`}
        >
          {theme.bgImg && (
            <>
              <div 
                className="absolute inset-0 z-0 opacity-100"
                style={{ backgroundImage: theme.bgImg, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
              ></div>
              <div className={`absolute inset-0 z-0 transition-colors duration-300 ${isExpanded ? 'bg-slate-900/60' : 'bg-slate-950/70 hover:bg-slate-900/60'}`}></div>
            </>
          )}

          {!isExpanded && (
            <div
              onClick={() => toggleMatchExpansion(match.id)}
              className="cursor-pointer px-3 sm:px-5 flex items-center justify-between border-b border-black/50 relative z-20 group transition-all duration-300 py-3 sm:py-4"
            >
              <div className="flex-1 flex items-center gap-2 justify-end text-right">
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{homeTeamUpper}</span>
                <img src={theme.homeLogo} alt={homeTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
              </div>
              
              <div className="px-3 sm:px-5 flex flex-col items-center justify-center">
                <div className={`flex items-center justify-center min-w-[60px] px-3 rounded-lg border shadow-inner backdrop-blur-md transition-all ${
                  matchStatus === 'LIVE' ? 'py-1.5 bg-red-950/50 border-red-500/50 animate-pulse' : 'py-1.5 bg-[#080d1a]/80 border-slate-700/50 group-hover:border-slate-500/80'
                }`}>
                  <span className={`font-black whitespace-nowrap tracking-widest ${
                    matchStatus === 'LIVE' ? 'text-xs sm:text-sm text-red-500' : 'text-xs sm:text-sm text-slate-200 group-hover:text-white'
                  }`}>
                    {matchStatus === 'NOT_STARTED' ? match.time : `${homeScore} - ${awayScore}`}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 flex items-center gap-2 justify-start text-left">
                <img src={theme.awayLogo} alt={awayTeamUpper} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wide truncate group-hover:text-white transition-colors">{awayTeamUpper}</span>
              </div>
              
              <div className="ml-2 opacity-50 text-[10px] text-white group-hover:opacity-100 transition-opacity">▼</div>
            </div>
          )}

          {isExpanded && (
            <div className="relative flex-grow overflow-hidden animate-fadeIn z-10">
              <button 
                onClick={() => toggleMatchExpansion(match.id)}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
                title="Küçült"
              >
                ✕
              </button>
              <div className="relative z-10 flex flex-col h-full">
                <div className="w-full text-center pt-3 pb-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">
                    {match.weekLabel}
                  </span>
                </div>
                <div className="w-full text-center px-2 mt-2 relative z-30">
                  <span className={`inline-block w-[95%] sm:w-[85%] mx-auto px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-snug whitespace-nowrap ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                    {match.category}
                  </span>
                </div>

                <div className="flex items-center justify-between px-2 sm:px-6 pt-3 pb-4">
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={theme.homeLogo} alt={homeTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{homeTeamUpper}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2 mx-1 sm:mx-4 w-36 sm:w-44 z-30 relative">
                    
                    {theme.leagueLogo && (
                      <div className="w-10 h-10 sm:w-14 sm:h-14 mb-1 flex items-center justify-center drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] hover:scale-110 transition-transform duration-500 z-40">
                        <img src={theme.leagueLogo} alt="League Logo" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {matchStatus === 'NOT_STARTED' && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}
                    {matchStatus === 'LIVE' && (
                      <div className="bg-red-950/80 border border-red-700 px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-red-500 text-[10px] font-black tracking-widest">CANLI</span>
                      </div>
                    )}
                    {matchStatus === 'WAITING_APPROVAL' && (
                      <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest">ONAY BEKLİYOR</span>
                      </div>
                    )}
                    {isFinished && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-slate-400 text-[10px] font-black tracking-widest">MS (BİTTİ)</span>
                      </div>
                    )}

                    <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} py-2 sm:py-3 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                      <span className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                      <span className={`text-base sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                    </div>

                    {matchStatus === 'NOT_STARTED' && countdownText && (
                      <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1 rounded-lg text-center shadow-md mt-1">
                        <span className="text-[#38bdf8] text-[9px] sm:text-[10px] font-mono font-bold tracking-widest drop-shadow-sm">
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                      <img src={theme.awayLogo} alt={awayTeamUpper} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{awayTeamUpper}</span>
                  </div>
                </div>
              
                <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative mt-auto`}>
                  <div className="flex justify-between items-center w-full">
                    <div className="text-left flex-1">
                      {matchStatus === 'NOT_STARTED' ? (
                        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                      ) : exactWinners.length === 0 ? (
                         !isFinished && possibleWinners.length > 0 ? (
                           <span className="text-[9px] sm:text-[10px] font-medium text-blue-300 italic">Tam isabet yok, {possibleWinners.length} kişi pusuda!</span>
                         ) : (
                           <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Skoru bilen kalmadı.</span>
                         )
                      ) : (
                        <span className="text-[9px] sm:text-[10px] font-medium text-emerald-300">
                          <strong className="text-emerald-400">{exactWinners.length} kişi</strong> tam isabetli
                        </span>
                      )}
                    </div>
                    <div className="flex-0 text-center px-1">
                      <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                        {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                      </span>
                    </div>
                    <div className="text-right flex-1">
                      {(exactWinners.length > 0 || possibleWinners.length > 0 || eliminatedPlayers.length > 0) && matchStatus !== 'NOT_STARTED' && (
                        <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">
                          {isWinnersOpen ? "Radarı Gizle ▲" : "Tüm Tahmin Radarı →"}
                        </button>
                      )}
                    </div>
                  </div>
                
                  {isWinnersOpen && (matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'WAITING_APPROVAL') && (
                    <div className="w-full mt-2 flex flex-col gap-2 animate-fadeIn pb-1">
                      
                      {/* 1. CEPHE: TAM İSABET */}
                      {exactWinners.length > 0 && (
                        <div className="w-full p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-800/50 shadow-inner">
                          <div className="text-emerald-400 font-bold mb-2 border-b border-emerald-900/50 pb-1.5 flex justify-between items-center text-[9px] sm:text-[10px]">
                            <span>{isFinished ? "🎯 TAM İSABET (MAÇ SONUCUNU BİLENLER)" : "🎯 ANLIK BİLENLER"}</span>
                            <span className="bg-emerald-900/40 px-2 py-0.5 rounded border border-emerald-700/50 text-emerald-300">Kişi Başı: {displayPoints} Puan</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                            {exactWinners.map((winner, idx) => (
                              <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-emerald-900/60 text-white border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)] flex gap-1 items-center">
                                <span>{winner.name}</span>
                                <span className="text-amber-400 font-black tracking-widest">[{winner.score}]</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 2. CEPHE: ŞANSI DEVAM EDENLER */}
                      {!isFinished && matchStatus !== 'WAITING_APPROVAL' && possibleWinners.length > 0 && (
                        <div className="w-full bg-blue-950/30 rounded-lg border border-blue-800/50 shadow-inner overflow-hidden">
                          <button onClick={() => togglePossible(match.id)} className="w-full flex justify-between items-center p-2.5 bg-blue-900/30 hover:bg-blue-800/40 transition-colors">
                            <span className="text-blue-400 font-bold text-[9px] sm:text-[10px]">⏳ ŞANSI DEVAM EDENLER ({possibleWinners.length} KİŞİ)</span>
                            <span className="text-blue-400 text-[10px]">{isPossibleOpen ? '▲' : '▼'}</span>
                          </button>
                          {isPossibleOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-blue-900/50">
                              {possibleWinners.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-blue-900/30 text-slate-300 border-blue-700/50 flex gap-1 items-center">
                                  <span>{winner.name}</span>
                                  <span className="text-cyan-400 font-black tracking-widest">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 3. CEPHE: ELENENLER */}
                      {eliminatedPlayers.length > 0 && (
                        <div className="w-full bg-red-950/20 rounded-lg border border-red-900/30 shadow-inner overflow-hidden">
                          <button onClick={() => toggleEliminated(match.id)} className="w-full flex justify-between items-center p-2.5 bg-red-900/20 hover:bg-red-800/30 transition-colors">
                            <span className="text-red-400 font-bold text-[9px] sm:text-[10px]">❌ TAM İSABET ŞANSI KALMAYANLAR ({eliminatedPlayers.length} KİŞİ)</span>
                            <span className="text-red-400 text-[10px]">{isEliminatedOpen ? '▲' : '▼'}</span>
                          </button>
                          {isEliminatedOpen && (
                            <div className="p-2.5 flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto custom-scrollbar pr-1 border-t border-red-900/30">
                              {eliminatedPlayers.map((winner, idx) => (
                                <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium bg-red-950/40 text-slate-400 border-red-900/50 flex gap-1 items-center opacity-70">
                                  <span className="line-through">{winner.name}</span>
                                  <span className="text-red-500 font-black tracking-widest">[{winner.score}]</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-5">
      
      {finishedMatches.length > 0 && (
        <div className="bg-slate-950/40 rounded-2xl border border-slate-800/50 shadow-xl backdrop-blur-xl overflow-hidden">
          <button 
            onClick={() => setIsFinishedAccordionOpen(!isFinishedAccordionOpen)}
            className="w-full flex items-center justify-between px-4 py-2 sm:py-3 bg-slate-900/50 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 group"
          >
            <div className="flex-1"></div> 
            <h2 className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex items-center gap-2">
              📅 GÜNÜN BİTEN MAÇLARI ({finishedMatches.length})
            </h2>
            <div className="flex-1 flex justify-end">
              <div className={`p-1 transition-transform duration-300 ${isFinishedAccordionOpen ? 'rotate-180' : ''}`}>
                <span className="text-slate-500 text-[10px] sm:text-xs">▼</span>
              </div>
            </div>
          </button>
          
          {isFinishedAccordionOpen && (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/20">
              {finishedMatches.map(match => renderMatchCard(match, true))}
            </div>
          )}
        </div>
      )}

      {activeMatches.length > 0 && (
        <div className="bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-xl overflow-hidden">
          <button 
            onClick={() => setIsLiveAccordionOpen(!isLiveAccordionOpen)}
            className="w-full flex items-center justify-between px-4 py-3 sm:py-4 bg-slate-900/80 hover:bg-slate-800/80 transition-colors border-b border-slate-800/80 group"
          >
            <div className="flex-1 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div> 
            <h2 className="text-xs sm:text-sm font-black text-amber-500 uppercase tracking-widest drop-shadow-md text-center">
              GÜNÜN CANLI MAÇLARI ({activeMatches.length})
            </h2>
            <div className="flex-1 flex justify-end">
              <div className={`p-1 transition-transform duration-300 ${isLiveAccordionOpen ? 'rotate-180' : ''}`}>
                <span className="text-slate-400 text-[10px] sm:text-xs">▼</span>
              </div>
            </div>
          </button>
          
          {isLiveAccordionOpen && (
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-start bg-slate-900/30">
              {activeMatches.map(match => renderMatchCard(match, false))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}