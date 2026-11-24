'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export interface OnlineVisitor {
  visitorKey: string;
  userId: string;
  name: string;
  isAdmin: boolean;
  isContestant: boolean;
  path: string;
  device: 'MOBİL' | 'PC';
  connectedAt: string;
  tabCount: number;
}

let activeChannel: any = null;
let currentVisitors: OnlineVisitor[] = [];
const subscribers = new Set<(list: OnlineVisitor[]) => void>();

function notifySubscribers() {
  subscribers.forEach((cb) => cb([...currentVisitors]));
}

function formatPageLabel(path: string): { label: string; color: string } {
  if (!path || path === '/') return { label: '🏠 Ana Vitrin (/)', color: 'text-sky-300 border-sky-500/40 bg-sky-950/60' };
  if (path.startsWith('/canli')) return { label: '🔴 Canlı Skor & Puan (/canli)', color: 'text-rose-300 border-rose-500/50 bg-rose-950/60' };
  if (path.startsWith('/tahminler')) return { label: '🎯 Tahmin Merkezi (/tahminler)', color: 'text-amber-300 border-amber-500/50 bg-amber-950/60' };
  if (path.startsWith('/yeni-arsiv') || path.startsWith('/istatistikler')) return { label: '📊 Puan Durumu & Arşiv', color: 'text-indigo-300 border-indigo-500/50 bg-indigo-950/60' };
  if (path.startsWith('/admin')) return { label: '🛡️ Karargah (/admin)', color: 'text-emerald-300 border-emerald-500/50 bg-emerald-950/60' };
  return { label: `📄 ${path}`, color: 'text-slate-300 border-slate-700 bg-slate-900' };
}

function getLocalVisitorPayload(pathname: string) {
  if (typeof window === 'undefined') return null;

  let visitorKey = localStorage.getItem('etml_visitor_key');
  if (!visitorKey) {
    const rnd = Math.floor(1000 + Math.random() * 9000);
    visitorKey = `v-${rnd}-${Date.now().toString().slice(-4)}`;
    localStorage.setItem('etml_visitor_key', visitorKey);
  }

  const isMaster =
    localStorage.getItem('etml_master_commander') === 'mankoman' ||
    sessionStorage.getItem('admin_role') === 'master';

  let userId = '';
  let name = `Misafir #${visitorKey.split('-')[1] || '1000'}`;
  let isContestant = false;

  if (isMaster) {
    userId = 'mankoman';
    name = 'KOMUTAN (SEN)';
  } else {
    try {
      const savedRaw = localStorage.getItem('etml_visitor_identity');
      if (savedRaw) {
        const parsed = JSON.parse(savedRaw);
        if (parsed?.name) {
          userId = String(parsed.userId || '');
          name = String(parsed.name).toUpperCase();
          isContestant = true;
        }
      }
    } catch {}
  }

  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
  const connectedAt =
    sessionStorage.getItem('etml_visit_start_time') ||
    new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  sessionStorage.setItem('etml_visit_start_time', connectedAt);

  return {
    visitorKey,
    userId,
    name,
    isAdmin: isMaster,
    isContestant,
    path: pathname || '/',
    device: (isMobile ? 'MOBİL' : 'PC') as 'MOBİL' | 'PC',
    connectedAt
  };
}

function syncPresenceState() {
  if (!activeChannel) return;
  const rawState = activeChannel.presenceState() as Record<string, any[]>;
  const grouped = new Map<string, OnlineVisitor>();

  Object.values(rawState).forEach((presences) => {
    (presences || []).forEach((p: any) => {
      const groupKey = p.userId ? `u-${p.userId}` : `g-${p.visitorKey}`;
      const existing = grouped.get(groupKey);
      if (!existing) {
        grouped.set(groupKey, {
          visitorKey: p.visitorKey || groupKey,
          userId: p.userId || '',
          name: p.name || 'Misafir',
          isAdmin: Boolean(p.isAdmin),
          isContestant: Boolean(p.isContestant),
          path: p.path || '/',
          device: p.device === 'MOBİL' ? 'MOBİL' : 'PC',
          connectedAt: p.connectedAt || '--:--',
          tabCount: 1
        });
      } else {
        existing.tabCount += 1;
        existing.path = p.path || existing.path;
      }
    });
  });

  currentVisitors = Array.from(grouped.values()).sort((a, b) => {
    if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
    if (a.isContestant !== b.isContestant) return a.isContestant ? -1 : 1;
    return a.name.localeCompare(b.name, 'tr');
  });

  notifySubscribers();
}

