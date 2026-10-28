// Template adegan v2 (dari R1 §8, KEPUTUSAN.md). Satu kanvas: tiap template punya wilayah di dunia (ox, oy), template "dapur"
// berbagi wajan yg sama di wilayah 0. Kamera, SFX, label nempel objek semua dihitung dari timing kata. Waktu = detik global video.
// Wilayah lokal: 1080 x 1920, pusat bidik kamera biasanya (540, 900) → zona teks atas (230-630) buat KataBesar, diagram 650-1536.
import React from 'react'
import { AbsoluteFill } from 'remotion'
import { evolvePath } from '@remotion/paths'
import { F, FPS, Kertas, Sprite, bayang, ease, goyang, halftone, kf, misreg, popS, prog } from './lib'
import { Cam, KeyKamera, Titik, proyeksi } from './kamera'
import { Api, Peristiwa, poly } from './dapur'
import { Tema } from './tema'
import idx from '../public/aset/index.json'

export type Kata = [string, number, number]
export type Adegan = { template: string; teks: string; kunci: string[]; data: any; kata: Kata[] }
export type Affiliate = { produk: string; teks: string; aset?: string; disclosure: string } | null
export type Ctx = { tema: Tema; t: number; a: Adegan; mulai: number; selesai: number; affiliate: Affiliate; ox: number; oy: number }
export type CtxLayar = Ctx & { cam: Cam; jangkar: Record<string, Titik>; jari: Record<string, number>; dunia: [number, number, number, number] }
type Sfx = [number, string][]

export const UKURAN: Record<string, number[]> = Object.fromEntries(idx.aset.filter((x: any) => x.ukuran).map((x: any) => [x.id, x.ukuran]))
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '')
// detik saat kata `w` diucapkan di adegan ini (fallback: awal adegan + cadangan)
export const waktu = (c: { a: Adegan; mulai: number }, w?: string, cadangan = 0) => {
  const k = w && c.a.kata.find((x) => norm(x[0]) === norm(w))
  return k ? k[1] : c.mulai + cadangan
}
const muncul = (t: number, at: number) => ({ opacity: prog(t, at, at + 6 * F, ease.out3), transform: `scale(${popS(t, at)})` })
const fontT = (c: Ctx, jenis: 'display' | 'serif' | 'tangan', size: number): React.CSSProperties =>
  jenis === 'serif' ? { fontFamily: c.tema.font.serif, fontStyle: 'italic', fontWeight: 900, fontSize: size, lineHeight: 1 }
    : { fontFamily: jenis === 'display' ? c.tema.font.display : c.tema.font.tangan, fontSize: size, lineHeight: 1.02 }
const warnaSemantik = (c: Ctx, w?: string) => (w === 'air' ? c.tema.warna.catatan2 : w === 'panas' ? c.tema.warna.catatan : w ?? c.tema.warna.tintaPintu)

// ---------- komponen bersama ----------
// garis tergambar sendiri (stroke draw 12-24f)
const Gores: React.FC<{ d: string; p: number; warna: string; lebar?: number; bayangan?: string }> = ({ d, p, warna, lebar = 10, bayangan }) => {
  const ev = evolvePath(Math.max(0.0001, p), d)
  return <>
    {bayangan && <path d={d} transform="translate(6 6)" fill="none" stroke={bayangan} strokeWidth={lebar} strokeLinejoin="miter" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />}
    <path d={d} fill="none" stroke={warna} strokeWidth={lebar} strokeLinejoin="miter" strokeLinecap="square" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
  </>
}
// panah bersudut (kepala segitiga)
const kepala = (ujung: Titik, dari: Titik, s = 34) => {
  const a = Math.atan2(ujung[1] - dari[1], ujung[0] - dari[0])
  return [[0, 0], [-s, -s * 0.5], [-s, s * 0.5]].map(([x, y]) => [ujung[0] + x * Math.cos(a) - y * Math.sin(a), ujung[1] + x * Math.sin(a) + y * Math.cos(a)].join(',')).join(' ')
}

