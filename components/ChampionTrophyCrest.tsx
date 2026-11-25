'use client';

import React, { useId } from 'react';

export const stripTrophies = (s?: string | null) =>
  String(s || '')
    .replace(/(🏆|🇹🇷)+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeTrName = (s: string) =>
  stripTrophies(s)
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const OFFICIAL_CHAMPIONS: Record<string, { stars: number; reigning: boolean }> = {
  'OSMAN ALI AYDIN': { stars: 2, reigning: true },
  'ISMAIL EKER': { stars: 1, reigning: true },
  'GAZI AYAN': { stars: 2, reigning: false },
  'RECEP ILHAN KARACA': { stars: 2, reigning: false },
  'RECEP ILAN KARACA': { stars: 2, reigning: false },
  'R ILHAN KARACA': { stars: 2, reigning: false },
  'YAHSI ERKAN': { stars: 1, reigning: false },
  'AHMET BIRCAN': { stars: 1, reigning: false },
  'CEMAL SIVRIKAYA': { stars: 1, reigning: false },
  'HUDAVERDI TOPARDIC': { stars: 1, reigning: false },
  'HUDAVER TOPARDIC': { stars: 1, reigning: false },
  'MURAT KARA': { stars: 1, reigning: false },
  'METE BUYUKGOL': { stars: 1, reigning: false }
};

export default function ChampionTrophyCrest({
  name,
  compact = false
}: {
  name: string;
  compact?: boolean;
}) {
  const gradId = useId().replace(/:/g, '');
  const info = OFFICIAL_CHAMPIONS[normalizeTrName(name)];

  if (!info || info.stars <= 0) return null;

  const { stars, reigning } = info;
  const sizeClass = compact
    ? 'w-6 h-6 sm:w-7 sm:h-7'
    : 'w-7 h-7 sm:w-8 sm:h-8';

  const makeStarPoints = (cx: number, cy: number, rOut: number, rIn: number) => {
    const pts: string[] = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? rOut : rIn;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
    }
    return pts.join(' ');
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 select-none ${sizeClass} drop-shadow-[0_2px_6px_rgba(0,0,0,0.75)]`}
      title={reigning ? `${stars} Şampiyonluk • Son Şampiyon` : `${stars} Şampiyonluk`}
    >
      <svg viewBox="0 0 64 68" className="w-full h-full overflow-visible block">
        <defs>
          <linearGradient id={`goldCup-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="45%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id={`goldStar-${gradId}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="55%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {stars === 1 ? (
          <polygon
            points={makeStarPoints(32, 9, 8.3, 3.6)}
            fill={`url(#goldStar-${gradId})`}
            stroke="#92400E"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        ) : (
          <>
            <polygon
              points={makeStarPoints(22, 9.5, 7.6, 3.3)}
              fill={`url(#goldStar-${gradId})`}
              stroke="#92400E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <polygon
              points={makeStarPoints(42, 9.5, 7.6, 3.3)}
              fill={`url(#goldStar-${gradId})`}
              stroke="#92400E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </>
        )}

        <path
          d="M17 24 H8.5 C6.5 24 5.5 25.5 6 28 C7.2 35.5 11.5 40.5 19.5 42"
          fill="none"
          stroke={`url(#goldCup-${gradId})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M47 24 H55.5 C57.5 24 58.5 25.5 58 28 C56.8 35.5 52.5 40.5 44.5 42"
          fill="none"
          stroke={`url(#goldCup-${gradId})`}
          strokeWidth="4.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M15 20 H49 L46 39 C44.5 48.5 38.8 53 32 53 C25.2 53 19.5 48.5 18 39 Z"
          fill={`url(#goldCup-${gradId})`}
          stroke="#854D0E"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        <rect
          x="13.5"
          y="18"
          width="37"
          height="4.5"
          rx="2.2"
          fill="#FEF08A"
          stroke="#854D0E"
          strokeWidth="1.3"
        />

        <path
          d="M28.5 52.5 H35.5 L37 60 H27 Z"
          fill={`url(#goldCup-${gradId})`}
          stroke="#854D0E"
          strokeWidth="1.4"
        />
        <rect
          x="20"
          y="59.5"
          width="24"
          height="5.5"
          rx="2.5"
          fill={`url(#goldCup-${gradId})`}
          stroke="#854D0E"
          strokeWidth="1.5"
        />

        {reigning ? (
          <g>
            <path
              d="M32 22.8 C36.2 24.4 40.5 24.6 44 24 V36 C44 43.8 38.6 49 32 51.4 C25.4 49 20 43.8 20 36 V24 C23.5 24.6 27.8 24.4 32 22.8 Z"
              fill="#E30A17"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="30.1" cy="36.6" r="5.7" fill="#FFFFFF" />
            <circle cx="31.7" cy="36.6" r="4.5" fill="#E30A17" />
            <polygon
              points="35.3,36.6 39.2,37.9 36.8,34.5 36.8,38.7 39.2,35.3"
              fill="#FFFFFF"
            />
          </g>
        ) : (
          <path
            d="M21.5 25 L23 38 C23.6 42.5 25.8 45.8 28.5 47.5"
            fill="none"
            stroke="#FEF9C3"
            strokeWidth="2.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        )}
      </svg>
    </span>
  );
}