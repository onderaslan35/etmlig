// ============================================================================
// 🏭 ETM LİGİ MERKEZ LOJİSTİK DEPOSU (THEME & LOGO ENGINE) 🏭
// ============================================================================

// 🔴 1. ANA YARIŞMACI LİSTESİ (ORJİNAL ŞİFRELER GERİ GELDİ)
export const TEST_ACCOUNTS: Record<string, { pass: string, name: string }> = {
  "mankoman": { pass: "123456", name: "MANKOMAN (ADMİN)" },
  "262740": { pass: "4940", name: "ABDULLAH DİK" },
  "262705": { pass: "1405", name: "AHMET BİRCAN 🏆" },
  "351925": { pass: "1925", name: "ALİOS GÖZTEPE" },
  "262735": { pass: "1925", name: "AYGÜN AKKEÇELİ" },
  "262723": { pass: "3223", name: "AYHAN LUŞOĞLU" },
  "262749": { pass: "5849", name: "B.VEYSELOĞLU EROL" },
  "262708": { pass: "1708", name: "BAYRAM YILMAZ" },
  "262718": { pass: "2718", name: "BEKİR KARADAĞ" },
  "262716": { pass: "2516", name: "BİROL DEMİREL" },
  "262772": { pass: "8172", name: "CEMAL SİVRİKAYA 🏆" },
  "262703": { pass: "1203", name: "CEMALETTİN BELLİ" },
  "262790": { pass: "9988", name: "CUMALİ SÖKER" },
  "262755": { pass: "6455", name: "DOĞAÇ ALKAN" },
  "262756": { pass: "7181", name: "EYÜP KARACAOĞLU" },
  "262731": { pass: "4031", name: "FATİH AYAN" },
  "262706": { pass: "1506", name: "GAZİ AYAN 🏆🏆" },
  "262707": { pass: "1607", name: "HAKAN AYAN" },
  "262726": { pass: "3526", name: "HUDAVER TOPARDIC" },
  "262725": { pass: "3425", name: "İLYAS KAZDAL" },
  "262744": { pass: "5344", name: "İLYAS UYGUN" },
  "262714": { pass: "2314", name: "İSMAİL EKER 🏆" },
  "262813": { pass: "2862", name: "KEMAL ERSOY" },
  "262734": { pass: "4334", name: "LEVENT YILDIRIM" },
  "262750": { pass: "5950", name: "MAHMUT CBR" },
  "262736": { pass: "4536", name: "MEHMET ALİ KARA" },
  "262758": { pass: "6758", name: "MELİH PINAR" },
  "262738": { pass: "4738", name: "MEVLÜT EVLER" },
  "262733": { pass: "4233", name: "MUHSİN ASİLKAN" },
  "262717": { pass: "2617", name: "MURAT ALİ" },
  "262712": { pass: "2112", name: "MURAT AYDEMİR" },
  "262702": { pass: "1102", name: "MURAT KARA" },
  "262763": { pass: "7263", name: "MUSTAFA ELMAS" },
  "262721": { pass: "3021", name: "MUSTAFA GÜMÜŞÇÜ" },
  "262787": { pass: "9687", name: "MUSTAFA TUCİ" },
  "262754": { pass: "6354", name: "OSMAN ALİ AYDIN 🏆" },
  "262770": { pass: "7970", name: "OZKAYA MAZAKALI BAYRAM" },
  "262728": { pass: "3528", name: "ÖNDER ASLAN" },
  "262730": { pass: "3930", name: "ÖNDER IŞIK" },
  "262732": { pass: "4132", name: "R. İLHAN KARACA 🏆🏆" },
  "262711": { pass: "2011", name: "RIDVAN DOGER" },
  "262741": { pass: "5041", name: "SABAHATTİN ÇAYLAK" },
  "262709": { pass: "1809", name: "SALİH KARACAOĞLU" },
  "262747": { pass: "5647", name: "SAVAŞ ÇAĞLAYAN" },
  "262786": { pass: "9586", name: "SEDAT DİŞLİ" },
  "262816": { pass: "6182", name: "SEDAT SEDAT" },
  "262737": { pass: "4637", name: "ŞAHİN GEZGİNCİ" },
  "262715": { pass: "2415", name: "ŞEMSETTIN DÜGER" },
  "262774": { pass: "8374", name: "ŞENOL CAN ÇAKICI" },
  "262739": { pass: "4839", name: "UĞUR GÜRBÜZ" },
  "262719": { pass: "2819", name: "UĞUR VARDAR" },
  "262771": { pass: "8071", name: "ULAŞ ADIGÜZEL" },
  "262704": { pass: "1304", name: "YAPAY ZEKA" },
  "262782": { pass: "9182", name: "YUSUF ERBAY" },
  "262753": { pass: "6253", name: "YUSUF KIZILTUĞ" }
};

export const staticPlayersList: Record<string, string> = Object.keys(TEST_ACCOUNTS).reduce((acc, key) => {
  if (key !== "mankoman") acc[key] = TEST_ACCOUNTS[key].name;
  return acc;
}, {} as Record<string, string>);

