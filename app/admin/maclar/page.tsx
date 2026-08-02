"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Match = {
  id: number;
  hafta: number;
  mac_no: number;
  lig: string;
  ev_sahibi: string;
  deplasman: string;
  durum: string;
};

export default function MaclarPage() {
  const [maclar, setMaclar] = useState<Match[]>([]);

  async function maclariGetir() {
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .order("hafta")
      .order("mac_no");

    if (error) {
      alert(error.message);
      return;
    }

    setMaclar(data || []);
  }

  useEffect(() => {
    maclariGetir();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">

      <h1 className="text-4xl font-bold text-yellow-400 mb-8">
        ETML - Maçlar
      </h1>

      <table className="w-full border border-zinc-700">

        <thead className="bg-zinc-800">

          <tr>

            <th className="p-3">Hafta</th>

            <th>Maç</th>

            <th>Lig</th>

            <th>Durum</th>

          </tr>

        </thead>

        <tbody>

          {maclar.map((m) => (

            <tr
              key={m.id}
              className="border-t border-zinc-700"
            >

              <td className="p-3">{m.hafta}</td>

              <td>
                {m.ev_sahibi} - {m.deplasman}
              </td>

              <td>{m.lig}</td>

              <td>{m.durum}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </main>
  );
}