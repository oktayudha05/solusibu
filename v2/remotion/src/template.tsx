// 6 template adegan. Koordinat lokal panel: konten di x 64..1016, y 200..1150 (bawahnya zona caption).
// Tiap template: komponen (gambar) + sfx (daftar [detik, id sfx]). Waktu = detik global video.
import React from 'react'
import { F, Kertas, Sprite, goyang, in2, inOut3, kf, out2, out3, pop, popS } from './lib'
import { Tema } from './tema'
import idx from '../public/aset/index.json'

export type Kata = [string, number, number]
export type Adegan = { template: string; teks: string; kunci: string[]; data: any; kata: Kata[] }
export type Affiliate = { produk: string; teks: string; aset?: string; disclosure: string } | null
export type Ctx = { tema: Tema; t: number; a: Adegan; mulai: number; selesai: number; affiliate: Affiliate }

const UKURAN: Record<string, number[]> = Object.fromEntries(idx.aset.filter((x: any) => x.ukuran).map((x: any) => [x.id, x.ukuran]))
export const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '')
// detik saat kata `w` diucapkan di adegan ini (fallback: awal adegan)
export const waktu = (c: { a: Adegan; mulai: number }, w?: string) => {
  const k = w && c.a.kata.find((x) => norm(x[0]) === norm(w))
  return k ? k[1] : c.mulai
}
const kunci = (c: Ctx, i = 0) => waktu(c, c.a.kunci[i])

// sprite dari pustaka, ukuran asli (skala x8, tanpa skala pecahan)
const Spr: React.FC<{ c: Ctx; id: string; l: number; top: number; warna?: string; style?: React.CSSProperties; flip?: boolean }> = ({ c, id, l, top, warna, style, flip }) => {
  const w = c.tema.warna, ef = c.tema.bentuk.efek ?? 1
  const [W, H] = UKURAN[id] ?? [300, 300]
  const fx = w.misreg ? `drop-shadow(${5 * ef}px ${4 * ef}px 0 ${w.misreg})` : 'none'
  return <Sprite src={`aset/sprite/${id}.png`} warna={warna} fx={fx} style={{ left: l, top, width: W, height: H, transform: flip ? 'scaleX(-1)' : undefined, ...style }} />
}
const karakterStyle = (c: Ctx, at: number, fase: number): React.CSSProperties => ({
  ...pop(c.t, at, goyang(c.t, fase, 1)), position: 'absolute', transformOrigin: '50% 100%',
})
const serif = (c: Ctx): React.CSSProperties => ({ fontFamily: c.tema.font.serif, fontStyle: 'italic', fontWeight: 900 })
const stabilo = (c: Ctx, at: number, warna: string): React.CSSProperties => ({
  position: 'absolute', left: -10, right: -10, bottom: '12%', height: '30%', background: warna, zIndex: -1,
  transformOrigin: 'left center', transform: `rotate(-1.5deg) scaleX(${kf(c.t, [[at, 0], [at + 0.2, 1, out3]])})`,
})
const label = (c: Ctx, teks: string, warna: string): React.ReactNode =>
  <div style={{ fontFamily: c.tema.font.display, fontSize: 40, letterSpacing: 3, color: warna }}>{teks}</div>
// garis tergambar (coretan, panah, centang): SVG stroke-dashoffset
const Garis: React.FC<{ c: Ctx; d: string; at: number; dur?: number; warna: string; lebar?: number; style?: React.CSSProperties; w: number; h: number }> =
  ({ c, d, at, dur = 0.3, warna, lebar = 12, style, w, h }) => (
    <svg width={w} height={h} style={{ position: 'absolute', overflow: 'visible', ...style }}>
      <path d={d} fill="none" stroke={warna} strokeWidth={lebar} strokeLinecap="square" strokeLinejoin="miter"
        pathLength={1} strokeDasharray={1} strokeDashoffset={kf(c.t, [[at, 1], [at + dur, 0, out2]])} />
    </svg>
  )

