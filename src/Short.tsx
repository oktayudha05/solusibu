import { AbsoluteFill, Audio, Series, staticFile, useCurrentFrame, useVideoConfig } from 'remotion'
import { FPS, SAFE, SUB_TINGGI, UKURAN, WARNA, fontFamily } from './gaya'
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

export const Short = ({ adegan }: ShortProps) => (
  <AbsoluteFill style={{ background: WARNA.krem }}>
    <Series>
      {adegan.map((a, i) => (
        <Series.Sequence key={i} durationInFrames={frameAdegan(a)}>
          <Visual {...a.visual} />
          {a.audio && <Audio src={staticFile(a.audio)} />}
          {a.kata && <Subtitle kata={a.kata} />}
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
)
