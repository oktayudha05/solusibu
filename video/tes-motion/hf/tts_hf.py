#!/usr/bin/env python3
"""Narasi tes-hf -> assets/s<i>.mp3 + timing.json (kata per adegan, offset global). Pakai: ../../../.venv/bin/python tts_hf.py"""
import asyncio, json, subprocess
from pathlib import Path
import edge_tts
D = Path(__file__).parent
NARASI = [
 "Kenapa minyak panas muncrat pas kena air?",
 "Minyak di wajan itu panas banget, jauh di atas seratus derajat, titik didih air.",
 "Air lebih berat dari minyak. Jadi, setetes air yang jatuh langsung tenggelam ke dasar.",
 "Di bawah sana, air itu langsung berubah jadi uap.",
 "Uap mengembang dan mendorong minyak keluar. Itulah cipratannya.",
 "Solusinya, keringkan bahan dulu sebelum masuk ke wajan.",
 "Kering dulu, baru masuk.",
]
JEDA = 0.3
def dur(f): return float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",str(f)]))
async def one(t, f):
    kata=[]
    c=edge_tts.Communicate(t,"id-ID-GadisNeural",rate="+5%",boundary="WordBoundary")
    with open(f,"wb") as o:
        async for m in c.stream():
            if m["type"]=="audio": o.write(m["data"])
            elif m["type"]=="WordBoundary": kata.append([m["text"],m["offset"]/1e7,(m["offset"]+m["duration"])/1e7])
    return kata
async def main():
    t0=0; out=[]
    for i,t in enumerate(NARASI):
        f=D/"assets"/f"s{i}.mp3"; k=await one(t,f); d=dur(f)+JEDA
        out.append({"mulai":round(t0,3),"durasi":round(d,3),"kata":k}); t0+=d
    (D/"timing.json").write_text(json.dumps(out,ensure_ascii=False))
    lst="".join(f"file 'assets/s{i}.mp3'\n" for i in range(len(NARASI)))
    # pad tiap klip dgn jeda lewat apad
    for i,a in enumerate(out):
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",str(D/"assets"/f"s{i}.mp3"),"-af",f"apad=pad_dur={JEDA}","-ar","44100","-ac","1",str(D/"assets"/f"p{i}.wav")],check=True)
    (D/"list.txt").write_text("".join(f"file 'assets/p{i}.wav'\n" for i in range(len(NARASI))))
    subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0","-i",str(D/"list.txt"),"-c:a","libmp3lame","-q:a","3",str(D/"assets"/"narasi.mp3")],check=True)
    print("total",round(t0,2))
asyncio.run(main())
