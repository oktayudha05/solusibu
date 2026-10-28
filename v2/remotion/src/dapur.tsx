// Dunia "dapur" (wilayah 0 di kanvas): penampang wajan + kompor + meja. Dipakai bareng hook-freeze, penampang-zoom, payoff-loop,
// jadi wajannya SATU objek yg terus hidup dari detik 0 sampai akhir (kontinuitas antar beat).
// Tiap template dapur nyumbang "peristiwa" tetes air (jatuh → tenggelam → mendidih → uap → ciprat). Semua fungsi murni dari t.
import React from 'react'
import { random } from 'remotion'
import { evolvePath } from '@remotion/paths'
import { noise2D } from '@remotion/noise'
import { FPS, Sprite, bayang, ease, kf, prog } from './lib'
import { Titik } from './kamera'
import { Tema } from './tema'

export type Peristiwa = { jatuh: number; sentuh: number; dasar: number; didih: number; uap: number; ciprat: number; beku?: [number, number] }

const RIM = 748, DASAR = 1104, PERMUKAAN = 950
const dalamKiri = (y: number) => 160 + (y - RIM) * (120 / (DASAR - RIM))
const dalamKanan = (y: number) => 1080 - dalamKiri(y)
const BODI: Titik[] = [[110, 748], [160, 748], [280, 1104], [800, 1104], [920, 748], [970, 748], [970, 776], [940, 776], [818, 1140], [262, 1140], [140, 776], [110, 776]]
const GAGANG: Titik[] = [[970, 752], [1250, 740], [1250, 772], [970, 776]]
export const poly = (p: Titik[]) => `M ${p.map(([x, y]) => `${x} ${y}`).join(' L ')} Z`
export const q8 = (v: number) => Math.round(v / 8) * 8 // grid pixel art x8

// peristiwa yg berlaku di t + waktu "efektif" (beku = waktu berhenti, lalu jalan lagi)
export const aktifDi = (t: number, ps: Peristiwa[]) => {
  const p = [...ps].reverse().find((x) => t >= x.jatuh - 0.2) ?? ps[0]
  if (!p) return null
  const b = p.beku, te = !b || t < b[0] ? t : t < b[1] ? b[0] : t - (b[1] - b[0])
  return { p, te }
}
const posTetes = (te: number, k: Peristiwa): Titik => {
  const y = kf(te, [[k.jatuh, 330], [k.sentuh, PERMUKAAN - 40, ease.in2], [k.dasar, DASAR - 66, ease.out3]])
  const getar = te > k.didih && te < k.uap ? (random(`g${Math.floor(te * FPS)}`) - 0.5) * 12 : 0
  return [540 + getar, y]
}
const ukuranUap = (te: number, k: Peristiwa) => kf(te, [[k.uap, 40], [k.uap + 0.45, 250, ease.out5], [k.ciprat + 0.15, 290], [k.ciprat + 0.35, 0, ease.in3]])
export const jangkarDapur = (t: number, ps: Peristiwa[]): Record<string, Titik> => {
  const a = aktifDi(t, ps), tetes = a ? posTetes(a.te, a.p) : [540, 330] as Titik, u = a ? ukuranUap(a.te, a.p) : 0
  return { dapur: [540, 930], wajan: [540, 960], atas: [540, 820], minyak: [330, 1010], dasar: [540, 1060], permukaan: [540, PERMUKAAN],
    tetes, uap: [540, DASAR - u / 2], api: [540, 1230] }
}
// jari-jari kira2 tiap jangkar (px dunia): label ditaruh di luar ini biar ga nutup objeknya
export const jariDapur = (t: number, ps: Peristiwa[]): Record<string, number> => {
  const a = aktifDi(t, ps)
  return { tetes: 70, uap: a ? ukuranUap(a.te, a.p) * 0.6 : 0, minyak: 40, dasar: 30, api: 60 }
}