// 🔴 HAFTA İSİMLENDİRME SÖZLÜĞÜ (MASKELEME MOTORU) 🔴
export const customWeekNames: Record<number, string> = {
  12: "12. HAFTA (18-19 EYLÜL)",
  13: "13. HAFTA (20 EYLÜL)",
  14: "14. HAFTA (24-25-26 EYLÜL)"
};

export const getWeekLabel = (weekNum: number): string => {
  return customWeekNames[weekNum] || `${weekNum}. HAFTA`;
};

// 🔴 2. LİG HAVUZU VE KATEGORİLER
export const LIG_HAVUZU: Record<string, string[]> = {
  "TÜRKİYE SÜPER LİG": ["ALANYASPOR", "AMED SPOR", "BAŞAKŞEHİR", "BEŞİKTAŞ", "ÇAYKUR RİZE", "ÇORUM FK", "ERZURUMSPOR", "EYÜPSPOR", "FENERBAHÇE", "GALATASARAY", "GAZİANTEP FK", "GENÇLERBİRLİĞİ", "GÖZTEPE", "KASIMPAŞA", "KOCAELİSPOR", "KONYASPOR", "SAMSUNSPOR", "TRABZONSPOR"],
  "TÜRKİYE 1. LİG": ["ANTALYASPOR", "BANDIRMASPOR", "BATMAN PETROL SPOR", "BODRUMSPOR", "BOLUSPOR", "BURSASPOR", "EROKSPOR", "FATİH KARAGÜMRÜK", "IĞDIR FK", "İSTANBULSPOR", "KAYSERİSPOR", "KEÇİÖRENGÜCÜ", "MANİSA FK", "MARDİN 1969", "MUĞLASPOR", "PENDİKSPOR", "SARIYER", "SİVASSPOR", "ÜMRANİYE SPOR", "VANSPOR FK"],
  "İNGİLTERE PREMIER LİG": ["ARSENAL", "ASTON VILLA", "BOURNEMOUTH", "BRENTFORD", "BRIGHTON", "CHELSEA", "COVENTRY CITY", "CRYSTAL PALACE", "EVERTON", "FULHAM", "HULL CITY", "IPSWICH TOWN", "LEEDS UNITED", "LIVERPOOL", "MANCHESTER CITY", "MANCHESTER UNITED", "NEWCASTLE UNITED", "NOTTINGHAM FOREST", "SUNDERLAND", "TOTTENHAM HOTSPUR", "MIDDLESBROUGH"],
  "ALMANYA BUNDESLIGA": ["AUGSBURG", "BAYER LEVERKUSEN", "BAYERN MÜNİH", "BORUSSIA DORTMUND", "MÖNCHENGLADBACH", "EINTRACHT FRANKFURT", "ELVERSBERG", "FREIBURG", "HAMBURG", "HOFFENHEIM", "KÖLN", "MAINZ 05", "RB LEIPZIG", "SCHALKE 04", "STUTTGART", "UNION BERLIN", "WERDER BREMEN", "WOLFSBURG", "BOCHUM", "ST. PAULI", "HEIDENHEIM", "HOLSTEIN KIEL"],
  "FRANSA LIGUE 1": ["ANGERS", "BREST", "LE MANS", "LENS", "LILLE", "LORIENT", "LYON", "MARSİLYA", "MONACO", "PARIS FC", "PARIS SAINT-GERMAIN", "RENNES", "STRASBOURG", "TOULOUSE", "TROYES", "NICE", "LE HAVRE", "AUXERRE", "NANTES", "REIMS"],
  "İTALYA SERIE A": ["ATALANTA", "BOLOGNA", "CAGLIARI", "COMO", "FIORENTINA", "FROSINONE", "GENOA", "INTER", "JUVENTUS", "LAZIO", "LECCE", "MILAN", "NAPOLI", "PARMA", "ROMA", "SASSUOLO", "TORINO", "UDINESE", "VENEZIA", "MONZA", "HELLAS VERONA", "EMPOLI"],
  "İSPANYA LA LIGA": ["ALAVÉS", "ATLÉTICO MADRID", "ATHLETIC BILBAO", "BARCELONA", "CELTA VIGO", "DEPORTIVO LA CORUÑA", "ELCHE", "ESPANYOL", "GETAFE", "LEVANTE", "OSASUNA", "RACING SANTANDER", "RAYO VALLECANO", "REAL BETIS", "REAL MADRID", "REAL SOCIEDAD", "SEVILLA", "VALENCIA", "VILLARREAL", "MALAGA", "GIRONA", "MALLORCA", "LAS PALMAS", "LEGANES"],
  "HOLLANDA EREDIVISIE": ["AJAX", "PSV", "FEYENOORD", "AZ ALKMAAR", "TWENTE", "NEC NIJMEGEN"],
  "PORTEKİZ PRIMEIRA LIGA": ["BENFICA", "PORTO", "SPORTING CP", "BRAGA"],
  "BELÇİKA PRO LEAGUE": ["CLUB BRUGGE", "ANDERLECHT", "USG", "GENK", "GENT", "ROYAL ANTWERP"],
  "MİLLİ TAKIMLAR": ["ALMANYA", "ARJANTİN", "BELÇİKA", "BREZİLYA", "FRANSA", "HOLLANDA", "İNGİLTERE", "İSPANYA", "İTALYA", "PORTEKİZ", "TÜRKİYE", "URUGUAY", "HIRVATİSTAN"],
  "ÇEŞİTLİ AVRUPA TAKIMLARI": ["KARABAĞ FK", "DINAMO KIEV", "SLOVAN BRATISLAVA", "KIZILYILDIZ", "FCSB", "RAPID WIEN", "PANATHINAIKOS", "HAJDUK SPLIT", "SPARTA PRAG", "OLIMPIYAKOS", "AEK ATHENS", "LASK", "SAO PAULO", "LEVSKI SOFIA", "CSKA SOFIA", "VİKİNG", "ST. MİRREN", "SHAKHTAR DONETSK", "SABAH FK", "BODO", "SLAVIA PRAGUE"]
};

