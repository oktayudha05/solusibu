// Review lokal tanpa render penuh: still di beberapa frame + lembar kontak + cek kepadatan (≥55% area aman terisi).
// Pakai: node lembar.mjs <props.json> <folder-out> [frame...]   (tanpa frame: 1 still per adegan, di tengah adegan)
import { bundle } from '@remotion/bundler'
import { renderStill, selectComposition } from '@remotion/renderer'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const [propsFile, out, ...fr] = process.argv.slice(2)
const props = JSON.parse(fs.readFileSync(propsFile, 'utf8'))
fs.mkdirSync(out, { recursive: true })
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.tsx'), publicDir: path.resolve('public') })
const comp = await selectComposition({ serveUrl, id: 'Video', inputProps: props })
let frames = fr.map(Number)
if (!frames.length) { // tengah tiap adegan, dari timing kata (atau perkiraan 0.42 dtk/kata)
  let t = 0.2
  frames = props.adegan.map((a) => {
    const k = a.kata ?? a.teks.split(/\s+/).map((_, i) => [0, t + i * 0.42]); if (!a.kata) t += a.teks.split(/\s+/).length * 0.42 + 0.35
    return Math.round(((k[0][1] + k[k.length - 1][1]) / 2) * 30)
  })
}
const files = []
for (const f of frames) {
  const file = path.join(out, `f${String(f).padStart(4, '0')}.png`)
  await renderStill({ serveUrl, composition: comp, frame: Math.min(f, comp.durationInFrames - 1), output: file, inputProps: props })
  // kepadatan: % piksel area aman (64..1016 x 192..1536) yg beda jauh dari warna latar & pintu
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', 'crop=952:1344:64:192,scale=238:336', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
  const bg = [[0x5e, 0x22, 0x33], [0x2a, 0x0e, 0x17]]
  let isi = 0
  for (let i = 0; i < raw.length; i += 3) if (bg.every(([r, g, b]) => Math.abs(raw[i] - r) + Math.abs(raw[i + 1] - g) + Math.abs(raw[i + 2] - b) > 70)) isi++
  console.log(`frame ${f}: terisi ${Math.round((isi / (raw.length / 3)) * 100)}%`)
  files.push(file)
}
const kol = Math.min(files.length, 4), baris = Math.ceil(files.length / kol)
execFileSync('ffmpeg', ['-v', 'error', '-y', ...files.flatMap((f) => ['-i', f]), '-filter_complex',
  `${files.map((_, i) => `[${i}]scale=360:640[v${i}]`).join(';')};${files.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${files.length}:layout=${files.map((_, i) => `${(i % kol) * 360}_${Math.floor(i / kol) * 640}`).join('|')}:fill=black`,
  '-frames:v', '1', path.join(out, 'lembar-kontak.png')].concat(files.length === 1 ? [] : []))
console.log(path.join(out, 'lembar-kontak.png'), `${kol}x${baris}`)