const Wajan: React.FC<{ tema: Tema; t: number; ps: Peristiwa[]; gambar: number }> = ({ tema, t, ps, gambar }) => {
  const w = tema.warna, a = aktifDi(t, ps)
  const garis = prog(t, gambar, gambar + 0.8, ease.inOut3), isi = prog(t, gambar + 0.5, gambar + 0.8, ease.out3)
  const d = poly(BODI), ev = evolvePath(garis, d), evG = evolvePath(prog(t, gambar + 0.4, gambar + 0.8), poly(GAGANG))
  const u = a && a.te > a.p.uap ? ukuranUap(a.te, a.p) : 0, tt = a?.te ?? t
  const muka: Titik[] = []
  for (let x = q8(dalamKiri(PERMUKAAN)); x <= dalamKanan(PERMUKAAN); x += 8) {
    const benjol = Math.max(0, 1 - Math.abs(x - 540) / (u * 0.9 + 1)) * u * 0.55
    muka.push([x, q8(PERMUKAAN + Math.sin(x / 40 + tt * 5) * 4 - benjol)])
  }
  const minyak = [...muka, [800, DASAR], [280, DASAR]] as Titik[]
  return (
    <svg width={1400} height={1500} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <defs>
        <pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill={w.latar} opacity="0.35" /></pattern>
        <pattern id="ht2" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="3" fill={w.pintu} opacity="0.3" /></pattern>
      </defs>
      <g opacity={isi}><path d={poly(minyak)} fill={w.catatan} /><path d={poly(minyak)} fill="url(#ht2)" /></g>
      <g opacity={isi}><path d={d} transform="translate(14 14)" fill={w.bayangan} /><path d={poly(GAGANG)} transform="translate(14 14)" fill={w.bayangan} /></g>
      <g opacity={isi}><path d={d} fill={w.catatan2} /><path d={d} fill="url(#ht)" /><path d={poly(GAGANG)} fill={w.latar} /></g>
      <path d={d} fill="none" stroke={w.tintaPintu} strokeWidth={6} strokeLinejoin="miter" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      <path d={poly(GAGANG)} fill="none" stroke={w.tintaPintu} strokeWidth={6} strokeLinejoin="miter" strokeDasharray={evG.strokeDasharray} strokeDashoffset={evG.strokeDashoffset} />
    </svg>
  )
}

