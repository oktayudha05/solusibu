import { ReactNode } from 'react'
import { AbsoluteFill, Audio, Series, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FPS, GERAK, SAFE, SUB_TINGGI, UKURAN, WARNA, fontFamily } from './gaya'
import { Visual, VisualProps } from './Visual'

export type Kata = { teks: string; mulai: number; selesai: number }
export type Adegan = { narasi: string; visual: VisualProps; audio?: string; durasi?: number; kata?: Kata[] }
export type ShortProps = { judul: string; suara: string; kecepatan: string; adegan: Adegan[] }

export const frameAdegan = (a: Adegan) => Math.max(1, Math.round((a.durasi ?? 1) * FPS))

const PER_BARIS = 4

// subtitle per kata: tampil 4 kata sekali, kata yg lagi diucapkan di-highlight
const Subtitle = ({ kata }: { kata: Kata[] }) => {
  const t = useCurrentFrame() / useVideoConfig().fps
  const aktif = Math.max(0, kata.findIndex((k) => t < k.selesai))
  const idx = t >= (kata.at(-1)?.selesai ?? 0) ? kata.length - 1 : aktif
  const awal = Math.floor(idx / PER_BARIS) * PER_BARIS
  return (
    <div style={{ position: 'absolute', left: SAFE.kiri, right: SAFE.kanan, bottom: SAFE.bawah, height: SUB_TINGGI,
      display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '0 22px' }}>
      {kata.slice(awal, awal + PER_BARIS).map((k, i) => (
        <span key={awal + i} style={{ fontFamily, fontWeight: 800, fontSize: UKURAN.subtitle,
          color: awal + i === idx ? WARNA.krem : WARNA.navy,
          background: awal + i === idx ? WARNA.tealTua : 'transparent', padding: '4px 18px', borderRadius: 20 }}>
          {k.teks}
        </span>
      ))}
    </div>
  )
}

// latar hidup: gradien krem->sage tipis yang geser pelan + pola titik tipis yang hanyut. kontinu antar adegan.
const Latar = () => {
  const t = useCurrentFrame() / FPS
  const x = 50 + 12 * Math.sin(t * 0.35)
  const y = 35 + 8 * Math.cos(t * 0.28)
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, ${WARNA.kremTerang} 0%, ${WARNA.krem} 45%, ${WARNA.kremSage} 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(${WARNA.sage} 3px, transparent 3.5px)`, backgroundSize: '72px 72px',
        backgroundPosition: `${t * 6}px ${t * 4}px`, opacity: 0.25 }} />
    </AbsoluteFill>
  )
}

// progress bar tipis tepat di atas safe area atas
const Progres = () => {
  const { durationInFrames } = useVideoConfig()
  const p = useCurrentFrame() / Math.max(1, durationInFrames - 1)
  return (
    <div style={{ position: 'absolute', top: SAFE.atas - 36, left: SAFE.kiri, right: SAFE.kanan, height: 12, borderRadius: 6,
      background: 'rgba(27,42,65,0.12)', overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(1, p) * 100}%`, height: '100%', background: WARNA.tealTua, borderRadius: 6 }} />
    </div>
  )
}

// fade masuk/keluar antar adegan (adegan pertama ga fade-in biar frame 0 ga kosong)
const Transisi = ({ durasi, pertama, children }: { durasi: number; pertama: boolean; children: ReactNode }) => {
  const f = useCurrentFrame()
  const m = GERAK.transisi
  if (durasi < m * 3) return <>{children}</>
  const o = interpolate(f, [0, m, durasi - m, durasi], [pertama ? 1 : 0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}

export const Short = ({ adegan }: ShortProps) => (
  <AbsoluteFill style={{ background: WARNA.krem }}>
    <Latar />
    <Series>
      {adegan.map((a, i) => (
        <Series.Sequence key={i} durationInFrames={frameAdegan(a)}>
          <Transisi durasi={frameAdegan(a)} pertama={i === 0}>
            <Visual {...a.visual} />
          </Transisi>
          {a.audio && <Audio src={staticFile(a.audio)} />}
          {a.kata && <Subtitle kata={a.kata} />}
        </Series.Sequence>
      ))}
    </Series>
    <Progres />
  </AbsoluteFill>
)
