#!/usr/bin/env python3
"""voice.wav + musik pad sintetis (ffmpeg) + sfx tipis -> assets/mix.wav, master -14 LUFS / TP -1 dBTP.
Musik -18 dB dari suara + ducking (sidechain), sfx jarang & pelan (hanya muncrat yang agak menonjol).
Jalankan dari folder ini: python3 mix_hf2.py   (butuh ffmpeg; cetak LUFS & true peak akhir)"""
import json, re, subprocess
from pathlib import Path
A = Path(__file__).parent / "assets"
END = 42.51

def ff(*a, cap=False):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error" if not cap else "info", *a], capture_output=cap, text=True)
    if r.returncode: raise SystemExit(r.stderr)
    return r.stderr

def sfx(name, src, flt):
    ff("-f", "lavfi", "-i", src, "-af", flt, "-ar", "44100", "-ac", "1", str(A / f"x_{name}.wav"))

# ---- sfx (semua pendek, tanpa tajam) ----
noise = lambda d: f"anoisesrc=d={d}:c=pink:a=0.9"
sfx("pop",    noise("0.12"), "bandpass=f=900:w=1.2,afade=t=out:st=0.02:d=0.10")
sfx("plip",   "sine=f=640:d=0.12", "afade=t=out:st=0.01:d=0.11")
sfx("plop",   "sine=f=240:d=0.2", "afade=t=out:st=0.01:d=0.19")
sfx("tink",   "sine=f=1250:d=0.35", "afade=t=out:st=0.01:d=0.34")
sfx("hiss",   noise("0.9"), "highpass=f=3500,lowpass=f=9000,afade=t=in:d=0.05,afade=t=out:st=0.1:d=0.8")
sfx("sizzle", noise("2.2"), "highpass=f=4500,lowpass=f=9000,tremolo=f=17:d=0.8,afade=t=in:d=0.4,afade=t=out:st=1.4:d=0.8")
sfx("swell",  noise("2.6"), "highpass=f=1800,lowpass=f=6000,afade=t=in:d=2.4,afade=t=out:st=2.4:d=0.2")
sfx("splash", noise("0.8"), "highpass=f=900,lowpass=f=6500,afade=t=in:d=0.01,afade=t=out:st=0.05:d=0.75")
sfx("thump",  "sine=f=62:d=0.45", "afade=t=out:st=0.02:d=0.43")
sfx("rub",    noise("0.3"), "bandpass=f=1500:w=1,tremolo=f=11:d=0.7,afade=t=in:d=0.05,afade=t=out:st=0.15:d=0.15")
# (nama, detik, gain linear)
SFX = [("pop", 1.27, .30), ("thump", 1.27, .18),
       ("plip", 12.84, .16), ("plip", 13.98, .12), ("plop", 15.85, .16),
       ("sizzle", 19.6, .06), ("pop", 21.88, .20), ("hiss", 21.88, .14),
       ("swell", 25.4, .10), ("splash", 28.76, .45), ("thump", 28.76, .35), ("hiss", 29.4, .10),
       ("rub", 32.66, .10), ("rub", 33.01, .10), ("rub", 33.36, .10), ("rub", 33.71, .10),
       ("tink", 34.2, .10), ("plop", 37.4, .16), ("sizzle", 37.6, .05), ("tink", 40.4, .08)]

# ---- musik pad: Am -> F, pelan ----
def pad(name, notes, d):
    ins = []
    for n in notes: ins += ["-f", "lavfi", "-i", f"sine=f={n}:d={d}"]
    k = len(notes)
    fc = "".join(f"[{i}]" for i in range(k)) + f"amix=inputs={k}:normalize=0,lowpass=f=900,tremolo=f=0.25:d=0.35,afade=t=in:d=3,afade=t=out:st={d-3}:d=3,volume=0.6"
    ff(*ins, "-filter_complex", fc, "-ar", "44100", "-ac", "1", str(A / f"x_{name}.wav"))
pad("padA", [110, 164.81, 220, 261.63, 329.63], 25)
pad("padB", [87.31, 130.81, 174.61, 220, 261.63], 26)
ff("-i", str(A / "x_padA.wav"), "-i", str(A / "x_padB.wav"), "-filter_complex",
   f"[1]adelay=18500|18500[b];[0][b]amix=inputs=2:normalize=0,atrim=0:{END},volume=0.5[o]", "-map", "[o]", str(A / "x_music.wav"))

# ---- mix: suara + musik (ducking) + sfx ----
ins = ["-i", str(A / "voice.wav"), "-i", str(A / "x_music.wav")]
fl = ["[0]asplit=2[v][vsc]", "[1]volume=0.20[m]", "[m][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[duck]"]
for i, (n, t, g) in enumerate(SFX):
    ins += ["-i", str(A / f"x_{n}.wav")]; ms = int(t * 1000)
    fl.append(f"[{i+2}]adelay={ms}|{ms},volume={g}[s{i}]")
labels = "[v][duck]" + "".join(f"[s{i}]" for i in range(len(SFX)))
fl.append(f"{labels}amix=inputs={2+len(SFX)}:normalize=0:dropout_transition=0,atrim=0:{END},apad=whole_dur={END}[pre]")
ff(*ins, "-filter_complex", ";".join(fl), "-map", "[pre]", "-ar", "44100", "-ac", "1", str(A / "pre.wav"))

# ---- loudnorm 2-pass: -14 LUFS, TP -1 ----
st = ff("-i", str(A / "pre.wav"), "-af", "loudnorm=I=-14:TP=-1:LRA=9:print_format=json", "-f", "null", "-", cap=True)
m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", st, re.S).group(0))
ff("-i", str(A / "pre.wav"), "-af",
   f"loudnorm=I=-14:TP=-1:LRA=9:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=44100,alimiter=limit=0.89",
   "-ac", "2", "-c:a", "pcm_s16le", str(A / "mix.wav"))
for f in A.glob("x_*.wav"): f.unlink()
(A / "pre.wav").unlink()
chk = ff("-i", str(A / "mix.wav"), "-af", "ebur128=peak=true", "-f", "null", "-", cap=True)
print("mix.wav selesai. Ukur akhir:")
print("\n".join(l for l in chk.splitlines()[-14:] if re.search(r"I:|LRA:|Peak:|True peak", l)))