// api segitiga tajam, ganti bentuk tiap 3 frame; kompor + meja dapur ngisi bawah layar
export const Api: React.FC<{ tema: Tema; t: number; x0: number; n: number; y: number; besar?: number; nyala?: number }> = ({ tema, t, x0, n, y, besar = 1, nyala = 1 }) => {
  const w = tema.warna, step = Math.floor((t * FPS) / 3)
  return <>{Array.from({ length: n }, (_, i) => {
    const x = x0 + i * 60 * besar, h = (70 + noise2D('api', i, step * 0.7) * 40) * nyala * besar
    return <g key={i}>
      <polygon points={`${x - 26 * besar},${y} ${x + 26 * besar},${y} ${x + noise2D('ax', i, step) * 10},${y - h}`} fill={w.catatan} />
      <polygon points={`${x - 12 * besar},${y} ${x + 12 * besar},${y} ${x},${y - h * 0.45}`} fill={w.pintu} />
    </g>
  })}</>
}
const Kompor: React.FC<{ tema: Tema; t: number; gambar: number }> = ({ tema, t, gambar }) => {
  const w = tema.warna
  return (
    <svg width={1080} height={1900} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <Api tema={tema} t={t} x0={300} n={9} y={1262} nyala={prog(t, gambar + 0.3, gambar + 0.7, ease.back)} />
      <rect x={200} y={1276} width={680} height={40} fill={w.bayangan} transform="translate(12 12)" />
      <rect x={200} y={1262} width={680} height={40} fill={w.latar} />
      <rect x={232} y={1272} width={24} height={20} fill={w.catatan2} /><rect x={824} y={1272} width={24} height={20} fill={w.catatan2} />
      {/* meja dapur: ngisi bawah layar (y 1300-1536 dulu kosong) */}
      <rect x={-500} y={1330} width={1700} height={600} fill={w.bayangan} transform="translate(14 14)" />
      <rect x={-500} y={1330} width={1700} height={600} fill={w.catatan2} />
      <rect x={-500} y={1330} width={1700} height={600} fill="url(#ht)" />
      {/* ubin keramik: kotak selang-seling */}
      {Array.from({ length: 17 * 5 }, (_, i) => (i + Math.floor(i / 17)) % 2 ? null : <rect key={i} x={-500 + (i % 17) * 100} y={1346 + Math.floor(i / 17) * 100} width={100} height={100} fill={w.latar} opacity={0.18} />)}
      <rect x={-500} y={1330} width={1700} height={16} fill={w.tintaPintu} />
    </svg>
  )
}
// gelembung uap: kotak bergerigi pixel (bukan lingkaran)
const Uap: React.FC<{ tema: Tema; te: number; k: Peristiwa }> = ({ tema, te, k }) => {
  const s = ukuranUap(te, k), w = tema.warna
  if (te < k.uap || s < 4) return null
  const step = Math.floor((te * FPS) / 2), p: Titik[] = [], n = 7
  const jag = (i: number) => (random(`u${i}-${step}`) - 0.5) * 16
  const cx = 540, by = DASAR, h = s, ww = s * 1.15
  for (let i = 0; i <= n; i++) p.push([q8(cx - ww / 2 + (ww * i) / n), q8(by - h + jag(i))])
  for (let i = 0; i <= n; i++) p.push([q8(cx + ww / 2 + jag(i + 20)), q8(by - h + (h * i) / n)])
  p.push([q8(cx - ww / 2 + jag(40)), by])
  for (let i = n; i >= 0; i--) p.push([q8(cx - ww / 2 + jag(i + 60)), q8(by - h + (h * i) / n)])
  return (
    <svg width={1080} height={1400} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      <path d={poly(p)} transform="translate(10 10)" fill={w.bayangan} opacity={0.6} />
      <path d={poly(p)} fill={w.catatan2} stroke={w.latar} strokeWidth={5} strokeLinejoin="miter" />
      <path d={poly(p)} fill="url(#ht)" />
    </svg>
  )
}
// cipratan balistik analitik (tanpa state). Dibesarin: kotak 24-56px + 3 sprite ciprat ukuran asli (dulu kekecilan)
const Ciprat: React.FC<{ tema: Tema; te: number; k: Peristiwa }> = ({ tema, te, k }) => {
  const dt = te - k.ciprat, w = tema.warna
  if (dt < 0 || dt > 2.2) return null
  return <>
    <svg width={1080} height={1400} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
      {Array.from({ length: 46 }, (_, i) => {
        const r = (s: string) => random(`c${i}${s}`)
        const x0 = 540 + (r('x') - 0.5) * 300, vx = (x0 - 540) * 2.4 + (r('vx') - 0.5) * 520, vy = -(900 + r('vy') * 800)
        const x = x0 + vx * dt, y = PERMUKAAN - 20 + vy * dt + 0.5 * 2400 * dt * dt
        if (vy + 2400 * dt > 0 && y > PERMUKAAN - 10 && x > 230 && x < 850) return null
        const sz = q8(24 + r('s') * 32), c = r('c') < 0.75 ? w.catatan : w.tintaPintu
        return <g key={i}><rect x={x + 8} y={y + 8} width={sz} height={sz} fill={w.bayangan} /><rect x={x} y={y} width={sz} height={sz} fill={c} /></g>
      })}
    </svg>
    {[0, 1, 2].map((i) => {
      const x = 540 + (i - 1) * 300 + (i - 1) * 380 * dt, y = 620 - 820 * dt + 1200 * dt * dt
      return <Sprite key={i} src="aset/sprite/ciprat-minyak.png" warna={w.cipratan} fx={bayang(w.bayangan, 8)}
        style={{ left: x - 128, top: y - 132, width: 256, height: 264, transform: `${i === 0 ? 'scaleX(-1) ' : ''}rotate(${(i - 1) * 28 + dt * 160 * (i - 1)}deg) scale(${[0.75, 1, 0.75][i]})`, opacity: prog(te, k.ciprat, k.ciprat + 0.05) }} />
    })}
  </>
}

export const Dapur: React.FC<{ tema: Tema; t: number; ps: Peristiwa[]; gambar: number }> = ({ tema, t, ps, gambar }) => {
  const a = aktifDi(t, ps), w = tema.warna
  const tetes = a ? posTetes(a.te, a.p) : null
  const tampakTetes = a && a.te >= a.p.jatuh && a.te < a.p.uap + 0.05
  const penyet = a && a.te > a.p.sentuh && a.te < a.p.sentuh + 0.15
  return <>
    <Kompor tema={tema} t={t} gambar={gambar} />
    <Wajan tema={tema} t={t} ps={ps} gambar={gambar} />
    {a && <Uap tema={tema} te={a.te} k={a.p} />}
    {tampakTetes && tetes && <Sprite src="aset/sprite/tetes-air.png" warna={w.tetes} fx={bayang(w.bayangan, 6)}
      style={{ left: tetes[0] - 40, top: tetes[1] - 62, width: 80, height: 124, transform: `scale(${penyet ? 1.15 : 1}, ${penyet ? 0.85 : 1})` }} />}
    {a && <Ciprat tema={tema} te={a.te} k={a.p} />}
  </>
}
