"""Uji anti-slideshow otomatis dari mp4 (ffmpeg): jumlah hard cut (scdet) + segmen diam > 0,4 dtk (freezedetect).
Pakai: python3 uji_gerak.py out/<slug>/video.mp4  -> tulis out/<slug>/uji-gerak.txt. Exit 0 selalu; gagal = ::warning (bukan error).
Batas dari KEPUTUSAN.md: hard cut <= 2, ga ada diam > 12 frame (0,4 dtk)."""
import pathlib, re, subprocess, sys

for mp4 in map(pathlib.Path, sys.argv[1:]):
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-vf", "scale=270:480,scdet=threshold=12,freezedetect=n=0.003:d=0.4",
                          "-an", "-f", "null", "-"], capture_output=True, text=True).stderr
    cut = [float(x) for x in re.findall(r"lavfi\.scd\.time:\s*([\d.]+)", log)]
    diam = [(float(a), float(b)) for a, b in zip(re.findall(r"freeze_start:\s*([\d.]+)", log), re.findall(r"freeze_duration:\s*([\d.]+)", log))]
    lolos = len(cut) <= 2 and not diam
    teks = (f"{mp4}: {'LOLOS' if lolos else 'PERINGATAN'}\nhard cut: {len(cut)} (batas 2) {['%.2f' % x for x in cut]}\n"
            f"diam > 0,4 dtk: {len(diam)} {['%.2f+%.2fs' % x for x in diam]}\n")
    (mp4.parent / "uji-gerak.txt").write_text(teks)
    print(teks)
    if not lolos: print(f"::warning title=uji anti-slideshow {mp4.parent.name}::{len(cut)} hard cut, {len(diam)} segmen diam")
