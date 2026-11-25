export const normTrTeam = (s?: string | null): string =>
  String(s || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Süper Lig, 1. Lig, 2. Lig, 3. Lig ve Türkiye Kupası kulüp kökleri ("SPOR" ile bitmeyenler dahil!)
const TURKISH_CLUB_KEYWORDS = [
  'GALATASARAY', 'FENERBAHCE', 'BESIKTAS', 'TRABZONSPOR', 'BASAKSEHIR',
  'GOZTEPE', 'KARSIYAKA', 'ALTAY', 'ALTINORDU', 'BUCASPOR', 'MENEMEN', 'BORNOVA', 'ALIAĞA', 'ALIAGA',
  'ALANYASPOR', 'KONYASPOR', 'ANTALYASPOR', 'KAYSERISPOR', 'SIVASSPOR', 'SAMSUNSPOR', 'RIZESPOR',
  'KASIMPASA', 'EYUPSPOR', 'KARAGUMRUK', 'BODRUM', 'GAZIANTEP', 'HATAYSPOR', 'ADANA DEMIR', 'ADANASPOR',
  'KOCAELISPOR', 'SAKARYASPOR', 'BANDIRMASPOR', 'ERZURUMSPOR', 'GENCLERBIRLIGI', 'ANKARAGUCU', 'KECIORENGUCU',
  'CORUM FK', 'IGDIR FK', 'VANSPOR', 'AMED', 'PENDIKSPOR', 'BOLUSPOR', 'UMRANIYESPOR', 'ISTANBULSPOR',
  'SANLIURFASPOR', 'MALATYASPOR', 'EROKSPOR', 'SARIYER', 'SERIK', 'BURSASPOR', 'ESKISEHIRSPOR',
  'GIRESUNSPOR', 'ORDUSPOR', 'BULANCAKSPOR', '1461 TRABZON', 'SEBAT GENCLIK', 'PAZARSPOR', 'HOPASPOR',
  'BATMAN PETROL', 'ELAZIG', 'MARDIN 1969', 'MAZIDAGI', 'DIYARBEKIR', 'ISKENDERUN', 'KASTAMONUSPOR',
  'DENIZLISPOR', 'BALIKESIRSPOR', 'MANISA', 'AKHISAR', 'TURGUTLUSPOR', 'SOMASPOR', 'KUSADASISPOR',
  'AYVALIKGUCU', 'TIRE 2021', 'EFELER 09', 'FETHIYESPOR', 'MUGLASPOR', 'ISPARTA 32', 'AFYONSPOR',
  'KUTAHYASPOR', 'USAKSPOR', 'DUZCESPOR', 'ZONGULDAK', 'KARABUK', 'INEGOL', 'KARACABEY',
  'KIRKLARELISPOR', 'CORLUSPOR', 'EDIRNESPOR', 'SILIVRISPOR', 'SINOPSPOR', 'BEYOGLU YENI CARSI',
  'BEYKOZ', 'ARNAVUTKOY', 'ANKARA DEMIR', 'ANKARASPOR', 'CANKAYA FK', 'KIRIKKALE', 'KIRSEHIR',
  'AKSARAY', 'KARAMAN FK', 'ADANA 01', 'ERBAASPOR', 'ERZINCANSPOR', 'TOKAT', 'AMASYASPOR',
  'GUMUSHANESPOR', 'BAYBURT', 'AGRI 1970', 'MUSSPOR', 'KAHRAMANMARAS', 'OSMANIYESPOR'
];

export const isTurkishClubTeam = (teamName?: string | null): boolean => {
  const t = normTrTeam(teamName);
  if (!t || t === 'TURKIYE' || t === 'TURKEY') return false;

  // 1) Sonu SPOR, GÜCÜ, BELEDİYESPOR, İDMANYURDU, GENÇLERBİRLİĞİ ile biten tüm Türk kulüpleri
  if (/(SPOR|SPOR FK|SPOR A S|BELEDIYESPOR|BELEDIYESI|GUCU|GENCLERBIRLIGI|IDMANYURDU|IDMAN YURDU)\b/.test(t)) {
    return true;
  }

  // 2) Sonunda "spor" olmayan tescilli Türk kulüpleri (Göztepe, Fenerbahçe, Beşiktaş, Galatasaray, Altay, Amed, Iğdır FK vb.)
  return TURKISH_CLUB_KEYWORDS.some((kw) => t === kw || t.startsWith(`${kw} `) || t.endsWith(` ${kw}`) || t.includes(` ${kw} `));
};

/**
 * EN BÜYÜK KISTAS:
 * İki Türk kulübü birbiriyle maç yapıyorsa (Alanyaspor - Konyaspor vb.),
 * lig adı ne yazarsa yazsın veya veritabanında yanlışlıkla DFO yazsa bile %100 TFF MAÇIDIR!
 */
export const isStrictTffMatch = (
  category?: string | null,
  homeTeam?: string | null,
  awayTeam?: string | null,
  savedPoolType?: string | null
): boolean => {
  const cat = normTrTeam(category);

  const isUefaCup =
    cat.includes('UEFA') ||
    cat.includes('SAMPIYONLAR LIGI') ||
    cat.includes('CHAMPIONS LEAGUE') ||
    cat.includes('AVRUPA LIGI') ||
    cat.includes('EUROPA LEAGUE') ||
    cat.includes('KONFERANS LIGI') ||
    cat.includes('CONFERENCE LEAGUE');

  // 1 NUMARALI ALTIN KURAL: İki Türk kulübü karşılaşıyorsa kesinlikle TFF maçıdır!
  if (!isUefaCup && isTurkishClubTeam(homeTeam) && isTurkishClubTeam(awayTeam)) {
    return true;
  }

  // Yabancı liglerin "Super League / 1. Lig" tuzaklarını ele (İsviçre, Yunanistan, Danimarka, Sırbistan vb.)
  const isForeignLeague =
    isUefaCup ||
    /(INGILTERE|PREMIER|ISPANYA|LA LIGA|ITALYA|SERIE A|ALMANYA|BUNDESLIGA|FRANSA|LIGUE 1|HOLLANDA|EREDIVISIE|PORTEKIZ|BELCIKA|ISKOCYA|DANIMARKA|ISVICRE|YUNANISTAN|SIRBISTAN|ROMANYA|AVUSTURYA|ULUSLAR|NATIONS|MILLI|DUNYA KUPASI|WORLD CUP)/.test(
      cat
    );

  if (isForeignLeague) return false;

  // Kategori adından TFF tespiti ("Süper Lig", "Trendyol Süper Lig", "1. Lig", "Türkiye Kupası" vb.)
  if (
    /(TURKIYE|TFF|TRENDYOL|NESINE|SUPER LIG|1 LIG|2 LIG|3 LIG|ZIRAAT|TURKIYE KUPASI)/.test(cat)
  ) {
    return true;
  }

  return savedPoolType === 'TFF';
};

// TÜM SAYFALAR İÇİN STANDART ARŞİV / CANLI KART RENK TEMASI (TFF = Kıpkırmızı, DFO = Mavi / UEFA Teması)
export const getStandardCardPalette = (
  category?: string | null,
  homeTeam?: string | null,
  awayTeam?: string | null,
  savedPoolType?: string | null
) => {
  const isTff = isStrictTffMatch(category, homeTeam, awayTeam, savedPoolType);
  const cat = normTrTeam(category);

  if (isTff) {
    return {
      isTff: true,
      cardOuterCls:
        'bg-gradient-to-b from-[#4c0714] via-[#2f050d] to-[#170206] border-rose-500/75 shadow-[0_8px_28px_rgba(225,29,72,0.28)]',
      bannerCls:
        'bg-rose-950/90 border-rose-400/65 text-rose-100 shadow-[0_0_18px_rgba(244,63,94,0.32)]',
      poolPillCls: 'bg-rose-950 border-rose-400/70 text-rose-200',
      scoreBoxCls: 'bg-[#1c0308] border-rose-500/60 text-white'
    };
  }

  if (cat.includes('SAMPIYONLAR') || cat.includes('CHAMPIONS')) {
    return {
      isTff: false,
      cardOuterCls:
        'bg-gradient-to-b from-[#0f1a48] via-[#09102e] to-[#040818] border-indigo-400/60 shadow-[0_8px_26px_rgba(99,102,241,0.22)]',
      bannerCls:
        'bg-indigo-950/90 border-indigo-400/55 text-indigo-100 shadow-[0_0_16px_rgba(129,140,248,0.28)]',
      poolPillCls: 'bg-indigo-950/90 border-indigo-400/60 text-indigo-200',
      scoreBoxCls: 'bg-[#040914] border-indigo-500/50 text-white'
    };
  }

  if (cat.includes('AVRUPA LIGI') || cat.includes('EUROPA')) {
    return {
      isTff: false,
      cardOuterCls:
        'bg-gradient-to-b from-[#3b1906] via-[#240f04] to-[#110702] border-orange-500/60 shadow-[0_8px_26px_rgba(249,115,22,0.2)]',
      bannerCls:
        'bg-orange-950/90 border-orange-400/55 text-orange-100 shadow-[0_0_16px_rgba(251,146,60,0.25)]',
      poolPillCls: 'bg-orange-950/90 border-orange-400/60 text-orange-200',
      scoreBoxCls: 'bg-[#040914] border-orange-500/50 text-white'
    };
  }

  if (cat.includes('KONFERANS') || cat.includes('CONFERENCE')) {
    return {
      isTff: false,
      cardOuterCls:
        'bg-gradient-to-b from-[#063322] via-[#042015] to-[#02100b] border-emerald-500/60 shadow-[0_8px_26px_rgba(16,185,129,0.2)]',
      bannerCls:
        'bg-emerald-950/90 border-emerald-400/55 text-emerald-100 shadow-[0_0_16px_rgba(52,211,153,0.25)]',
      poolPillCls: 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200',
      scoreBoxCls: 'bg-[#040914] border-emerald-500/50 text-white'
    };
  }

  // Standart DFO Mavisi (Ülkelere göre saçma renkler yerine net Canlı/Arşiv DFO mavisi)
  return {
    isTff: false,
    cardOuterCls:
      'bg-gradient-to-b from-[#081529] via-[#061020] to-[#040a15] border-sky-500/40 shadow-[0_8px_26px_rgba(2,132,199,0.16)]',
    bannerCls:
      'bg-[#071d36]/90 border-sky-400/45 text-sky-200 shadow-[0_0_16px_rgba(56,189,248,0.22)]',
    poolPillCls: 'bg-sky-950/90 border-sky-500/50 text-sky-300',
    scoreBoxCls: 'bg-[#040914] border-slate-700/80 text-white'
  };
};