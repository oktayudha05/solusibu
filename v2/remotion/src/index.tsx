// Video dari naskah.json (+ timing kata dari suara.py). Render: npx remotion render src/index.tsx Video out.mp4 --props=props.json
// Satu kanvas: wilayah 0 = dapur (wajan bersama), template lain dapat wilayah sendiri di grid 2 kolom. Kamera (kamera.tsx) jalan di atasnya.
import React from 'react'
import { AbsoluteFill, Audio, Composition, Sequence, registerRoot, staticFile, useCurrentFrame } from 'remotion'
import { F, FPS, GrainPng, SAFE, Sprite, bayang, ease, goyang, halftone, kf, popS } from './lib'
import { Kamera, KeyKamera, Titik, kameraDi, kecepatan } from './kamera'
import { Dapur, Peristiwa, jangkarDapur, jariDapur } from './dapur'
import { KataBesar, KataK } from './kinetik'
import { E3, Tema } from './tema'
import { Adegan, Affiliate, Ctx, TEMPLATE, UKURAN, norm } from './template'
import idx from '../public/aset/index.json'

const TEMA: Record<string, Tema> = { E3 }
const SYNC: Record<string, number> = Object.fromEntries(idx.aset.filter((x: any) => x.jenis === 'sfx').map((x: any) => [x.id, x.sync_at]))
const EKOR = 0.5 // pendek: video loop, frame akhir nyambung ke frame 0
const WIL = [1300, 2000] // jarak antar wilayah (x, y)

type Naskah = { slug: string; tema: string; adegan: Adegan[]; affiliate: Affiliate; audio?: { file: string; durasi: number }; safe?: boolean }

// kapan tiap adegan mulai/selesai: dari kata pertama (timing suara). Tanpa timing: 0.42 dtk/kata (cuma buat still lokal).
export const jadwal = (n: Naskah) => {
  let t = 0.2
  const adegan = n.adegan.map((a): Adegan => {
    if (a.kata) return a
    const k = a.teks.split(/\s+/), kata = k.map((w, i): [string, number, number] => [w, t + i * 0.42, t + i * 0.42 + 0.36])
    t += k.length * 0.42 + 0.35
    return { ...a, kata }
  })
  const total = (n.audio?.durasi ?? t) + EKOR
  const mulai = adegan.map((a, i) => (i === 0 ? 0 : Math.max(0, a.kata[0][1] - 0.25)))
  // wilayah: dapur = [0,0]; lainnya urut di grid 2 kolom (k=1 di kanan dapur → wajan masih ngintip pas pindah)
  let k = 0
  const wil = adegan.map((a): Titik => (TEMPLATE[a.template]?.dapur ? [0, 0] : (k++, [((k) % 2) * WIL[0], Math.floor(k / 2) * WIL[1]])))
  const dunia = [-200, -200, Math.max(...wil.map((w) => w[0])) + 1280, Math.max(...wil.map((w) => w[1])) + 1700]
  return { adegan, total, mulai, selesai: mulai.map((_, i) => mulai[i + 1] ?? total), wil, dunia }
}

// latar parallax: kertas grafik + halftone (d 0.3), coretan catatan lab (d 0.6), penggaris depan (d 1.35)
const Latar: React.FC<{ tema: Tema }> = ({ tema }) => {
  const w = tema.warna
  return <div style={{ position: 'absolute', left: -3000, top: -3000, width: 9000, height: 9000, background: w.pintu }}>
    <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundImage: `linear-gradient(${w.tintaPintu} 2px, transparent 2px), linear-gradient(90deg, ${w.tintaPintu} 2px, transparent 2px)`, backgroundSize: '64px 64px' }} />
    <div style={{ position: 'absolute', inset: 0, opacity: 0.5, background: halftone(w.latar, 11, 3) }} />
  </div>
}
const CORET = ['H₂O', '100°C', '±190°C', 'uap ↑', '×1.600', '1 L', 'jangan air!', 'kering']
const Coretan: React.FC<{ tema: Tema }> = ({ tema }) => <div style={{ position: 'absolute', left: 0, top: 0 }}>
  {Array.from({ length: 24 }, (_, i) => (
    <div key={i} style={{ position: 'absolute', left: -400 + (i % 4) * 520 + (i % 3) * 90, top: -300 + Math.floor(i / 4) * 620, fontFamily: tema.font.tangan, fontSize: 92,
      color: tema.warna.tintaPintu, opacity: 0.12, transform: `rotate(${i % 2 ? 6 : -5}deg)` }}>{CORET[i % CORET.length]}</div>
  ))}