// label tulisan tangan + panah. Posisi di LAYAR, ujung nempel objek dunia. Kotak SELALU di luar jari-jari objek (dulu nutup tetes),
// di-clamp: kiri ≥64, kanan ≤880 (rel tombol YouTube), atas ≥660 (zona kata besar), bawah ≤1500.
export const LabelPanah: React.FC<{ c: Ctx; at: number; sampai?: number; teks: string; ujung: Titik; jari: number; warna?: string; lebar?: number }> =
  ({ c, at, sampai, teks, ujung, jari, warna, lebar = 420 }) => {
    const t = c.t, w = c.tema.warna
    if (t < at || (sampai && t > sampai + 5 * F)) return null
    const keluar = sampai ? prog(t, sampai, sampai + 5 * F, ease.in3) : 0
    const H = teks.length > 16 ? 140 : 84, Wb = lebar, jauh = jari + 50
    const kiri = ujung[0] >= 540
    let L = Math.min(Math.max(64, kiri ? ujung[0] - jauh - Wb : ujung[0] + jauh), 880 - Wb), T = Math.min(Math.max(660, ujung[1] - 40 - H), 1500 - H)
    const tabrakX = L < ujung[0] + jari + 20 && L + Wb > ujung[0] - jari - 20, tabrakY = T < ujung[1] + jari + 20 && T + H > ujung[1] - jari - 20
    if (tabrakX && tabrakY) T = ujung[1] - jauh - H >= 660 ? ujung[1] - jauh - H : Math.min(ujung[1] + jauh, 1500 - H)
    if (T + H > 1140) L = Math.min(Math.max(L, 300), 880 - Wb) // maskot di kiri bawah
    const pangkal: Titik = [Math.min(Math.max(ujung[0], L + 30), L + Wb - 30), T + H / 2 < ujung[1] ? T + H : T]
    const dx = ujung[0] - pangkal[0], dy = ujung[1] - pangkal[1], len = Math.hypot(dx, dy) || 1
    const ujungP: Titik = [ujung[0] - (dx / len) * (jari + 8), ujung[1] - (dy / len) * (jari + 8)]
    const d = `M ${pangkal[0]} ${pangkal[1]} L ${ujungP[0]} ${ujungP[1]}`
    const p = prog(t, at + 0.12, at + 0.45, ease.inOut3)
    return (
      <AbsoluteFill style={{ opacity: 1 - keluar }}>
        {len > jari + 40 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
          <Gores d={d} p={p} warna={w.tintaPintu} lebar={7} bayangan={w.bayangan} />
          {p > 0.95 && <polygon points={kepala(ujungP, pangkal, 30)} fill={w.tintaPintu} stroke={w.bayangan} strokeWidth={3} />}
        </svg>}
        <div style={{ position: 'absolute', left: L, top: T, width: Wb, height: H, boxSizing: 'border-box', padding: '10px 22px', background: warna ?? w.catatan2,
          color: w.latar, ...fontT(c, 'tangan', 62), display: 'flex', alignItems: 'center', filter: bayang(w.bayangan),
          transform: `rotate(${kiri ? -2.5 : 2}deg) scale(${popS(t, at)})`, opacity: prog(t, at, at + 4 * F) }}>{teks}</div>
      </AbsoluteFill>
    )
  }
const labelSfx = (at: number): Sfx => [[at, 'pop-small-in'], [at + 0.12, 'writing-marker-tick']]

// catatan sumber kecil (wajib buat angka): pojok bawah, ≤x880
const Sumber: React.FC<{ c: Ctx; at: number; teks?: string }> = ({ c, at, teks }) => !teks ? null : (
  <div style={{ position: 'absolute', left: 250, top: 1446, width: 620, whiteSpace: 'nowrap', ...fontT(c, 'tangan', 56), color: c.tema.warna.tintaPintu,
    textShadow: `4px 4px 0 ${c.tema.warna.bayangan}`, ...muncul(c.t, at), transformOrigin: '0 50%' }}>sumber: {teks}</div>
)

// ================= 1. HOOK-FREEZE (dapur) =================
// frame 0 sudah ada aksinya: uap + ciprat → BEKU (flash) → kotak bidik + label "pelakunya?" → lanjut jatuh pas adegan habis.
const hookBeku = (c: Ctx) => c.mulai + 0.42
const hookPeristiwa = (c: Ctx): Peristiwa => {
  const m = c.mulai
  return { jatuh: m - 1.6, sentuh: m - 1.15, dasar: m - 0.75, didih: m - 0.6, uap: m - 0.38, ciprat: m + 0.12, beku: [hookBeku(c), c.selesai - 0.25] }
}
const HookLayar: React.FC<CtxLayar> = (c) => {
  const w = c.tema.warna, b = hookBeku(c), t = c.t
  const flash = t >= b && t < b + 3 * F ? 0.55 * (1 - (t - b) / (3 * F)) : 0
  const pusat = proyeksi(c.cam, [540, 900]), s = 230 * c.cam.zoom
  const p = prog(t, b + 3 * F, b + 13 * F, ease.out3)
  const sudut = (sx: number, sy: number) => `M ${pusat[0] + sx * s} ${pusat[1] + sy * s - sy * 70} L ${pusat[0] + sx * s} ${pusat[1] + sy * s} L ${pusat[0] + sx * s - sx * 70} ${pusat[1] + sy * s}`
  const lepas = c.selesai - 0.25
  return <>
    <AbsoluteFill style={{ background: w.stabilo, opacity: flash }} />
    {t >= b && t < lepas && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0 }}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, y], i) => <Gores key={i} d={sudut(x, y)} p={p} warna={w.tintaPintu} lebar={12} bayangan={w.bayangan} />)}
    </svg>}
    {/* tanda pause ala video: 2 balok, bukan ikon generik */}
    {t >= b && t < lepas && <div style={{ position: 'absolute', left: pusat[0] - s + 24, top: pusat[1] - s + 24, display: 'flex', gap: 14, ...muncul(t, b + 4 * F) }}>
      <div style={{ width: 22, height: 70, background: w.tintaPintu, boxShadow: `6px 6px 0 ${w.bayangan}` }} /><div style={{ width: 22, height: 70, background: w.tintaPintu, boxShadow: `6px 6px 0 ${w.bayangan}` }} />
    </div>}
    {c.a.data.label && <LabelPanah c={c} at={waktu(c, c.a.data.label_pada, 0.9)} sampai={lepas} teks={c.a.data.label} ujung={c.jangkar.permukaan} jari={120 * c.cam.zoom} warna={w.catatan} />}
  </>
}
const hookKamera = (c: Ctx): KeyKamera[] => {
  const b = hookBeku(c)
  return [{ t: c.mulai, fokus: 'dapur', zoom: 1.12 }, { t: b, fokus: 'dapur', zoom: 1.15 },
    { t: b + 4 * F, fokus: [540, 860], zoom: 1.22, ease: 'out5' }, { t: c.selesai - 0.3, fokus: [540, 860], zoom: 1.28 }]
}
const hookSfx = (c: Ctx): Sfx => {
  const b = hookBeku(c)
  return [[c.mulai + 0.12, 'props-splash'], [b, 'impact-heavy-soft'], [b + 3 * F, 'writing-scribble'], ...labelSfx(waktu(c, c.a.data.label_pada, 0.9)), [c.selesai - 0.25, 'whoosh-fast-soft']]
}

