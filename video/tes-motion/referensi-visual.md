# Referensi visual: solusibu Shorts (sains dapur, faceless)

Disusun Fajar, 2026-10-27, untuk Gilang. Konteks: video tes `shorts/out/tes-hf.mp4` ditolak Oring (kaku, warna monoton, sfx kegedean, asset "AI banget", font/tata letak jelek).

Catatan kejujuran:
- Saya TIDAK menonton video/channel-nya. Bagian "kenapa nempel" disusun dari artikel breakdown + panduan komposisi umum, bukan dari analisis frame sendiri. Gilang/Oring tonton dulu sebelum niru.
- Label "praktik umum, tanpa sumber" = saran saya, bukan fakta bersumber.
- Banyak angka Shorts (LUFS, safe zone, retensi) berasal dari blog pihak ketiga; YouTube tidak mempublikasikan angka resmi. Itu ditandai.

---

## 1. Gaya & komposisi

### Referensi konkret

| Referensi | Link | Yang dipinjam |
|---|---|---|
| Kurzgesagt | [Wikipedia](https://en.wikipedia.org/wiki/Kurzgesagt), [UMich](https://artsatmichigan.umich.edu/ink/2019/09/27/simple-bright-beautiful-the-work-of-kurzgesagt) | Flat tapi berlapis (gradien, layer), bentuk bulat, 1 gagasan per panel. Bukan template: ~200 panel digambar manual di Illustrator, 2-3 ilustrator 8-12 minggu per video ([transkrip "1200 Hours" via LingQ](https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/)). Pelajaran: gaya flat itu bagus kalau detailnya spesifik, bukan generik. |
| Vox (gaya collage) | [Kapwing breakdown](https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/) | Tekstur kertas/halftone, tepi sobek, bayangan lembut antar layer, gerak "stepped" (slide/drop/snap lalu diam), palet terbatas + 1 aksen. Ini breakdown pihak ketiga, bukan dari Vox sendiri. |
| TED-Ed | [Making a TED-Ed Lesson: Animation](https://ed.ted.com/lessons/making-a-ted-ed-lesson-animation), [Nick Hilditch (animator)](https://nickhilditch.com/work/ted-ed/) | Karakter/objek sederhana tapi gaya divariasikan per topik; satu animator pegang desain sampai sound design. Detail teknik tidak dijelaskan di halamannya. |
| Footage nyata slow-mo tetesan air ke minyak panas | [Gizmodo (rekaman 3000 fps, Penn State)](https://gizmodo.com/watch-what-happens-to-this-drop-of-water-when-it-hits-h-1728975481) (halaman 403 saat saya fetch, isi dari ringkasan pencarian) | Paling relevan untuk topik minyak muncrat: close-up nyata lebih meyakinkan daripada ilustrasi. |
| Short & video sejenis (topik sama) | [The Physics of Grease Pops (Short)](https://www.youtube.com/shorts/KN-2zMC4_0I), [Why Water Makes Hot Oil Splash So Violently](https://www.youtube.com/watch?v=PS2qbWu1sPs), [What happens if you pour water onto hot oil?](https://www.youtube.com/watch?v=H9vlwtHdoHs) | Judul/kanal tidak bisa saya verifikasi (halaman YouTube tidak ke-fetch). Buat studi banding hook & framing topik yang sama. |

### Kenapa nempel di mata (prinsip komposisi)
Sumber: [Backstage](https://www.backstage.com/magazine/article/shot-composition-film-guide-12842/), [Adobe Video World](https://adobevideoworld.com/video-composition-tips/), [Doc Film Academy](https://www.docfilmacademy.com/blog/5-rules-of-composition).
- Rule of thirds: subjek di garis/titik potong grid 3x3, bukan selalu tengah. Tengah itu boleh kalau disengaja.
- Kedalaman: isi 3 lapis (foreground, tengah, background). Frame datar terasa mati/"template"; 3 lapis terasa seperti dunia nyata. Foreground blur/ negative space menambah depth.
- Depth of field dangkal: background di-blur, subjek tajam, mata langsung tahu harus lihat mana.
- Jangan biarkan foreground/background menutup subjek.

Terjemahan buat HTML+GSAP (praktik umum, tanpa sumber):
- Satu subjek besar per beat (wajan/tetes/gelembung), bukan ikon kecil di tengah kanvas kosong.
- Pakai close-up/zoom ekstrem + skala dramatis (tetes air raksasa vs wajan) alih-alih diagram jauh.
- Foreground: tepi wajan/spatula blur di pojok. Background: dapur blur gelap (gradien + noise).
- Parallax tipis antar layer saat kamera "dolly" (scale 1.00 -> 1.06) supaya tidak statis.
- Kalau pakai foto/footage nyata, cek lisensinya sendiri (belum saya verifikasi sumber stok mana).

---

## 2. Warna

Palet di bawah adalah usulan saya (praktik umum, tanpa sumber). Tujuannya melawan keluhan "monoton + tidak realistis": lebih banyak variasi value, ada warna api/minyak, ada logam dingin sebagai lawan.

**Palet A, "Api & wajan" (gelap, dramatis, paling cocok buat topik minyak panas)**
- Latar arang: `#1E1A17`
- Logam wajan: `#6F7679` (terang `#A7ADAF`)
- Minyak: `#E8A33D`
- Api/panas: `#F26B21`
- Aksen bahaya/penting: `#C8372D`
- Teks: krem `#F6EBD9`

**Palet B, "Dapur pagi" (terang, hangat, buat tips/solusi)**
- Latar: `#F4EDE1`
- Kayu: `#A9744F` (gelap `#6B4A33`)
- Minyak: `#E3B04B`
- Logam: `#6B7378`
- Tinta teks: `#2B2623`
- Aksen tomat: `#D9482B`

**Palet C, "Teal vs oranye" (kontras hue, buat transisi sebab-akibat)**
- Latar teal gelap: `#1F3A3D`
- Uap/putih: `#EDEFEA`
- Kayu: `#B98A5E`
- Minyak: `#F0B73A`
- Aksen: `#E2552D`

Cara pakai (praktik umum, tanpa sumber, kecuali kontras teks):
- Pisahkan value dulu, hue belakangan: kalau di-grayscale-kan, subjek harus tetap kebaca dari latar.
- Aturan kasar 60/30/10: 60% latar, 30% objek utama, 10% aksen. Satu aksen panas per layar (pindah ke mana mata harus lihat).
- Ganti palet antar fase cerita (masalah = A, penjelasan = C, solusi = B), jangan satu palet dari awal sampai akhir. Itu bedanya dengan tes kemarin yang krem+hijau+zaitun terus.
- Hijau tua/zaitun jangan jadi warna dominan lagi.
- Kontras teks: [WCAG 1.4.3](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html) minta 4.5:1 (teks besar 3:1). Untuk teks di atas footage/gambar yang berubah-ubah, pakai backing (scrim/kotak semi-transparan) dan uji di bagian paling terang. Ringkasan ini dari hasil pencarian [MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast) dan W3C; W3C tidak punya panduan khusus video.
- Tambah tekstur: grain/noise 3-6% (praktik umum) supaya tidak flat-vektor steril.

---

## 3. Tipografi

Semua Google Fonts (gratis). Indonesia pakai alfabet Latin dasar, jadi tidak ada masalah glyph; tidak ada sumber yang menyebut Indonesia secara eksplisit.

- **Caption/badan:** Poppins Bold atau SemiBold. [Blitzcut](https://blitzcutai.com/blog/best-caption-fonts-youtube-shorts-2026) menaruh Montserrat ExtraBold, Poppins Bold, Roboto Black sebagai yang paling tahan di Shorts. Poppins lebih bulat/hangat, lebih sempit dari Montserrat.
- **Judul/hook:** Montserrat ExtraBold (tegas, geometris, tapi lebar sehingga kalimat panjang canggung; per [Blitzcut](https://blitzcutai.com/blog/best-caption-fonts-youtube-shorts-2026)).
- **Alternatif yang layak dites:** Plus Jakarta Sans (dirancang Tokotype, Indonesia; saya belum bisa verifikasi detailnya, halaman Google Fonts tidak terbaca) dan Bricolage Grotesque (karakter lebih unik, tapi di sumber ia hanya direkomendasikan untuk thumbnail, [Approachable Design](https://www.approachabledesign.co/articles/best-youtube-fonts/)). Tes dulu sebelum dipakai.
- **Hindari:** weight Light/Regular di atas footage; terlalu tipis ([Blitzcut](https://blitzcutai.com/blog/best-caption-fonts-youtube-shorts-2026)).
- **Stroke/backing:** outline hitam 3-4 px untuk caption disarankan Blitzcut (blog vendor). Lebih baik lagi kalau ada scrim tipis di belakang (lihat kontras di atas).

### Posisi aman (kanvas 1080x1920)
Template Google (dokumentasi ads, jadi konservatif untuk Shorts organik; [Everpop](https://everpop.app/blog/where-to-put-captions-so-youtube-ui-doesnt-cover-them), [Somake](https://www.somake.ai/blog/youtube-shorts-aspect-ratio)):
- Jarak aman: atas 288 px, bawah 672 px, kiri 48 px, kanan 192 px.
- Artinya teks penting di dalam x = 48 sampai 888, y = 288 sampai 1248. Blok teks tengah maks ~696 px lebar.
- Bawah ~35% layar dipakai nama kanal/judul YouTube; kanan dipakai tombol like/komen/share.
- Sumber lain angkanya lebih longgar (atas 120-380, bawah 300-450, kanan 96-150; [Postplanify](https://postplanify.com/tools/youtube-shorts-safe-zone-checker), [Poster.ly](https://www.poster.ly/tools/youtube-shorts-safe-zone-checker), [Bytecap](https://www.bytecap.io/blog/short-form-video-safe-zones-ui-overlays)). Angka tidak seragam, jadi ikuti yang paling ketat (Google) lalu cek di HP asli.
- Auto-caption YouTube bisa menimpa caption burn-in; sisakan ruang dan cek di Studio.
- Taruh elemen visual penting dan caption di zona tengah-atas; dasar layar kosongkan untuk UI.

### Ukuran & jumlah kata
- Ukuran minimum: tidak ada angka bersumber yang kuat untuk 1080x1920. Blitzcut menyebut 7-10% tinggi frame (blog vendor, ukurannya dinyatakan untuk 1080p), BBC dikabarkan ~8% tinggi frame (via ringkasan pencarian, belum diverifikasi). Praktik umum, tanpa sumber: caption >= ~64 px, judul hook >= ~96 px, cek terbaca di HP dari jarak lengan.
- Kata per layar: BBC membatasi karakter per baris (37 untuk broadcast; 90% lebar frame 9:16, maks 3 baris vertikal) dan minimal ~0,3 dtk per kata ([ringkasan subtitlegenerator.app](https://subtitlegenerator.app/guides/subtitle-guidelines)). Vendor caption menyarankan 1-3 kata per burst ([KreateFlo](https://kreateflo.com/blog/can-word-by-word-caption-animation-keep-viewers-hooked)), tapi studi [ACM W4A 2021](https://par.nsf.gov/servlets/purl/10253921) pada penonton tuli/kurang dengar justru lebih suka 6-12 kata per baris daripada satu kata (konteks TV, bukan Shorts). Rekomendasi saya (praktik umum): 3-6 kata per layar, maks 2 baris, ikut frasa bicara.
- Gaya caption yang lagi dominan: word-by-word/pop-in dengan satu warna highlight ([KreateFlo](https://kreateflo.com/blog/can-word-by-word-caption-animation-keep-viewers-hooked)). Klaim lonjakan retensi 12-25%/40-80% itu klaim vendor, tidak terverifikasi, jangan dipakai sebagai alasan.
- Maks 2 warna teks: dasar netral + 1 highlight.

Ide tata letak: jangan taruh semua teks di satu posisi tengah. Judul hook di atas (zona aman atas), caption narasi di tengah-bawah (di atas garis y=1248), label objek menempel ke objeknya.

---

## 4. Animasi

### Prinsip (sumber: 12 prinsip Disney, Thomas & Johnston, *The Illusion of Life*, 1981; ringkasan [Adobe](https://www.adobe.com/creativecloud/animation/discover/principles-of-animation.html), [StudioBinder](https://www.studiobinder.com/blog/what-are-the-12-principles-of-animation/), [LottieFiles](https://lottiefiles.com/blog/tips-and-tutorials/mastering-disney-12-principles-animation))
- **Slow in / slow out (easing):** mulai dan berhenti perlahan, jangan linear.
- **Anticipation:** gerak kecil berlawanan sebelum gerak utama (misal tetes air naik sedikit/ mengkerut sebelum jatuh; wajan "menarik napas" sebelum muncrat).
- **Follow through & overlapping:** bagian berbeda bergerak beda kecepatan dan berhenti belakangan (percikan terus melayang setelah pop, teks berhenti setelah ikon).
- **Overshoot:** lewat sedikit dari titik akhir lalu balik; satu sumber menggolongkannya di bawah exaggeration/follow through, bukan prinsip terpisah.
- **Squash & stretch:** beri bobot dan kelenturan; volume harus terasa tetap (tetes memanjang saat jatuh, melebar saat kena).
- **Staging:** sajikan ide "sepenuhnya jelas" (Johnston/Thomas): satu hal utama per layar.
- **Secondary action, timing, arc, exaggeration:** gerak pendukung, jumlah frame menentukan "berat", lintasan melengkung.

### Durasi & easing (acuan UI, bukan film)
[Material 3 Easing and duration](https://m3.material.io/styles/motion/easing-and-duration), angka dari ringkasan pencarian (halaman tidak ke-fetch): standard 300 ms, emphasized 500 ms, masuk layar (decelerate) 400 ms, keluar (accelerate) 200 ms. Kurva: emphasized decelerate `cubic-bezier(0.05, 0.7, 0.1, 1.0)` (dari sumber sekunder). Pola: masuk pelan di akhir (ease-out), keluar cepat (ease-in). Untuk video explainer saya sarankan masuk 0,4-0,6 dtk (praktik umum, tanpa sumber).

Peta ke GSAP (praktik umum, tanpa sumber): `power3.out`/`expo.out` untuk masuk, `back.out(1.4)` untuk overshoot, `power2.in` untuk keluar, `elastic.out` hanya untuk satu momen pop. Jangan satu ease untuk semua elemen. Tambahkan 0,1-0,2 dtk stagger antar elemen supaya overlap, bukan serempak.

### Ritme potongan
- Vox-style: satu beat per ~2-3 dtk atau 5-8 kata narasi, satu ide visual per beat, pakai cut sederhana ketimbang transisi mewah ([Kapwing](https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/)). Untuk Shorts 30-60 dtk, itu 12-20 beat. Ini pegangan paling bersumber; sumber lain tidak spesifik.
- Beri "hold" (diam) 0,3-0,6 dtk setelah elemen penting mendarat supaya terbaca (praktik umum, tanpa sumber). Kekakuan di tes sebagian dari gerak seragam tanpa jeda dan tanpa variasi tempo.
- Variasi tempo: 2-3 beat cepat lalu satu beat lambat di kejutan.

### Transisi yang bagus
Praktik umum, tanpa sumber (Kapwing hanya bilang "cut sederhana"): match cut (bentuk tetes -> bentuk gelembung), zoom-through (masuk ke dalam wajan), wipe memakai objek (uap/asap menutup layar), smash cut ke close-up saat pop. Hindari fade/slide generik berulang.

### Biar ilustrasi tidak keliatan "AI/template"
Sebagian praktik umum, tanpa sumber; dasar rujukan: Kurzgesagt menggambar manual dari nol ([LingQ](https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/)), Vox pakai tekstur arsip + tepi sobek ([Kapwing](https://www.kapwing.com/resources/how-to-make-informational-videos-like-vox/)).
- Detail spesifik, bukan generik: wajan besi dengan bekas gosong, botol minyak merek tipikal (tanpa logo asli), sendok kayu retak, bukan "ikon wajan" bundar.
- Garis tidak sempurna: SVG filter `feTurbulence` + `feDisplacementMap` tipis untuk garis agak bergetar; ketebalan stroke bervariasi.
- Tekstur: noise/grain, tekstur kertas atau kayu pada latar, bayangan lembut antar layer (seperti collage).
- Ketidaksimetrisan: jangan semua ikon sama ukuran, sejajar, dan lingkaran sempurna.
- Satu "objek bintang" yang digarap detail (tetes/gelembung/uap) + sisanya sederhana, daripada semua rata detailnya.
- Campur media: foto/footage nyata (lisensi dicek) + elemen vektor tipis di atasnya, atau tekstur kertas pada ilustrasi.
- Progress/loading bar: dibuang (permintaan Oring).

---

## 5. Suara

Semua angka target di bawah dari blog pihak ketiga yang konsisten satu sama lain; YouTube Help tidak memuat target numerik ([ringkasan APU Software](https://apu.software/youtube-audio-loudness-target/); artikel resmi Stable volume: https://support.google.com/youtube/answer/14106294, isinya belum saya baca).

- **Loudness master:** sekitar -14 LUFS integrated, true peak <= -1 dBTP ([Mr. Vocal](https://mrvocal.com/posts/loudness-for-shorts), [ClickyApps](https://clickyapps.com/creator/video/guides/lufs-targets-2025), [AudioForge](https://audioforgepro.com/blog/youtube-lufs-normalization-guide)). Yang konservatif: -14 sampai -15 LUFS, peak -1,5 dBTP. YouTube konon menurunkan video yang lebih keras dan tidak menaikkan yang lebih pelan, jadi tidak ada gunanya mengejar keras. Cek lewat "Stats for Nerds".
- **Voice vs musik:** dialog/voice puncak -12 sampai -6 dB, musik alas -18 sampai -24 dB; kebanyakan panduan menaruh musik 15-25 dB di bawah voice saat orang bicara ([MusicVivo](https://musicvivo.com/blog/music-under-voiceover), [DL Sounds](https://www.dl-sounds.com/how-to-mix-voice-and-music-in-videos/)). Ada satu sumber outlier yang menyarankan hanya 4-6 dB, tapi sumber lain memperingatkan hasilnya jadi "duet" ([CutScore](https://cutscore.io/blog/good-audio-level-for-voice), lawannya MusicVivo). Pilih yang lebih pelan: earbuds melebih-lebihkan musik.
- **Saat tidak ada bicara** (intro/ outro): musik boleh naik ke 0 sampai -6 dB.
- **Ducking:** turun 6-10 dB, attack 10-30 ms, release 300-600 ms ([Skrrol](https://www.skrrol.ai/blog/audio-ducking-explained), [CapCut](https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video), [Zella](https://zellahq.com/blog/music-ducking-explained/)). Set level dasar dulu; ducking dari dasar yang terlalu keras bikin "memompa". Release terlalu pendek = memompa, attack terlalu lambat = kata pertama tertutup.
- **EQ beri ruang voice:** potong musik 2-4 dB di 1-4 kHz; voice high-pass di bawah 80 Hz ([MusicVivo](https://musicvivo.com/blog/music-under-voiceover)). Pilih musik instrumental tanpa melodi lead.
- **SFX (praktik umum, tanpa sumber):** tipis dan tepat waktu. Puncak sfx jangan di atas voice; mulai dari sekitar level musik alas (-18 sampai -24 dB) lalu naikkan hanya untuk 1-2 momen kunci (pop minyak). Satu sfx untuk satu aksi, tidak setiap elemen masuk berbunyi. Sync tepat di frame aksinya, ekor singkat, hindari sfx tinggi/ tajam (whoosh berlebihan) beruntun. Kalau tes kemarin kegedean, turunkan semua sfx 10-12 dB dulu lalu dengar ulang.
- Mix pakai referensi di HP dan earbuds murah, bukan cuma headphone studio.

---

## 6. Hook 0-3 detik

Dasar: tidak ada panduan resmi YouTube; semua dari blog pihak ketiga. Metrik "viewed vs swiped away" di Studio dipengaruhi terutama oleh 1-3 detik pertama ([vidIQ](https://vidiq.com/blog/post/youtube-shorts-algorithm/), [1of10](https://1of10.com/blog/youtube-shorts-analytics/)). Ambang "70% = bagus" itu rule of thumb komunitas, angka antarsumber tidak seragam. Jangan dijanjikan ke Oring.

Pola ([VirVid](https://virvid.ai/blog/first-3-seconds-hook-faceless-shorts-2026), vidIQ):
1. Frame pertama = frame paling mencolok di seluruh video, bukan stok generik.
2. Hasil dulu, sebab kemudian: langsung tampilkan kejutan (before/after).
3. Angka/kata raksasa memenuhi layar.
4. Pattern interrupt: sesuatu yang sedikit janggal sehingga muncul "lho kok?".
5. Teks di layar sejak frame 1 + suara; caption mulai dari kata pertama.
6. Kata pertama diucap dalam setengah detik; tanpa intro musik, logo, atau salam.
7. Hindari zoom pelan ke gambar diam tanpa teks/suara 2 detik pertama.
8. Hook yang membentuk loop bagi yang menonton ulang (akhir nyambung ke awal).

Terapan ke topik minyak muncrat (praktik umum, tanpa sumber): 0-0,5 dtk close-up wajan, satu tetes air jatuh, cut ke kata "BUM"/pop dengan sfx tipis; 0,5-3 dtk teks "Kenapa minyak muncrat kalau kena air?" di zona aman atas; hold singkat; baru ke penjelasan. Footage nyata slow-mo lebih menjual daripada ilustrasi untuk frame pertama.

---

## Cek fakta naskah (bersumber)

| Klaim naskah | Status | Catatan & sumber |
|---|---|---|
| Air lebih berat dari minyak, jadi tenggelam | Benar | Minyak sayur ~0,92 g/cm3, air 1,00 g/cm3 ([Questacon](https://www.questacon.edu.au/sites/default/files/assets/discover/questacon-at-home/[QLAB]%20Questacon%20at%20Home%20-%20Density%20Column%20-%207-9.pdf), [Girlstart](https://girlstart.org/wp-content/uploads/2021/11/density-columns.pdf)). Tetes air jatuh ke dasar wajan: [Soto, Zenit, Belmonte, arXiv 0910.3272](https://arxiv.org/abs/0910.3272) (drop bergerak lewat minyak sampai dasar wadah). Rujukan Gizmodo menyebut air lebih padat dan tidak bercampur (sumber sekunder). |
| Suhu minyak goreng biasanya sekitar | Rentang: 150-190 °C | Deep-frying umumnya 170-190 °C ([studi PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8533521/)); 350-375 °F = 177-191 °C ([ScienceDirect overview](https://www.sciencedirect.com/topics/food-science/deep-fat-frying)); Centre for Food Safety Hong Kong menganjurkan 150-180 °C ([CFS HK](https://www.cfs.gov.hk/english/multimedia/multimedia_pub/multimedia_pub_fsf_160_02.html)). Saran narasi: "sekitar 160-190 °C", jauh di atas 100 °C. Titik asap minyak berbeda-beda per jenis/produk, jangan disebut satu angka. |
| Air mendidih 100 °C | Benar untuk tekanan atmosfer | Dasar: [Illinois Physics Van](https://van.physics.illinois.edu/ask/listing/1734) (uap pada 100 °C, tekanan atmosfer). |
| "Langsung jadi uap" | Perlu diperhalus | Sumber: tetes air lebih dulu menghangat lewat konduksi, menempel di dasar, lalu menguap; kalau minyak cuma sedikit di atas 100 °C, tetes bisa tertahan sebagai superheated sampai terganggu ([Soto dkk. arXiv](https://arxiv.org/abs/0910.3272)). Di minyak 160-190 °C praktis sangat cepat. Pakai "dalam sekejap", bukan "langsung". |
| Uap mengembang besar dan mendorong minyak keluar | Benar (inti) | Illinois: air mengembang ~1600x jadi uap pada 100 °C, tekanan atmosfer. Footage 3000 fps oleh Penn State menunjukkan tetes mengembang, mengempis, mengembang lagi, gelembung naik lalu pecah di permukaan dan menyebar minyak ([Gizmodo](https://gizmodo.com/watch-what-happens-to-this-drop-of-water-when-it-hits-h-1728975481), dari ringkasan pencarian; halaman 403 saat difetch). |
| Rasio volume uap/air | ~1600x (pada 100 °C) | Kuat: [Illinois Physics Van](https://van.physics.illinois.edu/ask/listing/1734): massa jenis air cair 0,96 g/cm3 pada 100 °C, uap ~1600x lebih renggang. Angka ~1700x kalau mulai dari air suhu ruang muncul di sumber ringkasan lain (data NIST via [aquaiot](https://aquaiot.co.uk/water-to-steam-expansion/), blog, tidak diverifikasi langsung). Saran: pakai "sekitar 1.600 kali" dan beri "kira-kira"; jangan tulis 1.700. |
| Solusi: keringkan bahan dulu | Wajar, didukung sebagian | CFS HK: kelembapan di permukaan makanan sebaiknya diminimalkan sebelum menggoreng, dan kelembapan ikut merusak minyak. Artikelnya tidak membahas percikan, jadi hubungan ke percikan didasarkan pada mekanisme uap di atas. |

Peringatan untuk visual/naskah: jangan tampilkan atau sarankan menyiram air ke minyak panas/terbakar; tetap dalam konteks "bahan basah masuk wajan" dan tips aman (angkat dari api bila perlu, masukkan bahan pelan-pelan ke sisi wajan, wajan jangan penuh). Tips ini praktik umum; belum saya sertai sumber.

Klaim yang saya hindari: angka retensi/ lonjakan engagement dari vendor caption, ambang persentase "viewed", efek kesehatan minyak panas.

---

## 5 poin prioritas buat Gilang
1. Ganti ilustrasi flat generik dengan 1 objek bintang berdetail + 3 lapis kedalaman + grain; jangan lagi ikon kecil di tengah kanvas.
2. Palet ganti per fase (A api, C teal-oranye, B pagi), dengan value kontras dan satu aksen panas; buang dominasi krem+hijau+zaitun.
3. Teks: Montserrat ExtraBold judul + Poppins Bold caption, 3-6 kata per layar, dalam x 48-888 dan y 288-1248, pakai scrim.
4. Gerak: easing out untuk masuk, overshoot kecil, hold 0,3-0,6 dtk, beat 2-3 dtk dengan variasi tempo; buang progress bar.
5. Suara: master -14 LUFS / -1 dBTP, voice -12 sampai -6 dB, musik -18 sampai -24 dB + ducking 6-10 dB, sfx lebih pelan dan jarang.
