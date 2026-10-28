// Kinetic typography sinkron timing kata (dari proto R2). Teks di zona atas (y 230-650), di atas diagram, bukan pita subtitle bawah.
// Frasa maks 3 kata (≤7 kata di layar), kata kunci sendirian: Playfair italic raksasa + stabilo nyapu, muncul 3 frame sebelum diucap.
import React, { useEffect, useState } from 'react'
import { continueRender, delayRender } from 'remotion'
import { fitText } from '@remotion/layout-utils'
import { FPS, ease, fontSiap, kf, misreg } from './lib'
import { Tema } from './tema'

export type KataK = { kata: string; s: number; e: number; kunci: boolean }

export const useFontSiap = () => {
  const [siap, setSiap] = useState(false)
  const [h] = useState(() => delayRender('font'))
  useEffect(() => { fontSiap.then(() => { setSiap(true); continueRender(h) }) }, [h])
  return siap
}

export const potongFrasa = (k: KataK[]) => {
  const out: KataK[][] = []; let cur: KataK[] = []
  const tutup = () => { if (cur.length) out.push(cur); cur = [] }
  k.forEach((w) => {
    if (w.kunci) { tutup(); out.push([w]); return }
    cur.push(w)
    if (cur.length >= 3 || /[.,?!—]$/.test(w.kata)) tutup()
  })
  tutup()
  return out
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
      const habis = frasa[i + 1] ? Math.min(frasa[i + 1][0].s - 0.12 - 5 / FPS, fr[fr.length - 1].e + 1.6) : fr[fr.length - 1].e + 0.8
      if (t < mulai || t > habis + 6 / FPS) return null
      const keluar = kf(t, [[habis, 0], [habis + 5 / FPS, 1, ease.in3]]) // keluar 5f ease-in: naik & pudar
      const box: React.CSSProperties = { position: 'absolute', left: L, width: LEBAR, top: ATAS, height: TINGGI, display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', alignContent: 'center', gap: '0 26px', opacity: 1 - keluar, transform: `translateY(${-90 * keluar}px)` }
      if (fr.length === 1 && fr[0].kunci) {
        const k = fr[0], s = k.s - 3 / FPS
        // lebar dikurangi buat rotasi -3°, overhang italic & stabilo (dulu "mendidih" kepotong kiri)
        const fs = Math.min(280, fitText({ text: k.kata, withinWidth: LEBAR - 220, fontFamily: f.serif, fontWeight: 900, additionalStyles: { fontStyle: 'italic' } }).fontSize)
        const sapu = kf(t, [[s - 0.03, 0], [s + 5 / FPS, 1, ease.out5]])
        const sc = kf(t, [[s, 2.1], [s + 5 / FPS, 0.94, ease.out3], [s + 9 / FPS, 1, ease.inOut3]]) // banting
        return <div key={i} style={box}>
          <div style={{ position: 'relative', transform: 'rotate(-3deg)' }}>
            <div style={{ position: 'absolute', left: -30, right: -30, top: '16%', bottom: '8%', background: w.stabilo, transformOrigin: '0 50%',
              transform: `scaleX(${sapu})`, boxShadow: `12px 12px 0 ${w.bayangan}` }} />
            <span style={{ position: 'relative', display: 'inline-block', fontFamily: f.serif, fontStyle: 'italic', fontWeight: 900, fontSize: fs,
              lineHeight: 1.05, padding: '0 0.08em', color: w.pintu, transform: `scale(${sc})`, opacity: kf(t, [[s, 0], [s + 2 / FPS, 1]]), textShadow: misreg(w.misreg ?? w.catatan2) }}>{k.kata}</span>
          </div>
        </div>
      }
      const fs = Math.max(84, Math.min(120, ...fr.map((x) => fitText({ text: x.kata, withinWidth: LEBAR, fontFamily: f.display }).fontSize)))
      return <div key={i} style={box}>
        {fr.map((x, j) => {
          const aktif = t >= x.s && t < x.e + 0.05
          // blok marun gelap di belakang tiap kata: tetap kebaca walau di atas ciprat/diagram
          return <span key={j} style={{ display: 'inline-block', fontFamily: f.display, fontSize: fs, lineHeight: 1.08, background: w.latar, padding: '2px 14px', marginBottom: 10,
            boxShadow: `8px 8px 0 ${w.bayangan}`, color: aktif ? w.catatan : w.tintaPintu, textShadow: misreg(w.misreg ?? w.catatan2),
            opacity: kf(t, [[x.s - 0.03, 0], [x.s + 2 / FPS, 1]]),
            transform: `translateY(${kf(t, [[x.s - 0.03, 46], [x.s + 5 / FPS, 0, ease.out5]])}px) scale(${kf(t, [[x.s - 0.03, 1.28], [x.s + 5 / FPS, 1, ease.out5]])})` }}>{x.kata}</span>
        })}
      </div>
    })}
  </>
}
