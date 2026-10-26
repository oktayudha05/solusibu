import { ReactNode } from 'react'
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { SAFE, SUB_TINGGI, UKURAN, WARNA, fontFamily } from './gaya'

export type VisualProps =
  | { jenis: 'hook'; teks: string }
  | { jenis: 'poin'; judul: string; poin: string[] }
  | { jenis: 'banding'; kiri: { label: string; teks: string }; kanan: { label: string; teks: string } }
  | { jenis: 'angka'; angka: string; teks: string }
  | { jenis: 'aff'; produk: string; teks: string }

// muncul halus: geser naik + fade, tertunda `tunda` frame
const Muncul = ({ tunda = 0, children }: { tunda?: number; children: ReactNode }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = spring({ frame: f - tunda, fps, config: { damping: 200 } })
  return <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}>{children}</div>
}

const teks = (ukuran: number, warna: string = WARNA.navy, berat = 700) =>
  ({ fontFamily, fontSize: ukuran, fontWeight: berat, color: warna, lineHeight: 1.25, margin: 0 }) as const

const Kotak = ({ children, gap = 48 }: { children: ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ padding: `${SAFE.atas}px ${SAFE.kanan}px ${SAFE.bawah + SUB_TINGGI}px ${SAFE.kiri}px`,
    justifyContent: 'center', alignItems: 'center', gap, textAlign: 'center' }}>
    {children}
  </AbsoluteFill>
)

const Kartu = ({ warna, label, children }: { warna: string; label: string; children: ReactNode }) => (
  <div style={{ background: warna, borderRadius: 40, padding: 40, width: '100%', boxSizing: 'border-box' }}>
    <p style={{ ...teks(UKURAN.label, WARNA.sage, 800), textTransform: 'uppercase', letterSpacing: 4 }}>{label}</p>
    <p style={teks(UKURAN.isi, WARNA.krem)}>{children}</p>
  </div>
)

export const Visual = (v: VisualProps) => {
  switch (v.jenis) {
    case 'hook':
      return (
        <Kotak>
          <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: WARNA.sage, opacity: 0.45 }} />
          <Muncul><p style={teks(UKURAN.judul + 16, WARNA.tealTua, 800)}>{v.teks}</p></Muncul>
        </Kotak>
      )
    case 'poin':
      return (
        <Kotak>
          <Muncul><p style={teks(UKURAN.judul, WARNA.tealTua, 800)}>{v.judul}</p></Muncul>
          {v.poin.map((p, i) => (
            <Muncul key={i} tunda={10 + i * 12}>
              <div style={{ background: WARNA.sage, borderRadius: 32, padding: '28px 40px' }}>
                <p style={teks(UKURAN.isi)}>{p}</p>
              </div>
            </Muncul>
          ))}
        </Kotak>
      )
    case 'banding':
      return (
        <Kotak>
          <Muncul><Kartu warna={WARNA.merah} label={v.kiri.label}>{v.kiri.teks}</Kartu></Muncul>
          <Muncul tunda={14}><Kartu warna={WARNA.tealTua} label={v.kanan.label}>{v.kanan.teks}</Kartu></Muncul>
        </Kotak>
      )
    case 'angka':
      return (
        <Kotak>
          <Muncul><p style={teks(UKURAN.angka, WARNA.tealTua, 800)}>{v.angka}</p></Muncul>
          <Muncul tunda={10}><p style={teks(UKURAN.isi)}>{v.teks}</p></Muncul>
        </Kotak>
      )
    case 'aff':
      return (
        <Kotak>
          <Muncul><p style={teks(UKURAN.judul, WARNA.tealTua, 800)}>{v.produk}</p></Muncul>
          <Muncul tunda={8}><p style={teks(UKURAN.isi)}>{v.teks}</p></Muncul>
          <Muncul tunda={16}>
            <div style={{ background: WARNA.navy, borderRadius: 32, padding: '24px 40px' }}>
              <p style={teks(UKURAN.label, WARNA.krem, 700)}>konten berbayar · tautan afiliasi</p>
              <p style={teks(UKURAN.isi, WARNA.sage, 800)}>link di profil</p>
            </div>
          </Muncul>
        </Kotak>
      )
  }
}
