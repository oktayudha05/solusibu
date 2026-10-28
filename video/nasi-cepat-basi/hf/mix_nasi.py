#!/usr/bin/env python3
"""voice.wav + musik pad (ffmpeg) + sfx tipis -> assets/mix.wav, master -14 LUFS / TP -1 dBTP (gaya hf2, STYLE v2).
Waktu sfx dari timing.json (kata kunci). Jalankan dari folder ini: python3 mix_nasi.py"""
import json, re, subprocess
from pathlib import Path
D = Path(__file__).parent; A = D / "assets"
timing = json.loads((D / "timing.json").read_text())
END = round(timing[-1]["mulai"] + timing[-1]["durasi"], 3)

def cue(si, word, nth=0):
    hits = [timing[si]["mulai"] + k[1] for k in timing[si]["kata"] if k[0].lower().strip(".,?!:;") == word.lower()]
    return hits[nth]

def ff(*a, cap=False):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error" if not cap else "info", *a], capture_output=cap, text=True)
    if r.returncode: raise SystemExit(r.stderr)
    return r.stderr

def sfx(name, src, flt):
    ff("-f", "lavfi", "-i", src, "-af", flt, "-ar", "44100", "-ac", "1", str(A / f"x_{name}.wav"))

noise = lambda d: f"anoisesrc=d={d}:c=pink:a=0.9"
sfx("tink",   "sine=f=1250:d=0.35", "afade=t=out:st=0.01:d=0.34")
sfx("thump",  "sine=f=62:d=0.45", "afade=t=out:st=0.02:d=0.43")
sfx("plop",   "sine=f=240:d=0.2", "afade=t=out:st=0.01:d=0.19")
sfx("pop",    noise("0.12"), "bandpass=f=900:w=1.2,afade=t=out:st=0.02:d=0.10")
sfx("hiss",   noise("0.9"), "highpass=f=3500,lowpass=f=9000,afade=t=in:d=0.05,afade=t=out:st=0.1:d=0.8")
sfx("door",   "sine=f=140:d=0.3", "afade=t=out:st=0.01:d=0.29")
# (nama, detik, gain linear): jarang dan pelan, satu per aksi
SFX = [("thump", 0.15, .12),
       ("tink", cue(1, "Kelihatannya") + .35, .08), ("tink", cue(1, "Baunya") + .35, .08), ("tink", cue(1, "Rasanya") + .35, .08),
       ("thump", cue(1, "Tapi"), .22), ("hiss", cue(2, "Dimasak"), .10), ("pop", cue(2, "bangun"), .15),
       ("thump", cue(4, "jangan") + .1, .18), ("plop", cue(4, "Sendok") + .8, .14),
       ("tink", cue(4, "sekitar") + 1.3, .08), ("door", cue(4, "masuk") + .8, .16),
       ("tink", cue(5, "sehari") + .2, .08), ("hiss", cue(5, "Panasin") + .1, .10),
       ("tink", cue(6, "sejam") + 1.3, .08), ("door", cue(6, "masuk") + .7, .16),
       ("tink", timing[-1]["mulai"] + timing[-1]["kata"][-1][2] + .4, .08)]

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

ins = ["-i", str(A / "voice.wav"), "-i", str(A / "x_music.wav")]
fl = ["[0]asplit=2[v][vsc]", "[1]volume=0.20[m]", "[m][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=450[duck]"]
for i, (n, t, g) in enumerate(SFX):
    ins += ["-i", str(A / f"x_{n}.wav")]; ms = int(t * 1000)
    fl.append(f"[{i+2}]adelay={ms}|{ms},volume={g}[s{i}]")
labels = "[v][duck]" + "".join(f"[s{i}]" for i in range(len(SFX)))
fl.append(f"{labels}amix=inputs={2+len(SFX)}:normalize=0:dropout_transition=0,atrim=0:{END},apad=whole_dur={END}[pre]")
ff(*ins, "-filter_complex", ";".join(fl), "-map", "[pre]", "-ar", "44100", "-ac", "1", str(A / "pre.wav"))

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
