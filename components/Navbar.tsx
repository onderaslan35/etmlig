'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Komutanın Emrettiği Simetrik Sıralama ve Düzeltilmiş Rotalar
  const navLinks = [
    { name: 'MAÇ ARŞİVİ', path: '/mac-arsivi' },
    { name: 'DFO PUAN DURUMU', path: '/puan-durumu/dfo' },
    { name: 'TFF PUAN DURUMU', path: '/puan-durumu/tff' },
    { name: 'MASTER PUAN DURUMU', path: '/puan-durumu/master', isMaster: true }, // MERKEZ
    { name: 'SKOR DURUMU', path: '/skor-durumu' },
    { name: 'TAHMİNLER', path: '/tahmin' }, // 🔴 HATA BURADAYDI, '/tahminler' YERİNE '/tahmin' YAPILDI!
    { name: '🏆 KAZANANLAR', path: '/kazananlar', isKazananlar: true }, // RESMİ KUPA SEMBOLÜ
  ];

  return (
    <nav className="bg-[#050b14]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* 🔴 MASAÜSTÜ MENÜ 🔴 */}
          <div className="hidden lg:flex items-center w-full">
            
            <div className="flex-1"></div>

            <div className="flex items-center justify-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                
                if (link.isKazananlar) {
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`px-2 xl:px-3 py-2 rounded-xl text-[9px] xl:text-[11px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-yellow-900/40 text-yellow-500 border border-yellow-600/50 shadow-[0_0_15px_rgba(202,138,4,0.3)] scale-105'
                          : 'text-yellow-600/80 hover:text-yellow-500 hover:bg-yellow-950/30'
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                }

                if (link.isMaster) {
                    return (
                      <Link
                        key={link.path}
                        href={link.path}
                        className={`px-2 xl:px-3 py-2 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap mx-1 ${
                          isActive 
                            ? 'bg-blue-900/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-500/50 scale-105' 
                            : 'bg-slate-800/40 text-blue-200 hover:text-white hover:bg-blue-900/40 border border-slate-700/50'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                }

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-2 xl:px-3 py-2 rounded-xl text-[9px] xl:text-[11px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-slate-800 text-white shadow-inner border border-slate-600' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex-1 flex justify-end">
              <Link
                href="/admin"
                className={`px-2 xl:px-3 py-2 rounded-xl text-[9px] xl:text-[11px] font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                  pathname === '/admin'
                    ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-105'
                    : 'text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/30'
                }`}
              >
                <span className="text-sm drop-shadow-md">🛡️</span> YÖNETİM
              </Link>
            </div>

          </div>

          {/* 🔴 MOBİL MENÜ BUTONU 🔴 */}
          <div className="lg:hidden flex items-center justify-between w-full px-2">
            <span className="text-white font-black tracking-widest text-xl">ETML <span className="text-slate-500 text-sm">KARARGAH</span></span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-400 hover:text-white focus:outline-none p-2 rounded-lg bg-slate-800/50"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* 🔴 MOBİL AÇILIR MENÜ 🔴 */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#050b14] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2 shadow-2xl absolute w-full left-0 top-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            
            if (link.isKazananlar) {
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-yellow-900/40 text-yellow-500 border border-yellow-600/50'
                      : 'text-yellow-600/80 hover:bg-yellow-950/30 hover:text-yellow-500'
                  }`}
                >
                  {link.name}
                </Link>
              );
            }

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all ${
                  isActive 
                    ? 'bg-slate-800 text-white border border-slate-600' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          <Link
            href="/admin"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`block px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
              pathname === '/admin'
                ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50'
                : 'text-rose-500/70 hover:bg-rose-950/30 hover:text-rose-400'
            }`}
          >
            <span className="text-lg">🛡️</span> YÖNETİM
          </Link>
        </div>
      )}
    </nav>
  );
}