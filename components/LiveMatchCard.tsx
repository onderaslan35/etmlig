'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 EKREM - YEREL & BULUT LOGO BANKASI (Tüm Eksikler Tamamlandı!)
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
  "GOTEBORG": "https://en.wikipedia.org/wiki/Special:FilePath/IFK_Goteborg_logo.svg",
  "UNIVERSITATEA CLUJ": "https://ro.wikipedia.org/wiki/Special:FilePath/U_Cluj.svg",
  "INTER TURKU": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Inter_Turku_logo.svg",
  "BODO-GLIMT": "https://en.wikipedia.org/wiki/Special:FilePath/FK_Bodo_Glimt_logo.svg",
  "NEC NIJMEGEN": "https://en.wikipedia.org/wiki/Special:FilePath/NEC_Nijmegen_logo.svg",
  "USG": "https://en.wikipedia.org/wiki/Special:FilePath/Royale_Union_Saint-Gilloise_logo.svg",
  "PAIDE LINNAMEESKOND": "https://en.wikipedia.org/wiki/Special:FilePath/Paide_Linnameeskond_logo.png",
  "DEBRECEN": "https://fr.wikipedia.org/wiki/Special:FilePath/Debreceni_VSC_(logo).svg",
  "SHELBOURNE": "https://tr.wikipedia.org/wiki/Special:FilePath/Shelbourne_logo.png",
  "DINAMO MINSK": "https://tr.wikipedia.org/wiki/Special:FilePath/Dinamo-Minsk.png",

  // YEREL LOGOLAR
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", 
  "VOJVODINA": "/logos/vojvodina.png", "FERENCVAROS": "/logos/ferencvaros.png",
  "HAMMARBY": "/logos/hammarby.png", "OLIMPIC LYON": "/logos/lyon.png", 
  "GENT": "/logos/gent.png", "AJAX": "/logos/ajax.png", 
  "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png", "ANDERLECHT": "/logos/anderlecht.png", 
  "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png", "ARSENAL": "/logos/arsenal.png"
};

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

