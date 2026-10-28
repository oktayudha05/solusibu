#!/usr/bin/env python3
"""python3 tts.py <folder video> [subfolder]: naskah.json -> public/<subfolder>/s<i>.mp3 + props.json (durasi & kata per adegan).
subfolder relatif ke public/, default out. Contoh: tts.py video/x out/x -> public/out/x/."""
import asyncio, json, subprocess, sys
from pathlib import Path

import edge_tts

PUBLIC = Path(__file__).parent / "public"
JEDA = 0.25  # dtk napas di akhir tiap adegan


def durasi_audio(f):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))


async def suara(teks, voice, rate, file):
    kata = []
    com = edge_tts.Communicate(teks, voice, rate=rate, boundary="WordBoundary")
    with open(file, "wb") as f:
        async for c in com.stream():
            if c["type"] == "audio":
                f.write(c["data"])
            elif c["type"] == "WordBoundary":  # offset & duration satuan 100ns
                kata.append({"teks": c["text"], "mulai": c["offset"] / 1e7,
                             "selesai": (c["offset"] + c["duration"]) / 1e7})
    return kata


async def main(folder, sub="out"):
    naskah = json.loads((Path(folder) / "naskah.json").read_text())
    OUT = PUBLIC / sub
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for i, a in enumerate(naskah["adegan"]):
        f = OUT / f"s{i}.mp3"
        a["kata"] = await suara(a["narasi"], naskah["suara"], naskah["kecepatan"], f)
        a["audio"] = f"{sub}/s{i}.mp3"  # relatif ke public/ (staticFile)
        a["durasi"] = durasi_audio(f) + JEDA
        total += a["durasi"]
    (OUT / "props.json").write_text(json.dumps(naskah, ensure_ascii=False, indent=1))
    print(f"total {total:.1f} dtk, {len(naskah['adegan'])} adegan")
    if total > 60:
        print("WARNING: lebih dari 60 dtk, Shorts bisa ga masuk kategori Shorts")


if __name__ == "__main__":
    if len(sys.argv) not in (2, 3):
        sys.exit("pakai: tts.py <folder video> [subfolder di public/, default out]")
    sub = sys.argv[2] if len(sys.argv) == 3 else "out"
    if Path(sub).is_absolute() or ".." in Path(sub).parts:
        sys.exit("subfolder harus relatif & tanpa ..")
    asyncio.run(main(sys.argv[1], sub))
