#!/usr/bin/env python3
"""Narasi dari ../naskah.json (adegan[i].narasi) -> assets/s<i>.mp3, voice.wav, timing.json (gaya hf2, STYLE v2).
Jalankan: ../../../.venv/bin/python tts_nasi.py   JEDA[i] = napas di akhir adegan; adegan terakhir +2 dtk hening buat screenshot."""
import asyncio, json, subprocess
from pathlib import Path
import edge_tts
D = Path(__file__).parent; A = D / "assets"
NASK = json.loads((D.parent / "naskah.json").read_text())
NARASI = [a["narasi"] for a in NASK["adegan"]]
JEDA = [0.35, 0.3, 0.3, 0.25, 0.3, 0.3, 2.0]
RATE = "+18%"  # ponytail: rate dipaksa di sini, bukan dari naskah["kecepatan"]
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(f)]))
async def one(t, f):
    kata = []
    c = edge_tts.Communicate(t, NASK["suara"], rate=RATE, boundary="WordBoundary")
    with open(f, "wb") as o:
        async for m in c.stream():
            if m["type"] == "audio": o.write(m["data"])
            elif m["type"] == "WordBoundary": kata.append([m["text"], m["offset"]/1e7, (m["offset"]+m["duration"])/1e7])
    return kata
async def main():
    t0 = 0; out = []
    for i, t in enumerate(NARASI):
        f = A / f"s{i}.mp3"; k = await one(t.replace(". ", ", ").replace("? ", ", "), f); d = dur(f) + JEDA[i]
        out.append({"mulai": round(t0, 3), "durasi": round(d, 3), "kata": k}); t0 += d
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(f),"-af",f"apad=pad_dur={JEDA[i]}","-ar","44100","-ac","1",str(A/f"p{i}.wav")], check=True)
    (D/"timing.json").write_text(json.dumps(out, ensure_ascii=False))
    (D/"list.txt").write_text("".join(f"file 'assets/p{i}.wav'\n" for i in range(len(NARASI))))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(D/"list.txt"),"-c:a","pcm_s16le",str(A/"voice.wav")], check=True)
    print("total", round(t0, 2))
asyncio.run(main())