// ================= 2. PENAMPANG-ZOOM (dapur) =================
// tetes jatuh → tenggelam → mendidih (snap zoom) → uap ngembang → ciprat (whip keluar). Ketukan = kata di teks.
const penKetuk = (c: Ctx) => {
  const k = c.a.data.ketukan ?? {}, d = c.selesai - c.mulai
  const jatuh = waktu(c, k.jatuh, 0.1), dasar = Math.max(jatuh + 0.7, waktu(c, k.dasar, d * 0.3))
  const didih = Math.max(dasar + 0.3, waktu(c, k.didih, d * 0.5)), uap = Math.max(didih + 0.35, waktu(c, k.uap, d * 0.65))
  const ciprat = Math.max(uap + 0.6, waktu(c, k.ciprat, d * 0.85))
  return { jatuh: jatuh - 0.2, sentuh: jatuh + 0.3, dasar, didih, uap, ciprat }
}
const penPeristiwa = (c: Ctx): Peristiwa => penKetuk(c)
const PenLayar: React.FC<CtxLayar> = (c) => <>
  {(c.a.data.label ?? []).map((l: any, i: number) => {
    const at = waktu(c, l.pada, 0.3 + i), next = c.a.data.label[i + 1]
    const sampai = l.sampai ? waktu(c, l.sampai) : next ? waktu(c, next.pada, 0.3 + i + 1) - 0.05 : c.selesai - 0.2
    return <LabelPanah key={i} c={c} at={at} sampai={sampai} teks={l.teks} ujung={c.jangkar[l.jangkar] ?? [540, 960]} jari={(c.jari[l.jangkar] ?? 20) * c.cam.zoom} warna={warnaSemantik(c, l.warna)} />
  })}
</>
const penKamera = (c: Ctx): KeyKamera[] => {
  const k = penKetuk(c)
  return [{ t: c.mulai + 0.2, fokus: 'dapur', zoom: 1.12, ease: 'inOut3' },
    { t: k.jatuh + 0.3, fokus: 'tetes', zoom: 1.3, ease: 'inOut3' }, { t: k.dasar, fokus: 'permukaan', zoom: 1.55, ease: 'inOut3' },
    { t: k.didih, fokus: 'dasar', zoom: 1.7, ease: 'inOut3' }, { t: k.didih + 4 * F, fokus: 'dasar', zoom: 2.3, ease: 'out5' },
    { t: k.ciprat - 0.05, fokus: 'dasar', zoom: 2.4 }, { t: k.ciprat + 9 * F, fokus: [540, 840], zoom: 1.12, rot: -2, ease: 'inOut5' },
    { t: k.ciprat + 0.6, fokus: [540, 860], zoom: 1.08, rot: 0, ease: 'back' }, { t: c.selesai, fokus: [540, 860], zoom: 1.12 }]
}
const penSfx = (c: Ctx): Sfx => {
  const k = penKetuk(c), lab = (c.a.data.label ?? []).flatMap((l: any, i: number) => labelSfx(waktu(c, l.pada, 0.3 + i)))
  return [[k.jatuh, 'swish-soft'], [k.sentuh, 'props-drip'], [k.dasar, 'impact-medium-soft'], [k.didih, 'zip-in-soft'],
    [k.uap - 0.6, 'riser-1s-soft'], [k.ciprat, 'props-splash'], [k.ciprat + 0.02, 'impact-heavy-soft'], [k.ciprat + 0.05, 'whoosh-medium-soft'], ...lab]
}

