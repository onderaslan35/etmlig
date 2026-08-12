'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 EKREM - YEREL & BULUT LOGO BANKASI
const localTeamLogos: Record<string, string> = {
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "HRADEC KRALOVE": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Hradec_Kralove.png",
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
  "PARIS SG": "https://en.wikipedia.org/wiki/Special:FilePath/Paris_Saint-Germain_F.C..svg",
  "ASTON VILLA": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Aston_Villa_FC_2024.svg",
  "STURM GRAZ": "https://en.wikipedia.org/wiki/Special:FilePath/SK_Sturm_Graz_logo.svg",
  "DINAMO KIEV": "https://en.wikipedia.org/wiki/Special:FilePath/FC_Dynamo_Kyiv_logo.svg",
  "ÇORUM FK": "/logos/corum-fk.png", "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", "BOLUSPOR": "/logos/boluspor.png", 
  "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", "ARSENAL": "/logos/arsenal.png"
};

const allPlayersList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN", "262714": "İSMAİL EKER", "262740": "ABDULLAH DİK",
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

const week4Matches = [
  { id: 1, homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" }, { id: 2, homeTeam: "PARIS SG", awayTeam: "ASTON VILLA" },
  { id: 3, homeTeam: "KARABAĞ FK", awayTeam: "DINAMO KIEV" }, { id: 4, homeTeam: "BEŞİKTAŞ", awayTeam: "HRADEC KRALOVE" },
  { id: 5, homeTeam: "GALATASARAY", awayTeam: "ÇORUM FK" }, { id: 6, homeTeam: "EROKSPOR", awayTeam: "SARIYER" },
  { id: 7, homeTeam: "KASIMPAŞA", awayTeam: "TRABZONSPOR" }, { id: 8, homeTeam: "KONYASPOR", awayTeam: "ÇAYKUR RİZE" },
  { id: 9, homeTeam: "FATİH KARAGÜMRÜK", awayTeam: "ÜMRANİYESPOR" }, { id: 10, homeTeam: "İSTANBULSPOR", awayTeam: "BODRUMSPOR" },
  { id: 11, homeTeam: "GAZİANTEP FK", awayTeam: "ALANYASPOR" }, { id: 12, homeTeam: "GENÇLERBİRLİĞİ", awayTeam: "FENERBAHÇE" },
  { id: 13, homeTeam: "BURSASPOR", awayTeam: "IĞDIR FK" }, { id: 14, homeTeam: "MANİSA FK", awayTeam: "VANSPOR FK" },
  { id: 15, homeTeam: "ARSENAL", awayTeam: "MANCHESTER CITY" }, { id: 16, homeTeam: "BAŞAKŞEHİR", awayTeam: "KOCAELİSPOR" },
  { id: 17, homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" }, { id: 18, homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" }, { id: 20, homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" }, { id: 22, homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" }, { id: 24, homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

export default function TahminlerMerkezi() {
  const [view, setView] = useState<'menu' | 'login' | 'entry' | 'declaration'>('menu');
  
  // Login State
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedInUser, setLoggedInUser] = useState<{id: string, name: string} | null>(null);

  // Predictions State
  const [scores, setScores] = useState<Record<number, {home: string, away: string}>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Declaration State
  const [allPredictions, setAllPredictions] = useState<any[]>([]);

  // 🔴 GİYOTİN SAATİ (4. Hafta Kapanış: 17 Ağustos 2026, 21:00:00)
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const DEADLINE_TIMESTAMP = new Date(2026, 7, 17, 21, 0, 0).getTime();

  useEffect(() => {
    const checkLock = () => {
      const now = new Date().getTime();
      setIsLocked(now >= DEADLINE_TIMESTAMP);
    };
    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!allPlayersList[userId]) {
      setLoginError("Böyle bir ID sistemde kayıtlı değil!");
      return;
    }
    if (password !== "elit2026") {
      setLoginError("Şifre hatalı!");
      return;
    }
    
    setLoggedInUser({ id: userId, name: allPlayersList[userId] });
    setLoginError('');
    
    try {
      const { data, error } = await supabase.from('user_predictions').select('*').eq('user_id', userId).single();
      if (data) {
        const loadedScores: Record<number, {home: string, away: string}> = {};
        for(let i=1; i<=24; i++) {
          const val = data[`m${i}`];
          if(val && val.includes('-')) {
            const [h, a] = val.split('-');
            loadedScores[i] = {home: h, away: a};
          }
        }
        setScores(loadedScores);
      }
    } catch (e) { console.log(e); }
    
    setView('entry');
  };

  const handleScoreSelect = (matchId: number, type: 'home' | 'away', val: string) => {
    if (isLocked) return;
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { home: "-", away: "-" },
        [type]: val
      }
    }));
  };

  const savePredictions = async () => {
    if (isLocked) {
      setSaveMessage("⏳ GİYOTİN İNDİ! Tahmin süresi dolmuştur. İşlem reddedildi.");
      return;
    }
    
    setIsSaving(true);
    setSaveMessage('');
    
    const payload: any = { user_id: loggedInUser?.id, week_no: 4, updated_at: new Date().toISOString() };
    for(let i=1; i<=24; i++) {
      const h = scores[i]?.home || "-";
      const a = scores[i]?.away || "-";
      payload[`m${i}`] = `${h}-${a}`;
    }

    try {
      const { error } = await supabase.from('user_predictions').upsert(payload);
      if (error) throw error;
      setSaveMessage("✅ BAŞARILI! Tahminlerin veri tabanına mühürlendi. 72 saat dolana kadar tekrar değiştirebilirsin.");
    } catch (e) {
      setSaveMessage("❌ HATA! Veri tabanına ulaşılamadı.");
    }
    setIsSaving(false);
  };

  // 🔴 EKMEL MÜDAHALESİ: KİLİT KIRILDI VE VERİLER BİRLEŞTİRİLDİ!
  const loadDeclaration = async () => {
    try {
      // 1. Önce Supabase'den güncel verileri (senin test ettiklerini) çekelim
      const { data, error } = await supabase.from('user_predictions').select('*').eq('week_no', 4);
      
      const formattedList: any[] = [];
      
      // 2. Bütün oyuncuları tek tek tarayıp listeye ekleyelim
      Object.keys(allPlayersList).forEach(userId => {
        const userName = allPlayersList[userId];
        const pData: any = { name: userName };
        let hasData = false;

        // Önce Supabase'de kaydı var mı bakıyoruz (Örn: Önder Aslan testi)
        const dbRecord = data?.find(r => r.user_id === userId);
        
        if (dbRecord) {
          for(let i=1; i<=24; i++) pData[`m${i}`] = dbRecord[`m${i}`] || "-:-";
          hasData = true;
        } 
        // Eğer Supabase'de yoksa, eski hardcoded (arşiv) verisinden çekiyoruz
        else if (week4PredictionsData[userId]) {
          const hardcodedScores = week4PredictionsData[userId];
          for(let i=1; i<=24; i++) pData[`m${i}`] = hardcodedScores[i-1] || "-:-";
          hasData = true;
        }

        // Eğer kişinin tahmini varsa (yeni veya eski) listeye ekle
        if (hasData) {
          formattedList.push(pData);
        }
      });

      // İsim sırasına göre diz ve ekrana bas
      setAllPredictions(formattedList.sort((a,b) => a.name.localeCompare(b.name, 'tr')));
    } catch(e) {
      console.error(e);
    }
    
    // Kilide falan bakmadan direkt tabloyu açıyoruz!
    setView('declaration');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* ÜST BİLGİ */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-amber-500 tracking-tighter uppercase drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
            ELİT TAHMİN MERKEZİ
          </h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide">4. HAFTA BÜLTENİ VE DEKLARASYON SİSTEMİ</p>
        </div>

        {/* 🔴 AŞAMA 1: ANA MENÜ (ÇİFT KAPI) */}
        {view === 'menu' && (
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch max-w-4xl mx-auto mt-12">
            
            {/* A KAPISI: DEKLARASYON (KİLİDİ AÇIK!) */}
            <div onClick={loadDeclaration} className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-800 hover:border-cyan-500 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] group relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors"></div>
              <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">📊</span>
              <h2 className="text-xl font-black text-white mb-2">KATILIMCI TAHMİNLERİNİ GÖR</h2>
              <p className="text-sm text-slate-400">Tüm yarışmacıların 4. hafta tahmin listesi (Deneme aşaması için kilit kaldırılmıştır).</p>
            </div>

            {/* B KAPISI: KİŞİSEL GİRİŞ */}
            <div onClick={() => setView('login')} className="flex-1 bg-gradient-to-b from-amber-900/40 to-slate-950 border-2 border-amber-700/50 hover:border-amber-500 rounded-2xl p-8 cursor-pointer transition-all duration-300 hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] group relative overflow-hidden text-center">
              <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors"></div>
              <span className="text-6xl mb-4 block group-hover:scale-110 transition-transform">🔒</span>
              <h2 className="text-xl font-black text-amber-400 mb-2">TAHMİNLERİNİ GİR / GÜNCELLE</h2>
              <p className="text-sm text-slate-400">Sana özel ID ve şifrenle giriş yap, 72 saatlik mühlet boyunca skorlarını taktiksel olarak yönet.</p>
            </div>

          </div>
        )}

        {/* 🔴 AŞAMA 2: GÜVENLİK KAPISI (LOGİN) */}
        {view === 'login' && (
          <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-2xl backdrop-blur-sm animate-fadeIn">
            <h2 className="text-2xl font-black text-amber-500 text-center mb-6">GÜVENLİK DUVARI</h2>
            {loginError && <div className="bg-red-950/50 border border-red-500 text-red-400 p-3 rounded-lg text-sm mb-4 text-center font-bold">{loginError}</div>}
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-widest mb-1 block">KULLANICI ID (Örn: 262728)</label>
                <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold text-center tracking-widest" placeholder="ID Numarası" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 tracking-widest mb-1 block">ŞİFRE</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-600 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-bold text-center tracking-widest" placeholder="••••••••" />
              </div>
              <button onClick={handleLogin} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-lg mt-2 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all">SİSTEME GİRİŞ YAP</button>
              <button onClick={() => setView('menu')} className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-bold py-2 rounded-lg transition-all text-sm mt-2 border border-slate-700">Geri Dön</button>
            </div>
          </div>
        )}

        {/* 🔴 AŞAMA 3: 24 MAÇLIK OTONOM BÜLTEN (KAYIT EKRANI) */}
        {view === 'entry' && loggedInUser && (
          <div className="animate-fadeIn max-w-5xl mx-auto">
            
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center mb-6 shadow-lg gap-4">
              <div>
                <span className="text-xs text-slate-400 font-bold block mb-1">HOŞ GELDİN,</span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">{loggedInUser.name} <span className="text-amber-500 text-sm">({loggedInUser.id})</span></h2>
              </div>
              <div className="text-center sm:text-right">
                {isLocked ? (
                  <div className="bg-red-950/80 border border-red-500 text-red-200 px-4 py-2 rounded-lg">
                    <span className="font-black block text-sm">GİYOTİN İNDİ ⏳</span>
                    <span className="text-[10px]">Süre dolduğu için sistem kilitlendi.</span>
                  </div>
                ) : (
                  <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-lg">
                    <span className="font-black block text-sm">SİSTEM AÇIK 🟢</span>
                    <span className="text-[10px]">İstediğin kadar güncelleme yapabilirsin.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {week4Matches.map((match) => {
                const hScore = scores[match.id]?.home || "-";
                const aScore = scores[match.id]?.away || "-";
                const hLogo = localTeamLogos[match.homeTeam] || "/logos/default.png";
                const aLogo = localTeamLogos[match.awayTeam] || "/logos/default.png";

                return (
                  <div key={match.id} className={`bg-slate-900 border rounded-xl p-4 flex flex-col transition-all ${isLocked ? 'border-slate-800 opacity-60' : 'border-slate-700 hover:border-amber-500/50 hover:bg-slate-800/80'}`}>
                    <div className="text-center border-b border-slate-800 pb-2 mb-3">
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-950 px-2 py-1 rounded">MAÇ {match.id}</span>
                    </div>
                    
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex flex-col items-center flex-1">
                        <img src={hLogo} className="w-10 h-10 object-contain mb-2 drop-shadow-md" alt={match.homeTeam} />
                        <span className="text-[9px] font-black text-slate-300 text-center uppercase truncate w-full px-1">{match.homeTeam}</span>
                      </div>

                      <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-700">
                        <select disabled={isLocked} value={hScore} onChange={(e)=>handleScoreSelect(match.id, 'home', e.target.value)} className="bg-transparent text-white font-black text-lg outline-none cursor-pointer appearance-none text-center">
                          {["-", "0","1","2","3","4","5","6","7","8","9"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="text-slate-500 font-bold">:</span>
                        <select disabled={isLocked} value={aScore} onChange={(e)=>handleScoreSelect(match.id, 'away', e.target.value)} className="bg-transparent text-white font-black text-lg outline-none cursor-pointer appearance-none text-center">
                          {["-", "0","1","2","3","4","5","6","7","8","9"].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col items-center flex-1">
                        <img src={aLogo} className="w-10 h-10 object-contain mb-2 drop-shadow-md" alt={match.awayTeam} />
                        <span className="text-[9px] font-black text-slate-300 text-center uppercase truncate w-full px-1">{match.awayTeam}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-8 bg-slate-900 border-t-2 border-amber-500 p-6 rounded-xl sticky bottom-4 shadow-2xl z-50">
              {saveMessage && <div className={`mb-4 p-3 rounded-lg text-sm font-bold text-center ${saveMessage.includes('HATA') || saveMessage.includes('GİYOTİN') ? 'bg-red-950/80 text-red-400 border border-red-800' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'}`}>{saveMessage}</div>}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button disabled={isLocked || isSaving} onClick={savePredictions} className={`flex-1 font-black py-4 rounded-xl text-lg transition-all shadow-lg ${isLocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]'}`}>
                  {isSaving ? 'KAYDEDİLİYOR...' : '💾 TAHMİNLERİMİ KAYDET VE GÖNDER'}
                </button>
                <button onClick={() => setView('menu')} className="sm:w-32 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all text-sm">Menü</button>
              </div>
            </div>

          </div>
        )}

        {/* 🔴 AŞAMA 4: DİJİTAL MÜHÜRLÜ DEKLARASYON TABLOSU (KİLİTSİZ AÇIK ERİŞİM) */}
        {view === 'declaration' && (
          <div className="animate-fadeIn w-full overflow-hidden">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-cyan-400 tracking-wider">RESMİ DEKLARASYON TABLOSU</h2>
              <button onClick={() => setView('menu')} className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-all text-sm">Geri</button>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
              
              {/* DİJİTAL MÜHÜR METNİ (AÇIK ERİŞİM VERSİYONU) */}
              <div className="bg-cyan-950/40 border-b border-cyan-900/50 p-4">
                <p className="text-xs text-cyan-300 leading-relaxed font-medium">
                  <strong className="text-cyan-400 font-black">🔓 AÇIK ERİŞİM (TEST MODU):</strong> 4. Hafta tahminleri tüm kullanıcılara açık hale getirilmiştir. Tabloda hem sistemdeki güncel kayıtlar hem de mevcut arşiv verileri birlikte görüntülenmektedir.
                </p>
              </div>

              {/* EXCEL BENZERİ MUAZZAM TABLO */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] sm:text-xs whitespace-nowrap">
                  <thead>
                    {/* SÜTUN NUMARALARI */}
                    <tr className="bg-slate-950 border-b border-slate-800">
                      <th className="p-3 font-black text-amber-500 bg-slate-950 sticky left-0 z-20 border-r border-slate-800 w-48 shadow-[5px_0_10px_rgba(0,0,0,0.5)]">4. HAFTA BÜLTENİ</th>
                      {week4Matches.map(m => (
                        <th key={m.id} className="p-2 font-black text-slate-500 text-center border-r border-slate-800 min-w-[45px]">{m.id}</th>
                      ))}
                    </tr>
                    {/* LOGOLAR */}
                    <tr className="bg-slate-900 border-b-2 border-slate-700">
                      <th className="p-3 font-black text-white bg-slate-900 sticky left-0 z-20 border-r border-slate-700 shadow-[5px_0_10px_rgba(0,0,0,0.5)]">OYUNCU İSMİ</th>
                      {week4Matches.map(m => {
                        const lUrl = localTeamLogos[m.homeTeam] || "/logos/default.png";
                        return (
                          <th key={m.id} className="p-1 border-r border-slate-800 bg-slate-900/50">
                            <div className="w-6 h-6 mx-auto"><img src={lUrl} alt={m.homeTeam} className="w-full h-full object-contain drop-shadow" /></div>
                          </th>
                        )
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {allPredictions.length === 0 ? (
                      <tr><td colSpan={25} className="text-center p-8 text-slate-500 italic">Veritabanından tahminler yükleniyor veya henüz tahmin yapılmamış...</td></tr>
                    ) : (
                      allPredictions.map((p, idx) => (
                        <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                          <td className="p-3 font-bold text-slate-200 bg-slate-900/90 sticky left-0 z-10 border-r border-slate-800 shadow-[5px_0_10px_rgba(0,0,0,0.3)] truncate max-w-[150px]">{p.name}</td>
                          {week4Matches.map(m => (
                            <td key={m.id} className={`p-2 text-center font-semibold border-r border-slate-800/30 ${p[`m${m.id}`] !== '-:-' ? 'text-amber-400' : 'text-slate-600'}`}>
                              {p[`m${m.id}`]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}