// 1. HOOK: catatan besar + kata kunci raksasa + karakter kaget + properti di magnet sobek
const Hook: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, k = kunci(c)
  return <>
    <Kertas tema={c.tema} t={c.t} l={80} top={250} w={640} h={460} warna={w.catatan} seed={41} style={{ opacity: kf(c.t, [[c.mulai, 0], [c.mulai + 0.1, 1]]) }}>
      {d.label && <div style={{ position: 'absolute', left: 40, top: 40 }}>{label(c, d.label, w.tintaCatatan)}</div>}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 150, color: w.kata, lineHeight: 1, ...serif(c) }}>
        <span style={{ ...pop(c.t, k, -3), position: 'relative', isolation: 'isolate' }}>{d.besar}<span style={stabilo(c, k + 0.15, w.stabilo)} /></span>
      </div>
    </Kertas>
    <Kertas tema={c.tema} t={c.t} l={100} top={740} w={420} h={380} warna={w.magnet} seed={43} style={{ ...pop(c.t, c.mulai + 0.3, 2), position: 'absolute' }}>
      <Spr c={c} id={d.properti} l={42} top={34} />
    </Kertas>
    <Spr c={c} id="ciprat-minyak" warna={w.cipratan} l={300} top={620} style={{ opacity: kf(c.t, [[k, 0], [k + 0.1, 1], [c.selesai - 0.2, 1], [c.selesai, 0, in2]]), transform: `scale(${popS(c.t, k, 0.5)})` }} />
    <div style={karakterStyle(c, c.mulai + 0.15, 1)}><Spr c={c} id={d.karakter} l={620} top={520} /></div>
  </>
}
const hookSfx = (c: Ctx): [number, string][] => [[c.mulai + 0.1, 'swish-soft'], [kunci(c), 'impact-heavy-soft'], [kunci(c) + 0.15, 'writing-highlighter']]

// 2. SEBAB-AKIBAT: dua kartu + panah tergambar
const Sebab: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, t1 = kunci(c, 0), t2 = kunci(c, 1)
  const kartu = (l: number, top: number, warna: string, aset: string, warnaAset: string | undefined, teks: string, at: number, seed: number) => (
    <Kertas tema={c.tema} t={c.t} l={l} top={top} w={400} h={440} warna={warna} seed={seed} style={{ ...pop(c.t, at, 0), position: 'absolute' }}>
      <Spr c={c} id={aset} warna={warnaAset} l={(400 - (UKURAN[aset]?.[0] ?? 200)) / 2} top={40} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 40, textAlign: 'center', fontSize: 110, color: w.tintaCatatan, ...serif(c) }}>{teks}</div>
    </Kertas>
  )
  return <>
    {kartu(80, 240, w.catatan2, d.sebab_aset, w.tetes, d.sebab, t1, 51)}
    <Garis c={c} at={t1 + 0.4} w={140} h={80} warna={w.tintaPintu} d="M0 40 L120 40 M90 10 L125 40 L90 70" style={{ left: 470, top: 420 }} />
    {kartu(600, 330, w.catatan, d.akibat_aset, w.cipratan, d.akibat, t2, 53)}
    <div style={karakterStyle(c, c.mulai + 0.2, 2)}><Spr c={c} id={d.karakter} l={330} top={580} /></div>
  </>
}
const sebabSfx = (c: Ctx): [number, string][] => [[kunci(c, 0), 'swish-soft'], [kunci(c, 0) + 0.4, 'zip-in-soft'], [kunci(c, 1), 'pop-medium-in']]

