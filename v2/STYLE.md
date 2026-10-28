# STYLE solusibu — gaya E3 "marun tua"
Sumber kebenaran angka: `remotion/src/tema.ts` (tema `E3`, basis `E` ← `D`). File ini aturan pakainya. Kalau beda, tema.ts menang.

## Palet (hex → peran)
| hex | peran |
|---|---|
| `#5E2233` marun | pintu kulkas = latar dominan; juga warna kata kunci di catatan mustard |
| `#2A0E17` marun gelap | latar luar pintu, tinta di atas kertas terang, blok stabilo di belakang kata besar |
| `#1E0910` | bayangan keras |
| `#F2CBD3` pink pucat | teks yg nempel langsung di pintu, kata besar ("air."), stabilo di catatan mustard, isi bingkai magnet |
| `#D6B25A` mustard | catatan utama, warna ulang ciprat minyak |
| `#A9BCD3` biru kabut | catatan tulisan tangan, bingkai magnet, misregistrasi, warna ulang tetes air |
| `#EFE6DA` | struk saja (kecil) |
Aksen boleh beda per video, asal tetap kalem. Teks wajib kontras dgn kertas di bawahnya.

## Font (lokal di `remotion/public/fonts/`)
- **Archivo Black**: judul/kalimat utama ("Minyak", "Ternyata gara-gara"), header struk.
- **Playfair Display italic 900**: 1 kata kunci per adegan, ukuran raksasa ("muncrat?", "air.").
- **Patrick Hand**: catatan tangan, pancingan ("kok bisa?"), isi struk.
Ukuran kontras ekstrem: kata kunci 150–300px, kalimat utama 104–120px, catatan 70–80px. Minimal 50px (kebaca di HP).

## Bentuk
- Sudut 0px. NOL bentuk bulat (termasuk bingkai: kotak sobek).
- Kertas: tepi sobek atas-bawah, rotasi acak −3..3°.
- Bayangan keras offset 9px tanpa blur (bingkai magnet 11px), warna `#1E0910`.
- Elemen saling tumpuk (catatan nimpa catatan, karakter nimpa kertas), bukan slide berjejer.

## Efek riso (`efek: 0.5`)
Misregistrasi teks −2px/1.5px, sprite 2.5px/2px, warna biru kabut. Halftone titik 9–11px, opacity 8–11%. Grain fractal noise opacity 0.12, ganti pola tiap 2 frame.

## Gerak (30fps)
- Masuk: scale 0.8 → 1.05 (6 frame, ease-out) → 1 (4 frame) + fade. Keluar lebih cepat dari masuk (5 frame, ease-in).
- Teks muncul per kata, sinkron suara/ketukan. Stagger antar elemen ≥3 frame.
- Kamera tidak pernah diam: push 3% pelan. Pindah antar fokus = geser kamera di satu kanvas (0.65 dtk, ease-in-out), bukan cut. Snap zoom 1→1.22 dalam 4 frame.
- Idle: kertas & karakter goyang/napas pelan (±0.35–1°, scale ±1.2%).
- SFX di tiap gerakan: pop (muncul), tick (kata), whoosh (geser kamera), snap (zoom/kata kunci).

## Sprite pixel
Skala x8 (1 pixel art = 8px layar), `image-rendering: pixelated`, jangan di-scale pecahan. Potongan & pembersihan: `aset/potong.py`. Properti yg warnanya di luar palet diwarnai ulang lewat komponen `Sprite warna=...` (tetes air, ciprat).

## Safe area (layar 1080x1920)
Konten penting (teks, karakter, fokus) di dalam: atas ≥192px, bawah ≤1536px (20% bawah = UI YouTube), kiri-kanan ≥64px, dihitung saat kamera push maksimal. Elemen latar (struk, catatan dari shot sebelumnya) boleh kepotong tepi. Cek: `cd remotion && npx remotion still src/index.tsx Video x.png --frame=N --props=../out/<slug>/props.json` (tambah `"safe": true` di props).

## Larangan
Latar putih/krem dominan, latar hijau (maskot sage tenggelam), orange/warna hangat dominan, gradient ungu-biru, emoji, ikon generik AI, bentuk bulat, sudut membulat, bayangan blur lembut, elemen game (HUD/XP).
