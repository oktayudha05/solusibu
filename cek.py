#!/usr/bin/env python3
"""python3 cek.py <folder video> | --tes. Validasi naskah.json; exit 1 kalau ada masalah."""
import json, sys
from pathlib import Path

# jenis visual -> field wajib (kiri/kanan wajib punya label+teks)
JENIS = {
    "hook": ["teks"],
    "poin": ["judul", "poin"],
    "banding": ["kiri", "kanan"],
    "angka": ["angka", "teks"],
    "aff": ["produk", "teks"],
    "diagram": ["langkah"],
    "ikon": ["ikon", "teks"],
    "penutup": ["teks"],
}
# harus sinkron dengan NAMA_IKON di src/Ikon.tsx
IKON = {"tetes", "wajan", "api", "nasi", "termometer", "uap", "es", "percikan", "mengembang", "minyak", "jam", "centang", "silang", "simpan", "ikuti"}
GERAK = {"goyang", "pulse", "melayang"}
KATA_PER_DTK = 2.5


def periksa(n):
    err = []
    for k in ("judul", "suara", "kecepatan"):
        if not isinstance(n.get(k), str) or not n[k].strip():
            err.append(f"field '{k}' wajib (string)")
    ad = n.get("adegan")
    if not isinstance(ad, list) or not ad:
        return err + ["'adegan' wajib list, minimal 1"]
    kata = 0
    aff = []
    penutup = []
    for i, a in enumerate(ad):
        w = f"adegan {i + 1}"
        nar, v = a.get("narasi"), a.get("visual")
        if not isinstance(nar, str) or not nar.strip():
            err.append(f"{w}: 'narasi' wajib")
            nar = ""
        if not isinstance(v, dict) or v.get("jenis") not in JENIS:
            err.append(f"{w}: visual.jenis harus salah satu {list(JENIS)}")
            continue
        for f in JENIS[v["jenis"]]:
            if not v.get(f):
                err.append(f"{w}: visual '{f}' wajib utk jenis {v['jenis']}")
        if v["jenis"] == "banding":
            for sisi in ("kiri", "kanan"):
                s = v.get(sisi)
                if isinstance(s, dict) and not (s.get("label") and s.get("teks")):
                    err.append(f"{w}: '{sisi}' wajib punya label & teks")
        if v["jenis"] == "diagram":
            ls = v.get("langkah")
            if not isinstance(ls, list) or not 2 <= len(ls) <= 4:
                err.append(f"{w}: diagram 'langkah' harus list 2-4 item")
            else:
                for j, l in enumerate(ls):
                    if not isinstance(l, dict) or not l.get("label"):
                        err.append(f"{w}: langkah {j + 1} wajib punya 'label'")
                    elif l.get("ikon") is not None and l["ikon"] not in IKON:
                        err.append(f"{w}: langkah {j + 1} ikon '{l['ikon']}' ga ada, pilih {sorted(IKON)}")
        if v["jenis"] == "ikon":
            if v.get("ikon") not in IKON:
                err.append(f"{w}: ikon '{v.get('ikon')}' ga ada, pilih {sorted(IKON)}")
            if v.get("gerak") is not None and v["gerak"] not in GERAK:
                err.append(f"{w}: gerak harus salah satu {sorted(GERAK)}")
        if v["jenis"] == "penutup":
            penutup.append(i)
            aj = v.get("ajakan")
            if aj is not None and not (isinstance(aj, list) and aj and all(isinstance(x, str) and x for x in aj)):
                err.append(f"{w}: penutup 'ajakan' harus list string (opsional)")
        if "link di deskripsi" in (nar + json.dumps(v, ensure_ascii=False)).lower():
            err.append(f"{w}: jangan 'link di deskripsi' (ga bisa diklik di Shorts), pakai 'link di profil'")
        if v["jenis"] == "aff":
            aff.append(i)
            if not any(x in nar.lower() for x in ("afiliasi", "berbayar")):
                err.append(f"{w}: narasi aff wajib menyebut 'afiliasi' atau 'berbayar'")
        kata += len(nar.split())
    if len(aff) > 1:
        err.append(f"aff maks 1, ketemu {len(aff)}")
    if len(penutup) > 1 or (penutup and penutup[0] != len(ad) - 1):
        err.append("penutup maks 1 dan harus adegan terakhir")
    akhir = len(ad) - 1 - len(penutup)  # aff terakhir, atau tepat sebelum penutup
    if aff and aff[0] != akhir:
        err.append("adegan aff harus yang terakhir (atau tepat sebelum penutup)")
    dtk = kata / KATA_PER_DTK
    if not 30 <= dtk <= 60:
        err.append(f"estimasi durasi {dtk:.0f} dtk ({kata} kata), harus 30-60 dtk")
    return err


