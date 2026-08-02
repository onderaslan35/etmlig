"use client";

import { useState } from "react";

type Mac = {
  ev_sahibi: string;
  deplasman: string;
};

export default function HaftaOlusturPage() {
  const [hafta, setHafta] = useState(1);
  const [lig, setLig] = useState("TFF 1. Lig");

  const [maclar, setMaclar] = useState<Mac[]>(
    Array.from({ length: 10 }, () => ({
      ev_sahibi: "",
      deplasman: "",
    }))
  );

  function macGuncelle(
    index: number,
    alan: "ev_sahibi" | "deplasman",
    deger: string
  ) {
    const yeni = [...maclar];
    yeni[index][alan] = deger;
    setMaclar(yeni);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">

      <div className="max-w-5xl mx-auto p-10">

        <h1 className="text-4xl font-bold text-yellow-400 mb-10">
          ETML - Hafta Oluştur
        </h1>

        <div className="grid grid-cols-2 gap-6 mb-10">

          <div>
            <label className="block mb-2">Hafta</label>

            <input
              type="number"
              value={hafta}
              onChange={(e) => setHafta(Number(e.target.value))}
              className="w-full bg-zinc-800 p-3 rounded"
            />
          </div>

          <div>
            <label className="block mb-2">Lig</label>

            <select
              value={lig}
              onChange={(e) => setLig(e.target.value)}
              className="w-full bg-zinc-800 p-3 rounded"
            >
              <option>TFF 1. Lig</option>
            </select>
          </div>

        </div>

        <div className="space-y-4">

          {maclar.map((mac, index) => (

            <div
              key={index}
              className="grid grid-cols-3 gap-4"
            >

              <div className="flex items-center justify-center bg-zinc-800 rounded">

                {index + 1}

              </div>

              <input
                placeholder="Ev Sahibi"
                value={mac.ev_sahibi}
                onChange={(e) =>
                  macGuncelle(index, "ev_sahibi", e.target.value)
                }
                className="bg-zinc-800 p-3 rounded"
              />

              <input
                placeholder="Deplasman"
                value={mac.deplasman}
                onChange={(e) =>
                  macGuncelle(index, "deplasman", e.target.value)
                }
                className="bg-zinc-800 p-3 rounded"
              />

            </div>

          ))}

        </div>

        <button
          className="mt-10 w-full bg-green-600 hover:bg-green-700 p-4 rounded-xl text-xl font-bold"
        >
          HAFTANIN 10 MAÇINI KAYDET
        </button>

      </div>

    </main>
  );
}