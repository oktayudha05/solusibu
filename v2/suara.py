"""Suara solusibu v2: SATU suara konsisten (clone dari suara/referensi.wav + seed tetap) + timing per kata.
Jalannya di GitHub Actions (.github/workflows/render-v2.yml), bukan di laptop.
  render  : python suara.py naskah/<slug>.json out/<slug>   -> suara.wav, props.json, suara-log.json
  kandidat: python suara.py --kandidat out/kandidat-suara    -> kandidat-N.wav + kandidat-N.json (Oring pilih satu,
            lalu salin jadi suara/referensi.wav + suara/referensi.json dan commit)."""
import argparse, json, os, pathlib, subprocess, sys, time

import numpy as np, soundfile as sf, torch

SR = 24000
REF = pathlib.Path(__file__).parent / "suara"
# teks kandidat = teks referensi clone nanti, jadi harus persis yg diucapkan di wav
TEKS_REF = ("Ibu-ibu, pernah nggak sih lagi masak terus kepikiran, kok bisa gini ya? "
            "Nah, hari ini aku cerita dikit, santai aja, sambil nunggu nasinya mateng.")
# voice design OmniVoice cuma ngerti gender/umur/pitch, jadi variasinya di situ + seed + tempo
KANDIDAT = [("female, young adult, moderate pitch", 11, 1.0),
            ("female, young adult, low pitch", 22, 1.0),
            ("female, middle-aged, moderate pitch", 33, 1.0),
            ("female, middle-aged, low pitch", 44, 1.05),
            ("female, young adult, moderate pitch", 55, 1.1)]

ap = argparse.ArgumentParser()
ap.add_argument("naskah", nargs="?"); ap.add_argument("out", nargs="?")
ap.add_argument("--kandidat", metavar="DIR", help="bikin kandidat suara (voice design) ke DIR")
ap.add_argument("--step", type=int, default=32, help="langkah difusi OmniVoice (16 cepat, 32 bagus)")
a = ap.parse_args()
if not a.kandidat and not (a.naskah and a.out):
    ap.error("butuh naskah + out, atau --kandidat DIR")

t0 = time.time()
torch.set_num_threads(os.cpu_count() or 4)
from omnivoice import OmniVoice
model = OmniVoice.from_pretrained("k2-fsa/OmniVoice", device_map="cpu", dtype=torch.float32)
t_load = time.time() - t0

if a.kandidat:
    d = pathlib.Path(a.kandidat); d.mkdir(parents=True, exist_ok=True)
    for i, (ins, seed, speed) in enumerate(KANDIDAT, 1):
        t = time.time(); torch.manual_seed(seed)
        w = model.generate(text=TEKS_REF, language="id", instruct=ins, speed=speed, num_step=a.step)[0]
        sf.write(d / f"kandidat-{i}.wav", w.astype(np.float32), SR)
        meta = {"teks": TEKS_REF, "seed": seed, "speed": speed, "instruct": ins, "step": a.step}
        (d / f"kandidat-{i}.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1))
        print(f"kandidat-{i}: {ins}, seed {seed}, speed {speed}, {time.time() - t:.0f} dtk", flush=True)
    sys.exit(0)

if not (REF / "referensi.wav").exists():
    sys.exit("suara/referensi.wav belum ada: jalanin tugas kandidat-suara, Oring pilih, commit referensinya dulu")
ref = json.loads((REF / "referensi.json").read_text())
naskah = json.loads(pathlib.Path(a.naskah).read_text())
out = pathlib.Path(a.out); out.mkdir(parents=True, exist_ok=True)
teks = " ".join(s["teks"].strip() for s in naskah["adegan"])
wav = out / "suara.wav"

t0 = time.time()
prompt = model.create_voice_clone_prompt(ref_audio=str(REF / "referensi.wav"), ref_text=ref["teks"])
torch.manual_seed(ref["seed"])
n = len(naskah["adegan"])  # per adegan biar potongan pendek & stabil; suaranya tetap satu krn clone referensi yg sama
potong = model.generate(text=[s["teks"] for s in naskah["adegan"]], language="id", voice_clone_prompt=[prompt] * n,
                        speed=ref.get("speed", 1.0), num_step=a.step)
jeda = np.zeros(int(SR * 0.25), dtype=np.float32)
sf.write(wav, np.concatenate([x for p in potong for x in (p.astype(np.float32), jeda)]), SR)
t_gen = time.time() - t0
durasi = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)],
                              capture_output=True, text=True, check=True).stdout)

# --- timing per kata: forced alignment MMS (teks naskah + audio)
from ctc_forced_aligner import (generate_emissions, get_alignments, get_spans, load_alignment_model, load_audio,
                                postprocess_results, preprocess_text)
t1 = time.time()
am, tok = load_alignment_model("cpu", dtype=torch.float32)
em, stride = generate_emissions(am, load_audio(str(wav), am.dtype, am.device), batch_size=4)
toks, txt = preprocess_text(teks, romanize=False, language="ind")
seg, scores, blank = get_alignments(em, toks, tok)
hasil = postprocess_results(txt, get_spans(toks, seg, blank), stride, scores)
t_align = time.time() - t1

kata_asli = teks.split()
assert len(hasil) == len(kata_asli), f"jumlah kata beda: align {len(hasil)} vs naskah {len(kata_asli)}"
kata = [[w, round(r["start"], 3), round(r["end"], 3)] for w, r in zip(kata_asli, hasil)]
i = 0
for s in naskah["adegan"]:
    k = len(s["teks"].split()); s["kata"] = kata[i:i + k]; i += k
naskah["audio"] = {"file": f"out/{out.name}/suara.wav", "durasi": round(durasi, 3)}  # relatif ke remotion/public/
(out / "props.json").write_text(json.dumps(naskah, ensure_ascii=False, indent=1))
log = {"step": a.step, "seed": ref["seed"], "durasi_audio": round(durasi, 2), "detik_load_model": round(t_load, 1),
       "detik_generate": round(t_gen, 1), "detik_alignment": round(t_align, 1)}
(out / "suara-log.json").write_text(json.dumps(log, indent=1))
print(json.dumps(log))