// ================= 3. SKALA-ANGKA (wilayah sendiri) =================
// mode termometer: batang naik per seri pas kata `pada`, pita rentang (dari-nilai), garis selisih.
// mode tumbuh: benda kecil (sendok air) → grid kotak 1 liter muncul satu-satu + penghitung ×N.
const Y0 = 1260, TINGGI_T = 520 // termometer lokal: nilai 0 di y 1260, maks di y 740
const Termometer: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, maks = d.maks ?? 220, t = c.t
  const yv = (v: number) => Y0 - (v / maks) * TINGGI_T
  const xs = [470, 770]
  return <>
    <Kertas tema={c.tema} t={t} l={170} top={650} w={800} h={860} warna={w.stabilo} seed={33} style={muncul(t, c.mulai - 0.2)} />
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {d.seri.map((s: any, i: number) => {
        const at = waktu(c, s.pada, 0.4 + i * 1.2), x = xs[i] ?? 330 + i * 330, warna = warnaSemantik(c, s.warna)
        const naik = kf(t, [[at, 0], [at + 0.8, s.nilai, ease.out5]])
        return <g key={i} opacity={prog(t, c.mulai + i * 0.1, c.mulai + 0.3 + i * 0.1)}>
          <rect x={x - 90 + 12} y={yv(maks) - 30 + 12} width={180} height={Y0 - yv(maks) + 30} fill={w.bayangan} />
          <rect x={x - 90} y={yv(maks) - 30} width={180} height={Y0 - yv(maks) + 30} fill={w.latar} />
          <rect x={x - 70} y={yv(naik)} width={140} height={Y0 - yv(naik)} fill={warna} />
          <rect x={x - 70} y={yv(naik)} width={140} height={Y0 - yv(naik)} fill={`url(#htT)`} />
          {Array.from({ length: Math.floor(maks / 10) + 1 }, (_, j) => j * 10).map((v) => <rect key={v} x={x - 90} y={yv(v) - 2} width={v % 50 ? 26 : 50} height={5} fill={w.tintaPintu} opacity={0.9} />)}
          {s.dari != null && naik >= s.dari && <rect x={x - 90} y={yv(s.nilai)} width={180} height={yv(s.dari) - yv(s.nilai)} fill="none" stroke={w.latar} strokeWidth={8} strokeDasharray="18 12"
            opacity={prog(t, at + 0.6, at + 0.8)} />}
          {/* bola termometer kotak: ngisi bawah layar */}
          <rect x={x - 130 + 12} y={Y0 - 4 + 12} width={260} height={180} fill={w.bayangan} />
          <rect x={x - 130} y={Y0 - 4} width={260} height={180} fill={warna} />
          <rect x={x - 130} y={Y0 - 4} width={260} height={180} fill="url(#htT)" />
        </g>
      })}
      <defs><pattern id="htT" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill={w.latar} opacity="0.3" /></pattern></defs>
      {/* garis selisih: dari puncak seri 0 ke puncak seri 1 */}
      {d.seri.length > 1 && (() => {
        const at = waktu(c, d.seri[1].pada, 2) + 0.9, a0 = d.seri[0], a1 = d.seri[1]
        const p = prog(t, Math.max(at, waktu(c, a0.pada, 0.4) + 0.9), Math.max(at, waktu(c, a0.pada, 0.4) + 0.9) + 0.5, ease.inOut3)
        return <Gores d={`M ${xs[0] + 70} ${yv(a0.nilai)} L ${xs[1] - 100} ${yv(a0.nilai)} L ${xs[1] - 100} ${yv(a1.nilai)} L ${xs[1] - 70} ${yv(a1.nilai)}`} p={p} warna={w.stabilo} lebar={8} bayangan={w.bayangan} />
      })()}
    </svg>
    {d.seri.map((s: any, i: number) => {
      const at = waktu(c, s.pada, 0.4 + i * 1.2), x = xs[i] ?? 330 + i * 330
      const angka = Math.round(kf(t, [[at, 0], [at + 0.8, s.nilai, ease.out5]]))
      const tulis = s.dari != null && angka >= s.nilai ? `${s.dari}–${s.nilai}` : `${angka}`
      const lebar = (tulis.length + 0.6) * 0.72 * 100 + 40, kiri = Math.min(Math.max(64, x - lebar / 2), 880 - lebar) // jangan lewat rel tombol x880
      return <React.Fragment key={i}>
        <div style={{ position: 'absolute', left: x - 150, top: Y0 + 40, width: 300, textAlign: 'center', ...fontT(c, 'display', 76), color: w.latar }}>{s.label}</div>
        {/* angka besar di samping puncak batang (dekat objek) */}
        <div style={{ position: 'absolute', left: kiri, width: lebar, top: yv(angka) - 150, textAlign: 'center', whiteSpace: 'nowrap',
          ...fontT(c, 'display', 100), opacity: prog(t, at, at + 3 * F) }}>
          <span style={{ display: 'inline-block', background: w.latar, color: warnaSemantik(c, s.warna), padding: '4px 16px', boxShadow: `9px 9px 0 ${w.bayangan}`, textShadow: misreg(w.misreg ?? w.catatan2) }}>{tulis}<span style={{ fontSize: 56 }}>°</span></span>
        </div>
      </React.Fragment>
    })}
  </>
}
// sendok makan (vektor kotak) + grid kotak 1 L
const SEL = 150, KOL = 4
const Tumbuh: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, t = c.t, at = waktu(c, d.pada, 1), n = d.sel ?? 24
  const baris = Math.ceil(n / KOL), x0 = 300, yBawah = 1180
  return <>
    {/* sendok: kepala kotak + gagang */}
    <div style={{ position: 'absolute', left: 200, top: 1250, ...muncul(t, c.mulai + 0.1) }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 300, height: 110, background: w.catatan2, filter: bayang(w.bayangan, 10), clipPath: 'polygon(0 0,100% 0,88% 100%,12% 100%)' }} />
      <div style={{ position: 'absolute', left: 290, top: 20, width: 380, height: 40, background: w.catatan2, filter: bayang(w.bayangan, 10) }} />
      <div style={{ position: 'absolute', left: 30, top: 8, width: 240, height: 34, background: w.tetes }} />
      <Sprite src="aset/sprite/tetes-air.png" warna={w.tetes} fx={bayang(w.bayangan, 6)} style={{ left: 110, top: -110, width: 80, height: 124, transform: `translateY(${kf(t, [[c.mulai + 0.1, -60], [c.mulai + 0.4, 0, ease.out3]])}px)` }} />
    </div>
    {d.awal && <div style={{ position: 'absolute', left: 330, top: 1380, ...fontT(c, 'display', 64), color: w.tintaPintu, textShadow: `6px 6px 0 ${w.bayangan}`, ...muncul(t, c.mulai + 0.3), transformOrigin: '0 0' }}>{d.awal}</div>}
    {/* panah uap naik dari sendok ke tumpukan */}
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <Gores d={`M 350 1230 L 350 1100 L ${x0 - 20} 1100`} p={prog(t, at - 0.3, at, ease.inOut3)} warna={w.stabilo} lebar={10} bayangan={w.bayangan} />
      {t > at && <polygon points={kepala([x0 - 4, 1100], [350, 1100], 36)} fill={w.stabilo} />}
    </svg>
    {Array.from({ length: n }, (_, i) => <div key={'k' + i} style={{ position: 'absolute', left: x0 + (i % KOL) * SEL, top: yBawah - (Math.floor(i / KOL) + 1) * SEL,
      width: SEL - 10, height: SEL - 10, outline: `4px dashed ${w.catatan2}`, opacity: 0.55 * prog(t, c.mulai + 0.2 + (i % 5) * F, c.mulai + 0.5 + (i % 5) * F) }} />)}
    {Array.from({ length: n }, (_, i) => {
      const kol = i % KOL, br = Math.floor(i / KOL), s = at + i * 2 * F
      return <div key={i} style={{ position: 'absolute', left: x0 + kol * SEL, top: yBawah - (br + 1) * SEL, width: SEL - 10, height: SEL - 10,
        background: `${halftone(w.latar, 10, 3)}, ${w.catatan2}`, outline: `5px solid ${w.latar}`, boxShadow: `8px 8px 0 ${w.bayangan}`,
        ...muncul(t, s), transformOrigin: '50% 100%' }}>
        {i === 0 && d.sel_label && <div style={{ ...fontT(c, 'display', 52), color: w.latar, textAlign: 'center', marginTop: 34 }}>{d.sel_label}</div>}
      </div>
    })}
    {/* garis ukur tinggi tumpukan di kanan (grafis, boleh di rel) */}
    <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <Gores d={`M ${x0 + KOL * SEL + 40} ${yBawah} L ${x0 + KOL * SEL + 40} ${yBawah - baris * SEL}`} p={prog(t, at, at + n * 2 * F)} warna={w.tintaPintu} lebar={8} />
    </svg>
  </>
}
const TumbuhLayar: React.FC<CtxLayar> = (c) => {
  const w = c.tema.warna, d = c.a.data, t = c.t, at = waktu(c, d.pada, 1), n = d.sel ?? 24
  const angka = Math.round(Math.exp(kf(t, [[at, 0], [at + n * 2 * F + 0.2, Math.log(d.ke ?? 1600), ease.out3]])))
  const pos = proyeksi(c.cam, [c.ox + 300 + KOL * SEL / 2, c.oy + 1180 - Math.ceil(n / KOL) * SEL * 0.5])
  const atH = waktu(c, d.hasil_pada, 2.5)
  return <>
    {t >= at && <div style={{ position: 'absolute', left: Math.min(Math.max(64, pos[0] - 300), 280), top: Math.max(660, pos[1] - 120), width: 600, textAlign: 'center' }}>
      <div style={{ display: 'inline-block', background: w.latar, padding: '6px 26px', transform: `rotate(-3deg) scale(${popS(t, at)})`, boxShadow: `12px 12px 0 ${w.bayangan}` }}>
        <span style={{ ...fontT(c, 'display', 150), color: w.tintaPintu, textShadow: misreg(w.misreg ?? w.catatan2) }}>{d.akhiran ?? '×'}{angka.toLocaleString('id-ID')}</span>
      </div>
    </div>}
    {d.hasil && t >= atH && <div style={{ position: 'absolute', left: 64, top: Math.min(1340, pos[1] + 160), width: 816, textAlign: 'center' }}>
      <span style={{ display: 'inline-block', background: w.catatan, color: w.latar, padding: '8px 28px', ...fontT(c, 'tangan', 84), transform: `rotate(2deg) scale(${popS(t, atH)})`, boxShadow: `9px 9px 0 ${w.bayangan}` }}>{d.hasil}</span>
    </div>}
  </>
}
const Skala: React.FC<Ctx> = (c) => (c.a.data.mode === 'tumbuh' ? <Tumbuh {...c} /> : <Termometer {...c} />)
const SkalaLayar: React.FC<CtxLayar> = (c) => <>
  {c.a.data.mode === 'tumbuh' && <TumbuhLayar {...c} />}
  <Sumber c={c} at={c.mulai + 0.6} teks={c.a.data.sumber} />
