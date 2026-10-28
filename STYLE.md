# STYLE.md v2 (pemilik: Gilang, disetujui Oring 2026-10-27)

Acuan hidup: `video/tes-motion/hf2/` (kode), `out/tes-hf2.mp4` (hasil), `video/tes-motion/referensi-visual.md` (riset: palet, tipografi, audio, hook, cek fakta).
v1 (Remotion: `src/gaya.ts`, `Visual.tsx`, `Ikon.tsx`, krem/sage/teal/navy, ikon flat, progress bar) **USANG**. Ditolak Oring ("kaku, monoton, AI banget"). Jangan dipakai buat video baru. Kodenya dibiarkan buat video lama saja.

## 1. Art direction
- **Engine:** HyperFrames (HTML + GSAP, 1080x1920, 30 fps, satu `index.html`, satu timeline `window.__timelines["main"]`). Render lokal: `npx hyperframes render`.
- **Ilustrasi SVG "rasa tangan", bukan ikon flat:** gradien + kilau di tiap objek (minyak, air, logam, daging), garis "mendidih" (`#fWob`: feTurbulence + displacement, seed berganti ~7 fps), grain bergeser (`assets/grain.png`, soft-light 10%), vignette, bokeh buram di latar, benda foreground buram (sendok/spatula), bayangan lembut.
- **Satu objek bintang per beat**, besar, memenuhi zona konten (tetes air, termometer, gelas, gelembung uap, ayam). Latar dan foreground cuma pendukung.
- **Kedalaman 3 lapis:** latar buram, objek tengah tajam, foreground buram. Kamera: `.world` per adegan di-scale pelan (1.0 ke 1.08) + punch/shake saat momen kunci (`shake()`).
- **Tempo:** cut keras tiap 2-5 dtk, beat cepat 2-3 lalu 1 lambat di kejutan. Tiap detik ada yang gerak (gelembung, api, uap, grain). Ease: `power3.out` masuk, `power2.in` keluar, `back.out` sekali buat pop. Hold 0,3-0,6 dtk setelah elemen penting mendarat.
- **Penjelasan "kenapa" harus digambar bergerak** (tetes tenggelam, jadi uap, mengembang, muncrat), bukan daftar ikon + panah.
- Hook: frame 1 sudah terisi objek bintang + judul besar. Tanpa intro/logo.
- Tanpa progress bar.

## 2. Palet per fase (ganti antar fase cerita, jangan satu palet dari awal sampai akhir)
| fase | latar | pendukung | aksen |
|---|---|---|---|
| **A "Api & wajan"** (masalah, panas, hook) | arang `#1E1A17` | logam `#6F7679`/`#A7ADAF`, minyak `#E8A33D` | api/panas `#F26B21`, bahaya `#C8372D`; teks krem `#F6EBD9` |
| **C "Teal vs oranye"** (sebab-akibat, penjelasan) | teal gelap `#1F3A3D` (`#2A5A5E`->`#14292B`) | uap `#EDEFEA`, minyak `#F0B73A`, air `#9ED8E4`/`#3E9EB6` | `#E2552D` |
| **B "Dapur pagi"** (solusi, penutup) | krem `#F4EDE1` | kayu `#A9744F`/`#6B4A33`, logam `#6B7378` | tomat `#D9482B`; tinta `#2B2623`; centang `#2F7D4F` |

Aturan: pisahkan value dulu (harus terbaca kalau di-grayscale), 60% latar / 30% objek / 10% aksen, satu aksen panas per layar. Hangat (oranye/amber) cuma aksen dan isi objek (minyak, api), bukan latar dominan. Api gas = biru di dasar + ujung oranye tipis. Topik lain (mis. nasi): pakai logika yang sama, ganti objek dan nuansa, tetap 3 fase dan tetap hitung kontras.

