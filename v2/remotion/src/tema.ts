// Tema = semua keputusan gaya. Adegan cuma baca ini; 1 tema baru = 1 objek baru, bukan kode baru.
export type Tema = {
  nama: string
  font: { display: string; serif: string; tangan: string } // keluarga (file di public/fonts)
  warna: {
    latar: string; pintu: string; tintaPintu: string // teks yg nempel langsung di pintu
    catatan: string; tintaCatatan: string; kata: string; stabilo: string // catatan utama + kata kunci
    catatan2: string; tintaCatatan2: string // catatan tulisan tangan
    air: string; stabiloAir: string; magnet: string; magnetDalam: string; bayangan: string
    misreg?: string // warna geser ala risograph
    struk?: string // kertas struk (default catatan2)
    tetes?: string; cipratan?: string // warnai ulang sprite tetes air & ciprat ikut palet
  }
  bentuk: {
    radius: number; bayangan: number // offset bayangan keras (px)
    sobek: boolean; selotip: string | null // warna selotip
    halftone: string | null; grain: number // opacity tekstur
    magnetBulat: boolean
    efek?: number // 0..1 kekuatan misregistrasi & halftone (default 1)
  }
  ukuran: { minyak: number; kata: number; air: number; ternyata: number; tangan: number }
}

export const A: Tema = {
  nama: 'scrapbook-kulkas',
  font: { display: 'Bricolage Grotesque', serif: 'Instrument Serif', tangan: 'Caveat' },
  warna: {
    latar: '#BFD9EE', pintu: '#FBFAF4', tintaPintu: '#1C1C28', catatan: '#FFE57A', tintaCatatan: '#1C1C28',
    kata: '#E0402B', stabilo: '#A8DCF5', catatan2: '#F7C6D3', tintaCatatan2: '#1C1C28', air: '#2B59C3', stabiloAir: '#FFE57A',
    magnet: '#9ED9BC', magnetDalam: '#FBFAF4', bayangan: '#1C1C28',
  },
  bentuk: { radius: 2, bayangan: 7, sobek: true, selotip: '#FFFFFFB0', halftone: null, grain: 0.16, magnetBulat: true },
  ukuran: { minyak: 104, kata: 168, air: 330, ternyata: 64, tangan: 84 },
}

export const B: Tema = {
  nama: 'editorial-majalah',
  font: { display: 'Archivo Black', serif: 'Playfair Display', tangan: 'Kalam' },
  warna: {
    latar: '#111111', pintu: '#1E3FD8', tintaPintu: '#F2ECE1', catatan: '#F2ECE1', tintaCatatan: '#111111',
    kata: '#E3122F', stabilo: 'transparent', catatan2: '#111111', tintaCatatan2: '#F2ECE1', air: '#F2ECE1', stabiloAir: '#E3122F',
    magnet: '#E3122F', magnetDalam: '#F2ECE1', bayangan: '#111111',
  },
  bentuk: { radius: 0, bayangan: 12, sobek: false, selotip: null, halftone: null, grain: 0.1, magnetBulat: false },
  ukuran: { minyak: 120, kata: 150, air: 300, ternyata: 60, tangan: 62 },
}

export const C: Tema = {
  nama: 'risograph',
  font: { display: 'Dela Gothic One', serif: 'DM Serif Display', tangan: 'Patrick Hand' },
  warna: {
    latar: '#00A95C', pintu: '#F5F0E6', tintaPintu: '#1D3A8A', catatan: '#FFE800', tintaCatatan: '#1D3A8A',
    kata: '#0078BF', stabilo: '#FF8CC6', catatan2: '#FF8CC6', tintaCatatan2: '#1D3A8A', air: '#0078BF', stabiloAir: '#FFE800',
    magnet: '#FF48B0', magnetDalam: '#F5F0E6', bayangan: '#0078BF', misreg: '#FF48B0',
  },
  bentuk: { radius: 3, bayangan: 8, sobek: true, selotip: null, halftone: '#1D3A8A', grain: 0.22, magnetBulat: true },
  ukuran: { minyak: 96, kata: 170, air: 300, ternyata: 60, tangan: 80 },
}

export const FONTS: [string, string, object?][] = [
  ['Bricolage Grotesque', 'bricolage', { weight: '800' }], ['Instrument Serif', 'instrument-italic', { style: 'italic' }],
  ['Caveat', 'caveat', { weight: '700' }], ['Archivo Black', 'archivo-black'],
  ['Playfair Display', 'playfair-italic', { style: 'italic', weight: '900' }], ['Kalam', 'kalam', { weight: '700' }],
  ['Dela Gothic One', 'dela'], ['DM Serif Display', 'dmserif-italic', { style: 'italic' }], ['Patrick Hand', 'patrick'],
]

