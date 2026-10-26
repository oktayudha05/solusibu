# STYLE.md v0 (pemilik: Gilang)

Sumber kebenaran token: `src/gaya.ts`. Ubah di sana, catat di sini.

## Palet
| nama | hex | pakai buat |
|---|---|---|
| krem | `#F4EFE1` | latar |
| navy | `#1B2A41` | teks utama |
| teal tua | `#1F5C5A` | judul, highlight subtitle, kartu "bener" |
| sage | `#A9C5A9` | bentuk dekor, kartu poin |
| merah redup | `#9B3D3D` | cuma label/kartu "salah" |

## Font & ukuran
Plus Jakarta Sans (500/700/800). Judul 84-100, isi 60, subtitle 64, label 40, angka 220 px (kanvas 1080x1920).

## Layout
Safe area Shorts: atas/bawah 15% (288 px), kanan 12% (130 px). Subtitle tepat di atas safe area bawah.

## Gerak
Halus: spring tanpa pantul (damping 200) + geser naik 40 px + fade. Elemen muncul bertahap (selisih ~12 frame). Tanpa goyang/zoom berlebihan.

## Larangan
- orange / warna hangat dominan
- gradient ungu-biru
- emoji bertebaran
- stock footage (pakai bentuk geometris & diagram)
- gaya beda antar video