</>
const skalaKamera = (c: Ctx): KeyKamera[] => {
  const o = (x: number, y: number): Titik => [c.ox + x, c.oy + y]
  if (c.a.data.mode === 'tumbuh') {
    const at = waktu(c, c.a.data.pada, 1)
    return [{ t: c.mulai + 10 * F, fokus: o(520, 1060), zoom: 1.15, ease: 'inOut5' }, { t: at - 0.1, fokus: o(520, 1050), zoom: 1.2 },
      { t: at + 0.9, fokus: o(560, 900), zoom: 0.92, ease: 'inOut3' }, { t: c.selesai, fokus: o(560, 890), zoom: 0.9 }]
  }
  const d = c.a.data, t1 = waktu(c, d.seri[0]?.pada, 0.4), t2 = waktu(c, d.seri[1]?.pada, 1.6)
  return [{ t: c.mulai + 10 * F, fokus: o(560, 880), zoom: 1.0, ease: 'inOut5' }, { t: Math.min(t1, t2) + 0.2, fokus: o(550, 870), zoom: 1.01, ease: 'inOut3' },
    { t: Math.max(t1, t2) + 0.4, fokus: o(560, 865), zoom: 1.03, ease: 'inOut3' }, { t: c.selesai, fokus: o(560, 860), zoom: 1.04 }]
}
const skalaSfx = (c: Ctx): Sfx => {
  const d = c.a.data
  if (d.mode === 'tumbuh') {
    const at = waktu(c, d.pada, 1), n = d.sel ?? 24
    return [[c.mulai + 0.1, 'pop-medium-in'], [c.mulai + 0.25, 'props-drip'], [at - 0.3, 'writing-marker-tick'], [at + n * 2 * F - 0.98, 'riser-1s-soft'],
      ...Array.from({ length: Math.ceil(n / 3) }, (_, i) => [at + i * 6 * F, i % 2 ? 'pop-small-bubble' : 'pop-small-in'] as [number, string]),
      [waktu(c, d.hasil_pada, 2.5), 'impact-medium-soft']]
  }
  return [[c.mulai + 0.05, 'swish-soft'], ...d.seri.flatMap((s: any, i: number) => {
    const at = waktu(c, s.pada, 0.4 + i * 1.2)
    return [[at, 'zip-in-soft'], [at + 0.75, 'impact-medium-soft']] as Sfx
  }), [waktu(c, d.seri[1]?.pada, 2) + 0.9, 'writing-marker-tick']]
}