export const defaultCategoriesList = [
  "TÜRKİYE 2.LİG", "TÜRKİYE 3.LİG", "TÜRKİYE KUPASI", "TÜRKİYE SÜPER KUPA", "TÜRKİYE KADINLAR SÜPER LİG", "AMATÖR LİG",
  "UEFA ŞAMPİYONLAR LİGİ GURUP AŞAMASI", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA Ş.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA Ş.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA Ş.L. PLAY OFF İLK MAÇ", "UEFA Ş.L. PLAY OFF RÖVANŞ",
  "UEFA AVRUPA LİGİ GURUP AŞAMASI", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA AVRUPA LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA A.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA A.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA A.L. PLAY OFF İLK MAÇ", "UEFA A.L. PLAY OFF RÖVANŞ",
  "UEFA KONFERANS LİGİ GURUP AŞAMASI", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR İLK MAÇ", "UEFA KONFERANS LİGİ ÖN ELEME 2.TUR RÖVANŞ",
  "UEFA K.L. ÖN ELEME 3.TUR İLK MAÇ", "UEFA K.L. ÖN ELEME 3.TUR RÖVANŞ", "UEFA K.L. PLAY OFF İLK MAÇ", "UEFA K.L. PLAY OFF RÖVANŞ",
  "UEFA AVRUPA ULUSLAR LİGİ", "UEFA KADINLAR ŞAMPİYONLAR LİGİ",
  "İNGİLTERE SÜPER KUPA", "UEFA SÜPER KUPA",
  "COPA DEL REY", "COPPA ITALIA", "COUPE DE FRANCE", "DFB POKAL", "EREDIVISIE", "FA CUP", "SCOTTISH PREMIER LEAGUE", "PORTEKİZ LİGİ",
  "FIFA DÜNYA KUPASI"
];

