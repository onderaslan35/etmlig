'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'DFO PUAN DURUMU', href: '/puan-durumu/dfo' },
    { name: 'MASTER PUAN DURUMU', href: '/puan-durumu/master' },
    { name: 'TFF PUAN DURUMU', href: '/puan-durumu/tff' },
    { name: 'SKOR DURUMU', href: '/skor-durumu' },
    { name: 'MAÇ ARŞİVİ', href: '/mac-arsivi' },
    { name: 'TAHMİNLER', href: '/tahmin' },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* MASAÜSTÜ MENÜ LİSTESİ */}
          <div className="hidden md:flex items-center justify-center w-full space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isHighlight) {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 border shadow-lg ${
                      isActive
                        ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-emerald-400/30 scale-105'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/20 hover:scale-105'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg font-extrabold text-xs uppercase tracking-wider transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* MOBİL MENÜ BUTONU */}
          <div className="flex md:hidden justify-between items-center w-full">
            <span className="font-extrabold text-emerald-400 text-sm tracking-wider uppercase">
              ELİT TAHMİN LİGİ
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold"
            >
              {isMobileMenuOpen ? '✕ KAPAT' : '☰ MENÜ'}
            </button>
          </div>

        </div>
      </div>

      {/* MOBİL AÇILIR MENÜ ALANI */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${
                  item.isHighlight
                    ? 'bg-emerald-500 text-slate-950 text-center font-black shadow-md'
                    : isActive
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}