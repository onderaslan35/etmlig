'use client';

import React, { useState, useEffect } from 'react';

const allPlayersMasterList: Record<string, string> = {
  "262756": "EYÜP KARACAOĞLU", "262755": "DOĞAÇ ALKAN", "262816": "SEDAT SEDAT", "262736": "MEHMET ALİ KARA",
  "262786": "SEDAT DİŞLİ", "262733": "MUHSİN ASİLKAN", "262728": "ÖNDER ASLAN", "262726": "HUDAVER TOPARDIC",
  "262709": "SALİH KARACAOĞLU", "262719": "UĞUR VARDAR", "262754": "OSMAN ALİ AYDIN 🏆", "262771": "ULAŞ ADIGÜZEL",
  "262721": "MUSTAFA GÜMÜŞÇÜ", "262790": "CUMALİ SÖKER", "262717": "MURAT ALİ", "262732": "R. İLHAN KARACA 🏆🏆",
  "262711": "RIDVAN DOGER", "262731": "FATİH AYAN", "262772": "CEMAL SİVRİKAYA 🏆", "262763": "MUSTAFA ELMAS",
  "262707": "HAKAN AYAN", "262706": "GAZİ AYAN 🏆🏆", "262813": "KEMAL ERSOY", "262774": "ŞENOL CAN ÇAKICI",
  "262747": "SAVAŞ ÇAĞLAYAN", "262705": "AHMET BİRCAN 🏆", "262714": "İSMAİL EKER 🏆", "262740": "ABDULLAH DİK",
  "262702": "MURAT KARA", "262738": "MEVLÜT EVLER", "262753": "YUSUF KIZILTUĞ", "262716": "BİROL DEMİREL",
  "262750": "MAHMUT CBR", "262734": "LEVENT YILDIRIM", "262725": "İLYAS KAZDAL", "262737": "ŞAHİN GEZGİNCİ",
  "351925": "ALİOS GÖZTEPE", "262730": "ÖNDER IŞIK", "262782": "YUSUF ERBAY", "262723": "AYHAN LUŞOĞLU",
  "262749": "B.VEYSELOĞLU EROL", "262718": "BEKİR KARADAĞ", "262715": "ŞEMSETTİN DÜGER", "262739": "UĞUR GÜRBÜZ",
  "262703": "CEMALETTİN BELLİ", "262758": "MELİH PINAR", "262770": "OZKAYA MAZAKALI BAYRAM", "262708": "BAYRAM YILMAZ",
  "262787": "MUSTAFA TUCİ", "262744": "İLYAS UYGUN", "262712": "MURAT AYDEMİR", "262704": "YAPAY ZEKA"
};

const masterWeek1Data: Record<string, number> = {
  "262736": 31, "262719": 23, "262755": 21, "262756": 17, "262754": 14, "262786": 12,
  "262731": 11, "262717": 11, "262732": 10, "262726": 10, "262750": 9, "262747": 8,
  "262771": 8, "262728": 8, "262816": 7, "262716": 7, "262790": 7, "262733": 7,
  "262709": 5, "262753": 4, "262813": 4, "262740": 4, "262718": 3, "262707": 1,
  "262782": 1, "262702": 1, "262714": 1, "262721": 1, "262706": 1, "262787": 1,
  "262744": 1, "262774": 1, "262715": 1, "262723": 1
};

const masterWeek2Data: Record<string, number> = {
  "262756": 16, "262755": 13, "262709": 13, "262790": 12, "262772": 12, "262728": 11,
  "262726": 9, "262711": 8, "262717": 7, "262737": 7, "262705": 6, "262816": 6,
  "262774": 6, "262732": 6, "262786": 6, "262721": 5, "262738": 5, "262714": 4,
  "262763": 2, "262736": 2, "262740": 2, "262702": 2, "262703": 2, "262730": 2,
  "262715": 2, "262749": 2, "262725": 1, "262758": 1, "262771": 1, "262754": 1,
  "262747": 1, "262716": 1, "262708": 1, "262731": 1, "262739": 1
};

const dfoWeek3: Record<string, number> = {
  "262816": 16, "262733": 12, "262721": 10, "262763": 7, "262786": 7, "262711": 7,
  "351925": 6, "262726": 6, "262725": 6, "262771": 6, "262813": 5, "262709": 5,
  "262706": 5, "262738": 5, "262753": 5, "262734": 4, "262756": 4, "262702": 4,
  "262730": 4, "262731": 2, "262755": 2, "262747": 2, "262732": 2, "262707": 1,
  "262754": 1, "262714": 1, "262782": 1, "262723": 1, "262772": 1, "262739": 1, "262716": 1
};