// 🔴 3. YEREL LOGO BANKASI (TÜM LİNKLER BURADA)
export const localTeamLogos: Record<string, string> = {
  // TÜRKİYE
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "GALATASARAY": "https://de.wikipedia.org/wiki/Special:FilePath/Galatasaray_S.K._Logo_2026_5-stars.svg",
  "FENERBAHÇE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Fenerbah%C3%A7e_SK_-_120_Yil_(1907-2027).svg",
  "TRABZONSPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Trabzonspor_2022.svg",
  "KASIMPAŞA": "https://de.wikipedia.org/wiki/Special:FilePath/Kasimpasa_Logo.svg",
  "KONYASPOR": "https://fr.wikipedia.org/wiki/Special:FilePath/Konyaspor_(logo).svg",
  "ÇAYKUR RİZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Caykur_Rizespor_(logo).svg",
  "FATİH KARAGÜMRÜK": "https://fr.wikipedia.org/wiki/Special:FilePath/Fatih_Karag%C3%BCmr%C3%BCk_SK_(logo).svg",
  "ÜMRANİYESPOR": "https://el.wikipedia.org/wiki/Special:FilePath/%C3%9Cmraniyespor_(logo).svg",
  "GAZİANTEP FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gaziantep_FK.svg",
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
  "KOCAELİSPOR": "https://de.wikipedia.org/wiki/Special:FilePath/Kocaelispor.svg",
  "EYÜPSPOR": "https://tr.wikipedia.org/wiki/Special:FilePath/Ey%C3%BCpspor_Logosu.png",

  // AVRUPA GENEL
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "SPARTA PRAG": "https://tr.wikipedia.org/wiki/Special:FilePath/AC-Sparta-LOGO2021.svg",
  "OLIMPIYAKOS": "https://tr.wikipedia.org/wiki/Special:FilePath/Olympiacos_F.C_Emblem.svg",
  "HRADEC KRALOVE": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Hradec_Kralove.png",
  "STURM GRAZ": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Sturm_Graz_logo.svg",
  "DINAMO KIEV": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Dynamo_Kyiv_logo.svg",
  "IBERIA 1999": "https://de.wikipedia.org/wiki/Special:FilePath/Iberia_1999_Tiflis.svg",
  "SLOVAN BRATISLAVA": "https://commons.wikimedia.org/wiki/Special:FilePath/SK_Slovan_Bratislava_logo.svg",
  "KUPS": "https://en.wikipedia.org/wiki/Special:FilePath/KuPS_logo.svg",
  "SABAH FK": "https://en.wikipedia.org/wiki/Special:FilePath/Sabah_FC_(Azerbaijan).png",
  "SABAH": "https://images.fotmob.com/image_resources/logo/teamlogo/951893.png",
  "SABAHFK": "https://images.fotmob.com/image_resources/logo/teamlogo/951893.png",
  "GORNİK ZABRZE": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Gornik_Zabrze.svg",
  "THUN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_Thun_Logo_2011.svg",
  "DINAMO ZAGREB": "https://tr.wikipedia.org/wiki/Special:FilePath/Logo_GNK_Dinamo_Zagreb_(2019).svg",
  "LARNE FC": "https://fr.wikipedia.org/wiki/Special:FilePath/Larne_FC_(logo).svg",
  "KIZILYILDIZ": "https://en.wikipedia.org/wiki/Special:FilePath/Red_Star_Belgrade_crest.svg",
  "LEVADIA FC": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Levadia_Tallinnin.png",
  "LEVSKI SOFYA": "https://en.wikipedia.org/wiki/Special:FilePath/Levski_Sofia_crest_(2026).svg",
  "LEVSKİ SOFİA": "https://images.fotmob.com/image_resources/logo/teamlogo/8632_large.png",
  "LEVSKI SOFIA": "https://images.fotmob.com/image_resources/logo/teamlogo/8632_large.png",
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
  "CSKA SOFİA": "https://images.fotmob.com/image_resources/logo/teamlogo/10144_large.png",
  "CSKA SOFIA": "https://images.fotmob.com/image_resources/logo/teamlogo/10144_large.png",
  "ST GALLEN": "https://tr.wikipedia.org/wiki/Special:FilePath/FC_St._Gallen_logo.svg",
  "SPARTAK TRNAVA": "https://tr.wikipedia.org/wiki/Special:FilePath/Spartak_Trnava_current_logo.png",
  "CSKA 1948": "https://tr.wikipedia.org/wiki/Special:FilePath/CSKA_1948_logo.png",
  "INTER TURKU": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Inter_Turku_logo.svg",
  "UNIVERSITATEA CLUJ": "https://ro.wikipedia.org/wiki/Special:FilePath/U_Cluj.svg",
  "DINAMO MINSK": "https://tr.wikipedia.org/wiki/Special:FilePath/Dinamo-Minsk.png",
  "AEK ATHENS": "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png",
  "LASK": "https://images.fotmob.com/image_resources/logo/teamlogo/9977_large.png",
  "VİKİNG": "https://images.fotmob.com/image_resources/logo/teamlogo/8478_large.png",
  "VIKING": "https://images.fotmob.com/image_resources/logo/teamlogo/8478_large.png",
  "SHAKHTAR DONETSK": "https://images.fotmob.com/image_resources/logo/teamlogo/9728_large.png",
  "SLAVIA PRAGUE": "https://images.fotmob.com/image_resources/logo/teamlogo/7787_large.png",
  "JAGIELLONIA BIAŁYSTOK": "https://images.fotmob.com/image_resources/logo/teamlogo/1957.png",
    "SLAVIA PRAG": "https://images.fotmob.com/image_resources/logo/teamlogo/7787_large.png",

  // İNGİLTERE
  "ARSENAL": "https://en.wikipedia.org/wiki/Special:FilePath/Arsenal_FC.svg",
  "BOURNEMOUTH": "https://en.wikipedia.org/wiki/Special:FilePath/AFC_Bournemouth_(2013).svg",
  "BRENTFORD": "https://en.wikipedia.org/wiki/Special:FilePath/Brentford_FC_crest.svg",
  "BRIGHTON": "https://images.fotmob.com/image_resources/logo/teamlogo/10204.png",
  "CHELSEA": "https://en.wikipedia.org/wiki/Special:FilePath/Chelsea_FC.svg",
  "COVENTRY CITY": "https://images.fotmob.com/image_resources/logo/teamlogo/8669.png",
  "CRYSTAL PALACE": "https://images.fotmob.com/image_resources/logo/teamlogo/9826.png",
  "EVERTON": "https://en.wikipedia.org/wiki/Special:FilePath/Everton_FC_logo.svg",
  "FULHAM": "https://en.wikipedia.org/wiki/Special:FilePath/Fulham_FC_(shield).svg",
  "HULL CITY": "https://images.fotmob.com/image_resources/logo/teamlogo/8667.png",
  "IPSWICH TOWN": "https://en.wikipedia.org/wiki/Special:FilePath/Ipswich_Town.svg",
  "LEEDS UNITED": "https://en.wikipedia.org/wiki/Special:FilePath/Leeds_United_F.C._logo.svg",
  "LIVERPOOL": "https://images.fotmob.com/image_resources/logo/teamlogo/8650_large.png",
  "MANCHESTER CITY": "https://sco.wikipedia.org/wiki/Special:FilePath/Manchester_City_FC_badge.svg",
  "MANCHESTER UNITED": "https://en.wikipedia.org/wiki/Special:FilePath/Manchester_United_FC_crest.svg",
  "NEWCASTLE UNITED": "https://en.wikipedia.org/wiki/Special:FilePath/Newcastle_United_Logo.svg",
  "NOTTINGHAM FOREST": "https://images.fotmob.com/image_resources/logo/teamlogo/10203.png",
  "SUNDERLAND": "https://images.fotmob.com/image_resources/logo/teamlogo/8472.png",
  "TOTTENHAM HOTSPUR": "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png",
  "ASTON VILLA": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Aston_Villa_FC_2024.svg",
  "MIDDLESBROUGH": "https://images.fotmob.com/image_resources/logo/teamlogo/8549_large.png",

  // İTALYA
  "INTER": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
  "İNTER": "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png",
  "MILAN": "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png",
  "AC MILAN": "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png",
  "JUVENTUS": "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png",
  "NAPOLI": "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png",
  "ROMA": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
  "AS ROMA": "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png",
  "LAZIO": "https://images.fotmob.com/image_resources/logo/teamlogo/8543.png",
  "ATALANTA": "https://images.fotmob.com/image_resources/logo/teamlogo/8524.png",
  "FIORENTINA": "https://images.fotmob.com/image_resources/logo/teamlogo/8535.png",
  "BOLOGNA": "https://images.fotmob.com/image_resources/logo/teamlogo/9857.png",
  "TORINO": "https://images.fotmob.com/image_resources/logo/teamlogo/9804.png",
  "GENOA": "https://images.fotmob.com/image_resources/logo/teamlogo/10233.png",
  "LECCE": "https://images.fotmob.com/image_resources/logo/teamlogo/9888.png",
  "UDINESE": "https://images.fotmob.com/image_resources/logo/teamlogo/8600.png",
  "MONZA": "https://images.fotmob.com/image_resources/logo/teamlogo/6504.png",
  "CAGLIARI": "https://images.fotmob.com/image_resources/logo/teamlogo/8529.png",
  "EMPOLI": "https://images.fotmob.com/image_resources/logo/teamlogo/8534.png",
  "PARMA": "https://images.fotmob.com/image_resources/logo/teamlogo/10167.png",
  "COMO": "https://images.fotmob.com/image_resources/logo/teamlogo/8530.png",
  "VENEZIA": "https://images.fotmob.com/image_resources/logo/teamlogo/7881.png",
  "SASSUOLO": "https://images.fotmob.com/image_resources/logo/teamlogo/7943.png",
  "FROSINONE": "https://images.fotmob.com/image_resources/logo/teamlogo/9891_large.png",
  "CREMONESE": "https://images.fotmob.com/image_resources/logo/teamlogo/7801_large.png",
  "HELLAS VERONA": "https://images.fotmob.com/image_resources/logo/teamlogo/9876_large.png",

  // ALMANYA
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
  "BORUSSIA MÖNCHENGLADBACH": "https://images.fotmob.com/image_resources/logo/teamlogo/9788_large.png",
  "WERDER BREMEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8697_large.png",
  "WOLFSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9721.png",
  "MAINZ 05": "https://images.fotmob.com/image_resources/logo/teamlogo/9905_large.png",
  "MAINZ": "https://images.fotmob.com/image_resources/logo/teamlogo/9781.png",
  "HOFFENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/10223.png",
  "AUGSBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/8406.png",
  "UNION BERLIN": "https://images.fotmob.com/image_resources/logo/teamlogo/9795.png",
  "BOCHUM": "https://images.fotmob.com/image_resources/logo/teamlogo/9911.png",
  "ST. PAULI": "https://images.fotmob.com/image_resources/logo/teamlogo/10202.png",
  "HEIDENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/8295.png",
  "FC HEIDENHEIM": "https://images.fotmob.com/image_resources/logo/teamlogo/156973.png",
  "HOLSTEIN KIEL": "https://images.fotmob.com/image_resources/logo/teamlogo/8276.png",
  "SCHALKE 04": "https://images.fotmob.com/image_resources/logo/teamlogo/10189.png",
  "HAMBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/9790.png",
  "ELVERSBERG": "https://images.fotmob.com/image_resources/logo/teamlogo/8251.png",
  "VFL OSNABRÜCK": "https://images.fotmob.com/image_resources/logo/teamlogo/9775_large.png",
  "HEBC HAMBURG": "https://images.fotmob.com/image_resources/logo/teamlogo/946303_large.png",

  // FRANSA
  "PARIS SAINT-GERMAIN": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "PARIS SG": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "PSG": "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png",
  "MARSEILLE": "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png",
  "MARSİLYA": "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png",
  "MONACO": "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png",
  "LILLE": "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png",
  "LYON": "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png",
  "OLYMPIQUE LYON": "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png",
  "OLİMPİC LYON": "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png",
  "LENS": "https://images.fotmob.com/image_resources/logo/teamlogo/8588.png",
  "RENNES": "https://images.fotmob.com/image_resources/logo/teamlogo/9851.png",
  "NICE": "https://images.fotmob.com/image_resources/logo/teamlogo/9831.png",
  "LE HAVRE": "https://en.wikipedia.org/wiki/Special:FilePath/Le_Havre_AC_logo.svg",
  "AUXERRE": "https://images.fotmob.com/image_resources/logo/teamlogo/8583_large.png",
  "ANGERS": "https://images.fotmob.com/image_resources/logo/teamlogo/8121.png",
  "NANTES": "https://images.fotmob.com/image_resources/logo/teamlogo/9830.png",
  "REIMS": "https://images.fotmob.com/image_resources/logo/teamlogo/9837.png",

  // İSPANYA
  "REAL MADRID": "https://en.wikipedia.org/wiki/Special:FilePath/Real_Madrid_CF.svg",
  "BARCELONA": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Barcelona_(crest).svg",
  "FC BARCELONA": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Barcelona_(crest).svg",
  "ATLÉTICO MADRID": "https://images.fotmob.com/image_resources/logo/teamlogo/9906_large.png",
  "ATLETICO MADRID": "https://en.wikipedia.org/wiki/Special:FilePath/Atletico_Madrid_2017_logo.svg",
  "ATHLETIC BILBAO": "https://images.fotmob.com/image_resources/logo/teamlogo/8315_large.png",
  "BILBAO": "https://en.wikipedia.org/wiki/Special:FilePath/Athletic_Club_Bilbao_logo.svg",
  "REAL SOCIEDAD": "https://en.wikipedia.org/wiki/Special:FilePath/Real_Sociedad_logo.svg",
  "REAL BETIS": "https://images.fotmob.com/image_resources/logo/teamlogo/8603_large.png",
  "BETIS": "https://en.wikipedia.org/wiki/Special:FilePath/Real_betis_logo.svg",
  "SEVILLA": "https://en.wikipedia.org/wiki/Special:FilePath/Sevilla_FC_logo.svg",
  "VILLARREAL": "https://images.fotmob.com/image_resources/logo/teamlogo/10205_large.png",
  "VALENCIA": "https://images.fotmob.com/image_resources/logo/teamlogo/10267.png",
  "GIRONA": "https://en.wikipedia.org/wiki/Special:FilePath/Girona_FC_logo_(2022).svg",
  "CELTA VIGO": "https://en.wikipedia.org/wiki/Special:FilePath/RC_Celta_de_Vigo_logo.svg",
  "OSASUNA": "https://images.fotmob.com/image_resources/logo/teamlogo/8371.png",
  "RAYO VALLECANO": "https://en.wikipedia.org/wiki/Special:FilePath/Rayo_Vallecano_logo.svg",
  "GETAFE": "https://images.fotmob.com/image_resources/logo/teamlogo/8305_large.png",
  "MALLORCA": "https://en.wikipedia.org/wiki/Special:FilePath/RCD_Mallorca_logo.svg",
  "RCD MALLORCA": "https://en.wikipedia.org/wiki/Special:FilePath/RCD_Mallorca_logo.svg",
  "ALAVÉS": "https://images.fotmob.com/image_resources/logo/teamlogo/9866_large.png",
  "ALAVES": "https://en.wikipedia.org/wiki/Special:FilePath/Deportivo_Alaves_logo.svg",
  "DEPORTIVO ALAVES": "https://en.wikipedia.org/wiki/Special:FilePath/Deportivo_Alaves_logo.svg",
  "ESPANYOL": "https://de.wikipedia.org/wiki/Special:FilePath/RCD_Espanyol_De_Barcelona.svg",
  "RCD ESPANYOL": "https://de.wikipedia.org/wiki/Special:FilePath/RCD_Espanyol_De_Barcelona.svg",
  "LAS PALMAS": "https://en.wikipedia.org/wiki/Special:FilePath/UD_Las_Palmas_logo.svg",
  "LEGANES": "https://en.wikipedia.org/wiki/Special:FilePath/CD_Legan%C3%A9s_logo.svg",
  "LEGANÉS": "https://en.wikipedia.org/wiki/Special:FilePath/CD_Legan%C3%A9s_logo.svg",
  "REAL VALLADOLID": "https://en.wikipedia.org/wiki/Special:FilePath/Real_Valladolid_CF_logo.svg",
  "VALLADOLID": "https://en.wikipedia.org/wiki/Special:FilePath/Real_Valladolid_CF_logo.svg",
  "ELCHE": "https://en.wikipedia.org/wiki/Special:FilePath/Elche_CF_logo.svg",
  "LEVANTE": "https://images.fotmob.com/image_resources/logo/teamlogo/8581_large.png",
  "MALAGA": "https://en.wikipedia.org/wiki/Special:FilePath/M%C3%A1laga_CF.svg",
  "MÁLAGA": "https://en.wikipedia.org/wiki/Special:FilePath/M%C3%A1laga_CF.svg",
  "DEPORTIVO LA CORUÑA": "https://images.fotmob.com/image_resources/logo/teamlogo/9783_large.png",
  "DEPORTIVO LA CORUNA": "https://en.wikipedia.org/wiki/Special:FilePath/RC_Deportivo_La_Coru%C3%B1a_logo.svg",
  "RACING SANTANDER": "https://images.fotmob.com/image_resources/logo/teamlogo/8696_large.png",

  // HOLLANDA
  "PSV": "https://images.fotmob.com/image_resources/logo/teamlogo/8640_large.png",
  "PSV EINDHOVEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8640_large.png",
  "FEYENOORD": "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png",
  "AJAX": "https://images.fotmob.com/image_resources/logo/teamlogo/8593.png",
  "AZ ALKMAAR": "https://images.fotmob.com/image_resources/logo/teamlogo/10229.png",
  "TWENTE": "https://images.fotmob.com/image_resources/logo/teamlogo/8611.png",
  "NEC NIJMEGEN": "https://en.wikipedia.org/wiki/Special:FilePath/NEC_Nijmegen_logo.svg",

  // BELÇİKA
  "CLUB BRUGGE": "https://images.fotmob.com/image_resources/logo/teamlogo/8392.png",
  "ANDERLECHT": "https://images.fotmob.com/image_resources/logo/teamlogo/8635.png",
  "GENK": "https://images.fotmob.com/image_resources/logo/teamlogo/9987.png",
  "UNION SG": "https://images.fotmob.com/image_resources/logo/teamlogo/6806.png",
  "USG": "https://en.wikipedia.org/wiki/Special:FilePath/Royale_Union_Saint-Gilloise_logo.svg",
  "GENT": "https://images.fotmob.com/image_resources/logo/teamlogo/9996.png",
  "ANTWERP": "https://images.fotmob.com/image_resources/logo/teamlogo/10141.png",
  "ROYAL ANTWERP": "https://images.fotmob.com/image_resources/logo/teamlogo/9982.png",
  "OH LEUVEN": "https://images.fotmob.com/image_resources/logo/teamlogo/1773_large.png",
  "KORTRIJK": "https://images.fotmob.com/image_resources/logo/teamlogo/8571_large.png",

  // PORTEKİZ
  "SPORTING CP": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "SPORTİNG LİZBON": "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png",
  "PORTO": "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png",
  "BENFİCA": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
  "BENFICA": "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png",
  "BRAGA": "https://images.fotmob.com/image_resources/logo/teamlogo/10208.png",

  // İSKOÇYA
  "CELTIC": "https://images.fotmob.com/image_resources/logo/teamlogo/9827.png",
  "RANGERS": "https://images.fotmob.com/image_resources/logo/teamlogo/8548.png",
  "HEART": "https://it.wikipedia.org/wiki/Special:FilePath/Hearts_FC.svg",
  "HEARTS": "https://images.fotmob.com/image_resources/logo/teamlogo/8274.png",
  "ABERDEEN": "https://images.fotmob.com/image_resources/logo/teamlogo/8485.png",
  "ST. MİRREN": "https://images.fotmob.com/image_resources/logo/teamlogo/9800_large.png",
  "ST. MIRREN": "https://images.fotmob.com/image_resources/logo/teamlogo/9800_large.png",

  // GÜNEY AMERİKA
  "SANTOS FC": "https://images.fotmob.com/image_resources/logo/teamlogo/8514_large.png",
  "PALMERIAS": "https://images.fotmob.com/image_resources/logo/teamlogo/10283_large.png",
  "VELEZ SARSFIELD": "https://images.fotmob.com/image_resources/logo/teamlogo/10079_large.png",
  "BOCA JUNIORS": "https://images.fotmob.com/image_resources/logo/teamlogo/10077_large.png",
  "SAO PAULO": "https://images.fotmob.com/image_resources/logo/teamlogo/10277_large.png",
  "SÃO PAULO": "https://images.fotmob.com/image_resources/logo/teamlogo/10277_large.png",
  
  // YEREL KLASÖRLER (FALLBACK)
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", 
   
   "PAOK": "/logos/paok.png",  
 
  "OLYMPIC LYON": "/logos/lyon.png",  "OLYMPIQUE LYONNAIS": "/logos/lyon.png", 
};

