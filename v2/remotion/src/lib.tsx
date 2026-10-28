import React from 'react'
import { Easing, Img, interpolate, staticFile } from 'remotion'
import { loadFont } from '@remotion/fonts'
import { FONTS, Tema } from './tema'

FONTS.forEach(([family, file, opt]) => loadFont({ family, url: staticFile(`fonts/${file}.woff2`), ...(opt ?? {}) }))

export const FPS = 30
// safe area Shorts (px layar 1080x1920): atas 10%, bawah 20% (UI YouTube), kiri-kanan 64
export const SAFE = { atas: 192, bawah: 384, kiri: 64, kanan: 64 }
export const F = 1 / FPS
export type E = (x: number) => number
export const lin: E = (x) => x
export const out2 = Easing.out(Easing.quad), inOut3 = Easing.inOut(Easing.cubic), out3 = Easing.out(Easing.cubic)
export const out5 = Easing.out(Easing.poly(5)), in2 = Easing.in(Easing.quad), back = Easing.out(Easing.back(3))

// keyframe [detik, nilai, ease menuju key ini]; di luar rentang ditahan
export const kf = (t: number, keys: [number, number, E?][]) => {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i], [t0, v0] = keys[i - 1]
    if (t <= t1) return interpolate(t, [t0, t1], [v0, v1], { easing: e ?? lin })
  }
  return keys[keys.length - 1][1]
}
export const popS = (t: number, at: number, from = 0.8) => kf(t, [[at, from], [at + 6 * F, 1.05, out2], [at + 10 * F, 1]])
export const pop = (t: number, at: number, rot = 0): React.CSSProperties => ({
  display: 'inline-block', transform: `rotate(${rot}deg) scale(${popS(t, at)})`, opacity: kf(t, [[at, 0], [at + 6 * F, 1, out2]]),
})
// acak deterministik (sama tiap render)
export const acak = (seed: number) => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x) }
// napas idle: goyang kecil terus-menerus
export const goyang = (t: number, fase: number, amp = 0.6) => Math.sin(t * 2 * Math.PI * 0.35 + fase) * amp
// tepi kertas sobek atas-bawah
export const sobek = (w: number, h: number, seed: number, amp = 7, step = 16) => {
  const atas: string[] = [], bawah: string[] = []
  for (let x = 0; x <= w; x += step) {
    atas.push(`${x}px ${acak(seed + x) * amp}px`)
    bawah.unshift(`${x}px ${h - acak(seed * 3 + x) * amp}px`)
  }
  return `polygon(${[...atas, ...bawah].join(',')})`
}

export type K = { tema: Tema; t: number }
// selembar kertas/blok: rotasi kecil, bayangan keras, sobek/selotip/halftone sesuai tema
export const Kertas: React.FC<K & { l: number; top: number; w: number; h: number; warna: string; seed: number; children?: React.ReactNode; style?: React.CSSProperties }> =
  ({ tema, t, l, top, w, h, warna, seed, children, style }) => {
    const b = tema.bentuk, rot = (acak(seed) * 6 - 3) * 0.8 + goyang(t, seed, 0.35)
    return (
      <div style={{ position: 'absolute', left: l, top, width: w, height: h, transform: `rotate(${rot}deg)`,
        filter: `drop-shadow(${b.bayangan}px ${b.bayangan}px 0 ${tema.warna.bayangan})`, ...style }}>
        <div style={{ position: 'absolute', inset: 0, background: warna, borderRadius: b.radius, clipPath: b.sobek ? sobek(w, h, seed) : undefined }}>
          {b.halftone && <div style={{ position: 'absolute', inset: 0, opacity: 0.16 * (b.efek ?? 1),
            backgroundImage: `radial-gradient(${b.halftone} 1.6px, transparent 1.9px)`, backgroundSize: '9px 9px' }} />}
          {children}
        </div>
        {b.selotip && <div style={{ position: 'absolute', left: w / 2 - 95, top: -24, width: 190, height: 50, background: b.selotip,
          transform: `rotate(${acak(seed + 7) * 8 - 4}deg)`, clipPath: 'polygon(0 4%,4% 0,8% 6%,92% 0,96% 5%,100% 0,100% 100%,95% 94%,90% 100%,6% 96%,2% 100%,0 96%)' }} />}
      </div>
    )
  }


export const Sprite: React.FC<{ src: string; warna?: string; fx: string; style: React.CSSProperties }> = ({ src, warna, fx, style }) => {
  const box: React.CSSProperties = { position: 'absolute', ...style, filter: fx }
  const img: React.CSSProperties = { position: 'absolute', inset: 0, width: '100%', height: '100%', imageRendering: 'pixelated' }
  if (!warna) return <div style={box}><Img src={staticFile(src)} style={img} /></div>
  const mask = `url(${staticFile(src)})`
  return (
    <div style={{ ...box, isolation: 'isolate' }}>
      <div style={{ position: 'absolute', inset: 0, background: warna, WebkitMaskImage: mask, maskImage: mask, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />
      <Img src={staticFile(src)} style={{ ...img, filter: 'grayscale(1)', mixBlendMode: 'luminosity' }} />
    </div>
  )
}

