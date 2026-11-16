'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { getMatchTimeMs, getUniqueMatchId } from '@/utils/themeEngine';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [bulletinSchedule, setBulletinSchedule] = useState<any[]>([]);
  const [liveStatusMap, setLiveStatusMap] = useState<Record<string, string>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const loadSchedule = async () => {
      const { data: bData } = await supabase
        .from('matches_bulletin')
        .select('week_num, match_index, match_date, match_time')
        .gte('week_num', 40);

      const list = bData || [];
      setBulletinSchedule(list);

      if (list.length > 0) {
        const ids = list.map((m: any) => getUniqueMatchId(Number(m.week_num), Number(m.match_index)));
        const { data: lData } = await supabase.from('live_matches').select('id, status').in('id', ids);
        const sMap: Record<string, string> = {};
        (lData || []).forEach((r: any) => {
          sMap[String(r.id)] = String(r.status || '');
        });
        setLiveStatusMap(sMap);
      }
    };

    loadSchedule();

    // Veritabanına sorgu atmadan yerel saatle maç başlangıcını kontrol et
    const clock = setInterval(() => setNowMs(Date.now()), 15000);

    const channel = supabase
      .channel('navbar-live-watch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'live_matches' }, (payload: any) => {
        const row = payload.new;
        if (row && row.id !== undefined) {
          setLiveStatusMap((prev) => ({ ...prev, [String(row.id)]: String(row.status || '') }));
        }
      })
      .subscribe();

    return () => {
      clearInterval(clock);
      supabase.removeChannel(channel);
    };
  }, []);

  // Sitede maç saati geldiği ve maç henüz bitmediği anda true olur
  const isAnyMatchLive = bulletinSchedule.some((m) => {
    const uid = String(getUniqueMatchId(Number(m.week_num), Number(m.match_index)));
    const st = (liveStatusMap[uid] || '').toUpperCase();
    if (['FINISHED', 'FT', 'AET', 'PEN', 'POSTPONED', 'PST', 'ERTELENDİ', 'İPTAL'].includes(st)) {
      return false;
    }
    const kickoff = getMatchTimeMs(m.match_date, m.match_time);
    if (!kickoff || isNaN(kickoff)) return false;
    if (['LIVE', '1H', '2H', 'HT', 'ET', 'P'].includes(st)) {
      return nowMs >= kickoff && nowMs <= kickoff + 210 * 60 * 1000;
    }
    return nowMs >= kickoff && nowMs <= kickoff + 135 * 60 * 1000;
  });

  const navLinks = [
    { name: 'CANLI', path: '/canli', isCanli: true },
    { name: 'PUAN DURUMLARI VE ARŞİV', path: '/yeni-arsiv' },
    { name: 'TAHMİNLER', path: '/tahmin' },
    { name: 'YÖNETİM', path: '/admin' },
  ];

  const getButtonClass = (link: { path: string; isCanli?: boolean }, isMobile = false) => {
    const isActive = link.path === '/admin' ? pathname?.startsWith('/admin') : pathname === link.path;
    const baseSize = isMobile
      ? 'block px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all text-center'
      : 'px-4 xl:px-5 py-2.5 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap';

    if (link.isCanli && isAnyMatchLive) {
      return `${baseSize} bg-emerald-600 text-white canli-soft-pulse ${
        isActive ? 'border-2 border-white' : 'border border-emerald-300 hover:bg-emerald-500'
      }`;
    }

    return `${baseSize} bg-black text-white ${
      isActive
        ? 'border-2 border-white shadow-[0_0_12px_rgba(255,255,255,0.2)]'
        : 'border border-slate-700 hover:border-white'
    }`;
  };

  return (
    <nav className="bg-[#050b14]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes canliPulse {
              0%, 100% { background-color: #059669; box-shadow: 0 0 8px rgba(16, 185, 129, 0.35); }
              50% { background-color: #10b981; box-shadow: 0 0 20px rgba(16, 185, 129, 0.85); }
            }
            .canli-soft-pulse { animation: canliPulse 2.2s ease-in-out infinite; }
          `
        }}
      />

      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* MASAÜSTÜ MENÜ */}
          <div className="hidden lg:flex items-center justify-center w-full gap-2.5 xl:gap-3.5">
            {navLinks.map((link) => (
              <Link key={link.path} href={link.path} className={getButtonClass(link, false)}>
                {link.name}
              </Link>
            ))}
          </div>

          {/* MOBİL ÜST BAR */}
          <div className="lg:hidden flex items-center justify-between w-full px-2 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Link
                href="/canli"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase text-white shrink-0 ${
                  isAnyMatchLive ? 'bg-emerald-600 border border-emerald-300 canli-soft-pulse' : 'bg-black border border-slate-700'
                }`}
              >
                CANLI
              </Link>
              <Link
                href="/yeni-arsiv"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white font-black tracking-wider text-xs uppercase truncate"
              >
                PUAN DURUMLARI VE ARŞİV
              </Link>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white focus:outline-none p-2 rounded-lg bg-black border border-slate-700 shrink-0"
              aria-label="Menüyü Aç/Kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBİL AÇILIR MENÜ (SIRASIYLA: CANLI -> PUAN DURUMLARI VE ARŞİV -> TAHMİNLER -> YÖNETİM) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#050b14] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2.5 shadow-2xl absolute w-full left-0 top-full">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={getButtonClass(link, true)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}