// 3. SALAH vs BENAR: kartu salah dicoret, kartu benar dicentang
const SalahBenar: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, tb = waktu(c, d.benar_pada), tc = d.coret_pada ? waktu(c, d.coret_pada) : (c.mulai + tb) / 2
  return <>
    <Kertas tema={c.tema} t={c.t} l={80} top={230} w={640} h={260} warna={w.catatan2} seed={61} style={{ ...pop(c.t, c.mulai + 0.1, 0), position: 'absolute' }}>
      <div style={{ padding: '34px 40px' }}>{label(c, 'SALAH', w.tintaCatatan2)}
        <div style={{ fontFamily: c.tema.font.tangan, fontSize: 66, lineHeight: 1, marginTop: 10, color: w.tintaCatatan2 }}>{d.salah}</div></div>
      <Garis c={c} at={tc} dur={0.35} w={560} h={150} warna={w.bayangan} lebar={14} d="M0 120 L80 20 L160 120 L240 20 L320 120 L400 20 L480 120 L560 20" style={{ left: 40, top: 70 }} />
    </Kertas>
    <div style={karakterStyle(c, c.mulai + 0.2, 3)}><Spr c={c} id={d.karakter} l={60} top={560} /></div>
    <Kertas tema={c.tema} t={c.t} l={400} top={600} w={600} h={290} warna={w.catatan} seed={63} style={{ ...pop(c.t, tb, 0), position: 'absolute' }}>
      <div style={{ padding: '34px 40px' }}>{label(c, 'BENAR', w.tintaCatatan)}
        <div style={{ fontFamily: c.tema.font.tangan, fontSize: 66, lineHeight: 1, marginTop: 10, color: w.tintaCatatan, maxWidth: 420 }}>{d.benar}</div></div>
      <Garis c={c} at={tb + 0.3} w={120} h={100} warna={w.kata} lebar={16} d="M0 50 L40 90 L120 0" style={{ left: 450, top: 40 }} />
    </Kertas>
  </>
}
const salahSfx = (c: Ctx): [number, string][] => {
  const tb = waktu(c, c.a.data.benar_pada), tc = c.a.data.coret_pada ? waktu(c, c.a.data.coret_pada) : (c.mulai + tb) / 2
  return [[c.mulai + 0.1, 'swish-soft'], [tc, 'writing-scribble'], [tb, 'pop-medium-in'], [tb + 0.3, 'writing-marker-tick']]
}

// 4. CHECKLIST: notes + item yg muncul & dicentang pas diucapkan
const Checklist: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data
  return <>
    <Kertas tema={c.tema} t={c.t} l={80} top={240} w={800} h={170 + d.item.length * 130} warna={w.catatan} seed={71} style={{ ...pop(c.t, c.mulai + 0.1, 0), position: 'absolute' }}>
      <div style={{ position: 'absolute', left: 44, top: 40, fontFamily: c.tema.font.tangan, fontSize: 70, color: w.tintaCatatan }}>{d.judul}:</div>
      {d.item.map((it: any, i: number) => {
        const at = waktu(c, it.pada)
        return <div key={i} style={{ position: 'absolute', left: 44, top: 150 + i * 130, display: 'flex', alignItems: 'center', gap: 30 }}>
          <div style={{ position: 'relative', width: 70, height: 70, border: `8px solid ${w.tintaCatatan}`, flexShrink: 0 }}>
            <Garis c={c} at={at + 0.15} w={70} h={60} warna={w.kata} lebar={14} d="M4 30 L26 52 L70 0" style={{ left: 2, top: -8 }} />
          </div>
          <span style={{ ...pop(c.t, at, 0), fontFamily: c.tema.font.display, fontSize: 58, color: w.tintaCatatan }}>{it.teks}</span>
        </div>
      })}
    </Kertas>
    <Kertas tema={c.tema} t={c.t} l={560} top={680} w={420} h={380} warna={w.magnet} seed={73} style={{ ...pop(c.t, c.mulai + 0.3, -2), position: 'absolute' }}>
      <Spr c={c} id={d.properti} l={42} top={34} />
    </Kertas>
  </>
}
const checklistSfx = (c: Ctx): [number, string][] => [[c.mulai + 0.1, 'swish-soft'],
  ...c.a.data.item.flatMap((it: any) => [[waktu(c, it.pada), 'pop-small-bubble'], [waktu(c, it.pada) + 0.15, 'writing-marker-tick']] as [number, string][])]

