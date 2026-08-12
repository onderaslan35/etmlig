'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 EKREM - YEREL & BULUT LOGO BANKASI (Maç Arşivi ile Birebir Aynı)
const localTeamLogos: Record<string, string> = {
  "BEŞİKTAŞ": "https://tr.wikipedia.org/wiki/Special:FilePath/BesiktasJK-Logo.svg",
  "KARABAĞ FK": "https://fr.wikipedia.org/wiki/Special:FilePath/Logo_Qaraba%C4%9F_FK_2024.svg",
  "HRADEC KRALOVE": "https://tr.wikipedia.org/wiki/Special:FilePath/Hradec_Kralove_CoA_CZ.svg",
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
  "ÇORUM FK": "/logos/corum-fk.png", 
  "ESENLER EROKSPOR": "/logos/erokspor.png", "EROKSPOR": "/logos/erokspor.png",
  "SARIYER": "/logos/sariyer.png", "PENDİKSPOR": "/logos/pendikspor.png", 
  "BOLUSPOR": "/logos/boluspor.png", "İSTANBULSPOR": "/logos/istanbulspor.png", 
  "BODRUMSPOR": "/logos/bodrumspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png",
  "ARSENAL": "/logos/arsenal.png" // Fallback
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

// 🔴 EKREM: 4. Haftanın 24 Maçı (Arşivdeki Şablon)
const week4Matches = [
  { id: 1, weekLabel: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
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
  { id: 17, weekLabel: "4. HAfta 17. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KAYSERİSPOR", awayTeam: "SİVASSPOR" },
  { id: 18, weekLabel: "4. HAFTA 18. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "AMED SPOR", awayTeam: "ERZURUMSPOR" },
  { id: 19, weekLabel: "4. HAFTA 19. MAÇ", category: "TÜRKİYE SÜPER LİG", date: "16.08.2026", time: "21:30", homeTeam: "BEŞİKTAŞ", awayTeam: "EYÜPSPOR" },
  { id: 20, weekLabel: "4. HAFTA 20. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "19:00", homeTeam: "KEÇİÖRENGÜCÜ", awayTeam: "PENDİKSPOR" },
  { id: 21, weekLabel: "4. HAFTA 21. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MARDİN 1969", awayTeam: "ANTALYASPOR" },
  { id: 22, weekLabel: "4. HAFTA 22. MAÇ", category: "TÜRKİYE 1.LİG", date: "16.08.2026", time: "21:30", homeTeam: "MUĞLASPOR", awayTeam: "BANDIRMASPOR" },
  { id: 23, weekLabel: "4. HAFTA 23. MAÇ", category: "TÜRKİYE SÜPER KUPA", date: "17.08.2026", time: "21:30", homeTeam: "SAMSUNSPOR", awayTeam: "GÖZTEPE" },
  { id: 24, weekLabel: "4. HAFTA 24. MAÇ", category: "TÜRKİYE 1.LİG", date: "17.08.2026", time: "21:30", homeTeam: "BATMAN PETROL SPOR", awayTeam: "BOLUSPOR" }
];

export default function AdminTahminmatik() {
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(true); 
  const [matchInputs, setMatchInputs] = useState<Record<number, { home: string, away: string, min: string }>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  const [liveData, setLiveData] = useState<Record<number, any>>({});

  // 🔴 Otonom Saat İçin Motor (Saniyede bir çalışır)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 🔴 Canlı Veritabanını Dinleme Motoru
  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const { data, error } = await supabase.from('live_matches').select('*');
        if (data) {
          const map: Record<number, any> = {};
          data.forEach(row => {
            map[row.id] = row;
            // Admin panelini DB'den gelen son durumla senkronize et
            setMatchInputs(prev => {
              if (prev[row.id]?.home === row.home_score && prev[row.id]?.away === row.away_score && prev[row.id]?.min === row.base_minute) return prev;
              return {
                ...prev,
                [row.id]: { home: row.home_score || "-", away: row.away_score || "-", min: row.base_minute || "1" }
              };
            });
          });
          setLiveData(map);
        }
      } catch (e) {
        console.log("Supabase baglantisi bekleniyor...");
      }
    };
    fetchFromDB();
    const interval = setInterval(fetchFromDB, 5000); 
    return () => clearInterval(interval);
  }, []);

  const scoreOptions = ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  
  const minOptions: string[] = [];
  for(let i=1; i<=45; i++) minOptions.push(i.toString());
  for(let i=1; i<=15; i++) minOptions.push(`45+${i}`);
  for(let i=46; i<=90; i++) minOptions.push(i.toString());
  for(let i=1; i<=15; i++) minOptions.push(`90+${i}`);

  const handleScoreChange = (matchId: number, type: 'home' | 'away' | 'min', value: string) => {
    setMatchInputs(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId] || { home: "-", away: "-", min: "1" },
        [type]: value
      }
    }));
  };

  const dispatchScores = async (matchId: number, h: string, a: string, status: 'LIVE' | 'HT' | 'FINISHED' | 'NOT_STARTED', baseMinute: string) => {
    
    // YENİ OTONOM SİSTEM: Duruma göre started_at belirle
    let startedAt = 0;
    const currentDbMatch = liveData[matchId];

    if (status === 'LIVE') {
      if (currentDbMatch?.status === 'LIVE' && currentDbMatch?.base_minute === baseMinute) {
         startedAt = currentDbMatch.started_at; // Eskiden çalışıyorsa devam et
      } else {
         startedAt = Date.now(); // İlk defa veya yeni dakika ile başlıyorsa sıfırla
      }
    } else {
      startedAt = 0; // İY, MS veya Henüz Başlamadı ise saati durdur
    }

    try {
      const { error } = await supabase
        .from('live_matches')
        .upsert({
          id: matchId,
          home_score: h,
          away_score: a,
          status: status,
          base_minute: baseMinute,
          started_at: startedAt
        });

      if (error) alert("Supabase Hatası: " + error.message);
    } catch (e) {
      console.log("Supabase hatası.");
    }

    // 🔴 PUAN DAĞITIM ALGORİTMASI (Senkronize)
    const targetScore = `${h}-${a}`;
    const winnerIds = Object.keys(week4PredictionsData).filter(id => week4PredictionsData[id][matchId - 1] === targetScore);
    
    let points = 1;
    if(winnerIds.length === 1) points = 12;
    else if(winnerIds.length === 2) points = 6;
    else if(winnerIds.length === 3) points = 5;
    else if(winnerIds.length === 4) points = 4;
    else if(winnerIds.length === 5) points = 3;
    else if(winnerIds.length === 6) points = 2;
    else if(winnerIds.length === 0) points = 0;

    // Supabase başarılıysa, localStorage ve Event'leri tetikle
    const currentBoard: Record<string, any> = {}; 

    winnerIds.forEach(wId => {
      currentBoard[wId] = { dfo: points, master: points, skor: 1 };
    });

    const signalData = { status, homeScore: h, awayScore: a, baseMinute: baseMinute, startedAt: startedAt };
    
    localStorage.setItem('elitTahmin_AdminSignal', JSON.stringify(signalData));
    localStorage.setItem('elitTahmin_Leaderboard', JSON.stringify(currentBoard));
    
    window.dispatchEvent(new Event('adminUpdate')); 
    window.dispatchEvent(new Event('leaderboardUpdate')); 
  };

  const resetSystem = async () => {
    try {
      // Sadece 1. maçı değil, haftanın tüm maçlarını sıfırla
      for(let i=1; i<=24; i++){
        await supabase.from('live_matches').upsert({
          id: i, home_score: '-', away_score: '-', status: 'NOT_STARTED', base_minute: '1', started_at: 0
        });
      }
    } catch(e) {}

    localStorage.removeItem('elitTahmin_AdminSignal');
    localStorage.removeItem('elitTahmin_Leaderboard');
    window.dispatchEvent(new Event('adminUpdate')); 
    window.dispatchEvent(new Event('leaderboardUpdate')); 
    setMatchInputs({});
  };

  // 🔴 Otonom Saat Hesaplayıcı (Senin Ekranda Göreceğin Canlı Saat)
  const getDisplayMinute = (baseMinute: string, startedAt: number | null, status: string) => {
    if (status !== 'LIVE' || !startedAt || !baseMinute || baseMinute === 'İY' || baseMinute === 'MS') return baseMinute;
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

  // 🔴 ALTIN STANDART TEMA MOTORU
  const getEliteTheme = (category: string) => {
    const upCat = category.toUpperCase();
    if (upCat.includes("ŞAMPİYONLAR LİGİ")) {
      return { containerBorder: "border-indigo-500/50", containerShadow: "shadow-[0_0_40px_rgba(79,70,229,0.3)]", containerBg: "bg-[#050b14]", badgeBg: "bg-indigo-900/80", badgeText: "text-indigo-200", badgeBorder: "border-indigo-500/50", catText: "text-white", scoreBorder: "border-white/30" };
    } else if (upCat.includes("AVRUPA LİGİ")) {
      return { containerBorder: "border-orange-500/50", containerShadow: "shadow-[0_0_40px_rgba(249,115,22,0.3)]", containerBg: "bg-[#140805]", badgeBg: "bg-orange-900/80", badgeText: "text-orange-200", badgeBorder: "border-orange-500/50", catText: "text-orange-300", scoreBorder: "border-orange-600/40" };
    } else if (upCat.includes("KONFERANS LİGİ")) {
      return { containerBorder: "border-emerald-500/50", containerShadow: "shadow-[0_0_40px_rgba(16,185,129,0.3)]", containerBg: "bg-[#05140b]", badgeBg: "bg-emerald-900/80", badgeText: "text-emerald-200", badgeBorder: "border-emerald-500/50", catText: "text-emerald-300", scoreBorder: "border-emerald-600/40" };
    } else {
      return { containerBorder: "border-red-500/50", containerShadow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]", containerBg: "bg-[#140505]", badgeBg: "bg-red-900/80", badgeText: "text-red-200", badgeBorder: "border-red-500/50", catText: "text-red-300", scoreBorder: "border-red-600/40" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 text-slate-100 min-h-screen font-sans">
      
      {/* BAŞLIK VE SIFIRLAMA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl mb-8 backdrop-blur-md">
        <h1 className="text-2xl md:text-3xl font-black text-amber-400 tracking-tight uppercase flex items-center gap-3">
          ⚡ ŞAMPİYONLAR LİGİ REJİ ODASI
        </h1>
        <button onClick={resetSystem} className="mt-4 md:mt-0 bg-red-950/80 border border-red-800 text-red-400 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-red-900 hover:text-red-300 transition-colors shadow-lg">
          📌 TÜM MAÇLARI VE PUANLARI SIFIRLA
        </button>
      </div>

      <div className="w-full relative mb-8">
        <button onClick={() => setIsAdminPanelOpen(!isAdminPanelOpen)} className={`w-full py-4 px-6 rounded-xl font-extrabold text-base border-2 transition-all flex items-center justify-between shadow-lg ${isAdminPanelOpen ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-amber-500 border-amber-500/50 hover:bg-slate-800'}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎛️</span>
            <span>MANUEL MAÇ KONTROL PANELİ (YÖNETMEN MODU)</span>
          </div>
          <span className="text-lg transition-transform duration-300">{isAdminPanelOpen ? '▲' : '▼'}</span>
        </button>

        {isAdminPanelOpen && (
          <div className="absolute top-full left-0 right-0 mt-3 z-40 bg-slate-950/95 border-2 border-amber-500/50 p-4 sm:p-6 rounded-2xl shadow-2xl backdrop-blur-xl animate-fadeIn max-h-[80vh] overflow-y-auto">
            
            {/* 🔴 ALTIN STANDART İZGARASI (24 MAÇ) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              {week4Matches.map((match) => { 
                const currentInputs = matchInputs[match.id] || { home: "-", away: "-", min: "1" };
                const dbStatus = liveData[match.id]?.status || 'NOT_STARTED';
                const dbStartedAt = liveData[match.id]?.started_at || null;
                const dbBaseMin = liveData[match.id]?.base_minute || '';
                
                const displayMinute = getDisplayMinute(dbBaseMin, dbStartedAt, dbStatus);
                const theme = getEliteTheme(match.category);
                
                const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
                const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";

                return (
                  <div key={match.id} className={`flex flex-col relative rounded-2xl border overflow-hidden p-4 sm:p-6 transition-all duration-300 ${theme.containerBorder} ${theme.containerBg} ${theme.containerShadow}`}>
                    
                    {/* ÜST BİLGİ BARLARI */}
                    <div className="flex flex-col items-center justify-center mb-4 gap-2 z-10 relative">
                      <span className="text-[10px] font-extrabold text-white bg-black/80 border border-white/30 px-3 py-0.5 rounded-full uppercase tracking-widest shadow-md">
                        {match.weekLabel}
                      </span>
                      <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded border text-center shadow-sm flex items-center gap-1.5 ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
                        🏆 {match.category}
                      </span>
                    </div>

                    {/* DÖRT ATLI KONTROL BUTONLARI VE LOGOLAR */}
                    <div className="flex items-start justify-between relative z-10">
                      
                      {/* EV SAHİBİ KISMI */}
                      <div className="flex flex-col items-center flex-1 gap-2">
                        <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, 'LIVE', currentInputs.min)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[9px] sm:text-[10px] font-black py-1.5 rounded shadow-md border border-blue-400">
                          🟢 MAÇI BAŞLAT
                        </button>
                        <button onClick={() => { handleScoreChange(match.id, 'min', 'İY'); dispatchScores(match.id, currentInputs.home, currentInputs.away, 'HT', 'İY'); }} className="w-full bg-amber-600 hover:bg-amber-500 text-white text-[9px] sm:text-[10px] font-black py-1.5 rounded shadow-md border border-amber-400">
                          ⏸ İLK YARI BİTİR
                        </button>
                        <div className="w-16 h-16 sm:w-24 sm:h-24 mt-2 flex items-center justify-center">
                          <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                        </div>
                        <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide mt-1">{match.homeTeam}</span>
                      </div>

                      {/* MERKEZ (SKOR SEÇİCİ VE OTONOM SAAT) */}
                      <div className="flex flex-col items-center justify-center mx-2 w-32 sm:w-40 z-30 pt-2">
                        
                        {/* OTONOM SAAT GÖSTERGESİ */}
                        <div className="w-full flex flex-col items-center mb-3">
                           <span className={`text-[10px] sm:text-xs font-semibold tracking-widest ${theme.catText} mb-1 opacity-80`}>
                             {match.date} | {match.time}
                           </span>
                           {dbStatus === 'LIVE' ? (
                             <div className="bg-red-950/80 border border-red-700 px-3 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse shadow-lg">
                               <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                               <span className="text-red-500 text-xs font-black tracking-widest">{displayMinute}'</span>
                             </div>
                           ) : dbStatus === 'HT' ? (
                             <div className="bg-amber-950/80 border border-amber-700 px-3 py-0.5 rounded-full shadow-lg">
                               <span className="text-amber-500 text-xs font-black tracking-widest">İY</span>
                             </div>
                           ) : dbStatus === 'FINISHED' ? (
                             <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-lg">
                               <span className="text-slate-400 text-xs font-black tracking-widest">MS</span>
                             </div>
                           ) : (
                             <div className="bg-slate-900/80 border border-slate-600/80 px-3 py-0.5 rounded-full shadow-lg">
                               <span className="text-slate-400 text-[10px] font-bold">BAŞLAMADI</span>
                             </div>
                           )}
                        </div>

                        {/* AÇILIR AKORDEON (SELECT) SKORLAR */}
                        <div className={`w-full bg-[#080d1a]/80 border ${theme.scoreBorder} p-2 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
                          <select value={currentInputs.home} onChange={(e)=>handleScoreChange(match.id, 'home', e.target.value)} className="w-10 sm:w-12 bg-slate-900 border border-slate-600 text-white rounded p-1 text-lg sm:text-xl font-black outline-none focus:border-amber-500 appearance-none text-center cursor-pointer shadow-inner">
                            {scoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                          <span className="text-xl font-bold text-white/50">:</span>
                          <select value={currentInputs.away} onChange={(e)=>handleScoreChange(match.id, 'away', e.target.value)} className="w-10 sm:w-12 bg-slate-900 border border-slate-600 text-white rounded p-1 text-lg sm:text-xl font-black outline-none focus:border-amber-500 appearance-none text-center cursor-pointer shadow-inner">
                            {scoreOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                        
                        {/* GÜNCELLE BUTONU (Ortada, skora müdahale için) */}
                        <button onClick={() => dispatchScores(match.id, currentInputs.home, currentInputs.away, dbStatus, currentInputs.min)} className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black py-2 rounded-lg shadow-md border border-indigo-400 transition-all flex items-center justify-center gap-1">
                          🔄 SKORU GÜNCELLE
                        </button>

                        {/* MANUEL DAKİKA SEÇİCİ (Geç kalırsan elinle düzeltmek için) */}
                        <div className="w-full mt-2 flex flex-col items-center">
                          <label className="text-[8px] text-slate-400 font-bold mb-0.5">MANUEL DAKİKA GİR</label>
                          <select value={currentInputs.min} onChange={(e)=>handleScoreChange(match.id, 'min', e.target.value)} className="w-full bg-slate-900 border border-slate-700 text-slate-300 rounded p-1 text-[10px] font-bold outline-none appearance-none text-center cursor-pointer">
                            {minOptions.map(opt => <option key={opt} value={opt}>{opt}'</option>)}
                          </select>
                        </div>

                      </div>

                      {/* DEPLASMAN KISMI */}
                      <div className="flex flex-col items-center flex-1 gap-2">
                        <button onClick={() => { handleScoreChange(match.id, 'min', '46'); dispatchScores(match.id, currentInputs.home, currentInputs.away, 'LIVE', '46'); }} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] sm:text-[10px] font-black py-1.5 rounded shadow-md border border-cyan-400">
                          ▶️ 2. YARIYI BAŞLAT
                        </button>
                        <button onClick={() => { handleScoreChange(match.id, 'min', 'MS'); dispatchScores(match.id, currentInputs.home, currentInputs.away, 'FINISHED', 'MS'); }} className="w-full bg-red-600 hover:bg-red-500 text-white text-[9px] sm:text-[10px] font-black py-1.5 rounded shadow-md border border-red-400">
                          🛑 MAÇI BİTİR (MS)
                        </button>
                        <div className="w-16 h-16 sm:w-24 sm:h-24 mt-2 flex items-center justify-center">
                          <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)]" />
                        </div>
                        <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide mt-1">{match.awayTeam}</span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}