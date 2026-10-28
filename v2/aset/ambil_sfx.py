"""Subset SFX dari wyzowl/sfx-kit (CC0) + metadata sinkron, lalu gabung ke index.json bareng sprite.json.
Pakai: git clone --depth 1 https://github.com/wyzowl/sfx-kit /tmp/sfxkit && python3 ambil_sfx.py /tmp/sfxkit"""
import json, pathlib, subprocess, sys
KIT = pathlib.Path(sys.argv[1]); HERE = pathlib.Path(__file__).parent
PILIH = {  # id: kapan dipakai di template kita
    "whoosh-medium-soft": "kamera geser antar elemen", "whoosh-fast-soft": "geser cepat / transisi adegan",
    "swish-soft": "kertas/kartu masuk", "zip-in-soft": "elemen meluncur masuk", "zip-out-soft": "elemen keluar",
    "pop-medium-in": "elemen muncul (overshoot)", "pop-small-in": "kata/caption muncul", "pop-small-bubble": "item checklist",
    "pop-medium-out": "elemen hilang", "impact-medium-soft": "snap zoom / kata kunci mendarat",
    "impact-heavy-soft": "momen kejutan hook", "riser-1s-soft": "nahan penasaran sebelum jawaban",
    "writing-highlighter": "stabilo kata kunci", "writing-marker-tick": "centang checklist", "writing-scribble": "coret yg salah",
    "props-tape": "selotip/kertas ditempel", "props-drip": "tetes air", "props-splash": "ciprat",
    "notification-message-in-soft": "chat masuk", "notification-message-out-soft": "chat terkirim",
    "notification-success-chime": "jawaban benar / penutup", "notification-failure-minor": "jawaban salah",
}
meta = json.loads((KIT / "sounds.json").read_text())
sounds = {x["id"]: x for v in meta.values() if isinstance(v, list) for x in v if isinstance(x, dict) and "sync" in x}
out = []
for sid, kapan in PILIH.items():
    x = sounds[sid]; dst = HERE / "sfx" / f"{sid}.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(KIT / x["file"]), "-c:a", "pcm_s16le", str(dst)], check=True)
    out.append({"id": sid, "file": f"sfx/{sid}.wav", "jenis": "sfx", "tag": [x["category"]] + x["tags"][:6],
                "catatan": kapan, "durasi": x["duration"], "sync_at": x["sync"]["at"], "sync_meets": x["sync"]["meets"],
                "lufs": x["level"]["lufs"], "di_bawah_suara_db": x.get("under_voiceover_db"), "lisensi": "CC0 wyzowl/sfx-kit"})
# desis minyak: sintesis sendiri (noise pink bandpass 2,5-9 kHz + tremolo acak buat "kretek" + envelope), bebas lisensi
DESIS = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=d=1.6:c=pink:a=0.6:r=48000:s=7", "-af",
         "highpass=f=2500,lowpass=f=9000,tremolo=f=17:d=0.5,tremolo=f=41:d=0.35,afade=t=in:d=0.04,afade=t=out:st=0.7:d=0.9,volume=1.0",
         "-c:a", "pcm_s16le", str(HERE / "sfx/desis-minyak.wav")]
subprocess.run(DESIS, check=True)
out.append({"id": "desis-minyak", "file": "sfx/desis-minyak.wav", "jenis": "sfx", "tag": ["foley", "desis", "minyak", "goreng", "sizzle", "panas"],
            "catatan": "minyak panas kena air (hook, penampang)", "durasi": 1.6, "sync_at": 0.03, "sync_meets": "onset",
            "lufs": None, "di_bawah_suara_db": None, "lisensi": "sintesis ffmpeg (ambil_sfx.py), bebas"})
sprite = json.loads((HERE / "sprite.json").read_text())
(HERE / "index.json").write_text(json.dumps({"catatan": "cari aset = grep tag. sfx: mulai di (momen - sync_at).",
    "aset": sprite + out}, indent=1, ensure_ascii=False))
print(len(sprite), "sprite +", len(out), "sfx")
