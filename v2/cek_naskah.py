"""Cek naskah.json v2 sebelum di-push (stdlib, beberapa detik). Juga dijalanin workflow sebelum render.
Pakai: python3 cek_naskah.py naskah/<slug>.json [...]   -> exit 1 + daftar masalah kalau ada yg salah."""
import json, pathlib, re, sys

DIR = pathlib.Path(__file__).parent
ASET = {x["id"] for x in json.loads((DIR / "aset/index.json").read_text())["aset"] if x.get("jenis") != "sfx"}
TEMPLATE = {"hook-freeze": [], "penampang-zoom": ["ketukan"], "skala-angka": ["mode"], "langkah-tangan": ["langkah"], "payoff-loop": ["rangkum"]}
MODE = {"termometer": ["seri"], "tumbuh": ["pada", "ke"]}  # skala-angka
AKSI = {"lap", "pinggir", "jangan-air", "jangan-pindah", "kompor", "tutup"}  # langkah-tangan (selain ini: id properti dari aset)
JANGKAR = {"dapur", "wajan", "atas", "minyak", "dasar", "permukaan", "tetes", "uap", "api"}
KOLOM_ASET = ("karakter",)
HARAM = ["tahukah kamu", "pernahkah kamu", "fakta menarik", "yuk simak", "mari kita", "di video ini", "melainkan", "semoga bermanfaat",
         "penting untuk diingat", "jadi mulai sekarang", "rahasia", "jitu", "ampuh", "dijamin", "wajib tahu", "game changer",
         "solusi terbaik", "anda", "tentunya", "selain itu", "oleh karena itu", "merupakan", "adalah sebuah"]
norm = lambda w: re.sub(r"[^a-z0-9]", "", w.lower())  # sama dgn norm() di remotion/src/template.tsx


def cek(p):
    m, n = [], json.loads(pathlib.Path(p).read_text())
    if n.get("slug") != pathlib.Path(p).stem: m.append(f"slug '{n.get('slug')}' beda dgn nama file")
    if not re.fullmatch(r"[a-z0-9-]+", pathlib.Path(p).stem): m.append("nama file cuma boleh a-z 0-9 -")
    adegan = n.get("adegan") or []
    if not adegan: m.append("adegan kosong")
    if adegan and adegan[-1].get("template") != "payoff-loop": m.append("adegan terakhir harus payoff-loop")
    for i, a in enumerate(adegan, 1):
        t, d, teks = a.get("template"), a.get("data") or {}, a.get("teks", "")
        kata = {norm(w) for w in teks.split()}
        if t not in TEMPLATE: m.append(f"adegan {i}: template '{t}' ga ada"); continue
        m += [f"adegan {i}: data.{k} kosong" for k in TEMPLATE[t] if not d.get(k)]
        m += [f"adegan {i}: aset '{d[k]}' ga ada di aset/index.json" for k in KOLOM_ASET if d.get(k) and d[k] not in ASET]
        m += [f"adegan {i}: kunci '{k}' ga ada di teks" for k in a.get("kunci", []) if norm(k) not in kata]
        lst = lambda k: d[k] if isinstance(d.get(k), list) else []  # hook-freeze: label = string, penampang: label = daftar
        if t == "skala-angka":
            if d.get("mode") not in MODE: m.append(f"adegan {i}: mode '{d.get('mode')}' ga ada (termometer/tumbuh)")
            else: m += [f"adegan {i}: data.{k} kosong" for k in MODE[d["mode"]] if not d.get(k)]
        m += [f"adegan {i}: aksi '{x.get('aksi')}' ga ada" for x in lst("langkah") if x.get("aksi") not in AKSI | ASET]
        m += [f"adegan {i}: jangkar '{x.get('jangkar')}' ga ada" for x in lst("label") if x.get("jangkar") not in JANGKAR]
        pada = [d.get(k) for k in ("pada", "hasil_pada", "label_pada")] + list((d.get("ketukan") or {}).values())
        pada += [x.get("pada") for k in ("label", "seri", "langkah") for x in lst(k)]
        m += [f"adegan {i}: pada '{w}' ga ada di teks" for w in pada if w and norm(w) not in kata]
        # angka di teks bikin forced alignment (suara.py) gagal hitung kata → tulis pakai huruf. Angka di layar taruh di data.
        m += [f"adegan {i}: '{w}' ada angkanya, tulis pakai huruf" for w in teks.split() if re.search(r"\d", w)]
        low = f" {teks.lower()} "
        m += [f"adegan {i}: frasa haram '{h}'" for h in HARAM if re.search(rf"\b{h}\b", low)]
    af = n.get("affiliate")
    if af is not None:
        if not af.get("disclosure"): m.append("affiliate diisi tapi disclosure kosong")
        if af.get("aset") and af["aset"] not in ASET: m.append(f"affiliate.aset '{af['aset']}' ga ada")
    if not n.get("cek_fakta") and not n.get("slug", "").startswith("contoh-"): m.append("cek_fakta belum true (riset belum dicek Fajar)")
    return m


if __name__ == "__main__":
    gagal = 0
    for p in sys.argv[1:]:
        for x in cek(p): print(f"{p}: {x}"); gagal = 1
    sys.exit(gagal)
