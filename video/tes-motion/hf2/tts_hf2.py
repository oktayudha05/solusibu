#!/usr/bin/env python3
"""Narasi tes-hf2 -> assets/s<i>.mp3 + assets/voice.wav (disambung) + timing.json. Jalankan: ../../../.venv/bin/python tts_hf2.py
Voice sama pipeline lama (id-ID-GadisNeural, +5%). Fakta: lihat referensi-visual.md (suhu 160-190, "dalam sekejap", ~1.600x)."""
import asyncio, json, subprocess
from pathlib import Path
import edge_tts
D = Path(__file__).parent; A = D / "assets"
NARASI = [
 "Kenapa minyak panas muncrat, kalau kena air?",
 "Minyak goreng itu panas banget. Sekitar seratus enam puluh sampai seratus sembilan puluh derajat.",
 "Air lebih berat dari minyak. Jadi, tetesnya tenggelam sampai ke dasar.",
 "Di dasar yang panas, air berubah jadi uap dalam sekejap.",
 "Uap mengembang sekitar seribu enam ratus kali, lalu mendorong minyak keluar.",
 "Solusinya, keringkan bahan dulu pakai tisu. Lalu masukkan pelan-pelan dari sisi wajan.",
 "Kering dulu, baru masuk.",
]
JEDA = [0.15, 0.35, 0.3, 0.3, 0.45, 0.4, 0.6]
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(f)]))
async def one(t, f):
    kata = []
    c = edge_tts.Communicate(t, "id-ID-GadisNeural", rate="+5%", boundary="WordBoundary")
    with open(f, "wb") as o:
        async for m in c.stream():
            if m["type"] == "audio": o.write(m["data"])
            elif m["type"] == "WordBoundary": kata.append([m["text"], m["offset"]/1e7, (m["offset"]+m["duration"])/1e7])
    return kata
async def main():
    t0 = 0; out = []
    for i, t in enumerate(NARASI):
        f = A / f"s{i}.mp3"; k = await one(t, f); d = dur(f) + JEDA[i]
        out.append({"mulai": round(t0, 3), "durasi": round(d, 3), "kata": k}); t0 += d
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(f),"-af",f"apad=pad_dur={JEDA[i]}","-ar","44100","-ac","1",str(A/f"p{i}.wav")], check=True)
    (D/"timing.json").write_text(json.dumps(out, ensure_ascii=False))
    (D/"list.txt").write_text("".join(f"file 'assets/p{i}.wav'\n" for i in range(len(NARASI))))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(D/"list.txt"),"-c:a","pcm_s16le",str(A/"voice.wav")], check=True)
    print("total", round(t0, 2))
asyncio.run(main())
