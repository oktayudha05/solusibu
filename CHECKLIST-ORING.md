# Checklist Oring (channel solusibu)

Tanda 👆 = ORING KLIK SENDIRI.

1. Repo udah dibikinin Pak Arif: github.com/oktayudha05/solusibu
2. 👆 Buka tab **Actions** di repo itu. Kalau ada tombol hijau "enable workflow" / "I understand my workflows...", klik.
3. Tiap video jadi:
   - 👆 Di HP buka github.com/oktayudha05/solusibu/releases, download file mp4 terbaru
   - 👆 Buka app YouTube, tekan **+**, upload videonya
   - 👆 Judul & deskripsi: copas dari catatan di halaman release
   - 👆 Pilih "Tidak, ini tidak dibuat untuk anak-anak"
   - 👆 Kalau video ada affiliate: centang "Promosi berbayar" di YouTube Studio
   - 👆 Publish atau jadwalkan (saran jam ada di catatan release)
4. 👆 Link affiliate: YouTube Studio -> Penyesuaian -> Info dasar -> Link. (Link di deskripsi Shorts ga bisa diklik, makanya video bilang "link di profil".)
5. NANTI (belum perlu): OAuth / Google Cloud cuma berguna kalau project lolos audit YouTube API. Tanpa audit, video yg diupload lewat API dikunci private permanen. Kalau mau otomatis penuh, kabarin; status OAuth harus "In production", bukan "Testing" (refresh token mode Testing mati tiap 7 hari).

Ga ada GitHub Secrets yg perlu diisi.
