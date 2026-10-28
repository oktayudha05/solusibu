// Video dari naskah.json (+ timing kata dari suara.py). Render: npx remotion render src/index.tsx Video out.mp4 --props=props.json
import React from 'react'
import { AbsoluteFill, Audio, Composition, Sequence, registerRoot, staticFile, useCurrentFrame } from 'remotion'
import { FPS, SAFE, inOut3, kf, out2 } from './lib'
import { E3, Tema } from './tema'
import { Adegan, Affiliate, Ctx, TEMPLATE, norm } from './template'
import idx from '../public/aset/index.json'

const TEMA: Record<string, Tema> = { E3 }
const SYNC: Record<string, number> = Object.fromEntries(idx.aset.filter((x: any) => x.jenis === 'sfx').map((x: any) => [x.id, x.sync_at]))
const PANEL = 1500 // jarak antar adegan di dunia (kanvas nyambung, kamera turun)
const EKOR = 1.5 // tahan di akhir

type Naskah = { slug: string; tema: string; adegan: Adegan[]; affiliate: Affiliate; audio?: { file: string; durasi: number }; safe?: boolean }

// kapan tiap adegan mulai/selesai: dari kata pertama (timing suara). Tanpa timing: 0.4 dtk/kata.
const jadwal = (n: Naskah) => {
  let t = 0
  const adegan = n.adegan.map((a): Adegan => {
    if (a.kata) return a
    const k = a.teks.split(/\s+/), kata = k.map((w, i): [string, number, number] => [w, t + i * 0.4, t + i * 0.4 + 0.35])
    t += k.length * 0.4 + 0.3
    return { ...a, kata }
  })
  const total = (n.audio?.durasi ?? t) + EKOR
  const mulai = adegan.map((a, i) => (i === 0 ? 0 : Math.max(0, a.kata[0][1] - 0.25)))
  return { adegan, total, mulai, selesai: mulai.map((_, i) => mulai[i + 1] ?? total) }
}

// caption per potongan (maks 4 kata / sampai tanda baca), kata muncul pas diucapkan, kata kunci beda gaya
const Caption: React.FC<{ tema: Tema; t: number; a: Adegan; akhir: number }> = ({ tema, t, a, akhir }) => {
  const potong: typeof a.kata[] = []; let cur: typeof a.kata = []
  a.kata.forEach((k) => { cur.push(k); if (cur.length >= 4 || /[.,?!]$/.test(k[0])) { potong.push(cur); cur = [] } })
  if (cur.length) potong.push(cur)
  const i = potong.findIndex((p, j) => t >= p[0][1] - 0.1 && t < (potong[j + 1]?.[0][1] ?? akhir) - 0.1)
  if (i < 0) return null
  const kunci = new Set(a.kunci.map(norm)), w = tema.warna
  return (
    <div style={{ position: 'absolute', left: SAFE.kiri + 20, right: SAFE.kanan + 20, top: 1190, height: 1920 - SAFE.bawah - 1190,
      display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignContent: 'center', gap: '0 22px' }}>
      {potong[i].map(([kata, s], j) => {
        const k = kunci.has(norm(kata))
        return <span key={j} style={{ display: 'inline-block', transform: `scale(${kf(t, [[s - 0.05, 0.8], [s + 0.12, 1.05, out2], [s + 0.2, 1]])})`,
          opacity: kf(t, [[s - 0.05, 0], [s + 0.08, 1]]), color: k ? w.catatan : w.tintaPintu, lineHeight: 1.1,
          fontFamily: k ? tema.font.serif : tema.font.display, fontStyle: k ? 'italic' : 'normal', fontWeight: k ? 900 : 400, fontSize: k ? 104 : 74,
          textShadow: `${-2 * (tema.bentuk.efek ?? 1) * 2}px ${1.5 * 2}px 0 ${w.bayangan}` }}>{kata}</span>
      })}
    </div>
  )
}