const week4PredictionsData: Record<string, string[]> = {
  "262731": ["1-1", "3-1", "1-1", "2-0", "3-0", "2-2", "1-3", "1-1", "2-1", "1-2", "1-0", "1-3", "2-1", "1-2", "2-2", "2-1", "2-1", "1-1", "3-1", "1-1", "1-1", "1-1", "1-1", "2-1"],
  "262758": ["1-2", "3-0", "2-0", "3-0", "4-1", "1-1", "1-3", "1-1", "1-1", "0-2", "2-1", "0-3", "3-0", "1-1", "2-1", "2-1", "3-0", "3-0", "3-0", "1-1", "0-3", "1-1", "1-2", "3-0"],
  "262763": ["1-1", "1-1", "1-1", "2-0", "4-0", "1-1", "0-2", "1-0", "1-0", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-0", "3-0", "1-1", "1-1", "1-1", "1-1", "1-0"],
  "262744": ["1-2", "3-1", "1-1", "2-0", "4-0", "2-0", "1-2", "1-1", "1-0", "0-0", "2-2", "0-4", "2-0", "2-0", "1-2", "2-1", "0-1", "0-2", "2-0", "0-1", "0-2", "0-2", "1-1", "0-1"],
  "262813": ["1-2", "4-1", "1-0", "3-2", "2-0", "2-0", "1-3", "1-1", "3-0", "2-2", "1-2", "0-4", "1-1", "2-2", "2-0", "1-0", "2-0", "1-2", "2-0", "1-2", "1-3", "0-0", "0-1", "1-2"],
  "351925": ["0-2", "0-0", "2-1", "1-0", "3-0", "0-0", "0-2", "0-0", "0-0", "0-0", "0-0", "0-3", "2-1", "0-0", "2-0", "2-1", "0-0", "0-2", "2-0", "0-0", "0-2", "0-0", "0-2", "0-0"],
  "262732": ["2-1", "2-1", "1-0", "1-1", "2-0", "3-1", "2-2", "2-1", "2-0", "1-1", "1-1", "0-3", "2-0", "1-1", "2-1", "0-1", "1-1", "1-1", "2-1", "1-2", "0-2", "0-2", "2-1", "1-0"],
  "262754": ["1-1", "1-0", "1-0", "2-0", "3-0", "1-0", "0-2", "1-0", "1-0", "0-2", "1-0", "0-3", "2-0", "1-0", "1-2", "1-0", "1-0", "1-1", "2-0", "1-0", "0-1", "0-1", "1-0", "1-0"],
  "262733": ["2-1", "3-1", "0-0", "3-0", "2-0", "0-1", "1-4", "2-0", "0-0", "1-0", "1-1", "0-3", "2-0", "2-1", "2-1", "2-0", "1-1", "1-0", "3-0", "1-1", "0-1", "1-1", "3-1", "1-0"],
  "262774": ["0-1", "2-0", "1-0", "2-0", "3-1", "1-1", "0-2", "1-1", "1-2", "1-2", "1-1", "0-2", "1-0", "0-0", "2-0", "0-0", "1-2", "2-1", "2-0", "1-1", "0-2", "0-0", "3-1", "0-2"],
  "262771": ["2-2", "3-1", "2-1", "4-0", "5-0", "1-1", "1-3", "1-1", "2-2", "1-1", "2-1", "1-4", "3-1", "3-0", "2-1", "1-0", "1-1", "3-1", "3-1", "1-3", "1-1", "1-1", "1-1", "2-1"],
  "262730": ["0-3", "3-0", "1-0", "3-1", "2-0", "1-1", "0-2", "0-1", "0-0", "0-1", "0-2", "0-3", "2-0", "2-1", "0-2", "2-0", "1-1", "1-2", "3-0", "0-1", "0-2", "0-0", "1-1", "2-1"],
  "262707": ["0-4", "3-0", "2-1", "1-1", "1-0", "0-0", "0-2", "0-0", "2-1", "0-2", "0-0", "0-4", "1-0", "0-0", "0-0", "0-0", "0-0", "0-0", "2-0", "1-0", "0-2", "0-0", "0-0", "0-2"],
  "262816": ["0-1", "3-1", "0-2", "1-0", "2-0", "0-0", "0-3", "1-1", "3-0", "0-2", "0-0", "0-2", "3-0", "0-2", "2-0", "1-1", "2-1", "1-3", "3-0", "0-0", "0-2", "0-3", "2-0", "0-1"],
  "262719": ["2-1", "2-1", "2-0", "2-1", "3-0", "2-1", "0-2", "3-1", "2-1", "1-1", "1-2", "0-2", "3-0", "2-1", "2-1", "1-1", "1-2", "2-1", "3-0", "2-1", "1-1", "2-1", "1-2", "2-0"],
  "262725": ["0-2", "2-0", "1-1", "3-0", "3-0", "1-0", "0-2", "1-1", "2-0", "2-1", "2-1", "0-2", "2-0", "0-0", "1-1", "1-0", "2-0", "1-0", "2-0", "0-1", "0-2", "1-0", "1-0", "0-1"],
  "262711": ["0-1", "3-1", "1-0", "3-0", "3-0", "2-1", "0-4", "0-0", "1-1", "1-3", "1-1", "1-2", "2-2", "1-0", "1-1", "2-1", "0-0", "2-1", "3-0", "0-0", "1-1", "1-2", "2-2", "2-0"],
  "262718": ["1-2", "4-1", "3-1", "3-0", "4-1", "1-1", "1-3", "2-2", "2-1", "1-1", "1-2", "1-3", "2-0", "2-1", "2-2", "2-1", "2-2", "1-1", "3-1", "2-2", "1-2", "1-3", "2-2", "1-2"],
  "262721": ["0-1", "2-0", "1-0", "3-1", "2-1", "0-2", "0-3", "2-1", "2-0", "1-2", "1-1", "0-3", "3-1", "1-1", "0-1", "0-2", "0-1", "0-2", "2-0", "0-2", "0-3", "0-1", "2-2", "0-1"],
  "262726": ["1-3", "2-2", "2-2", "3-0", "4-0", "1-1", "1-2", "2-1", "1-1", "1-1", "1-2", "0-3", "1-1", "2-1", "0-2", "0-2", "2-0", "1-1", "2-0", "3-1", "2-2", "0-2", "1-0", "2-1"],
  "262702": ["0-2", "1-0", "1-1", "3-1", "2-0", "1-0", "0-2", "0-1", "0-0", "0-1", "1-0", "0-3", "2-0", "1-0", "0-1", "1-0", "1-0", "2-0", "3-0", "1-1", "0-0", "0-1", "0-0", "2-0"],
  "262738": ["1-1", "2-1", "1-1", "1-0", "3-0", "2-1", "1-3", "2-1", "2-1", "1-1", "2-1", "1-3", "2-0", "1-1", "2-2", "2-1", "2-1", "1-1", "2-0", "2-1", "1-1", "1-1", "2-1", "1-1"],
  "262750": ["1-1", "3-1", "2-2", "3-1", "3-0", "1-1", "1-3", "2-1", "0-0", "1-2", "2-2", "0-3", "3-1", "2-0", "2-2", "0-0", "1-1", "0-2", "3-1", "0-2", "0-3", "1-2", "1-3", "2-0"],
  "262705": ["1-3", "3-1", "2-1", "3-1", "3-1", "3-0", "1-3", "1-2", "3-1", "1-2", "1-2", "0-3", "2-0", "3-0", "2-1", "2-1", "2-0", "2-0", "4-0", "3-1", "0-1", "0-2", "1-2", "1-1"],
  "262706": ["0-2", "4-1", "1-0", "3-0", "2-0", "0-2", "0-2", "0-0", "0-0", "0-1", "0-0", "0-2", "0-2", "0-0", "0-1", "0-0", "0-0", "0-1", "2-0", "2-1", "0-2", "0-2", "0-0", "2-0"],
  "262716": ["1-1", "3-2", "1-0", "3-1", "3-0", "3-1", "0-3", "0-0", "3-1", "0-2", "1-1", "0-4", "2-0", "3-1", "1-1", "3-0", "2-1", "1-1", "4-0", "2-1", "0-2", "0-2", "1-1", "1-2"],
  "262736": ["1-2", "2-1", "1-2", "3-0", "4-0", "2-1", "2-4", "3-1", "2-2", "2-2", "3-2", "1-1", "3-1", "3-0", "1-1", "4-1", "2-1", "2-1", "1-0", "2-1", "1-1", "1-1", "1-1", "3-0"],
  "262714": ["1-3", "2-0", "0-2", "0-0", "2-0", "0-1", "1-1", "0-0", "2-0", "0-1", "2-0", "0-3", "1-1", "0-1", "1-1", "0-0", "0-0", "1-0", "1-0", "0-0", "1-0", "1-1", "0-1", "0-1"],
  "262749": ["2-1", "3-1", "2-0", "3-0", "3-1", "2-2", "1-2", "2-1", "2-0", "2-0", "2-2", "1-3", "2-1", "2-1", "2-1", "1-1", "2-1", "1-1", "2-1", "2-1", "0-2", "1-2", "2-2", "1-1"],
  "262753": ["1-1", "2-1", "2-0", "3-0", "1-1", "1-0", "3-2", "1-1", "1-0", "2-2", "2-2", "0-3", "2-0", "1-2", "1-1", "1-1", "1-1", "0-1", "2-0", "1-1", "1-2", "1-1", "0-2", "1-1"],
  "262740": ["1-2", "1-1", "2-1", "2-0", "3-0", "1-2", "1-3", "1-1", "2-2", "1-1", "2-1", "1-3", "3-0", "1-1", "2-2", "2-1", "1-1", "1-2", "3-1", "2-1", "1-2", "2-1", "2-2", "1-1"],
  "262790": ["0-2", "3-1", "0-2", "0-2", "4-0", "0-2", "0-3", "3-1", "1-1", "2-0", "1-1", "0-3", "3-1", "2-1", "0-3", "2-1", "1-1", "2-0", "2-1", "1-0", "2-1", "1-1", "0-2", "0-2"],
  "262786": ["1-2", "3-1", "3-1", "3-0", "2-1", "1-1", "1-2", "1-1", "1-2", "2-0", "2-1", "1-1", "3-1", "2-0", "1-1", "1-2", "1-1", "1-1", "3-1", "2-1", "2-0", "1-2", "1-2", "1-1"],
  "262734": ["3-0", "4-1", "2-1", "3-1", "4-1", "2-1", "1-2", "3-2", "2-1", "3-2", "3-1", "2-1", "3-0", "2-3", "1-2", "3-1", "2-1", "3-2", "4-1", "3-1", "2-1", "3-1", "2-1", "3-1"],
  "262756": ["2-2", "3-2", "2-0", "4-2", "1-2", "1-2", "1-3", "1-2", "0-0", "0-0", "2-1", "1-3", "2-2", "1-2", "1-2", "1-2", "0-0", "0-0", "2-0", "0-0", "2-2", "0-1", "1-1", "1-3"],
  "262703": ["2-2", "1-1", "1-1", "2-1", "1-0", "1-1", "1-3", "2-2", "0-1", "0-0", "1-1", "0-2", "0-0", "0-0", "2-2", "1-1", "1-1", "0-0", "2-1", "1-1", "0-1", "1-1", "2-2", "0-0"],
  "262772": ["0-2", "2-0", "1-1", "1-1", "1-0", "0-0", "0-1", "0-0", "1-0", "1-2", "2-3", "0-3", "2-0", "1-1", "1-1", "1-0", "0-1", "1-0", "2-1", "1-1", "0-0", "0-1", "0-0", "0-1"],
  "262717": ["1-2", "0-1", "1-1", "2-2", "2-2", "2-0", "0-2", "1-2", "0-0", "0-2", "0-1", "0-2", "2-0", "1-2", "1-1", "1-0", "1-2", "0-0", "2-1", "1-0", "1-1", "3-2", "1-2", "0-0"],
  "262728": ["0-0", "0-0", "1-0", "2-1", "4-1", "0-1", "0-2", "1-1", "0-1", "0-0", "1-0", "0-5", "4-0", "2-0", "2-3", "1-2", "0-0", "0-0", "3-0", "0-0", "0-2", "0-1", "0-2", "0-0"],
  "262770": ["3-1", "3-1", "2-2", "2-0", "2-1", "1-1", "1-3", "0-2", "2-0", "0-3", "0-1", "0-4", "2-1", "1-1", "2-1", "2-0", "1-1", "1-0", "3-0", "2-3", "0-2", "1-2", "0-2", "3-1"],
  "262755": ["1-2", "4-1", "3-2", "2-1", "3-2", "1-1", "3-3", "2-1", "1-0", "0-1", "1-1", "0-2", "1-1", "3-0", "1-2", "4-2", "3-1", "2-2", "1-0", "2-2", "1-0", "3-2", "1-0", "3-1"],
  "262704": ["1-1", "2-1", "1-1", "2-0", "3-0", "0-1", "1-2", "2-1", "1-0", "0-1", "1-1", "1-3", "1-0", "2-0", "2-1", "2-0", "1-1", "1-1", "2-1", "1-1", "1-2", "0-2", "2-1", "1-1"],
  "262747": ["1-1", "2-0", "1-0", "2-0", "2-0", "1-1", "1-2", "1-1", "1-1", "1-1", "1-1", "1-3", "1-1", "1-1", "1-1", "1-1", "1-1", "1-1", "2-0", "1-1", "1-1", "1-1", "1-1", "1-1"],
  "262723": ["1-1", "3-1", "2-1", "2-0", "3-0", "1-2", "1-2", "2-1", "2-0", "1-2", "1-1", "2-1", "3-1", "3-0", "2-1", "1-1", "2-1", "1-1", "2-1", "1-1", "0-2", "0-2", "1-1", "2-0"],
  "262709": ["1-1", "2-1", "2-1", "2-0", "3-0", "1-1", "1-2", "1-1", "1-0", "1-0", "2-1", "0-2", "2-1", "2-0", "1-1", "1-0", "1-1", "2-1", "2-1", "1-1", "0-3", "0-2", "1-2", "1-0"],
  "262782": ["0-2", "0-0", "0-1", "1-0", "1-0", "0-0", "0-4", "1-0", "0-1", "0-0", "0-1", "0-3", "0-0", "0-0", "0-1", "0-0", "0-0", "0-0", "3-1", "0-0", "0-1", "0-0", "0-0", "0-0"],
  "262739": ["1-0", "3-1", "1-1", "3-0", "3-1", "0-1", "1-2", "3-1", "2-0", "2-0", "2-1", "1-2", "3-0", "2-0", "2-1", "3-2", "1-0", "1-0", "2-0", "1-1", "0-1", "1-1", "1-2", "1-0"]
};

// 4. HAFTA TÜM FİKSTÜR
const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. HAFTA 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, weekLabel: "4. HAFTA 3. MAÇ", category: "UEFA KONFERANS LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "19:00", homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" },
  { id: 4, weekLabel: "4. HAFTA 4. MAÇ", category: "UEFA AVRUPA LİGİ ÖN ELEME 3.TUR RÖVANŞ", date: "13.08.2026", time: "20:00", homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
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

const isTffMatchCheck = (category: string) => {
  const uppercaseCat = category.toUpperCase();
  return (uppercaseCat.includes("TÜRKİYE SÜPER LİG") || uppercaseCat.includes("TÜRKİYE 1.LİG") || uppercaseCat.includes("TÜRKİYE SÜPER KUPA"));
};

const getEliteTheme = (category: string) => {
  const upCat = category.toUpperCase();
  if (upCat.includes("ŞAMPİYONLAR LİGİ")) {
    return {
      bgImg: "url('/cl-bg.png')",
      containerBorder: "border-indigo-500/50",
      containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.4)]",
      containerBg: "bg-[#050b14]",
      badgeBg: "bg-transparent backdrop-blur-sm",
      badgeText: "text-indigo-300",
      badgeBorder: "border-indigo-400/80 shadow-[0_0_10px_currentColor]",
      catText: "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]",
      scoreBorder: "border-white/30",
      colonText: "text-white/50",
      tagText: "text-cyan-300",
      tagBg: "bg-cyan-950/90",
      tagBorder: "border-cyan-400/80",
      bottomBar: "bg-[#050b14]/90 border-blue-900/30"
    };
  } else if (upCat.includes("AVRUPA LİGİ")) {
    return {
      bgImg: "url('/el-bg.png')", 
      containerBorder: "border-orange-500/50",
      containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.4)]",
      containerBg: "bg-[#140805]",
      badgeBg: "bg-transparent backdrop-blur-sm",
      badgeText: "text-orange-400",
      badgeBorder: "border-orange-500/80 shadow-[0_0_10px_currentColor]",
      catText: "text-orange-300 drop-shadow-[0_0_8px_rgba(253,186,116,0.5)]",
      scoreBorder: "border-orange-600/40",
      colonText: "text-orange-400/50",
      tagText: "text-orange-300",
      tagBg: "bg-orange-950/90",
      tagBorder: "border-orange-400/80",
      bottomBar: "bg-[#140805]/90 border-orange-900/30"
    };
  } else if (upCat.includes("KONFERANS LİGİ")) {
    return {
      bgImg: "url('/uecl-bg.png')",
      containerBorder: "border-emerald-500/50",
      containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.4)]",
      containerBg: "bg-[#05140b]",
      badgeBg: "bg-transparent backdrop-blur-sm",
      badgeText: "text-emerald-400",
      badgeBorder: "border-emerald-500/80 shadow-[0_0_10px_currentColor]",
      catText: "text-emerald-300 drop-shadow-[0_0_8px_rgba(110,231,183,0.5)]",
      scoreBorder: "border-emerald-600/40",
      colonText: "text-emerald-400/50",
      tagText: "text-emerald-300",
      tagBg: "bg-emerald-950/90",
      tagBorder: "border-emerald-400/80",
      bottomBar: "bg-[#05140b]/90 border-emerald-900/30"
    };
  } else if (isTffMatchCheck(category)) {
    return {
      bgImg: "url('/tff-bg.png')",
      containerBorder: "border-red-500/50",
      containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.4)]",
      containerBg: "bg-[#140505]",
      badgeBg: "bg-transparent backdrop-blur-sm",
      badgeText: "text-red-400",
      badgeBorder: "border-red-500/80 shadow-[0_0_10px_currentColor]",
      catText: "text-red-300 drop-shadow-[0_0_8px_rgba(252,165,165,0.5)]",
      scoreBorder: "border-red-600/40",
      colonText: "text-red-400/50",
      tagText: "text-red-400",
      tagBg: "bg-red-950/90",
      tagBorder: "border-red-500/80",
      bottomBar: "bg-[#140505]/90 border-red-900/30"
    };
  }
  return {
      bgImg: null,
      containerBorder: "border-blue-500/30",
      containerShadow: "shadow-[0_0_30px_rgba(30,58,138,0.5)]",
      containerBg: "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14]",
      badgeBg: "bg-transparent backdrop-blur-sm",
      badgeText: "text-cyan-400",
      badgeBorder: "border-cyan-500/80 shadow-[0_0_10px_currentColor]",
      catText: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]",
      scoreBorder: "border-blue-600/40",
      colonText: "text-blue-400/50",
      tagText: "text-cyan-300",
      tagBg: "bg-cyan-950/90",
      tagBorder: "border-cyan-400/80",
      bottomBar: "bg-[#050b14]/90 border-blue-900/30"
  };
};