// 🔴 4. YARDIMCI FONKSİYONLAR 🔴
export const normalizeTurkish = (text: string) => {
  if (!text) return '';
  return text.replace(/İ/g, 'i').replace(/I/g, 'ı').replace(/Ş/g, 'ş').replace(/Ğ/g, 'ğ').replace(/Ü/g, 'ü').replace(/Ö/g, 'ö').replace(/Ç/g, 'ç').toLowerCase().trim();
};

export const getLocalLogoUrl = (teamName: string) => {
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

export const isTffMatchCheck = (category: string) => {
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

export const cleanTeamName = (name: string) => {
  if(!name) return "";
  return name.trim().toUpperCase();
};

export const getMatchTimeMs = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return Infinity;
  try {
      const [d, m, y] = dateStr.split('.');
      const [hr, min] = timeStr.split(':');
      const isoString = `${y}-${m}-${d}T${hr}:${min}:00+03:00`;
      return new Date(isoString).getTime();
  } catch(e) {
      return Infinity;
  }
};

export const getTodayDateString = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const parseDateLocal = (ds: string) => {
  if (!ds) return new Date(0);
  const parts = ds.split('.');
  if(parts.length !== 3) return new Date(0);
  return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
};

export const generateTimeOptions = () => {
  const times = ["00:00"];
  for (let h = 23; h >= 12; h--) {
      for (let m = 45; m >= 0; m -= 15) {
          times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      }
  }
  return times;
};

export const generateWeekDates = (weekNum: number) => {
  if (weekNum < 8) {
    const baseDate = new Date(2026, 7, 18); 
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
  } else {
    const baseDate = new Date(2026, 8, 4); 
    const dates = [];
    for (let i = 0; i < 150; i++) { 
        const d = new Date(baseDate);
        d.setDate(d.getDate() + i);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        dates.push(`${day}.${month}.${year}`);
    }
    return dates;
  }
};

export const getUniqueMatchId = (week: number, index: number) => {
  return (week * 100) + index;
};

// 🔴 5. DEV TEMA MOTORU 🔴
export const getEliteTheme = (category: string, homeTeam: string, awayTeam: string) => {
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
  else if (upCat.includes("İNGİLTERE") || upCat.includes("PREMIER")) {
      theme = { ...theme, bgImg: "url('/pl-bg.png')", containerBorder: "border-fuchsia-500/50", containerShadow: "shadow-[0_0_40px_rgba(192,38,211,0.4)]", containerBg: "bg-[#0b0410]", badgeBg: "bg-fuchsia-950/80 backdrop-blur-sm", badgeText: "text-fuchsia-300", badgeBorder: "border-fuchsia-400/80 shadow-[0_0_10px_currentColor]", catText: "text-fuchsia-200 drop-shadow-[0_0_8px_rgba(232,121,249,0.8)]", scoreBorder: "border-fuchsia-500/30", colonText: "text-fuchsia-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#0b0410]/90 border-fuchsia-900/30" };
  }
  else if (upCat.includes("İTALYA") || upCat.includes("SERIE A")) {
      theme = { ...theme, bgImg: "url('/seriea-bg.png')", containerBorder: "border-blue-500/50", containerShadow: "shadow-[0_0_40px_rgba(59,130,246,0.4)]", containerBg: "bg-[#040b16]", badgeBg: "bg-blue-900/80 backdrop-blur-sm", badgeText: "text-blue-300", badgeBorder: "border-blue-400/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-200 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]", scoreBorder: "border-blue-500/30", colonText: "text-yellow-400/50", tagText: "text-yellow-400", tagBg: "bg-yellow-950/90", tagBorder: "border-yellow-500/80", bottomBar: "bg-[#040b16]/90 border-blue-900/30" };
  }
  else if (upCat.includes("İSPANYA") || upCat.includes("LA LIGA")) {
      theme = { ...theme, bgImg: "url('/laliga-bg.png')", containerBorder: "border-rose-500/50", containerShadow: "shadow-[0_0_40px_rgba(225,29,72,0.4)]", containerBg: "bg-[#0f0407]", badgeBg: "bg-rose-950/80 backdrop-blur-sm", badgeText: "text-rose-300", badgeBorder: "border-rose-400/80 shadow-[0_0_10px_currentColor]", catText: "text-rose-200 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]", scoreBorder: "border-rose-500/30", colonText: "text-rose-400/50", tagText: "text-rose-300", tagBg: "bg-rose-950/90", tagBorder: "border-rose-400/80", bottomBar: "bg-[#0f0407]/90 border-rose-900/30" };
  }
  else if (upCat.includes("FRANSA") || upCat.includes("LIGUE 1")) {
       theme = { ...theme, bgImg: "url('/ligue1-bg.png')", containerBorder: "border-lime-500/50", containerShadow: "shadow-[0_0_40px_rgba(132,204,22,0.4)]", containerBg: "bg-[#040a05]", badgeBg: "bg-lime-950/80 backdrop-blur-sm", badgeText: "text-lime-300", badgeBorder: "border-lime-400/80 shadow-[0_0_10px_currentColor]", catText: "text-lime-200 drop-shadow-[0_0_8px_rgba(163,230,53,0.8)]", scoreBorder: "border-lime-500/30", colonText: "text-lime-400/50", tagText: "text-lime-300", tagBg: "bg-lime-950/90", tagBorder: "border-lime-400/80", bottomBar: "bg-[#040a05]/90 border-lime-900/30" };
  }
  else if (upCat.includes("ALMANYA") || upCat.includes("BUNDESLIGA")) {
      theme = { ...theme, bgImg: "url('/bundesliga-bg.png')", containerBorder: "border-red-600/50", containerShadow: "shadow-[0_0_40px_rgba(220,38,38,0.4)]", containerBg: "bg-[#0a0202]", badgeBg: "bg-red-950/80 backdrop-blur-sm", badgeText: "text-red-300", badgeBorder: "border-red-400/80 shadow-[0_0_10px_currentColor]", catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]", scoreBorder: "border-slate-500/30", colonText: "text-slate-400/50", tagText: "text-slate-300", tagBg: "bg-slate-800/90", tagBorder: "border-slate-500/80", bottomBar: "bg-[#0a0202]/90 border-red-900/30" };
  }
  else {
      theme = { ...theme, bgImg: null, containerBorder: "border-blue-500/30", containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]", containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]", badgeBg: "bg-transparent backdrop-blur-sm", badgeText: "text-cyan-400", badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]", catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]", scoreBorder: "border-blue-600/40", colonText: "text-blue-400/50", tagText: "text-cyan-300", tagBg: "bg-cyan-950/90", tagBorder: "border-cyan-400/80", bottomBar: "bg-[#050b14]/90 border-blue-900/30" };
  }
  
  return theme;
};