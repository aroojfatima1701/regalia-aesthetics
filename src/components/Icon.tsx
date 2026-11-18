import type { IconKey } from '../lib/data';

// Fine line icons drawn to sit beside the line-art logo.
const paths: Record<IconKey, string> = {
  syringe: 'M31 7l10 10M36 12l-19 19-6 1 1-6 19-19M20 22l4 4M24 18l4 4M13 33l-6 8',
  drop: 'M24 6c7 9 12 15 12 22a12 12 0 0 1-24 0c0-7 5-13 12-22zM18 30a6 6 0 0 0 6 6',
  lips: 'M6 24c5-6 9-9 13-8 2 0 4 2 5 2s3-2 5-2c4-1 8 2 13 8-5 8-11 12-18 12S11 32 6 24zM6 24h36',
  sparkle: 'M24 6l3 12 12 3-12 3-3 12-3-12-12-3 12-3zM38 32l1 4 4 1-4 1-1 4-1-4-4-1 4-1z',
  needles: 'M10 38h28M14 38V22M20 38V16M26 38V16M32 38V22M12 22h22v-6H12z',
  peel: 'M10 34c8-2 14-8 16-18 6 4 10 10 10 16a10 10 0 0 1-10 10c-6 0-12-3-16-8zM26 16c-1-4-4-8-8-10',
  beam: 'M24 6v8M24 34v8M6 24h8M34 24h8M11 11l6 6M31 31l6 6M37 11l-6 6M17 31l-6 6M24 19a5 5 0 1 0 0 10 5 5 0 0 0 0-10z',
  leaf: 'M10 38C10 20 20 10 38 10c0 18-10 28-28 28zM10 38l18-18',
  lift: 'M24 40V12M14 22l10-10 10 10M10 40c4-6 9-8 14-8s10 2 14 8',
  thread: 'M8 36c8 0 8-24 16-24s8 24 16 24M36 8l4 4M40 8l-4 4',
  facial: 'M24 6c-9 0-15 8-15 18 0 11 7 18 15 18s15-7 15-18C39 14 33 6 24 6zM17 22c1-1 3-1 4 0M27 22c1-1 3-1 4 0M20 32c2 2 6 2 8 0',
  wave: 'M6 18c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 26c4-4 8-4 12 0s8 4 12 0 8-4 12 0M6 34c4-4 8-4 12 0s8 4 12 0 8-4 12 0',
};
export function Icon({ k, size = 40, className }: { k: IconKey; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[k]} />
    </svg>
  );
}
