import { loadFont } from '@remotion/google-fonts/PlusJakartaSans'

// design system: lihat STYLE.md (pemilik: Gilang)
export const { fontFamily } = loadFont('normal', { weights: ['500', '700', '800'] })

export const WARNA = {
  sage: '#A9C5A9',
  tealTua: '#1F5C5A',
  krem: '#F4EFE1',
  navy: '#1B2A41',
  merah: '#9B3D3D', // cuma buat label "salah", jangan buat dekor
}

export const FPS = 30
export const W = 1080
export const H = 1920

// safe area Shorts: atas/bawah ~15%, kanan ~12%
export const SAFE = { atas: 288, bawah: 288, kanan: 130, kiri: 60 }

// ruang subtitle di atas safe area bawah
export const SUB_TINGGI = 260

export const UKURAN = { judul: 84, isi: 60, subtitle: 64, label: 40, angka: 220 }