export default function LiveMatchCard() {
  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});
  const [expandedMatches, setExpandedMatches] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const todayFormatted = `${dd}.${mm}.${yyyy}`;

    const todaysMatches = week4Matches.filter(m => m.date === todayFormatted);
    setTodaysMatchesList(todaysMatches);
    
    if (todaysMatches.length === 0) return;

    const fetchFromDB = async () => {
      try {
        const { data, error } = await supabase.from('live_matches').select('*');
        if (data) {
          const map: Record<number, any> = {};
          data.forEach(row => map[row.id] = row);
          setLiveMatchesData(map);
          
          let currentBoard: Record<string, any> = {}; 
          let hasLiveScores = false;

          todaysMatches.forEach(match => {
            const dbMatch = map[match.id];
            if (dbMatch && dbMatch.home_score && dbMatch.home_score !== '-' && dbMatch.away_score && dbMatch.away_score !== '-') {
              hasLiveScores = true;
              const isTff = isTffMatchCheck(match.category);
              const targetScore = `${dbMatch.home_score}-${dbMatch.away_score}`;
              const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][match.id - 1] === targetScore);
              
              let points = 1;
              if(winnerIds.length === 1) points = 12;
              else if(winnerIds.length === 2) points = 6;
              else if(winnerIds.length === 3) points = 5;
              else if(winnerIds.length === 4) points = 4;
              else if(winnerIds.length === 5) points = 3;
              else if(winnerIds.length >= 6) points = 2;

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
      } catch (e) {
        console.log("Supabase baglantisi bekleniyor...");
      }
    };

    fetchFromDB(); 
    const interval = setInterval(fetchFromDB, 5000); 
    return () => clearInterval(interval);
  }, []);

  const toggleWinners = (matchId: number) => {
    setOpenWinnersMap((prev) => ({ ...prev, [matchId]: !prev[matchId] })); 
  };

  const toggleMatchExpansion = (matchId: number) => {
    setExpandedMatches(prev => ({ ...prev, [matchId]: !prev[matchId] }));
  };

  const getDisplayMinute = (baseMinute: string, startedAt: number | null) => {
    if (!startedAt || !baseMinute || baseMinute === 'İY' || baseMinute === 'MS') return baseMinute;
    const elapsedMins = Math.floor((now - startedAt) / 60000);
    let base = 0; let extra = 0;
    if (baseMinute.includes('+')) {
      const parts = baseMinute.split('+');
      base = parseInt(parts[0]); extra = parseInt(parts[1]);
    } else {
      base = parseInt(baseMinute);
    }
    const total = base + extra + elapsedMins;
    if (base <= 45) { return total > 45 ? `45+${total - 45}` : `${total}`; } 
    else { return total > 90 ? `90+${total - 90}` : `${total}`; }
  };

  if (todaysMatchesList.length === 0) return null;

  return (
    <div className="w-full max-w-6xl mx-auto mb-8 flex flex-col gap-4 items-center">
      
      <div className="w-full max-w-lg md:max-w-none text-center mb-2 border-b border-slate-700/80 pb-3">
        <span className="text-slate-300 font-black tracking-[0.25em] uppercase text-sm sm:text-lg drop-shadow-md">
          {todaysMatchesList.length > 1 ? "GÜNÜN MAÇLARI" : "GÜNÜN MAÇI"}
        </span>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {todaysMatchesList.map((match) => {
          const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
          const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
          const isWinnersOpen = openWinnersMap[match.id] !== false;
          
          const isExpanded = !!expandedMatches[match.id];

          const dbMatch = liveMatchesData[match.id] || {};
          const matchStatus = dbMatch.status || 'NOT_STARTED';
          const homeScore = dbMatch.home_score || '-';
          const awayScore = dbMatch.away_score || '-';
          const baseMinute = dbMatch.base_minute || '';
          const startedAt = dbMatch.started_at || null;

          const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
          const isTffMatch = isTffMatchCheck(match.category);

          const theme = getEliteTheme(match.category);

          let currentWinners: string[] = [];
          if ((matchStatus === 'LIVE' || matchStatus === 'FINISHED' || matchStatus === 'HT') && homeScore !== '-' && awayScore !== '-') {
            const targetScore = `${homeScore}-${awayScore}`;
            currentWinners = Object.keys(week4PredictionsData)
              .filter(id => week4PredictionsData[id][match.id - 1] === targetScore)
              .map(id => allPlayersList[id])
              .sort((a, b) => a.localeCompare(b, 'tr'));
          }
          const winnersCount = currentWinners.length;

          let displayPoints = 1;
          if(winnersCount === 1) displayPoints = 12;
          else if(winnersCount === 2) displayPoints = 6;
          else if(winnersCount === 3) displayPoints = 5;
          else if(winnersCount === 4) displayPoints = 4;
          else if(winnersCount === 5) displayPoints = 3;
          else if(winnersCount >= 6) displayPoints = 2;
          else displayPoints = 0;

          let countdownText = "";
          if (matchStatus === 'NOT_STARTED') {
            const matchDateParts = match.date.split('.');
            const matchTimeParts = match.time.split(':');
            const matchTargetDate = new Date(parseInt(matchDateParts[2]), parseInt(matchDateParts[1]) - 1, parseInt(matchDateParts[0]), parseInt(matchTimeParts[0]), parseInt(matchTimeParts[1]), 0).getTime();
            const distance = matchTargetDate - now;
            if (distance > 0) {
              const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const s = Math.floor((distance % (1000 * 60)) / 1000);
              countdownText = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }
          }

          const currentDisplayMinute = getDisplayMinute(baseMinute, startedAt);

          return (
            <div 
              key={match.id} 
              className={`w-full max-w-lg mx-auto border rounded-xl overflow-hidden transition-all duration-300 flex flex-col relative ${isExpanded ? theme.containerBorder + ' ' + theme.containerShadow + ' ' + theme.containerBg : 'bg-slate-950 border-slate-700/50 shadow-[0_0_15px_rgba(0,0,0,0.3)]'}`}
            >
              
              {/* 🔴 EKMEL MÜDAHALESİ: AKORDEON AÇIKSA CETVELİ GİZLE (!) 🔴 */}
              {!isExpanded && (
                <div
                  onClick={() => toggleMatchExpansion(match.id)}
                  className="cursor-pointer px-3 sm:px-5 py-3 flex items-center justify-between bg-slate-900/80 hover:bg-slate-800/80 transition-colors border-b border-slate-800/50 relative z-20"
                >
                  <div className="flex-1 flex items-center gap-2 justify-end text-right">
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wide truncate">{match.homeTeam}</span>
                    <img src={homeLogoUrl} alt={match.homeTeam} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md" />
                  </div>
                  
                  <div className="px-3 sm:px-5 flex flex-col items-center justify-center">
                    {/* 🔴 EKMEL MÜDAHALESİ: TERTEMİZ SKOR KUTUCUĞU 🔴 */}
                    <div className={`flex items-center justify-center min-w-[60px] px-3 py-1.5 rounded-lg border shadow-[0_0_10px_rgba(0,0,0,0.5)] backdrop-blur-md ${matchStatus === 'LIVE' ? 'bg-red-950/50 border-red-500/50 animate-pulse' : 'bg-[#080d1a]/80 border-slate-700/50'}`}>
                      <span className={`text-xs sm:text-sm font-black whitespace-nowrap tracking-widest ${matchStatus === 'LIVE' ? 'text-red-500' : 'text-amber-400'}`}>
                        {matchStatus === 'NOT_STARTED' ? '-' : `${homeScore} - ${awayScore}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex items-center gap-2 justify-start text-left">
                    <img src={awayLogoUrl} alt={match.awayTeam} className="w-5 h-5 sm:w-7 sm:h-7 object-contain drop-shadow-md" />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-wide truncate">{match.awayTeam}</span>
                  </div>
                  
                  <div className="ml-2 text-slate-500 text-[10px]">
                    ▼
                  </div>
                </div>
              )}

              {/* AÇIK KART GÖRÜNÜMÜ */}
              {isExpanded && (
                <div className="relative flex-grow overflow-hidden animate-fadeIn">
                  
                  {/* Akordeonu geri kapatmak için tıkla */}
                  <button 
                    onClick={() => toggleMatchExpansion(match.id)}
                    className="absolute top-2 right-2 sm:top-3 sm:right-3 z-50 bg-slate-950/50 text-slate-300 hover:text-white border border-slate-700/50 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center shadow-lg backdrop-blur-md transition-colors"
                    title="Kapat"
                  >
                    ✕
                  </button>

                  {theme.bgImg && (
                    <>
                      <div 
                        className="absolute inset-0 z-0 opacity-100"
                        style={{ 
                          backgroundImage: theme.bgImg,
                          backgroundSize: 'cover', 
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      ></div>
                      <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
                    </>
                  )}

                  <div className="relative z-10 flex flex-col h-full">
                    
                    <div className="w-full text-center pt-3 pb-1 border-b border-slate-800/30">
                      <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 tracking-widest uppercase bg-slate-950/50 px-3 py-1 rounded-full shadow-inner">
                        {match.weekLabel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-2 sm:px-6 pt-6 pb-4">
                      
                      <div className="flex flex-col items-center justify-center flex-1 gap-3">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center relative z-20">
                          <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{match.homeTeam}</span>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-2 mx-1 sm:mx-4 w-36 sm:w-44 z-30">
                        
                        {/* 🔴 EKMEL MÜDAHALESİ: NEON KATEGORİ ETİKETİ 🔴 */}
                        <div className="text-center w-full mb-1 flex justify-center">
                          <span className={`inline-block px-3 py-1.5 rounded-lg border shadow-[0_0_15px_currentColor] leading-snug text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                            {match.category}
                          </span>
                        </div>

                        {matchStatus === 'NOT_STARTED' && (
                          <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                            <span className="text-amber-400 text-[10px] sm:text-xs font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                          </div>
                        )}

                        {matchStatus === 'LIVE' && (
                          <div className="bg-red-950/80 border border-red-700 px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            <span className="text-red-500 text-[10px] font-black tracking-widest">CANLI {currentDisplayMinute}'</span>
                          </div>
                        )}

                        {matchStatus === 'HT' && (
                          <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-sm backdrop-blur-md">
                            <span className="text-amber-500 text-[9px] sm:text-[10px] font-black tracking-widest">İY (BİTTİ)</span>
                          </div>
                        )}

                        {matchStatus === 'FINISHED' && (
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
                          <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                        </div>
                        <span className="text-white font-extrabold text-[9px] sm:text-[11px] text-center uppercase tracking-wide drop-shadow-md">{match.awayTeam}</span>
                      </div>

                    </div>
                  
                    <div className={`${theme.bottomBar} border-t px-3 py-2.5 w-full backdrop-blur-md z-10 relative`}>
                      <div className="flex justify-between items-center w-full">
                        <div className="text-left flex-1">
                          {matchStatus === 'NOT_STARTED' ? (
                            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                          ) : winnersCount === 0 ? (
                            <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 italic">Şu an skoru bilen yok</span>
                          ) : (
                            <span className="text-[9px] sm:text-[10px] font-medium text-blue-200">
                              <strong className="text-blue-400">{winnersCount} kişi</strong> tam isabetli
                            </span>
                          )}
                        </div>

                        <div className="flex-0 text-center px-1">
                          <span className={`text-[8px] font-black tracking-widest whitespace-nowrap px-2 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${theme.tagText} ${theme.tagBg} ${theme.tagBorder}`}>
                            {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                          </span>
                        </div>

                        <div className="text-right flex-1">
                          {winnersCount > 0 && (
                            <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[9px] sm:text-[10px] outline-none whitespace-nowrap drop-shadow-sm">
                              {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {isWinnersOpen && winnersCount > 0 && (
                        <div className="w-full mt-2 p-2.5 bg-blue-950/20 rounded-lg border border-blue-800/40 text-xs animate-fadeIn shadow-inner">
                          <div className="text-blue-300/80 font-semibold mb-2 border-b border-blue-900/50 pb-1.5 flex justify-between items-center text-[9px] sm:text-[10px]">
                            <span>CANLI SKOR BİLENLER (A-Z)</span>
                            <span className="text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded border border-blue-700/50">Kişi Başı: {displayPoints} Puan</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
                            {currentWinners.map((winner: string, idx: number) => (
                              <span key={idx} className="border px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-medium transition-all duration-500 bg-blue-900/60 text-white border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                                {winner}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}