// Hibrida: struktur & latar B (penuh warna, sudut 0, bayangan keras) + font B (aksen tangan C) + warna/efek riso C
const D: Omit<Tema, 'nama' | 'warna'> = {
  font: { display: 'Archivo Black', serif: 'Playfair Display', tangan: 'Patrick Hand' },
  bentuk: { radius: 0, bayangan: 12, sobek: true, selotip: null, halftone: '#14163A', grain: 0.22, magnetBulat: false },
  ukuran: { minyak: 120, kata: 150, air: 300, ternyata: 60, tangan: 78 },
}
export const D1: Tema = {
  ...D, nama: 'hibrida-cobalt',
  warna: {
    latar: '#14163A', pintu: '#0078BF', tintaPintu: '#FFE800', catatan: '#FFE800', tintaCatatan: '#14163A',
    kata: '#E3122F', stabilo: '#FF48B0', catatan2: '#FF48B0', tintaCatatan2: '#14163A', air: '#FFE800', stabiloAir: '#E3122F',
    magnet: '#00A95C', magnetDalam: '#FFE800', bayangan: '#14163A', misreg: '#FF48B0', struk: '#F5F0E6',
  },
}
export const D2: Tema = {
  ...D, nama: 'hibrida-hijau',
  warna: {
    latar: '#0F3B2A', pintu: '#00A95C', tintaPintu: '#14163A', catatan: '#FFE800', tintaCatatan: '#14163A',
    kata: '#0078BF', stabilo: '#FF48B0', catatan2: '#FF48B0', tintaCatatan2: '#14163A', air: '#14163A', stabiloAir: '#FF48B0',
    magnet: '#0078BF', magnetDalam: '#FFE800', bayangan: '#14163A', misreg: '#FF48B0', struk: '#F5F0E6',
  },
}

// Basis E: D yg dikalemin (efek & saturasi turun) buat ibu 25-45. Latar tidak putih/krem, tidak hijau (maskot sage).
const E: Omit<Tema, 'nama' | 'warna'> = {
  ...D,
  bentuk: { ...D.bentuk, bayangan: 9, grain: 0.12, efek: 0.5 },
  ukuran: { ...D.ukuran, ternyata: 104 },
}
export const E1: Tema = {
  ...E, nama: 'navy-kalem',
  warna: {
    latar: '#1B2440', pintu: '#A9BCD3', tintaPintu: '#1B2440', catatan: '#F1DB9A', tintaCatatan: '#1B2440',
    kata: '#A8463A', stabilo: '#E3B5BC', catatan2: '#E3B5BC', tintaCatatan2: '#1B2440', air: '#1B2440', stabiloAir: '#F1DB9A',
    magnet: '#1B2440', magnetDalam: '#F1DB9A', bayangan: '#1B2440', misreg: '#D69AA4', struk: '#EDE6DA',
    tetes: '#4E6E9A', cipratan: '#D9B95E',
  },
}
export const E2: Tema = {
  ...E, nama: 'biru-abu',
  warna: {
    latar: '#4F5F73', pintu: '#B4C0CD', tintaPintu: '#1F2A44', catatan: '#D8B860', tintaCatatan: '#1F2A44',
    kata: '#1F2A44', stabilo: '#D9A3AE', catatan2: '#D9A3AE', tintaCatatan2: '#1F2A44', air: '#1F2A44', stabiloAir: '#D8B860',
    magnet: '#1F2A44', magnetDalam: '#D9A3AE', bayangan: '#1F2A44', misreg: '#C98B97', struk: '#E9E4DA',
    tetes: '#3F5C86', cipratan: '#C9A54A',
  },
}
export const E3: Tema = {
  ...E, nama: 'marun-tua',
  warna: {
    latar: '#2A0E17', pintu: '#5E2233', tintaPintu: '#F2CBD3', catatan: '#D6B25A', tintaCatatan: '#2A0E17',
    kata: '#5E2233', stabilo: '#F2CBD3', catatan2: '#A9BCD3', tintaCatatan2: '#2A0E17', air: '#F2CBD3', stabiloAir: '#2A0E17',
    magnet: '#A9BCD3', magnetDalam: '#F2CBD3', bayangan: '#1E0910', misreg: '#A9BCD3', struk: '#EFE6DA',
    tetes: '#A9BCD3', cipratan: '#D6B25A',
  },
}
