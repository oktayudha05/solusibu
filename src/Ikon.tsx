import { ReactNode } from 'react'
import { WARNA } from './gaya'

// set ikon dapur: datar, tanpa outline tebal, cuma palet STYLE.md. viewBox 100x100.
// NAMA_IKON harus sinkron dengan IKON di cek.py.
const { navy, tealTua, sage, krem, merah, aksen, minyak } = WARNA
const garis = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const

// setetes cairan, ujung runcing ke atas, diputar `deg` derajat di (x,y), tinggi ~s
const Tetesan = ({ x, y, s, deg = 0, fill }: { x: number; y: number; s: number; deg?: number; fill: string }) => (
  <path transform={`translate(${x} ${y}) rotate(${deg})`} fill={fill}
    d={`M0 ${-s}C${0.15 * s} ${-0.6 * s} ${0.75 * s} ${-0.1 * s} ${0.75 * s} ${0.35 * s}a${0.75 * s} ${0.75 * s} 0 0 1 ${-1.5 * s} 0C${-0.75 * s} ${-0.1 * s} ${-0.15 * s} ${-0.6 * s} 0 ${-s}Z`} />
)

const GAMBAR = {
  tetes: (
    <>
      <path d="M50 10C50 10 22 44 22 64a28 28 0 0 0 56 0C78 44 50 10 50 10Z" fill={tealTua} />
      <path d="M36 64a14 14 0 0 0 10 13" stroke={krem} strokeWidth={5} {...garis} />
    </>
  ),
  wajan: (
    <>
      <circle cx="30" cy="16" r="5" fill={sage} />
      <circle cx="50" cy="8" r="4" fill={sage} />
      <circle cx="66" cy="19" r="3.5" fill={sage} />
      <rect x="14" y="30" width="60" height="14" rx="7" fill={minyak} />
      <path d="M6 38H80C80 66 66 92 43 92 20 92 6 66 6 38Z" fill={navy} />
      <rect x="78" y="40" width="20" height="12" rx="6" fill={navy} />
    </>
  ),
  api: (
    <>
      <path d="M50 8C57 28 76 38 76 62a26 26 0 0 1-52 0C24 48 33 40 38 30 42 38 46 40 50 8Z" fill={tealTua} />
      <path d="M50 48C54 57 64 61 64 73a14 14 0 0 1-28 0C36 65 44 61 50 48Z" fill={sage} />
    </>
  ),
  nasi: (
    <>
      <path d="M12 54H88C88 76 72 88 50 88S12 76 12 54Z" fill={tealTua} />
      <path d="M18 54C18 32 34 20 50 20S82 32 82 54Z" fill={krem} stroke={navy} strokeWidth={4} strokeLinejoin="round" />
      <circle cx="40" cy="38" r="2.5" fill={navy} />
      <circle cx="56" cy="32" r="2.5" fill={navy} />
      <circle cx="64" cy="44" r="2.5" fill={navy} />
      <circle cx="46" cy="47" r="2.5" fill={navy} />
    </>
  ),
  termometer: (
    <>
      <rect x="38" y="8" width="24" height="64" rx="12" fill={navy} />
      <circle cx="50" cy="76" r="18" fill={navy} />
      <rect x="44" y="14" width="12" height="62" rx="6" fill={krem} />
      <rect x="46.5" y="36" width="7" height="42" rx="3.5" fill={tealTua} />
      <circle cx="50" cy="76" r="12" fill={tealTua} />
      <path d="M68 24h12M68 38h8M68 52h12" stroke={navy} strokeWidth={5} {...garis} />
    </>
  ),
  uap: (
    <g stroke={aksen} strokeWidth={8} {...garis}>
      <path d="M28 90C16 76 38 68 28 54S38 30 28 16" />
      <path d="M28 90C16 76 38 68 28 54S38 30 28 16" transform="translate(22 0)" />
      <path d="M28 90C16 76 38 68 28 54S38 30 28 16" transform="translate(44 0)" />
    </g>
  ),
  es: (
    <>
      <rect x="18" y="18" width="64" height="64" rx="14" fill={sage} stroke={tealTua} strokeWidth={4} />
      <path d="M32 36v16M32 36h14" stroke={krem} strokeWidth={6} {...garis} />
    </>
  ),
  percikan: (
    <>
      <Tetesan x={50} y={40} s={30} fill={minyak} />
      <Tetesan x={22} y={50} s={20} deg={-40} fill={minyak} />
      <Tetesan x={78} y={50} s={20} deg={40} fill={minyak} />
      <circle cx="10" cy="26" r="4.5" fill={minyak} />
      <circle cx="90" cy="26" r="4.5" fill={minyak} />
      <circle cx="36" cy="10" r="3.5" fill={minyak} />
      <circle cx="66" cy="8" r="3" fill={minyak} />
      <path d="M8 86C28 72 72 72 92 86 82 96 18 96 8 86Z" fill={minyak} />
    </>
  ),
  mengembang: (
    <>
      <circle cx="50" cy="50" r="30" fill={sage} stroke={tealTua} strokeWidth={5} />
      <circle cx="50" cy="50" r="10" fill={tealTua} />
      <path d="M38 36a16 16 0 0 1 10-8" stroke={krem} strokeWidth={5} {...garis} />
      <g stroke={tealTua} strokeWidth={6} {...garis}>
        <path d="M76 24L92 8M78 8H92V22" />
        <path d="M76 24L92 8M78 8H92V22" transform="rotate(90 50 50)" />
        <path d="M76 24L92 8M78 8H92V22" transform="rotate(180 50 50)" />
        <path d="M76 24L92 8M78 8H92V22" transform="rotate(270 50 50)" />
      </g>
    </>
  ),
  minyak: (
    <>
      <rect x="42" y="16" width="16" height="26" fill={minyak} />
      <rect x="28" y="36" width="44" height="56" rx="12" fill={minyak} />
      <rect x="40" y="6" width="20" height="14" rx="4" fill={navy} />
      <rect x="35" y="56" width="30" height="24" rx="5" fill={krem} />
      <Tetesan x={50} y={72} s={9} fill={tealTua} />
    </>
  ),
  jam: (
    <>
      <rect x="43" y="8" width="14" height="8" rx="3" fill={navy} />
      <circle cx="50" cy="54" r="36" fill={krem} stroke={navy} strokeWidth={6} />
      <path d="M50 54V32M50 54l14 8" stroke={navy} strokeWidth={6} {...garis} />
    </>
  ),
  centang: (
    <>
      <circle cx="50" cy="50" r="38" fill={tealTua} />
      <path d="M32 52L45 65L70 36" stroke={krem} strokeWidth={9} {...garis} />
    </>
  ),
  silang: (
    <>
      <circle cx="50" cy="50" r="38" fill={merah} />
      <path d="M36 36L64 64M64 36L36 64" stroke={krem} strokeWidth={9} {...garis} />
    </>
  ),
  simpan: <path d="M28 12h44a4 4 0 0 1 4 4v76L50 72 24 92V16a4 4 0 0 1 4-4Z" fill={tealTua} />,
  ikuti: (
    <>
      <circle cx="40" cy="30" r="17" fill={tealTua} />
      <path d="M6 90C6 66 20 54 40 54S74 66 74 90Z" fill={tealTua} />
      <circle cx="74" cy="68" r="22" fill={navy} stroke={sage} strokeWidth={5} />
      <path d="M74 56v24M62 68h24" stroke={krem} strokeWidth={7} {...garis} />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IkonNama = keyof typeof GAMBAR
export const NAMA_IKON = Object.keys(GAMBAR) as IkonNama[]

export const Ikon = ({ nama, ukuran }: { nama: IkonNama; ukuran: number }) => (
  <svg width={ukuran} height={ukuran} viewBox="0 0 100 100" style={{ display: 'block' }}>
    {GAMBAR[nama]}
  </svg>
)