function ensurePresenceChannel(pathname: string) {
  if (typeof window === 'undefined') return;
  const payload = getLocalVisitorPayload(pathname);
  if (!payload) return;

  if (!activeChannel) {
    activeChannel = supabase.channel('etml_live_visitors_v1', {
      config: { presence: { key: payload.visitorKey } }
    });

    activeChannel
      .on('presence', { event: 'sync' }, syncPresenceState)
      .on('presence', { event: 'join' }, syncPresenceState)
      .on('presence', { event: 'leave' }, syncPresenceState)
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          const fresh = getLocalVisitorPayload(window.location.pathname);
          if (fresh) await activeChannel.track(fresh);
        }
      });
  } else {
    activeChannel.track(payload).catch(() => {});
  }
}

/** app/layout.tsx içine konulan görünmez takipçi (0 Veritabanı Egress) */
export function OnlinePresenceTracker() {
  const pathname = usePathname();

  useEffect(() => {
    ensurePresenceChannel(pathname || '/');
  }, [pathname]);

  useEffect(() => {
    const onIdentityUpdate = () => {
      ensurePresenceChannel(window.location.pathname || '/');
    };
    window.addEventListener('etml-identity-updated', onIdentityUpdate);
    return () => window.removeEventListener('etml-identity-updated', onIdentityUpdate);
  }, []);

  return null;
}

/** Admin sekme butonunun üstündeki canlı sayı rozeti */
export function OnlineCountPill() {
  const [count, setCount] = useState<number>(currentVisitors.length);

  useEffect(() => {
    ensurePresenceChannel(typeof window !== 'undefined' ? window.location.pathname : '/admin');
    const handler = (list: OnlineVisitor[]) => setCount(list.length);
    subscribers.add(handler);
    setCount(currentVisitors.length);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  return (
    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-400/60 text-[10px] font-black">
      {count}
    </span>
  );
}

/** Admin Karargahı içindeki müstakil "SİTEDEKİLER" Modülü */
export function OnlineVisitorsAdminModule() {
  const [visitors, setVisitors] = useState<OnlineVisitor[]>(currentVisitors);

  useEffect(() => {
    ensurePresenceChannel('/admin');
    const handler = (list: OnlineVisitor[]) => setVisitors(list);
    subscribers.add(handler);
    setVisitors([...currentVisitors]);
    return () => {
      subscribers.delete(handler);
    };
  }, []);

  const contestantCount = visitors.filter((v) => v.isContestant || v.isAdmin).length;
  const guestCount = visitors.length - contestantCount;

  return (
    <div className="animate-fade-in bg-slate-900 border border-emerald-500/40 rounded-2xl p-4 sm:p-6 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-emerald-400 tracking-wider uppercase flex items-center gap-2.5">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500" />
            </span>
            CANLI ZİYARETÇİ RADARI (ŞU AN SİTEDEKİLER)
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            WebSocket bellek sinyali ile çalışır • Supabase Egress kotasından 0 Byte harcar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-black">
            TOPLAM ONLINE: {visitors.length}
          </div>
          <div className="px-3 py-2 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black">
            TANINAN YARIŞMACI: {contestantCount}
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs font-black">
            MİSAFİR: {guestCount}
          </div>
        </div>
      </div>

      {visitors.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          Radar sinyali bağlanıyor...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {visitors.map((v) => {
            const pageInfo = formatPageLabel(v.path);
            return (
              <div
                key={v.visitorKey}
                className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                  v.isAdmin
                    ? 'bg-emerald-950/30 border-emerald-500/60'
                    : v.isContestant
                    ? 'bg-slate-950/90 border-amber-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">
                      {v.isAdmin ? '🛡️' : v.isContestant ? '⚽' : '👤'}
                    </span>
                    <span
                      className={`font-black text-xs sm:text-sm truncate uppercase ${
                        v.isAdmin ? 'text-emerald-300' : v.isContestant ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {v.name}
                    </span>
                  </div>

                  <span className="shrink-0 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300">
                    {v.device === 'MOBİL' ? '📱 Mobil' : '💻 PC'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                  <span className={`px-2.5 py-0.5 rounded-lg border text-[10px] font-black truncate ${pageInfo.color}`}>
                    {pageInfo.label}
                  </span>

                  <span className="text-[10px] font-bold text-slate-500 shrink-0">
                    🕒 {v.connectedAt} {v.tabCount > 1 ? `(${v.tabCount} sekme)` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}