// ================= 4. LANGKAH-TANGAN (wilayah sendiri) =================
// tiap langkah = kartu bernomor + ilustrasi mini yg DIPERAGAKAN (bukan dicentang). Langkah lama tetap jadi jejak di atas.
const KARTU_Y = 600, KARTU_H = 360, KARTU_JARAK = 390, KARTU_X = 290, KARTU_W = 730
const WajanMini: React.FC<{ c: Ctx; x: number; y: number; api?: number }> = ({ c, x, y, api = 0 }) => {
  const w = c.tema.warna
  return <svg width={320} height={260} style={{ position: 'absolute', left: x, top: y, overflow: 'visible' }}>
    {api > 0.01 && <Api tema={c.tema} t={c.t} x0={70} n={4} y={70} besar={1.2} nyala={api} />}
    <path d={poly([[10, 90], [310, 90], [270, 200], [50, 200]])} transform="translate(10 10)" fill={w.bayangan} />
    <path d={poly([[10, 90], [310, 90], [270, 200], [50, 200]])} fill={w.catatan2} stroke={w.tintaPintu} strokeWidth={5} />
    <rect x={30} y={100} width={260} height={30} fill={w.catatan} />
    <rect x={310} y={92} width={60} height={20} fill={w.latar} />
  </svg>
}
const Ilustrasi: React.FC<{ c: Ctx; aksi: string; at: number }> = ({ c, aksi, at }) => {
  const w = c.tema.warna, t = c.t, p = (a: number, b: number, e = ease.inOut3) => prog(t, at + a, at + b, e)
  const X = (cx: number, cy: number, s: number, pp: number) => <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <Gores d={`M ${cx - s} ${cy - s} L ${cx + s} ${cy + s}`} p={Math.min(1, pp * 2)} warna={w.stabilo} lebar={20} bayangan={w.bayangan} />
    <Gores d={`M ${cx + s} ${cy - s} L ${cx - s} ${cy + s}`} p={Math.max(0, pp * 2 - 1)} warna={w.stabilo} lebar={20} bayangan={w.bayangan} />
  </svg>
  if (aksi === 'lap') { // bahan basah (tetes) → tisu nyapu → kering
    const sapu = p(0.1, 0.7)
    return <>
      <div style={{ position: 'absolute', left: 20, top: 120, width: 280, height: 150, background: w.stabilo, filter: bayang(w.bayangan, 9), clipPath: 'polygon(8% 0,100% 12%,92% 100%,0 86%)' }} />
      {[[60, 70], [150, 50], [220, 90]].map(([x, y], i) => <Sprite key={i} src="aset/sprite/tetes-air.png" warna={w.tetes} fx={bayang(w.bayangan, 4)}
        style={{ left: x, top: y, width: 40, height: 62, opacity: sapu * 300 > x + 20 ? 0 : 1 }} />)}
      <div style={{ position: 'absolute', left: -60 + sapu * 300, top: 40, width: 120, height: 200, background: w.struk, filter: bayang(w.bayangan, 8), transform: `rotate(${-8 + sapu * 10}deg)`,
        backgroundImage: `linear-gradient(90deg, transparent 58px, ${w.catatan2} 58px, ${w.catatan2} 62px, transparent 62px)` }} />
    </>
  }
  if (aksi === 'pinggir') { // bahan meluncur dari pinggir wajan, panah menjauh
    const m = p(0.1, 0.8, ease.out3)
    return <>
      <WajanMini c={c} x={0} y={60} />
      <div style={{ position: 'absolute', left: 250 - m * 120, top: 60 + m * 110, width: 90, height: 56, background: w.stabilo, filter: bayang(w.bayangan, 6), transform: `rotate(${30 - m * 30}deg)` }} />
      <svg width={1} height={1} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
        <Gores d="M 120 40 L 220 40 L 300 0" p={p(0.4, 0.8)} warna={w.tintaPintu} lebar={9} bayangan={w.bayangan} />
        {t > at + 0.8 && <polygon points={kepala([300, 0], [220, 40], 30)} fill={w.tintaPintu} />}
      </svg>
    </>
  }
  if (aksi === 'jangan-air') return <>
    <WajanMini c={c} x={0} y={70} api={1} />
    <Sprite src="aset/sprite/tetes-air.png" warna={w.tetes} fx={bayang(w.bayangan, 6)} style={{ left: 120, top: -20, width: 80, height: 124 }} />
    {X(160, 40, 80, p(0.15, 0.55))}
  </>
  if (aksi === 'jangan-pindah') { // wajan mau diangkat → dicoret
    const angkat = kf(t, [[at, 0], [at + 0.3, -40, ease.out3], [at + 0.5, -40], [at + 0.7, 0, ease.in2]])
    return <>
      <div style={{ position: 'absolute', left: 0, top: angkat }}><WajanMini c={c} x={0} y={70} api={1} /></div>
      {X(160, 150, 110, p(0.4, 0.8))}
    </>
  }
  if (aksi === 'kompor') { // kenop diputar → api mati
    const r = p(0, 0.35)
    return <>
      <WajanMini c={c} x={0} y={40} api={1 - p(0.25, 0.6)} />
      <div style={{ position: 'absolute', left: 110, top: 250, width: 100, height: 100, background: w.latar, outline: `6px solid ${w.tintaPintu}`, filter: bayang(w.bayangan, 8), transform: `rotate(${r * 90}deg)` }}>
        <div style={{ position: 'absolute', left: 42, top: 6, width: 16, height: 50, background: w.catatan }} />
      </div>
    </>
  }
  if (aksi === 'tutup') { // tutup logam geser dari samping → api padam
    const g = p(0.05, 0.5, ease.out3)
    return <>
      <WajanMini c={c} x={0} y={70} api={1 - p(0.45, 0.7)} />
      <div style={{ position: 'absolute', left: -260 + g * 280, top: 110 - g * 0, width: 300, height: 34, background: w.tintaPintu, filter: bayang(w.bayangan, 8) }}>
        <div style={{ position: 'absolute', left: 120, top: -26, width: 60, height: 26, background: w.latar }} />
      </div>
    </>
  }
  // fallback: sprite properti dari pustaka
  return aksi ? <Sprite src={`aset/sprite/${aksi}.png`} fx={bayang(w.bayangan, 8)} style={{ left: 0, top: 0, width: UKURAN[aksi]?.[0] ?? 300, height: UKURAN[aksi]?.[1] ?? 300, ...muncul(t, at) }} /> : null
}
const Langkah: React.FC<Ctx> = (c) => {
  const w = c.tema.warna
  return <>{(c.a.data.langkah ?? []).map((l: any, i: number) => {
    const at = waktu(c, l.pada, 0.4 + i * 1.5), y = KARTU_Y + i * KARTU_JARAK, warna = i % 2 ? w.catatan2 : w.catatan
    return <div key={i} style={{ position: 'absolute', left: 0, top: 0, ...muncul(c.t, Math.min(at - 0.15, c.mulai + 0.25 + i * 4 * F)), transformOrigin: `${KARTU_X + KARTU_W / 2}px ${y + KARTU_H / 2}px` }}>
      <Kertas tema={c.tema} t={c.t} l={KARTU_X} top={y} w={KARTU_W} h={KARTU_H} warna={warna} seed={91 + i * 7}>
        <div style={{ position: 'absolute', left: 30, top: 14, ...fontT(c, 'serif', 150), color: w.kata, textShadow: misreg(w.misreg ?? w.catatan2) }}>{i + 1}</div>
        <div style={{ position: 'absolute', left: 30, top: 170, width: 370, height: 170, zIndex: 1, display: 'flex', alignItems: 'center', ...fontT(c, 'display', l.teks.length > 12 ? 54 : 64), color: w.tintaCatatan, ...muncul(c.t, at - 0.1), transformOrigin: '0 50%' }}>{l.teks}</div>
        <div style={{ position: 'absolute', left: 400, top: 40, width: 320, height: 300, opacity: prog(c.t, at - 0.15, at) }}><Ilustrasi c={c} aksi={l.aksi} at={at} /></div>
      </Kertas>
    </div>
  })}</>
}
const langkahKamera = (c: Ctx): KeyKamera[] => {
  const L = c.a.data.langkah ?? []
  // pusat layar (y 860) = tengah antara kartu i-1 & i → kartu aktif di y≈1060-1420, kartu sebelumnya di atasnya
  const fy = (i: number) => c.oy + KARTU_Y + Math.max(0, i - 1) * KARTU_JARAK + (i ? KARTU_JARAK : 0) + KARTU_H / 2 - (i ? 360 : 140)
  return [{ t: c.mulai + 10 * F, fokus: [c.ox + 560, fy(0)], zoom: 1.0, ease: 'inOut5' },
    ...L.slice(1).flatMap((l: any, i: number) => {
      const at = waktu(c, l.pada, 0.4 + (i + 1) * 1.5)
      return [{ t: at - 0.45, fokus: [c.ox + 560, fy(i)], zoom: 1.0 }, { t: at + 0.1, fokus: [c.ox + 560, fy(i + 1)], zoom: 1.0, ease: 'inOut3' }] as KeyKamera[]
    }), { t: c.selesai, fokus: [c.ox + 560, fy(L.length - 1) - 10], zoom: 1.02 }]
}
const langkahSfx = (c: Ctx): Sfx => (c.a.data.langkah ?? []).flatMap((l: any, i: number) => {
  const at = waktu(c, l.pada, 0.4 + i * 1.5)
  const aksi: Record<string, string> = { lap: 'swish-soft', pinggir: 'swish-soft', 'jangan-air': 'writing-scribble', 'jangan-pindah': 'writing-scribble', kompor: 'zip-out-soft', tutup: 'impact-medium-soft' }
  return [[at - 0.15, 'pop-medium-in'], [at + 0.15, aksi[l.aksi] ?? 'pop-small-in'], ...(i ? [[at - 0.45, 'whoosh-fast-soft']] : [])] as Sfx
})

