'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tertemiz, sadeleştirilmiş ana menü listesi
  const navItems = [
    { name: 'DFO PUAN DURUMU', href: '/puan-durumu/dfo' },
    { name: 'MASTER PUAN DURUMU', href: '/puan-durumu/master' },
    { name: 'TFF PUAN DURUMU', href: '/puan-durumu/tff' },
    { name: 'SKOR DURUMU', href: '/skor-durumu' },
    { name: 'MAÇ ARŞİVİ', href: '/mac-arsivi' },
    { name: 'TAHMİNLER', href: '/tahmin' }
  ];

  return (
    <nav className="bg-[#020617] border-b border-slate-800/50 sticky top-0 z-50 backdrop-blur-md bg-opacity-95 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* MASAÜSTÜ MENÜ LİSTESİ */}
          <div className="hidden md:flex items-center justify-center w-full space-x-2 lg:space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 border ${
                    isActive
                      ? 'bg-slate-800/80 text-white border-slate-600 shadow-[0_0_15px_rgba(255,255,255,0.05)] scale-105'
                      : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* MOBİL MENÜ BUTONU (Hamburger) */}
          <div className="md:hidden flex items-center justify-between w-full">
            <span className="text-amber-500 font-black tracking-widest text-lg drop-shadow-md">ETML</span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none p-2 bg-slate-800/50 rounded-lg"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBİL MENÜ AÇILIR LİSTE */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-b border-slate-800 absolute w-full shadow-2xl">
          <div className="px-4 pt-2 pb-4 space-y-1 sm:px-3 flex flex-col">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}