</div>
// lapis depan: penggaris kekunci di bawah layar (y≈1500), geser horizontal 1.35x kamera (parallax), selalu ngisi bawah
const Depan: React.FC<{ tema: Tema; cam: { x: number; zoom: number; rot: number } }> = ({ tema, cam }) => {
  const w = tema.warna
  return <div style={{ position: 'absolute', left: -200, top: 1530, width: 1480, height: 64, background: w.catatan, filter: bayang(w.bayangan, 12),
    transform: `rotate(${-3 + cam.rot * 1.35}deg)`, backgroundImage: `repeating-linear-gradient(90deg, ${w.latar} 0 6px, transparent 6px 32px)`,
    backgroundSize: '160px 22px', backgroundRepeat: 'repeat-x', backgroundPositionX: `${-cam.x * 1.35 * cam.zoom}px` }}>
    <div style={{ position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(90deg, ${w.latar} 0 6px, transparent 6px 160px)`, backgroundSize: '160px 40px',
      backgroundRepeat: 'repeat-x', backgroundPositionX: `${-cam.x * 1.35 * cam.zoom}px` }} />
  </div>
}

export const Video: React.FC<Naskah> = (n) => {
  const frame = useCurrentFrame(), t = frame / FPS
  const tema = TEMA[n.tema] ?? E3, w = tema.warna
  const { adegan, total, mulai, selesai, wil, dunia } = jadwal(n)
  const ctx = (i: number): Ctx & { dunia: number[] } => ({ tema, t, a: adegan[i], mulai: mulai[i], selesai: selesai[i], affiliate: n.affiliate, ox: wil[i][0], oy: wil[i][1], dunia })
  const aktif = Math.max(0, mulai.findLastIndex((m) => t >= m))
  const ps: Peristiwa[] = adegan.flatMap((a, i) => (TEMPLATE[a.template]?.peristiwa ? [TEMPLATE[a.template].peristiwa!(ctx(i))] : []))
  const jangkar = jangkarDapur(t, ps), jari = jariDapur(t, ps)

  // kamera: key tiap template disambung; sebelum tiap adegan ada key "tahan" biar perpindahan cuma makan waktu transisinya
  const keys: KeyKamera[] = []
  adegan.forEach((a, i) => {
    const T = TEMPLATE[a.template]; if (!T) return
    const k = T.kamera(ctx(i))
    if (keys.length && k.length) {
      const c = kameraDi(mulai[i] - 0.05, keys, jangkarDapur(mulai[i] - 0.05, ps), 0)
      keys.push({ t: Math.max(keys[keys.length - 1].t + 0.01, mulai[i] - 0.05), fokus: [c.x, c.y], zoom: c.zoom, rot: c.rot })
    }
    keys.push(...k.filter((x) => !keys.length || x.t > keys[keys.length - 1].t))
  })
  if (!keys.length) keys.push({ t: 0, fokus: [540, 900], zoom: 1 })
  const cam = kameraDi(t, keys, jangkar)

  // sfx: per template + kamera ngebut (whip) + kata kunci (banting + stabilo) + ganti pose maskot
  // kunci "kata" atau "kata:tampilan" (angka diucap pakai huruf, tampil sbg angka). Cuma kata kunci yg tampil di layar.
  const kata: KataK[] = adegan.flatMap((a, i) => {
    const km = new Map(a.kunci.map((k) => { const [w, tampil] = k.split(':'); return [norm(w), tampil] as [string, string | undefined] }))
    return a.kata.map(([k, s, e]) => ({ kata: k, s, e, kunci: km.has(norm(k)), tampil: km.get(norm(k)), sampai: selesai[i] - 0.15 }))
  })
  const frasa = kata.filter((k) => k.kunci).map((k) => [k])
  const pose = (i: number) => adegan[i].data?.karakter ?? TEMPLATE[adegan[i].template]?.pose ?? 'ibu-senyum'
  const sfx: [number, string][] = [
    ...adegan.flatMap((a, i) => TEMPLATE[a.template]?.sfx(ctx(i)) ?? []),
    ...adegan.flatMap((_, i) => (i && wil[i].join() !== wil[i - 1].join() ? [[mulai[i] - 0.02, i % 2 ? 'whoosh-medium-soft' : 'whoosh-fast-soft'] as [number, string]] : [])),
    ...frasa.filter((f) => f.length === 1 && f[0].kunci).flatMap((f) => [[f[0].s - 3 * F, 'impact-heavy-soft'], [f[0].s, 'writing-highlighter']] as [number, string][]),
    ...adegan.flatMap((_, i) => (i && pose(i) !== pose(i - 1) ? [[mulai[i] + 0.2, 'pop-small-in'] as [number, string]] : [])),
  ]

  // maskot: kekunci di layar kiri bawah (objek yg kebawa di semua beat), ganti pose per adegan, lompat pas ciprat
  const pi = pose(aktif), [mw, mh] = (UKURAN[pi] ?? [300, 620]).map((v) => (v * 5) / 8) // x5 (tetap kelipatan bulat pixel art)
  const kaget = ps.some((p) => t >= p.ciprat && t < p.ciprat + 0.4 && !(p.beku && t >= p.beku[0] && t < p.beku[1]))
  const pc = ps.find((p) => t >= p.ciprat && t < p.ciprat + 0.4)
  const lompat = kaget && pc ? kf(t, [[pc.ciprat, 0], [pc.ciprat + 0.12, -70, ease.out3], [pc.ciprat + 0.3, 0, ease.in2]]) : 0
  const ganti = aktif > 0 && pose(aktif) !== pose(aktif - 1) ? mulai[aktif] + 0.2 : -9

  const Lp = TEMPLATE[adegan[aktif]?.template]?.Layar
  const blurOn = kecepatan(t, keys, jangkar) > 40
  const isiDunia = (
    <div style={{ position: 'absolute', left: 0, top: 0 }}>
      <Dapur tema={tema} t={t} ps={ps} gambar={-10} />
      {adegan.map((a, i) => {
        const T = TEMPLATE[a.template]
        if (!T?.K) return null
        return <div key={i} style={{ position: 'absolute', left: wil[i][0], top: wil[i][1], width: 1080, height: 1920 }}><T.K {...ctx(i)} /></div>
      })}
    </div>
  )
  return (
    <AbsoluteFill style={{ background: w.latar, overflow: 'hidden' }}>
      {n.audio && <Audio src={staticFile(n.audio.file)} />}
      {sfx.map(([at, id], i) => (
        <Sequence key={i} from={Math.max(0, Math.round((at - (SYNC[id] ?? 0)) * FPS))}><Audio src={staticFile(`aset/sfx/${id}.wav`)} volume={id.startsWith('pop') || id.startsWith('writing') ? 0.3 : 0.45} /></Sequence>
      ))}
      <Kamera t={t} keys={keys} jangkar={jangkar} blur={blurOn ? 'hantu' : 'none'} sampel={8}
        lapis={[{ d: 0.3, isi: <Latar tema={tema} /> }, { d: 0.6, isi: <Coretan tema={tema} /> }, { d: 1, isi: isiDunia }]} />
      <Depan tema={tema} cam={cam} />
      {!TEMPLATE[adegan[aktif]?.template]?.aktor && <div style={{ position: 'absolute', left: 40, top: 1536 - mh + lompat + goyang(t, 1, 4), width: mw, height: mh, transformOrigin: '50% 100%',
        transform: `rotate(${kaget ? goyang(t * 6, 0, 3) : goyang(t, 0, 1)}deg) scale(${t >= ganti ? popS(t, ganti) : 1})` }}>
        <Sprite src={`aset/sprite/${pi}.png`} fx={`drop-shadow(-5px 4px 0 ${w.misreg ?? w.catatan2}) ${bayang(w.bayangan)}`} style={{ left: 0, top: 0, width: mw, height: mh }} />
      </div>}
      {Lp && <Lp {...ctx(aktif)} cam={cam} jangkar={jangkar} jari={jari} dunia={dunia as any} />}
      <KataBesar tema={tema} t={t} kata={kata} frasa={frasa} />
      <GrainPng frame={frame} opacity={tema.bentuk.grain} />
      {n.safe && <>
        <div style={{ position: 'absolute', left: SAFE.kiri, right: SAFE.kanan, top: SAFE.atas, bottom: SAFE.bawah, outline: '4px dashed #00FFFF' }} />
        <div style={{ position: 'absolute', left: 880, top: 653, width: 200, height: 1517 - 653, background: '#00FFFF33' }} />
      </>}
    </AbsoluteFill>
  )
}

registerRoot(() => (
  <Composition id="Video" component={Video as any} fps={FPS} width={1080} height={1920} durationInFrames={300}
    defaultProps={{ slug: 'kosong', tema: 'E3', adegan: [], affiliate: null } as any}
    calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil(jadwal(JSON.parse(JSON.stringify(props)) as Naskah).total * FPS) })} />
))