// ================= 5. PAYOFF-LOOP (dapur) =================
// ungkap: kamera mundur lihat seluruh kanvas + jejak kata kunci berurutan → balik ke komposisi frame 0 → tetes jatuh (nyambung ke hook).
const payPulang = (c: Ctx) => Math.max(c.mulai + 1.4, c.selesai - 1.6)
const payPeristiwa = (c: Ctx): Peristiwa => {
  const j = c.selesai - 0.7 // tetes mulai jatuh, video habis sebelum nyentuh → loop ke hook (yg dibuka pas ciprat)
  return { jatuh: j, sentuh: j + 1.0, dasar: j + 1.4, didih: j + 1.6, uap: j + 1.8, ciprat: j + 2.4 }
}
const PayLayar: React.FC<CtxLayar> = (c) => {
  const w = c.tema.warna, t = c.t, r: string[] = c.a.data.rangkum ?? [], pulang = payPulang(c), af = c.affiliate
  const keluar = prog(t, pulang - 0.1, pulang + 0.2, ease.in3)
  return <>
    {r.map((s, i) => {
      const at = c.mulai + 0.5 + i * 8 * F, x = i % 2 ? 400 : 100, y = 690 + i * 190
      return <React.Fragment key={i}>
        {i > 0 && <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: 1 - keluar }}>
          <Gores d={`M ${(i - 1) % 2 ? 620 : 320} ${y - 100} L ${i % 2 ? 560 : 330} ${y - 8}`} p={prog(t, at - 4 * F, at, ease.out3)} warna={w.tintaPintu} lebar={8} bayangan={w.bayangan} />
        </svg>}
        <div style={{ position: 'absolute', left: x, top: y, width: 440, textAlign: 'center', opacity: prog(t, at, at + 3 * F) * (1 - keluar), transform: `rotate(${i % 2 ? 2 : -2}deg) scale(${popS(t, at)})` }}>
          <span style={{ display: 'inline-block', background: i === r.length - 1 ? w.stabilo : w.catatan, color: w.latar, padding: '4px 26px', ...fontT(c, i === r.length - 1 ? 'serif' : 'display', i === r.length - 1 ? 110 : 76), boxShadow: `9px 9px 0 ${w.bayangan}` }}>{s}</span>
        </div>
      </React.Fragment>
    })}
    {af && <div style={{ position: 'absolute', left: 64, top: 1240, width: 760, background: w.catatan2, color: w.latar, boxShadow: `9px 9px 0 ${w.bayangan}`, ...muncul(t, c.mulai + 0.8), opacity: 1 - keluar }}>
      <div style={{ padding: '16px 26px', ...fontT(c, 'tangan', 60) }}>{af.produk} · {af.teks}</div>
      <div style={{ background: w.bayangan, color: w.tintaPintu, padding: '10px 26px', ...fontT(c, 'display', 30) }}>{af.disclosure}</div>
    </div>}
  </>
}
const payKamera = (c: Ctx): KeyKamera[] => {
  // ungkap: mundur sampai dapur + wilayah sebelahnya kelihatan (seluruh kanvas kekecilan buat HP)
  const z = 0.5, pusat: Titik = [1190, 1050], pulang = payPulang(c)
  return [{ t: c.mulai + 24 * F, fokus: pusat, zoom: z, ease: 'inOut5' }, { t: pulang, fokus: pusat, zoom: z * 1.04 },
    { t: pulang + 20 * F, fokus: 'dapur', zoom: 1.12, ease: 'inOut5' }]
}
const paySfx = (c: Ctx): Sfx => [[c.mulai, 'whoosh-medium-soft'], ...(c.a.data.rangkum ?? []).map((_: string, i: number) => [c.mulai + 0.5 + i * 8 * F, i === c.a.data.rangkum.length - 1 ? 'impact-medium-soft' : 'pop-small-in'] as [number, string]),
  [payPulang(c) - 0.05, 'whoosh-fast-soft'], [c.selesai - 0.7, 'swish-soft']]

export type Template = { dapur?: boolean; K?: React.FC<Ctx>; Layar?: React.FC<CtxLayar>; kamera: (c: Ctx & { dunia?: number[] }) => KeyKamera[]; sfx: (c: Ctx) => Sfx; peristiwa?: (c: Ctx) => Peristiwa; pose: string }
export const TEMPLATE: Record<string, Template> = {
  'hook-freeze': { dapur: true, Layar: HookLayar, kamera: hookKamera, sfx: hookSfx, peristiwa: hookPeristiwa, pose: 'ibu-kaget' },
  'penampang-zoom': { dapur: true, Layar: PenLayar, kamera: penKamera, sfx: penSfx, peristiwa: penPeristiwa, pose: 'ibu-mikir' },
  'skala-angka': { K: Skala, Layar: SkalaLayar, kamera: skalaKamera, sfx: skalaSfx, pose: 'ibu-jelasin' },
  'langkah-tangan': { K: Langkah, kamera: langkahKamera, sfx: langkahSfx, pose: 'ibu-nunjuk' },
  'payoff-loop': { dapur: true, Layar: PayLayar, kamera: payKamera, sfx: paySfx, peristiwa: payPeristiwa, pose: 'ibu-jempol' },
}
export { FPS }