## 3. Tipografi & tata letak
- **Judul:** Montserrat ExtraBold 800, HURUF KAPITAL, 88-170 px, `white-space:nowrap` per baris (huruf kapital lebar: 12 karakter x ~0,75em, cek muat <= 840 px, kalau tidak kecilkan, jangan biarkan wrap). 1-2 baris, 1-3 kata per layar judul. 1 kata kunci berwarna aksen. Outline gelap 3 px (krem di palet B) supaya terbaca di atas objek.
- **Label kecil:** Poppins Bold 40-60 px (min 40). **Caption narasi:** Poppins Bold 62 px, 3-6 kata per layar, maks 2 baris, kata yang sedang diucapkan berwarna aksen, di atas scrim (gelap 74% di A/C, krem 90% di B), pindah layar di jeda kalimat.
- **Safe zone (kanvas 1080x1920):** teks penting di x 48-888, y 288-1248. Judul mulai y 300. Caption bertumpu di y 1236 (kotak `#cap` top 1050, tinggi 190). Objek bintang tidak melewati y ~1040 (di bawahnya caption). Area di bawah 1250 = hanya latar/tekstur/api, tanpa info.
- Judul tidak boleh ketutup objek/cipratan: judul DOM di atas scene; partikel yang lewat zona judul harus kecil.
- Font file lokal di `assets/fonts/` (`mont-800.ttf`, `pop-700.ttf`, `pop-600.ttf`), dipanggil `@font-face`.

## 4. Komponen yang dipakai ulang (di `video/tes-motion/hf2/index.html`)
Salin file itu jadi `video/<slug>/hf/index.html`, ganti isi adegan. Fungsi siap pakai:
| fungsi | guna |
|---|---|
| `waterDrop(par,scale)` | tetes air berkilau (gradien, kilau, tepi) |
| `oilDrop`, `bubbleShape(par,r)`, `oilBubbles(...)` | tetes minyak, gelembung uap/udara berkilau, gelembung naik di dalam cairan |
| `crown(par,t,cx,cy,n,seed,opts)` | cipratan: mahkota kolom cairan + bulatan ujung, tetesan kepala bulat berekor tipis (motion blur), yang "dekat kamera" = bulatan buram |
| `ripple(...)`, `shake(el,t,amp)` | riak elips, getar kamera |
| `panTop(par,gradMinyak,T0,T1)` | wajan close-up dari atas-miring + kompor di bawah |
| `cutaway(s,T0,T1)` | penampang minyak (sinar, butiran, dasar logam bergores, dinding, kompor) |
| `flameRow(par,x0,x1,baseY,T0,T1,seed,sc)` | api gas kecil tak seragam, biru + ujung oranye, kedip acak, cuma di tengah burner |
| `bokeh`, `waterDrop`, `chicken(par)`, `chicken().gloss` | latar buram, paha ayam, kilau basah |
| blok THERM / GLASS | termometer (merkuri naik, band suhu, garis pembanding) dan gelas berlapis dengan tetes menyatu |
| blok DRY | tisu dapur bertekstur + tangan menekan + tetes hilang saat disapu |
| blok GROW | gelembung membesar + count-up angka (format titik: `1.600×`) |
| `T(id,times,end)` | judul per kata (pop) + keluar cepat |
| caption generator (akhir file) | dari `timing.json`, otomatis 3-6 kata, highlight per kata |
`tl.set("#tbW",{attr:{seed}})` tiap 0,14 dtk = garis "mendidih". Jangan tulis elemen langsung `repeat:-1`, pakai loop berhingga (`loop(a,b,periode,fn)`).

**Bikin video baru:** `cp -r video/tes-motion/hf2 video/<slug>/hf`, hapus `assets/*.mp3|wav`, `timing.json`, `list.txt`; edit `NARASI`/`JEDA` di `tts_hf2.py`; jalankan tts, tempel isi `timing.json` ke `const TIMING=[...]` di `index.html`, sesuaikan `data-start/duration` tiap `.scn`/`.ttl`/judul (dari `timing.json`), bangun tiap adegan; jalankan `mix_hf2.py` (ganti daftar `SFX` & `END`).

