// Kinetic typography sinkron timing kata (dari proto R2). Yang tampil CUMA kata kunci (naskah `kunci`, bisa "kata:tampilan" buat angka),
// sisanya dibawa suara. Zona atas (y 230-630): Playfair italic raksasa + stabilo nyapu, muncul 3 frame sebelum diucap, tahan sampai kunci berikut/akhir adegan.
import React, { useEffect, useState } from 'react'
import { continueRender, delayRender } from 'remotion'
import { fitText } from '@remotion/layout-utils'
import { FPS, ease, fontSiap, kf, misreg } from './lib'
import { Tema } from './tema'

export type KataK = { kata: string; s: number; e: number; kunci: boolean; tampil?: string; sampai?: number }

export const useFontSiap = () => {
  const [siap, setSiap] = useState(false)
  const [h] = useState(() => delayRender('font'))
  useEffect(() => { fontSiap.then(() => { setSiap(true); continueRender(h) }) }, [h])
  return siap
}

const L = 70, LEBAR = 940
export const ATAS = 230, TINGGI = 400 // zona teks: 230..630
export const KataBesar: React.FC<{ tema: Tema; t: number; kata: KataK[]; frasa: KataK[][] }> = ({ tema, t, frasa }) => {
  const siap = useFontSiap()
  if (!siap) return null
  const w = tema.warna, f = tema.font
  return <>
    {frasa.map((fr, i) => {
      const mulai = fr[0].s - 0.12
      const akhir = fr[0].sampai ?? fr[fr.length - 1].e + 1.6
      const habis = Math.min(frasa[i + 1] ? frasa[i + 1][0].s - 0.12 - 5 / FPS : akhir, akhir)
      if (t < mulai || t > habis + 6 / FPS) return null
      const keluar = kf(t, [[habis, 0], [habis + 5 / FPS, 1, ease.in3]]) // keluar 5f ease-in: naik & pudar
      const box: React.CSSProperties = { position: 'absolute', left: L, width: LEBAR, top: ATAS, height: TINGGI, display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', alignContent: 'center', gap: '0 26px', opacity: 1 - keluar, transform: `translateY(${-90 * keluar}px)` }
      {
        const k = fr[0], s = k.s - 3 / FPS
        // lebar dikurangi buat rotasi -3°, overhang italic & stabilo (dulu "mendidih" kepotong kiri)
        const teks = k.tampil ?? k.kata
        const fs = Math.min(260, fitText({ text: teks, withinWidth: LEBAR - 220, fontFamily: f.serif, fontWeight: 900, additionalStyles: { fontStyle: 'italic' } }).fontSize)
        const sapu = kf(t, [[s - 0.03, 0], [s + 5 / FPS, 1, ease.out5]])
        const sc = kf(t, [[s, 2.1], [s + 5 / FPS, 0.94, ease.out3], [s + 9 / FPS, 1, ease.inOut3]]) // banting
        return <div key={i} style={box}>
          <div style={{ position: 'relative', transform: 'rotate(-3deg)' }}>
            <div style={{ position: 'absolute', left: -30, right: -30, top: '16%', bottom: '8%', background: w.stabilo, transformOrigin: '0 50%',
              transform: `scaleX(${sapu})`, boxShadow: `12px 12px 0 ${w.bayangan}` }} />
            <span style={{ position: 'relative', display: 'inline-block', fontFamily: f.serif, fontStyle: 'italic', fontWeight: 900, fontSize: fs,
              lineHeight: 1.05, padding: '0 0.08em', color: w.pintu, transform: `scale(${sc})`, opacity: kf(t, [[s, 0], [s + 2 / FPS, 1]]), textShadow: misreg(w.misreg ?? w.catatan2) }}>{teks}</span>
          </div>
        </div>
      }
    })}
  </>
}