def tes():
    adegan = lambda nar, v: {"narasi": nar, "visual": v}
    hook = {"jenis": "hook", "teks": "x"}
    isi = lambda n: adegan(" ".join(["kata"] * n), hook)
    base = lambda *ad: {"judul": "j", "suara": "id-ID-GadisNeural", "kecepatan": "+5%", "adegan": list(ad)}
    aff = lambda nar: adegan(nar, {"jenis": "aff", "produk": "p", "teks": "t"})
    assert periksa(base(isi(90))) == []
    assert periksa(base(isi(90), aff("ini konten berbayar"))) == []
    assert periksa(base(isi(10)))  # kependekan
    assert periksa(base(isi(200)))  # kepanjangan
    assert periksa(base(isi(90), adegan("x", {"jenis": "ngawur"})))
    assert periksa(base(isi(90), adegan("x", {"jenis": "poin", "judul": "j"})))
    assert periksa(base(isi(90), aff("tanpa disclosure")))
    assert periksa(base(aff("afiliasi"), isi(90)))  # aff bukan terakhir
    assert periksa(base(isi(90), aff("afiliasi"), aff("afiliasi")))  # aff > 1
    assert periksa(base(isi(80), aff("afiliasi, link di deskripsi")))
    tutup = adegan("simpan ya", {"jenis": "penutup", "teks": "t"})
    dia = lambda ls: adegan("x", {"jenis": "diagram", "langkah": ls})
    ok2 = [{"label": "a", "ikon": "tetes"}, {"label": "b"}]
    assert periksa(base(isi(90), dia(ok2), tutup)) == []
    assert periksa(base(isi(90), adegan("x", {"jenis": "ikon", "ikon": "wajan", "teks": "t"}))) == []
    assert periksa(base(isi(90), aff("afiliasi"), tutup)) == []  # aff sebelum penutup
    assert periksa(base(isi(90), dia(ok2[:1])))  # kurang dari 2 langkah
    assert periksa(base(isi(90), dia([{"label": "a", "ikon": "ngawur"}, {"label": "b"}])))
    assert periksa(base(isi(90), adegan("x", {"jenis": "ikon", "ikon": "ngawur", "teks": "t"})))
    assert periksa(base(tutup, isi(90)))  # penutup bukan terakhir
    assert periksa(base(isi(90), tutup, tutup))  # penutup > 1
    assert periksa(base(isi(90), tutup, aff("afiliasi")))  # aff setelah penutup
    assert periksa({"adegan": []})
    print("tes cek.py lolos")


if __name__ == "__main__":
    if sys.argv[1:] == ["--tes"]:
        tes()
        sys.exit()
    if len(sys.argv) != 2:
        sys.exit("pakai: cek.py <folder video> | --tes")
    try:
        err = periksa(json.loads((Path(sys.argv[1]) / "naskah.json").read_text()))
    except (OSError, json.JSONDecodeError) as e:
        err = [f"naskah.json ga kebaca: {e}"]
    for e in err:
        print("GAGAL:", e)
    if err:
        sys.exit(1)
    print("naskah lolos")
