import { loadFont } from '@remotion/google-fonts/PlusJakartaSans'

// design system: lihat STYLE.md (pemilik: Gilang)
export const { fontFamily } = loadFont('normal', { weights: ['500', '700', '800'] })

export const WARNA = {
  sage: '#A9C5A9',
  tealTua: '#1F5C5A',
  krem: '#F4EFE1',
  navy: '#1B2A41',
  merah: '#9B3D3D', // cuma buat label/ikon "salah", jangan buat dekor
  aksen: '#3A8F87', // teal terang: panah, uap, garis tipis (bukan teks kecil)
  minyak: '#C4B160', // kuning zaitun redup, cuma buat isi ikon minyak (wajan/percikan/minyak), bukan latar
  kremTerang: '#FAF7EC', // pusat gradien latar
  kremSage: '#E4EAD5', // tepi gradien latar
  sorot: 'rgba(169,197,169,0.6)', // marker kata kunci di latar terang
}

export const FPS = 30
export const W = 1080
export const H = 1920

// safe area Shorts: atas/bawah ~15%, kanan ~12%
export const SAFE = { atas: 288, bawah: 288, kanan: 130, kiri: 60 }

// ruang subtitle di atas safe area bawah
export const SUB_TINGGI = 260

export const UKURAN = {
  judul: 84, isi: 60, subtitle: 64, label: 40, angka: 220,
  langkah: 54, // label langkah diagram
  kotakIkon: 150, // lingkaran ikon di diagram
  ikonBesar: 380, // ikon di template `ikon`
}

// semua angka gerak di sini biar satu keluarga
export const GERAK = {
  spring: { damping: 200 }, // tanpa pantul
  geser: 40, // px geser naik saat muncul
  jedaKata: 3, // frame antar kata
  jedaBaris: 12, // frame antar baris/kartu
  jedaLangkah: 30, // frame antar langkah diagram
  panah: 14, // durasi stroke draw-on panah
  hitung: 45, // durasi count-up angka
  transisi: 6, // fade masuk/keluar antar adegan
}
