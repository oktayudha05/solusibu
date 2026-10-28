import { CSSProperties, ReactNode } from 'react'
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'
import { FPS, GERAK, SAFE, SUB_TINGGI, UKURAN, WARNA, fontFamily } from './gaya'
import { Ikon, IkonNama } from './Ikon'

export type Gerak = 'goyang' | 'pulse' | 'melayang'

export type VisualProps =
  | { jenis: 'hook'; teks: string }
  | { jenis: 'poin'; judul: string; poin: string[] }
  | { jenis: 'banding'; kiri: { label: string; teks: string }; kanan: { label: string; teks: string } }
  | { jenis: 'angka'; angka: string; teks: string }
  | { jenis: 'aff'; produk: string; teks: string }
  | { jenis: 'diagram'; judul?: string; langkah: { ikon?: IkonNama; label: string }[] }
  | { jenis: 'ikon'; ikon: IkonNama; teks: string; gerak?: Gerak }
  | { jenis: 'penutup'; teks: string; ajakan?: string[] }

const klem = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

// spring halus (tanpa pantul), tertunda `tunda` frame
const usePegas = (tunda = 0) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return Math.min(1, spring({ frame: f - tunda, fps, config: GERAK.spring }))
}

// muncul halus: geser naik + fade
const Muncul = ({ tunda = 0, children }: { tunda?: number; children: ReactNode }) => {
  const p = usePegas(tunda)
  return <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [GERAK.geser, 0])}px)` }}>{children}</div>
}

// gerak idle pelan (periode 2 dtk): goyang / pulse / melayang
const Idle = ({ gerak, fase = 0, children }: { gerak: Gerak; fase?: number; children: ReactNode }) => {
  const s = Math.sin(((useCurrentFrame() + fase) / FPS) * Math.PI)
  const tf = gerak === 'goyang' ? `rotate(${s * 4}deg)` : gerak === 'pulse' ? `scale(${1 + 0.04 * s})` : `translateY(${s * 14}px)`
  return <div style={{ transform: tf }}>{children}</div>
}

// lingkaran sage dekor, "bernapas" pelan
const Napas = ({ ukuran, opacity = 0.45, pos }: { ukuran: number; opacity?: number; pos?: CSSProperties }) => {
  const s = Math.sin((useCurrentFrame() / FPS) * Math.PI * 0.6)
  return (
    <div style={{ position: 'absolute', width: ukuran, height: ukuran, borderRadius: '50%', background: WARNA.sage, opacity,
      transform: `scale(${1 + 0.03 * s})`, ...pos }} />
  )
}

const teks = (ukuran: number, warna: string = WARNA.navy, berat = 700) =>
  ({ fontFamily, fontSize: ukuran, fontWeight: berat, color: warna, lineHeight: 1.25, margin: 0 }) as const

// "*kata kunci*" -> per kata, dengan flag sorot. tanda * harus nempel di kata.
const urai = (s: string) => {
  let on = false
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      if (w.startsWith('*')) on = true
      const sorot = on
      if (w.replace(/[.,!?;:]+$/, '').endsWith('*')) on = false
      return { kata: w.replace(/\*/g, ''), sorot }
    })
}

const KataAnim = ({ kata, sorot, gelap, tunda }: { kata: string; sorot: boolean; gelap: boolean; tunda: number }) => {
  const p = usePegas(tunda)
  const s = usePegas(tunda + 8) // marker nyapu setelah kata muncul
  const marker = gelap ? 'rgba(244,239,225,0.22)' : WARNA.sorot
  return (
    <span style={{ display: 'inline-block', opacity: p, transform: `translateY(${interpolate(p, [0, 1], [GERAK.geser * 0.8, 0])}px)` }}>
      {sorot ? (
        <span style={{ color: gelap ? WARNA.krem : WARNA.tealTua, padding: '0 8px',
          backgroundImage: `linear-gradient(${marker},${marker})`, backgroundRepeat: 'no-repeat',
          backgroundPosition: '0 90%', backgroundSize: `${s * 100}% 45%` }}>{kata}</span>
      ) : kata}
    </span>
  )
}

// teks muncul per kata (stagger), kata kunci di-highlight lewat *...*
const TeksAnim = ({ children, ukuran, warna = WARNA.navy, berat = 700, tunda = 0, gelap = false, rata = 'center' }: {
  children: string; ukuran: number; warna?: string; berat?: number; tunda?: number; gelap?: boolean; rata?: 'left' | 'center'
}) => (
  <p style={{ ...teks(ukuran, warna, berat), textAlign: rata }}>
    {urai(children).map((k, i) => (
      <span key={i}>
        {i > 0 && ' '}
        <KataAnim kata={k.kata} sorot={k.sorot} gelap={gelap} tunda={tunda + i * GERAK.jedaKata} />
      </span>
    ))}
  </p>
)

const Kotak = ({ children, gap = 48 }: { children: ReactNode; gap?: number }) => (
  <AbsoluteFill style={{ padding: `${SAFE.atas}px ${SAFE.kanan}px ${SAFE.bawah + SUB_TINGGI}px ${SAFE.kiri}px`,
    justifyContent: 'center', alignItems: 'center', gap, textAlign: 'center' }}>
    {children}
  </AbsoluteFill>
)

// ikon di lingkaran krem biar kebaca di atas kartu berwarna
const Lencana = ({ nama }: { nama: IkonNama }) => (
  <div style={{ background: WARNA.krem, borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Ikon nama={nama} ukuran={48} />
  </div>
)

const Kartu = ({ warna, label, ikon, tunda, children }: { warna: string; label: string; ikon: IkonNama; tunda: number; children: string }) => (
  <div style={{ width: '100%' }}>
   <Muncul tunda={tunda}>
    <div style={{ background: warna, borderRadius: 40, padding: 40, width: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 12 }}>
        <Lencana nama={ikon} />
        <p style={{ ...teks(UKURAN.label, WARNA.krem, 800), textTransform: 'uppercase', letterSpacing: 4 }}>{label}</p>
      </div>
      <TeksAnim ukuran={UKURAN.isi} warna={WARNA.krem} gelap tunda={tunda + 6}>{children}</TeksAnim>
    </div>
   </Muncul>
  </div>
)

// "1.600x" -> awalan "", angka 1.600, akhiran "x". format Indonesia: titik ribuan, koma desimal.
const POLA_ANGKA = /^(\D*?)(\d(?:[\d.,]*\d)?)([\s\S]*)$/

const bacaAngka = (n: string) => {
  const ribuan = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(n)
  const bersih = ribuan ? n.replace(/\./g, '').replace(',', '.') : n.replace(',', '.')
  return { ribuan, koma: n.includes(','), desimal: (bersih.split('.')[1] ?? '').length, nilai: parseFloat(bersih) }
}

const tulisAngka = (v: number, a: { ribuan: boolean; koma: boolean; desimal: number }) => {
  const [i, d] = v.toFixed(a.desimal).split('.')
  const bulat = a.ribuan ? i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : i
  return d ? bulat + (a.koma || a.ribuan ? ',' : '.') + d : bulat
}

// count-up; kalau teks ga ada angkanya, tampil apa adanya
const HitungNaik = ({ angka }: { angka: string }) => {
  const f = useCurrentFrame()
  const m = angka.match(POLA_ANGKA)
  if (!m) return <>{angka}</>
  const a = bacaAngka(m[2])
  const p = interpolate(f, [4, 4 + GERAK.hitung], [0, 1], { ...klem, easing: Easing.out(Easing.cubic) })
  return <>{m[1] + tulisAngka(a.nilai * p, a) + m[3]}</>
}

// panah turun, garis digambar bertahap (stroke draw-on)
const Panah = ({ tunda }: { tunda: number }) => {
  const f = useCurrentFrame()
  const p = interpolate(f, [tunda, tunda + GERAK.panah], [0, 1], { ...klem, easing: Easing.inOut(Easing.quad) })
  return (
    <svg width={UKURAN.kotakIkon} height={60} viewBox="0 0 150 60" style={{ display: 'block', opacity: p > 0 ? 1 : 0 }}>
      <path d="M75 4V52M59 38L75 54L91 38" pathLength={1} stroke={WARNA.aksen} strokeWidth={8} fill="none"
        strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 2" strokeDashoffset={1 - p} />
    </svg>
  )
}

const Langkah = ({ ikon, nomor, label, tunda }: { ikon?: IkonNama; nomor: number; label: string; tunda: number }) => {
  const p = usePegas(tunda)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 36, height: UKURAN.kotakIkon }}>
      <div style={{ width: UKURAN.kotakIkon, height: UKURAN.kotakIkon, flexShrink: 0, borderRadius: '50%', background: WARNA.sage,
        display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})` }}>
        {ikon ? <Ikon nama={ikon} ukuran={96} /> : <p style={teks(72, WARNA.tealTua, 800)}>{nomor}</p>}
      </div>
      <div style={{ flex: 1 }}>
        <TeksAnim ukuran={UKURAN.langkah} tunda={tunda + 6} rata="left">{label}</TeksAnim>
      </div>
    </div>
  )
}

