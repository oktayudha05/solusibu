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
`kunci` = kata di `teks` yang tampil di layar (CUMA ini yg tampil, sisanya dibawa suara; Playfair raksasa + stabilo, SFX banting). Format `"kata"` atau `"kata:tampilan"` (mis. `"seribu:1.600 kali"`). 1-2 per adegan. Kolom `pada` = satu kata di `teks` yang jadi pemicu. `suara.py` menambahkan `kata: [[kata, mulai, selesai], ...]` per adegan dan `audio`, lalu hasilnya disimpan ke `out/<slug>/props.json`.
**Angka di `teks` tulis pakai huruf** ("seratus sembilan puluh"), angka buat layar taruh di `data`. Digit bikin hitungan kata alignment meleset (dicek `cek_naskah.py`).

Satu kanvas, kamera jalan (`kamera.tsx`). Template "dapur" (`hook-freeze`, `penampang-zoom`, `payoff-loop`) berbagi satu wajan penampang (`dapur.tsx`); template lain dapat wilayah sendiri di sebelahnya. Teks: frasa ≤3 kata di zona atas (y 230-630, `kinetik.tsx`), label tulisan tangan nempel objek, maskot kiri bawah ganti pose per adegan (`data.karakter`, opsional). Semua teks ≤ x880 di pita y 653-1517 (rel tombol YouTube).

| template | data | isi |
|---|---|---|
| `hook-freeze` | `label?`, `label_pada?`, `karakter?` | (topik wajan) frame 0 udah ciprat → BEKU + flash + snap ke wajan + label. Taruh di adegan pertama |
| `penampang-zoom` | `ketukan: {jatuh, dasar, didih, uap, ciprat}` (kata), `label?: [{teks, jangkar, pada, warna?}]` | penampang wajan: tetes jatuh, tenggelam, mendidih (snap zoom), uap ngembang, ciprat (whip). `jangkar`: tetes/dasar/uap/minyak/permukaan/api. `warna`: air/panas |
| `skala-angka` | `mode: "termometer"`: `seri: [{label, nilai, dari?, warna?, pada}]`, `maks?`, `sumber` | batang termometer naik pas `pada`, pita rentang `dari`-`nilai` |
| | `mode: "tumbuh"`: `awal`, `pada`, `ke`, `akhiran?`, `sel?`, `sel_label?`, `hasil?`, `hasil_pada?`, `sumber` | sendok air → grid kotak (`sel` buah) + penghitung ×`ke` |
| `langkah-tangan` | `langkah: [{teks, aksi, pada}]` | kartu bernomor + ilustrasi yg diperagakan. `aksi`: lap, pinggir, jangan-air, jangan-pindah, kompor, tutup (atau id properti) |
| `rantai-proses` | `langkah: [{teks, ikon, pada}]` | sebab-akibat 3-6 langkah, kartu ular 2 per baris + panah bersudut, kamera turun per baris, akhir mundur lihat semua. `ikon`: id sprite atau vektor `spora`/`bakteri`/`racun`, boleh daftar (ditumpuk) |
| `banding-belah` | `atas`/`bawah`: `{label, cap?, ikon, pada}`, `pemenang?` (atas/bawah/null), `pemenang_pada?` | salah vs benar: 2 panel ada dari awal, `pada` = cap SALAH/BENAR + denyut, `pemenang_pada` = yg kalah dicoret, yg menang membesar. `ikon` sama dgn rantai-proses |
| `bedah-label` | `objek` (id sprite), `label: [{teks, titik: [x,y] 0..1, pada, warna?}]` | objek besar (x2) di kanan, label satu kolom kiri muncul pas `pada`, panah bersudut ke titik di objek |
| `payoff-loop` | `rangkum: [kata...]`, `karakter?` | kamera mundur + jejak kata kunci → balik ke komposisi frame 0, tetes jatuh (nyambung ke hook). Wajib adegan terakhir; kartu affiliate + disclosure di sini kalau `affiliate` diisi. Kalimat akhir sebaiknya nyambung ke kalimat pertama |

Video tanpa template dapur (selain payoff) ga gambar wajan: adegan 1 jadi wilayah 0 dan payoff pulang ke situ (loop). Adegan pertama ga wajib `hook-freeze`.

Aset dipanggil pakai `id` dari `aset/index.json` (cari: `grep '"tag"' -A8 aset/index.json \| grep wajan`). Sprite skala bulat (x8, maskot x5).

## Isi folder
- `aset/`: `potong.py` (sheet AI → sprite bersih pakai spritegrid), `ambil_sfx.py` (subset wyzowl/sfx-kit CC0 + titik sinkron + `desis-minyak` sintesis ffmpeg), `index.json`
- `remotion/src/`: `lib.tsx` (gerak, kertas, sprite, grain PNG), `kamera.tsx` (kamera satu kanvas, parallax, blur cuma pas whip), `kinetik.tsx` (teks per kata), `dapur.tsx` (wajan penampang), `template.tsx` (8 template), `index.tsx` (rakit + SFX), `tema.ts`
- `remotion/lembar.mjs`: review lokal tanpa render: `node lembar.mjs <props.json> <folder> [frame...]` → still + `lembar-kontak.png` + % area aman terisi (target ≥55%)
- `uji_gerak.py` (uji anti-slideshow dari mp4: hard cut + diam >0,4 dtk → `out/<slug>/uji-gerak.txt`, jalan di workflow, gagal = warning)
- `cek_naskah.py` (cek naskah, stdlib) · `suara.py` + `suara/` (referensi suara terpilih) · `requirements.txt` (deps Python CPU)
- `naskah/`: naskah per video · `out/`: hasil (ga di-commit) · `referensi-naskah/`: transkrip referensi
