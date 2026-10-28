# solusibu v2
Alurnya: naskah.json (ditulis penulis) → `suara.py` (suara + timing per kata) → `remotion render`. Semua jalan di GitHub Actions (`.github/workflows/render-v2.yml`), laptop ga dipakai buat suara/render. Gaya visual: `STYLE.md` (E3 marun, angka di `remotion/src/tema.ts`). Gaya naskah: `GAYA-NASKAH.md`.

## Jalanin (GitHub Actions, branch `v2`)
- **Sebelum push**: `python3 cek_naskah.py naskah/<slug>.json` harus lolos (template, data wajib, id aset, kata `kunci`/`pada` ada di teks, frasa haram, disclosure affiliate, `cek_fakta`). Workflow ngecek ulang sebelum render.
- **Render**: commit + push `v2/naskah/<slug>.json` ke branch `v2` → workflow render naskah yg berubah di commit terakhir → artifact `video-<nomor run>` (mp4 + suara-log). Oring download, review.
- **Kandidat suara** (sekali, atau kalau mau ganti suara): push commit yg pesannya ada `[kandidat-suara]` (dan nyentuh `v2/suara/` atau `v2/suara.py`) → artifact `kandidat-suara` (kandidat-1..5 .wav + .json).
- Setelah Oring milih kandidat N: salin `kandidat-N.wav` → `v2/suara/referensi.wav` dan `kandidat-N.json` → `v2/suara/referensi.json`, commit, push. Semua render berikutnya clone suara itu + seed tetap → satu orang yg sama.
- Cek frame tanpa render penuh (butuh props.json dari artifact): `cd remotion && npx remotion still src/index.tsx Video x.png --frame=N --props=../out/<slug>/props.json` (tambah `"safe": true` di props buat garis safe area).
- Kalau file workflow nanti ada di branch default, bisa juga lewat tombol Run workflow (pilih `render` + slug, atau `kandidat-suara`).

`remotion/public/aset` dan `remotion/public/out` itu symlink ke `../../aset` dan `../../out`.

## Skema naskah.json
```jsonc
{
  "slug": "minyak-muncrat", "judul": "...", "tema": "E3",
  "cek_fakta": false,                 // true kalau semua klaim sudah dicek periset
  "adegan": [                          // urutan = urutan video. Durasi ikut timing kata, jangan ditulis manual
    { "template": "<id template>", "teks": "kalimat yang diucapkan", "kunci": ["kata", "kunci"], "data": { ... } }
  ],
  "affiliate": null                    // atau { "produk", "teks", "aset"?, "disclosure" } → tampil di penutup
}
```
`kunci` = kata di `teks` yang ditonjolkan (caption serif italic, stabilo, SFX). Kolom `pada` di bawah = satu kata di `teks` yang jadi pemicu muncul. `suara.py` menambahkan `kata: [[kata, mulai, selesai], ...]` per adegan dan `audio`, lalu hasilnya disimpan ke `out/<slug>/props.json`.

| template | data | isi |
|---|---|---|
| `hook-kejutan` | `label?`, `besar`, `karakter`, `properti` | catatan + kata raksasa di `kunci[0]`, karakter, properti di magnet, ciprat |
| `sebab-akibat` | `sebab`, `akibat`, `sebab_aset`, `akibat_aset`, `karakter` | kartu sebab di `kunci[0]`, panah, kartu akibat di `kunci[1]` |
| `salah-vs-benar` | `salah`, `benar`, `benar_pada`, `coret_pada?`, `karakter` | kartu salah dicoret, kartu benar dicentang |
| `checklist-pop` | `judul`, `item: [{teks, pada}]`, `properti` | item muncul + dicentang pas diucapkan (jumlah item bebas, jangan selalu 3) |
| `chat-takeover` | `nama`, `pesan: [{dari: "dia"\|"aku", teks, pada}]` | layar chat naik nutupin layar, gelembung muncul per pesan |
| `penutup` | `besar`, `karakter` | kalimat penutup + karakter. Kalau `affiliate` diisi: kartu produk + strip disclosure (wajib) |

Aset dipanggil pakai `id` dari `aset/index.json` (cari: `grep '"tag"' -A8 aset/index.json \| grep wajan`). Semua sprite skala x8. Properti yang warnanya di luar palet (tetes, ciprat) otomatis diwarnai ulang lewat tema.

## Isi folder
- `aset/`: `potong.py` (sheet AI → sprite bersih pakai spritegrid), `ambil_sfx.py` (subset wyzowl/sfx-kit CC0 + titik sinkron), `index.json`
- `remotion/src/`: `lib.tsx` (gerak, kertas, sprite), `template.tsx` (6 template), `index.tsx` (kamera satu kanvas, caption per kata, SFX), `tema.ts`
- `cek_naskah.py` (cek naskah, stdlib) · `suara.py` + `suara/` (referensi suara terpilih) · `requirements.txt` (deps Python CPU)
- `naskah/`: naskah per video · `out/`: hasil (ga di-commit) · `referensi-naskah/`: transkrip referensi