const LINGKAR_ANGKA = 720

// garis pendek aksen yang melebar, penanda di atas teks hook
const GarisAksen = () => {
  const p = usePegas(0)
  return <div style={{ width: 140 * p, height: 12, borderRadius: 6, background: WARNA.aksen }} />
}

const IkonBesar =({ nama, gerak }: { nama: IkonNama; gerak: Gerak }) => {
  const p = usePegas()
  return (
    <div style={{ width: 520, height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
      <Napas ukuran={520} />
      <div style={{ opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.7, 1])})` }}>
        <Idle gerak={gerak}>
          <Ikon nama={nama} ukuran={UKURAN.ikonBesar} />
        </Idle>
      </div>
    </div>
  )
}

const GERAK_IKON: Partial<Record<IkonNama, Gerak>> = { wajan: 'goyang', jam: 'goyang', api: 'pulse', termometer: 'pulse' }
const IKON_AJAKAN: IkonNama[] = ['simpan', 'ikuti']
const AJAKAN_DEFAULT = ['Simpan buat nanti', 'Ikuti solusibu']

export const Visual = (v: VisualProps) => {
  switch (v.jenis) {
    case 'hook':
      return (
        <Kotak>
          {/* dekor kalem: dua lingkaran kecil di pojok + garis pendek di atas teks */}
          <Napas ukuran={200} opacity={0.4} pos={{ top: SAFE.atas + 20, right: SAFE.kanan + 10 }} />
          <Napas ukuran={110} opacity={0.5} pos={{ bottom: SAFE.bawah + SUB_TINGGI + 10, left: SAFE.kiri + 30 }} />
          <GarisAksen />
          <TeksAnim ukuran={UKURAN.judul + 16} warna={WARNA.tealTua} berat={800} tunda={4}>{v.teks}</TeksAnim>
        </Kotak>
      )
    case 'poin':
      return (
        <Kotak>
          <TeksAnim ukuran={UKURAN.judul} warna={WARNA.tealTua} berat={800}>{v.judul}</TeksAnim>
          {v.poin.map((p, i) => {
            const t = 10 + i * GERAK.jedaBaris
            return (
              <Muncul key={i} tunda={t}>
                <div style={{ background: WARNA.sage, borderRadius: 32, padding: '28px 40px', display: 'flex', alignItems: 'center', gap: 28 }}>
                  <div style={{ ...teks(UKURAN.label, WARNA.krem, 800), width: 64, height: 64, flexShrink: 0, borderRadius: '50%',
                    background: WARNA.tealTua, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <TeksAnim ukuran={UKURAN.isi} tunda={t + 6} rata="left">{p}</TeksAnim>
                </div>
              </Muncul>
            )
          })}
        </Kotak>
      )
    case 'banding':
      return (
        <Kotak>
          <Kartu warna={WARNA.merah} label={v.kiri.label} ikon="silang" tunda={0}>{v.kiri.teks}</Kartu>
          <Kartu warna={WARNA.tealTua} label={v.kanan.label} ikon="centang" tunda={14}>{v.kanan.teks}</Kartu>
        </Kotak>
      )
    case 'angka':
      return (
        <Kotak>
          {/* angka dikecilkan sesuai panjangnya supaya selalu muat di dalam lingkaran (~0.56em per karakter) */}
          <div style={{ width: LINGKAR_ANGKA, height: LINGKAR_ANGKA, position: 'relative', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Napas ukuran={LINGKAR_ANGKA} opacity={0.35} />
            <Muncul>
              <p style={{ ...teks(Math.min(UKURAN.angka, Math.floor((LINGKAR_ANGKA * 0.78) / (Math.max(3, v.angka.length) * 0.56))), WARNA.tealTua, 800),
                fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}><HitungNaik angka={v.angka} /></p>
            </Muncul>
          </div>
          <TeksAnim ukuran={UKURAN.isi} tunda={10}>{v.teks}</TeksAnim>
        </Kotak>
      )
    case 'aff':
      return (
        <Kotak>
          <TeksAnim ukuran={UKURAN.judul} warna={WARNA.tealTua} berat={800}>{v.produk}</TeksAnim>
          <TeksAnim ukuran={UKURAN.isi} tunda={8}>{v.teks}</TeksAnim>
          <Muncul tunda={20}>
            <div style={{ background: WARNA.navy, borderRadius: 32, padding: '24px 40px' }}>
              <p style={teks(UKURAN.label, WARNA.krem, 700)}>konten berbayar · tautan afiliasi</p>
              <p style={teks(UKURAN.isi, WARNA.sage, 800)}>link di profil</p>
            </div>
          </Muncul>
        </Kotak>
      )
    case 'diagram':
      return (
        <Kotak gap={24}>
          {v.judul && <TeksAnim ukuran={72} warna={WARNA.tealTua} berat={800}>{v.judul}</TeksAnim>}
          <div style={{ width: '100%' }}>
            {v.langkah.map((l, i) => {
              const t = 10 + i * GERAK.jedaLangkah
              return (
                <div key={i}>
                  <Langkah ikon={l.ikon} nomor={i + 1} label={l.label} tunda={t} />
                  {i < v.langkah.length - 1 && <Panah tunda={t + 16} />}
                </div>
              )
            })}
          </div>
        </Kotak>
      )
    case 'ikon':
      return (
        <Kotak>
          <IkonBesar nama={v.ikon} gerak={v.gerak ?? GERAK_IKON[v.ikon] ?? 'melayang'} />
          <TeksAnim ukuran={UKURAN.judul} warna={WARNA.tealTua} berat={800} tunda={8}>{v.teks}</TeksAnim>
        </Kotak>
      )
    case 'penutup':
      return (
        <Kotak gap={40}>
          <Muncul>
            <p style={{ ...teks(UKURAN.label + 4, WARNA.aksen, 800), letterSpacing: 8 }}>solusibu</p>
          </Muncul>
          <TeksAnim ukuran={UKURAN.judul + 8} warna={WARNA.tealTua} berat={800} tunda={6}>{v.teks}</TeksAnim>
          {(v.ajakan ?? AJAKAN_DEFAULT).map((a, i) => (
            <Muncul key={i} tunda={34 + i * GERAK.jedaBaris}>
              <Idle gerak="pulse" fase={i * 30}>
                <div style={{ background: WARNA.sage, borderRadius: 999, padding: '20px 44px', display: 'flex', alignItems: 'center', gap: 24 }}>
                  <Ikon nama={IKON_AJAKAN[i] ?? 'centang'} ukuran={84} />
                  <p style={teks(UKURAN.isi)}>{a}</p>
                </div>
              </Idle>
            </Muncul>
          ))}
        </Kotak>
      )
  }
}
