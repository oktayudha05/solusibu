// Kamera satu kanvas: dunia besar, keyframe (fokus/zoom/rotasi), parallax, handheld, motion blur kamera-saja.
// Semua fungsi murni dari t → deterministik, aman buat still & render paralel.
import React from 'react'
import { AbsoluteFill } from 'remotion'
import { noise2D } from '@remotion/noise'
import { E, FPS, ease, kf, Key } from './lib'

export type Titik = [number, number]
// key kamera: fokus = titik dunia (atau nama jangkar) yg jadi pusat layar
export type KeyKamera = { t: number; fokus: Titik | string; zoom: number; rot?: number; ease?: keyof typeof ease | E }
export type Cam = { x: number; y: number; zoom: number; rot: number }
export const LAYAR = { w: 1080, h: 1920 }
// pusat optik di 45% tinggi: diagram di atas zona caption & UI YouTube
export const PUSAT: Titik = [540, 860]

const ez = (e: KeyKamera['ease']): E | undefined => (typeof e === 'string' ? ease[e] : e)

export const kameraDi = (t: number, keys: KeyKamera[], jangkar: Record<string, Titik> = {}, goyah = 1): Cam => {
  const p = (k: KeyKamera) => (typeof k.fokus === 'string' ? jangkar[k.fokus] ?? [540, 960] : k.fokus)
  const ch = (f: (k: KeyKamera) => number): Key[] => keys.map((k) => [k.t, f(k), ez(k.ease)])
  // zoom diinterpolasi di skala log → kecepatan zoom terasa rata (seperti AE "exponential scale")
  const zoom = Math.exp(kf(t, ch((k) => Math.log(k.zoom))))
  // handheld: noise pelan, amplitudo turun saat zoom besar (biar fokus tidak goyang berlebih)
  const hx = noise2D('kx', t * 0.4, 0) * 6 * goyah, hy = noise2D('ky', t * 0.4, 0) * 6 * goyah, hr = noise2D('kr', t * 0.3, 0) * 0.35 * goyah
  return { x: kf(t, ch((k) => p(k)[0])) + hx / zoom, y: kf(t, ch((k) => p(k)[1])) + hy / zoom, zoom, rot: kf(t, ch((k) => k.rot ?? 0)) + hr }
}

// transform dunia→layar utk lapisan dgn kedalaman d (1 = dunia, <1 = latar jauh, >1 = depan)
export const transformLapis = (c: Cam, d = 1) => {
  const z = 1 + (c.zoom - 1) * d
  return `translate(${PUSAT[0]}px, ${PUSAT[1]}px) rotate(${c.rot * d}deg) scale(${z}) translate(${-c.x * d}px, ${-c.y * d}px)`
}
// proyeksi titik dunia ke layar (buat label/panah yg nempel ke objek tapi ukurannya tetap di layar)
export const proyeksi = (c: Cam, [x, y]: Titik): Titik => {
  const r = (c.rot * Math.PI) / 180, dx = (x - c.x) * c.zoom, dy = (y - c.y) * c.zoom
  return [PUSAT[0] + dx * Math.cos(r) - dy * Math.sin(r), PUSAT[1] + dx * Math.sin(r) + dy * Math.cos(r)]
}
// kecepatan kamera dlm px layar per frame (dipakai buat nyalain motion blur hanya saat snap/whip)
export const kecepatan = (t: number, keys: KeyKamera[], j: Record<string, Titik>) => {
  const a = kameraDi(t - 1 / FPS, keys, j, 0), b = kameraDi(t, keys, j, 0)
  return Math.hypot((b.x - a.x) * b.zoom, (b.y - a.y) * b.zoom) + Math.abs(Math.log(b.zoom / a.zoom)) * 1400
}

export type Lapis = { d: number; isi: React.ReactNode }
// blur: 'hantu' = render dunia N kali dgn kamera sub-frame (isi dihitung sekali), cuma di frame yg cepat
export const Kamera: React.FC<{ t: number; keys: KeyKamera[]; jangkar?: Record<string, Titik>; lapis: Lapis[]; blur?: 'hantu' | 'none'; sampel?: number; ambang?: number }> =
  ({ t, keys, jangkar = {}, lapis, blur = 'hantu', sampel = 12, ambang = 40 }) => {
    const v = blur === 'hantu' ? kecepatan(t, keys, jangkar) : 0
    // shutter 180° = setengah frame ke belakang; jumlah sampel ikut jarak (±1 sampel per 10px) biar tidak kelihatan "tangga"
    const n = v > ambang ? Math.min(sampel, Math.ceil((v * 0.5) / 10)) : 1
    const ts = Array.from({ length: n }, (_, i) => t - (i / n) * (0.5 / FPS))
    return (
      <AbsoluteFill style={{ overflow: 'hidden' }}>
        {lapis.map((l, li) => (
          <AbsoluteFill key={li}>
            {ts.map((ti, i) => (
              // akumulasi rata: lapisan ke-i opacity 1/(i+1) → hasil = rata-rata semua sampel
              <div key={i} style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', opacity: 1 / (i + 1),
                transform: transformLapis(kameraDi(ti, keys, jangkar), l.d) }}>{l.isi}</div>
            ))}
          </AbsoluteFill>
        ))}
      </AbsoluteFill>
    )
  }
