'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';

// 🔴 EKREM - YEREL LOGO BANKASI (Senin isimlendirmene göre alt tireli güncellendi!)
const localTeamLogos: Record<string, string> = {
  "FENERBAHÇE": "/logos/fenerbahce.png", "GALATASARAY": "/logos/galatasaray.png", "BEŞİKTAŞ": "/logos/besiktas.png",
  "TRABZONSPOR": "/logos/trabzonspor.png", "STURM GRAZ": "/logos/sturm-graz.png", "PARIS SAINT-GERMAIN": "/logos/psg.svg",
  "ASTON VILLA": "/logos/aston_villa.svg", "KARABAĞ FK": "/logos/karabag.png", "DINAMO KIEV": "/logos/dinamo-kiev.png",
  "HRADEC KRALOVE": "/logos/hradec.png", "ÇORUM FK": "/logos/corum-fk.png", "KASIMPAŞA": "/logos/kasimpasa.png",
  "KONYASPOR": "/logos/konyaspor.png", "ÇAYKUR RİZE": "/logos/caykur-rize.png", "BAŞAKŞEHİR": "/logos/basaksehir.png",
  "IBERIA 1999": "/logos/iberia.png", "SLOVAN BRATISLAVA": "/logos/slovan.png", "SABAH FK": "/logos/sabah.png",
  "KUPS": "/logos/kups.png", "GORNİK ZABRZE": "/logos/gornik.png", "THUN": "/logos/thun.png",
  "DINAMO ZAGREB": "/logos/dinamo-zagreb.png", "HEART": "/logos/heart.png", "LARNE FC": "/logos/larne.png",
  "KIZILYILDIZ": "/logos/kizilyildiz.png", "GOTEBORG": "/logos/goteborg.png", "LEVADIA FC": "/logos/levadia.png",
  "LEVSKI SOFYA": "/logos/levski.png", "UNIVERSITATEA CRAIOVA": "/logos/craiova.png", "KOPENAG": "/logos/kopenhag.png",
  "KOPENHAG": "/logos/kopenhag.png", "RAPID WIEN": "/logos/rapid-wien.png", "AJAX": "/logos/ajax.png",
  "PANATHINAIKOS": "/logos/panathinaikos.png", "BRAGA": "/logos/braga.png", "PAOK": "/logos/paok.png",
  "ANDERLECHT": "/logos/anderlecht.png", "TWENTE": "/logos/twente.png", "BENFICA": "/logos/benfica.png",
  "SİVASSPOR": "/logos/sivasspor.png", "ANTALYASPOR": "/logos/antalyaspor.png", "KAYSERİSPOR": "/logos/kayserispor.png",
  "PENDİKSPOR": "/logos/pendikspor.png", "BATMAN PETROL SPOR": "/logos/batman.png", "ESENLER EROKSPOR": "/logos/erokspor.png",
  "EROKSPOR": "/logos/erokspor.png", "ALANYASPOR": "/logos/alanyaspor.png", "GENÇLERBİRLİĞİ": "/logos/genclerbirligi.png",
  "IĞDIR FK": "/logos/igdir.png", "BURSASPOR": "/logos/bursaspor.png", "MANİSA FK": "/logos/manisa.png",
  "VANSPOR FK": "/logos/vanspor.png", "ARSENAL": "/logos/arsenal.png", "MANCHESTER CITY": "/logos/man-city.png",
  "KOCAELİSPOR": "/logos/kocaelispor.png", "AMED SPOR": "/logos/amedspor.png", "ERZURUMSPOR": "/logos/erzurumspor.png",
  "EYÜPSPOR": "/logos/eyupspor.png", "KEÇİÖRENGÜCÜ": "/logos/keciorengucu.png", "MARDİN 1969": "/logos/mardin.png",
  "MUĞLASPOR": "/logos/muglaspor.png", "BANDIRMASPOR": "/logos/bandirmaspor.png", "SAMSUNSPOR": "/logos/samsunspor.png",
  "GÖZTEPE": "/logos/goztepe.png", "BOLUSPOR": "/logos/boluspor.png", "FATİH KARAGÜMRÜK": "/logos/karagumruk.png",
  "ÜMRANİYESPOR": "/logos/umraniyespor.png", "İSTANBULSPOR": "/logos/istanbulspor.png", "BODRUMSPOR": "/logos/bodrumspor.png",
  "GAZİANTEP FK": "/logos/gaziantep.png", "SARIYER": "/logos/sariyer.png"
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
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
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
  { id: 1, weekLabel: "4. HAFTA 1. MAÇ", category: "UEFA ŞAMPİYONLAR LİGİ ÖN ELEME 3.TUR RÖVANŞ MAÇI", date: "11.08.2026", time: "21:30", homeTeam: "STURM GRAZ", awayTeam: "FENERBAHÇE" },
  { id: 2, weekLabel: "4. HAFTA 2. MAÇ", category: "UEFA SÜPER KUPA", date: "12.08.2026", time: "22:00", homeTeam: "PARIS SAINT-GERMAIN", awayTeam: "ASTON VILLA" },
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

export default function LiveMatchCard() {
  const [todaysMatchesList, setTodaysMatchesList] = useState<any[]>([]);
  const [liveMatchesData, setLiveMatchesData] = useState<Record<number, any>>({});
  const [now, setNow] = useState<number>(new Date().getTime());
  const [openWinnersMap, setOpenWinnersMap] = useState<{ [key: number]: boolean }>({});

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
              else if(winnerIds.length === 6) points = 2;

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
    <div className="w-full max-w-5xl mx-auto mb-8 flex flex-col gap-6">
      {todaysMatchesList.map((match) => {
        const homeLogoUrl = localTeamLogos[match.homeTeam] || "/logos/default.png";
        const awayLogoUrl = localTeamLogos[match.awayTeam] || "/logos/default.png";
        const isWinnersOpen = openWinnersMap[match.id] !== false;

        const dbMatch = liveMatchesData[match.id] || {};
        const matchStatus = dbMatch.status || 'NOT_STARTED';
        const homeScore = dbMatch.home_score || '-';
        const awayScore = dbMatch.away_score || '-';
        const baseMinute = dbMatch.base_minute || '';
        const startedAt = dbMatch.started_at || null;

        const isChampionsLeague = match.category.toUpperCase().includes('ŞAMPİYONLAR LİGİ');
        const isTffMatch = isTffMatchCheck(match.category);

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
        else if(winnersCount === 6) displayPoints = 2;
        else if(winnersCount === 0) displayPoints = 0;

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
            className={`w-full max-w-lg mx-auto border rounded-2xl overflow-hidden transition-all duration-500 flex flex-col relative ${
              isChampionsLeague 
                ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.4)] bg-[#050b14]' 
                : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-[#0a1120] to-[#050b14] border-blue-500/30 shadow-[0_0_30px_rgba(30,58,138,0.5)]'
            }`}
          >
            <div className="p-4 sm:p-6 relative flex-grow overflow-hidden">
              
              {isChampionsLeague && (
                <>
                  <div 
                    className="absolute inset-0 z-0 opacity-100"
                    style={{ 
                      backgroundImage: "url('/logos/cl-bg.png')",
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }}
                  ></div>
                  <div className="absolute inset-0 bg-slate-900/40 z-0"></div>
                </>
              )}

              <div className="relative z-10">
                
                <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-br-xl text-[10px] border-b border-r border-amber-400 shadow-md backdrop-blur-sm z-20 flex items-center gap-1">
                  <span className="animate-pulse">🔥</span> BUGÜNÜN MAÇI
                </div>

                <div className={`absolute -top-4 sm:-top-6 -right-4 sm:-right-6 ${isChampionsLeague ? 'bg-indigo-900/80 text-indigo-200 border-indigo-500/50' : 'bg-blue-900/80 text-blue-200 border-blue-500/50'} font-black px-3 py-1 rounded-bl-xl text-[10px] border-b border-l shadow-md backdrop-blur-sm`}>
                  {match.weekLabel}
                </div>

                <div className="text-center mb-6 mt-3">
                  <span className={`${isChampionsLeague ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.5)]'} text-xs sm:text-sm font-bold uppercase tracking-wider flex justify-center items-center gap-2`}>
                    🏆 {match.category}
                  </span>
                </div>

                <div className="flex items-center justify-between px-2 sm:px-6">
                  
                  {/* 🔴 EKREM: EV SAHİBİ ÇERÇEVESİZ ÖZGÜR LOGO */}
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                      <img src={homeLogoUrl} alt={match.homeTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.homeTeam}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-2.5 mx-2 sm:mx-4 w-28 sm:w-32 z-30">
                    
                    {matchStatus === 'NOT_STARTED' && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-400 text-xs sm:text-sm font-bold tracking-widest drop-shadow-md">⏱ {match.time}</span>
                      </div>
                    )}

                    {matchStatus === 'LIVE' && (
                      <div className="bg-red-950/80 border border-red-700 px-4 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-red-500 text-xs font-black tracking-widest">CANLI {currentDisplayMinute}'</span>
                      </div>
                    )}

                    {matchStatus === 'HT' && (
                      <div className="bg-amber-950/80 border border-amber-700 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-amber-500 text-[10px] sm:text-xs font-black tracking-widest">İY (BİTTİ)</span>
                      </div>
                    )}

                    {matchStatus === 'FINISHED' && (
                      <div className="bg-slate-900/80 border border-slate-600/80 px-4 py-1 rounded-full shadow-sm backdrop-blur-md">
                        <span className="text-slate-400 text-xs font-black tracking-widest">MS (BİTTİ)</span>
                      </div>
                    )}

                    <div className={`w-full bg-[#080d1a]/80 border ${isChampionsLeague ? 'border-white/30' : 'border-blue-600/40'} py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md`}>
                      <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{homeScore}</span>
                      <span className={`text-lg sm:text-xl font-bold ${isChampionsLeague ? 'text-white/50' : 'text-blue-400/50'}`}>:</span>
                      <span className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{awayScore}</span>
                    </div>

                    {matchStatus === 'NOT_STARTED' && countdownText && (
                      <div className="w-full bg-[#0c2a3b]/50 border border-[#164e63]/50 py-1.5 rounded-lg text-center shadow-md">
                        <span className="text-[#38bdf8] text-[10px] sm:text-[11px] font-mono font-bold tracking-widest drop-shadow-sm">
                          {countdownText}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 🔴 EKREM: DEPLASMAN ÇERÇEVESİZ ÖZGÜR LOGO */}
                  <div className="flex flex-col items-center justify-center flex-1 gap-3">
                    <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center relative z-20">
                      <img src={awayLogoUrl} alt={match.awayTeam} className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.6)] hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-white font-extrabold text-[10px] sm:text-xs text-center uppercase tracking-wide drop-shadow-md">{match.awayTeam}</span>
                  </div>

                </div>
              </div>
            </div>

            <div className="bg-[#050b14]/90 border-t border-blue-900/30 px-4 py-3 w-full backdrop-blur-md z-10 relative">
              <div className="flex justify-between items-center w-full">
                <div className="text-left flex-1">
                  {matchStatus === 'NOT_STARTED' ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Maç saatini bekliyor...</span>
                  ) : winnersCount === 0 ? (
                    <span className="text-[10px] sm:text-xs font-medium text-slate-400 italic">Şu an skoru bilen yok</span>
                  ) : (
                    <span className="text-[10px] sm:text-xs font-medium text-blue-200">
                      <strong className="text-blue-400">{winnersCount} kişi</strong> tam isabetli
                    </span>
                  )}
                </div>

                <div className="flex-0 text-center px-1">
                  <span className={`text-[9px] font-black tracking-widest whitespace-nowrap px-2.5 py-0.5 rounded block shadow-[0_0_10px_currentColor] border ${isTffMatch ? 'text-red-400 bg-red-950/90 border-red-500/80' : 'text-cyan-300 bg-cyan-950/90 border-cyan-400/80'}`}>
                    {isTffMatch ? "TFF MAÇI" : "MASTER & DFO MAÇI"}
                  </span>
                </div>

                <div className="text-right flex-1">
                  {winnersCount > 0 && (
                    <button onClick={() => toggleWinners(match.id)} className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-[10px] sm:text-xs outline-none whitespace-nowrap drop-shadow-sm">
                      {isWinnersOpen ? "Gizle ▲" : "Bilenleri gör →"}
                    </button>
                  )}
                </div>
              </div>
              
              {isWinnersOpen && winnersCount > 0 && (
                <div className="w-full mt-3 p-3 bg-blue-950/20 rounded-lg border border-blue-800/40 text-xs animate-fadeIn shadow-inner">
                  <div className="text-blue-300/80 font-semibold mb-2 border-b border-blue-900/50 pb-1.5 flex justify-between items-center text-[10px] sm:text-[11px]">
                    <span>CANLI SKOR BİLENLER (A-Z)</span>
                    <span className="text-blue-300 font-bold bg-blue-900/40 px-2 py-0.5 rounded border border-blue-700/50">Kişi Başı: {displayPoints} Puan</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentWinners.map((winner: string, idx: number) => (
                      <span key={idx} className="border px-2 py-1 rounded text-[9px] sm:text-[10px] font-medium transition-all duration-500 bg-blue-900/60 text-white border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        {winner}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}