const tffWeek3: Record<string, number> = {
  "262707": 10, "262816": 9, "262733": 7, "262754": 6, "262728": 6, "262706": 6,
  "262771": 5, "262734": 5, "262705": 4, "262714": 4, "262763": 4, "262756": 4,
  "262774": 4, "262740": 4, "262702": 3, "262782": 3, "262813": 3, "262723": 2,
  "262749": 2, "262721": 1, "351925": 1, "262730": 1, "262772": 1, "262739": 1, "262770": 1
};

export default function MasterPuanDurumuPage() {
  const [activeTab, setActiveTab] = useState<string>('total');
  const [isWeekMenuOpen, setIsWeekMenuOpen] = useState<boolean>(false);
  const [tableRows, setTableRows] = useState<any[]>([]);

  const calculateWeeklyRankings = (pointsMap: Record<string, number>, exactMap?: Record<string, number>) => {
    let maxPts = -1;
    Object.values(pointsMap).forEach(v => { if (v > maxPts) maxPts = v; });
    const topPts = Object.keys(pointsMap).filter(id => pointsMap[id] === maxPts && maxPts > 0);
    const pointLeader = topPts.length === 1 ? topPts[0] : null;

    let exactLeader = null;
    if (exactMap) {
      let maxExt = -1;
      Object.values(exactMap).forEach(v => { if (v > maxExt) maxExt = v; });
      const topExt = Object.keys(exactMap).filter(id => exactMap[id] === maxExt && maxExt > 0);
      exactLeader = topExt.length === 1 ? topExt[0] : null;
    }
    return { pointLeader, exactLeader };
  };

  useEffect(() => {
    const approvedStore = JSON.parse(localStorage.getItem('elitTahmin_ApprovedMatches') || '{}');
    const extraPoints: Record<string, number> = {};
    const extraExacts: Record<string, number> = {};

    Object.values(approvedStore).forEach((m: any) => {
      if (m?.allocations) {
        m.allocations.forEach((alloc: any) => {
          extraPoints[alloc.id] = (extraPoints[alloc.id] || 0) + alloc.points;
          if (alloc.isExact) extraExacts[alloc.id] = (extraExacts[alloc.id] || 0) + 1;
        });
      }
    });

    const w3Map: Record<string, number> = {};
    Object.keys(allPlayersMasterList).forEach(id => {
      w3Map[id] = (dfoWeek3[id] || 0) + (tffWeek3[id] || 0) + (extraPoints[id] || 0);
    });

    const r3 = calculateWeeklyRankings(w3Map, extraExacts);

    if (activeTab === 'total') {
      const list = Object.keys(allPlayersMasterList).map(id => {
        const b3 = (r3.pointLeader === id ? 3 : 0) + (r3.exactLeader === id ? 3 : 0);
        return { id, name: allPlayersMasterList[id], puan: (masterWeek1Data[id] || 0) + (masterWeek2Data[id] || 0) + (w3Map[id] || 0) + b3 };
      });
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else if (activeTab === 'week3') {
      const list = Object.keys(allPlayersMasterList).map(id => {
        let name = allPlayersMasterList[id];
        let p = w3Map[id] || 0;
        const ptLead = r3.pointLeader === id;
        const exLead = r3.exactLeader === id;
        if (ptLead && exLead) { name += " 🏔️🎯 (+6 PUAN HAFTANIN ZİRVE & SKOR BONUSU)"; p += 6; }
        else if (ptLead) { name += " 🏔️ (+3 PUAN HAFTANIN ZİRVE BONUSU)"; p += 3; }
        else if (exLead) { name += " 🎯 (+3 PUAN HAFTANIN SKOR BONUSU)"; p += 3; }
        return { id, name, puan: p };
      });
      setTableRows(list.sort((a, b) => b.puan - a.puan));
    } else {
        // week1 ve week2 için diğer mantık...
        setTableRows([]);
    }
  }, [activeTab]);

  return (
    <div className="max-w-5xl mx-auto p-4 text-slate-100 flex flex-col items-center">
        {/* Görsel yapın buraya */}
        <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-800/60">
                {tableRows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-slate-800/40">
                        <td className="px-6 py-3.5 text-center">{idx + 1}</td>
                        <td className="px-6 py-3.5">{row.name}</td>
                        <td className="px-6 py-3.5 text-right font-bold text-amber-400">{row.puan}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );
}