## 5. Audio
- Suara: edge-tts `id-ID-GadisNeural`, `+5%` (`tts_hf2.py`: narasi per adegan -> `assets/s*.mp3`, `voice.wav`, `timing.json` kata per kata; `JEDA[i]` = napas di akhir adegan).
- `mix_hf2.py`: suara + musik pad sintetis (ffmpeg, Am -> F) -18 dB dari suara + ducking (sidechain 8:1) + sfx tipis, master `loudnorm` dua tahap **-14 LUFS, true peak <= -1 dBTP**, tulis `assets/mix.wav`; cetak ukuran akhir. Tag `<audio id="mix" src="assets/mix.wav">`.
- SFX jarang & pelan (satu per aksi, mulai ~-16 dB dari suara); hanya momen kunci (pop/muncrat) agak menonjol. Tanpa whoosh beruntun. Sync ke frame aksinya.
- Ukur di mp4 final: `ebur128`. Hasil hf2: sekitar -13 LUFS, TP -2,8. Dengar di HP/earbud murah.

## 6. JANGAN (kritik Oring)
- progress/loading bar
- palet monoton krem/sage/zaitun/hijau tua; satu palet dari awal sampai akhir
- sfx gede/rame
- cairan sebagai bola emas, kristal bersudut, atau gumpalan nugget; cipratan harus bulat-lonjong mulus, berekor, mahkota kolom tipis
- api: kerucut identik berulang, api raksasa atau menutup seperempat layar; api cuma kecil, rapi di burner, sebagian tersembunyi di bawah wajan + glow
- objek/cipratan menutup judul; judul wrap jadi 4 baris
- layar kosong, pita warna datar, seperempat bawah mati (isi dengan latar bertekstur/kompor/kayu, bukan info)
- ikon flat generik di tengah kanvas kosong; semua objek sama besar/rata
- emoji, stock footage generik, gradient ungu-biru
- teks info di bawah y 1248 atau di luar x 48-888; caption menimpa label/objek penting
- klaim tanpa sumber: angka wajib dari `referensi-visual.md`/riset; "dalam sekejap" bukan "langsung"; jangan sarankan menyiram air ke minyak panas; tanpa klaim kesehatan

## 7. Alur kerja (kirim ke Bu Laras kalau Bash subagent ditolak)
Dari `video/<slug>/hf/`:
```
python3 mix_hf2.py                      # setelah tts_hf2.py (../../../.venv/bin/python tts_hf2.py)
npx hyperframes check                   # harus ok:true, 0 error
mkdir -p /tmp/s && npx hyperframes snapshot --at 0.1,2,5,9,13,17,21,25,29,33,37 --no-end -o /tmp/s
npx hyperframes render -o <root>/shorts/out/<slug>.mp4 --fps 30
cd <root>/shorts/out
ffmpeg -y -i <slug>.mp4 -vf "fps=1,scale=270:-1,tile=10x5" -frames:v 1 <slug>-sheet.png
ffmpeg -hide_banner -i <slug>.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -14
ffmpeg -hide_banner -i <slug>.mp4 -vf freezedetect=n=-60dB:d=0.5 -an -f null - 2>&1 | grep freeze
```
Urutan wajib: snapshot (lihat contact sheet) -> perbaiki -> check -> baru render penuh (berat, ~5-10 mnt; jalankan foreground). `freezedetect` harus kosong (kecuali tahan penutup yang disengaja). Subagent di background sering ditolak izin Bash-nya: kirim perintah persis ke Bu Laras/koordinator, dia yang menjalankan lalu kirim balik gambar. Tanpa Bash, edit lewat Edit saja dan jangan klaim sudah dites.
Render final ke GitHub Actions: belum ada (butuh Node + Chromium + ffmpeg + `hyperframes@0.8.206` + internet buat gsap CDN, atau vendor gsap ke `assets/`). Jangan tulis ke `shorts/public/out`.

## 8. Referensi
- `video/tes-motion/hf2/` (index.html, tts_hf2.py, mix_hf2.py), `out/tes-hf2.mp4`, `out/tes-hf2-sheet.png`
- `video/tes-motion/referensi-visual.md` (Fajar): palet, tipografi, audio, hook, cek fakta
- `video/nasi-cepat-basi/hf/` (video kedua dengan gaya ini). Cara lebih rapi dari "salin index.html": `build_nasi.py` merakit `index.html` dari pustaka hf2 (CSS, defs, fungsi) + `timing.json` + `scenes_nasi.js` (adegan sendiri, waktu per kata lewat `B.*`). Urutan: `tts_nasi.py` -> `build_nasi.py` -> `mix_nasi.py`. Pola ini boleh dicontoh untuk video berikutnya.
