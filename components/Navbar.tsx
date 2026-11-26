'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PORTAL_SESSION_EVENT,
  PortalSession,
  readPortalSession
} from '@/components/PortalAuthGate';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [portalSession, setPortalSession] = useState<PortalSession | null>(null);

  useEffect(() => {
    const sync = () => setPortalSession(readPortalSession());
    sync();
    window.addEventListener(PORTAL_SESSION_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(PORTAL_SESSION_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isVisitor = !portalSession || portalSession.role === 'visitor';

  const navLinks = [
    { name: 'PUAN DURUMLARI VE ARŞİV', path: '/yeni-arsiv' },
    {
   name: isVisitor ? '📜 RESMİ DEKLARASYON' : 'TAHMİNLER',
   path: '/tahmin'
 },
    { name: '🔴 CANLI', path: '/canli', isCanli: true }
  ];

  const isAdminActive = pathname?.startsWith('/admin');

  return (
    <nav className="bg-[#050b14]/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-xl">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* MASAÜSTÜ MENÜ */}
          <div className="hidden lg:flex items-center w-full">
            <div className="flex-1" />
            <div className="flex items-center justify-center gap-2 xl:gap-3">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.path ||
                  (link.path === '/tahmin' && pathname === '/tahmin');

                if (link.isCanli) {
                  return (
                    <Link
                      key={link.path}
                      href={link.path}
                      className={`px-3.5 xl:px-4 py-2.5 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-rose-950/80 text-rose-500 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)] scale-105'
                          : 'text-rose-500/80 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30'
                      }`}
                    >
                      <span className={isActive ? 'animate-pulse' : ''}>{link.name}</span>
                    </Link>
                  );
                }

                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`px-4 xl:px-5 py-2.5 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap bg-black text-white ${
                      isActive
                        ? 'border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.2)]'
                        : 'border border-slate-700 hover:border-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="flex-1 flex justify-end">
              {!isVisitor && (
                <Link
                  href="/admin"
                  className={`px-3.5 xl:px-4 py-2.5 rounded-xl text-[10px] xl:text-xs font-black tracking-widest uppercase transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 ${
                    isAdminActive
                      ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)] scale-105'
                      : 'text-rose-500/70 hover:text-rose-400 hover:bg-rose-950/30'
                  }`}
                >
                  <span className="text-sm drop-shadow-md">🛡️</span> YÖNETİM
                </Link>
              )}
            </div>
          </div>

          {/* MOBİL ÜST BAR */}
          <div className="lg:hidden flex items-center justify-between w-full px-2">
            <Link
              href="/yeni-arsiv"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white font-black tracking-widest text-xs sm:text-sm uppercase truncate pr-2"
            >
              PUAN DURUMLARI VE ARŞİV
            </Link>
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

      {/* MOBİL AÇILIR MENÜ */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#050b14] border-b border-slate-800 px-4 pt-2 pb-6 space-y-2.5 shadow-2xl absolute w-full left-0 top-full">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.path ||
              (link.path === '/tahmin' && pathname === '/tahmin');

            if (link.isCanli) {
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-rose-950/80 text-rose-500 border border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                      : 'text-rose-500/80 hover:bg-rose-950/40 hover:text-rose-400'
                  }`}
                >
                  <span className={isActive ? 'animate-pulse' : ''}>{link.name}</span>
                </Link>
              );
            }

            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all bg-black text-white ${
                  isActive ? 'border-2 border-white' : 'border border-slate-700'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {!isVisitor && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`px-4 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase transition-all flex items-center gap-2 ${
                isAdminActive
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-500/50'
                  : 'text-rose-500/70 hover:bg-rose-950/30 hover:text-rose-400'
              }`}
            >
              <span className="text-lg">🛡️</span> YÖNETİM
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}