export const Video: React.FC<Naskah> = (n) => {
  const frame = useCurrentFrame(), t = frame / FPS
  const tema = TEMA[n.tema] ?? E3, w = tema.warna
  const { adegan, total, mulai, selesai } = jadwal(n)
  const ctx = (i: number): Ctx => ({ tema, t, a: adegan[i], mulai: mulai[i], selesai: selesai[i], affiliate: n.affiliate })
  const aktif = Math.max(0, mulai.findLastIndex((m) => t >= m))
  // kamera: turun ke panel adegan (0.55 dtk), push 3% pelan di tiap adegan; adegan "layar" (chat) tidak geser
  const panelKe = (i: number) => adegan.slice(0, i + 1).filter((a) => !TEMPLATE[a.template]?.layar).length - 1
  const kunciKamera: [number, number, any][] = [[0, 0, undefined]]
  adegan.forEach((_, i) => { if (i) kunciKamera.push([mulai[i] - 0.3, panelKe(i - 1) * PANEL, undefined], [mulai[i] + 0.25, panelKe(i) * PANEL, inOut3]) })
  const camY = kf(t, kunciKamera)
  const push = 1 + 0.03 * Math.min(1, (t - mulai[aktif]) / Math.max(1, selesai[aktif] - mulai[aktif]))
  // sfx: global (geser kamera) + per template; mulai = momen - sync_at
  const sfx: [number, string][] = [...adegan.flatMap((a, i) => [
    ...(i && !TEMPLATE[a.template]?.layar && panelKe(i) !== panelKe(i - 1) ? [[mulai[i] - 0.02, 'whoosh-medium-soft'] as [number, string]] : []),
    ...(TEMPLATE[a.template]?.sfx(ctx(i)) ?? [])])]

  return (
    <AbsoluteFill style={{ background: w.latar, overflow: 'hidden' }}>
      {n.audio && <Audio src={staticFile(n.audio.file)} />}
      {sfx.map(([at, id], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((at - (SYNC[id] ?? 0)) * FPS))}><Audio src={staticFile(`aset/sfx/${id}.wav`)} volume={0.45} /></Sequence>
      ))}
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '540px 700px', transform: `scale(${push})` }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, transform: `translateY(${-camY}px)` }}>
          <div style={{ position: 'absolute', left: 40, top: -200, width: 1000, height: PANEL * adegan.length + 2400, background: w.pintu }} />
          {adegan.map((a, i) => {
            const T = TEMPLATE[a.template]
            if (!T || T.layar || t < mulai[i] - 0.4) return null // muncul pas giliran, lalu tetap nempel (satu kanvas)
            return <div key={i} style={{ position: 'absolute', left: 0, top: panelKe(i) * PANEL, width: 1080, height: PANEL }}><T.K {...ctx(i)} /></div>
          })}
        </div>
      </div>
      {adegan.map((a, i) => { const T = TEMPLATE[a.template]; return T?.layar && t >= mulai[i] && t < selesai[i] ? <T.K key={i} {...ctx(i)} /> : null })}
      <Caption tema={tema} t={t} a={adegan[aktif]} akhir={selesai[aktif]} />
      <svg width={1080} height={1920} style={{ position: 'absolute', inset: 0, opacity: tema.bentuk.grain, mixBlendMode: 'multiply', pointerEvents: 'none' }}>
        <filter id="g"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={Math.floor(frame / 2) % 6} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
      {n.safe && <div style={{ position: 'absolute', left: SAFE.kiri, right: SAFE.kanan, top: SAFE.atas, bottom: SAFE.bawah, outline: '4px dashed #00FFFF' }} />}
    </AbsoluteFill>
  )
}

registerRoot(() => (
  <Composition id="Video" component={Video as any} fps={FPS} width={1080} height={1920} durationInFrames={300}
    defaultProps={{ slug: 'kosong', tema: 'E3', adegan: [], affiliate: null } as any}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(jadwal(JSON.parse(JSON.stringify(props)) as Naskah).total * FPS) })} />
))