// 5. CHAT TAKEOVER: layar chat naik nutupin layar (lapisan layar, bukan dunia)
const Chat: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data
  const y = c.t < c.selesai - 0.35 ? kf(c.t, [[c.mulai, 1300], [c.mulai + 0.35, 0, out3]]) : kf(c.t, [[c.selesai - 0.35, 0], [c.selesai, 1400, in2]])
  return (
    <div style={{ position: 'absolute', left: 110, top: 200, width: 860, height: 950, transform: `translateY(${y}px) rotate(${goyang(c.t, 5, 0.5) - 1}deg)`,
      background: w.latar, boxShadow: `12px 12px 0 ${w.bayangan}`, border: `6px solid ${w.misreg ?? w.tintaPintu}` }}>
      <div style={{ height: 120, background: w.bayangan, display: 'flex', alignItems: 'center', padding: '0 40px', gap: 24 }}>
        <div style={{ width: 64, height: 64, background: w.catatan2 }} />
        <div style={{ fontFamily: c.tema.font.display, fontSize: 46, color: w.tintaPintu }}>{d.nama}</div>
      </div>
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 34 }}>
        {d.pesan.map((p: any, i: number) => {
          const aku = p.dari === 'aku'
          return <div key={i} style={{ ...pop(c.t, waktu(c, p.pada), aku ? 1 : -1), alignSelf: aku ? 'flex-end' : 'flex-start', maxWidth: 620,
            background: aku ? w.catatan : w.catatan2, color: w.tintaCatatan, padding: '24px 30px', borderRadius: 2,
            fontFamily: c.tema.font.tangan, fontSize: 56, lineHeight: 1.05, boxShadow: `7px 7px 0 ${w.bayangan}` }}>{p.teks}</div>
        })}
      </div>
    </div>
  )
}
const chatSfx = (c: Ctx): [number, string][] => [[c.mulai, 'whoosh-fast-soft'], [c.selesai - 0.35, 'zip-out-soft'],
  ...c.a.data.pesan.map((p: any) => [waktu(c, p.pada), p.dari === 'aku' ? 'notification-message-out-soft' : 'notification-message-in-soft'] as [number, string])]

// 6. PENUTUP: kalimat penutup besar + karakter; slot affiliate opsional (wajib disclosure kalau diisi)
const Penutup: React.FC<Ctx> = (c) => {
  const w = c.tema.warna, d = c.a.data, k = kunci(c), af = c.affiliate
  return <>
    <Kertas tema={c.tema} t={c.t} l={80} top={240} w={700} h={330} warna={w.catatan} seed={81} style={{ ...pop(c.t, c.mulai + 0.1, 0), position: 'absolute' }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontSize: 150, color: w.kata, lineHeight: 1, ...serif(c) }}>
        <span style={{ ...pop(c.t, k, -2), position: 'relative', isolation: 'isolate' }}>{d.besar}<span style={stabilo(c, k + 0.15, w.stabilo)} /></span>
      </div>
    </Kertas>
    {af && <Kertas tema={c.tema} t={c.t} l={80} top={640} w={560} h={440} warna={w.catatan2} seed={83} style={{ ...pop(c.t, k + 0.6, 0), position: 'absolute' }}>
      <div style={{ padding: '36px 40px', color: w.tintaCatatan2 }}>
        {label(c, 'YANG AKU PAKAI', w.tintaCatatan2)}
        <div style={{ fontFamily: c.tema.font.tangan, fontSize: 64, lineHeight: 1, marginTop: 14 }}>{af.produk}</div>
        <div style={{ fontFamily: c.tema.font.display, fontSize: 40, marginTop: 18 }}>{af.teks}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: w.bayangan, color: w.tintaPintu, padding: '18px 40px',
        fontFamily: c.tema.font.display, fontSize: 30, letterSpacing: 1 }}>{af.disclosure}</div>
    </Kertas>}
    <div style={karakterStyle(c, c.mulai + 0.2, 6)}><Spr c={c} id={d.karakter} l={620} top={520} /></div>
  </>
}
const penutupSfx = (c: Ctx): [number, string][] => [[c.mulai + 0.1, 'swish-soft'], [kunci(c), 'notification-success-chime'],
  ...(c.affiliate ? [[kunci(c) + 0.6, 'pop-medium-in'] as [number, string]] : [])]

export const TEMPLATE: Record<string, { K: React.FC<Ctx>; sfx: (c: Ctx) => [number, string][]; layar?: boolean }> = {
  'hook-kejutan': { K: Hook, sfx: hookSfx }, 'sebab-akibat': { K: Sebab, sfx: sebabSfx },
  'salah-vs-benar': { K: SalahBenar, sfx: salahSfx }, 'checklist-pop': { K: Checklist, sfx: checklistSfx },
  'chat-takeover': { K: Chat, sfx: chatSfx, layar: true }, 'penutup': { K: Penutup, sfx: penutupSfx },
}
export { inOut3, F }
