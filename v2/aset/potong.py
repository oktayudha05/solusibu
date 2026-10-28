"""Sheet AI (latar #00FF00) -> sprite bersih x8. Grid dibenerin spritegrid, sisanya di sini:
chroma key + buang spill, pisah per sprite (komponen terhubung), kuantisasi ringan, upscale x8.
File asli cuma dibaca. Jalanin: ../.venv/bin/python -I potong.py  (hasil: sprite/*.png + sprite.json)"""
import json, pathlib, subprocess, tempfile
import numpy as np
from PIL import Image

HERE = pathlib.Path(__file__).parent
SRC = HERE.parent.parent.parent / "asset content"
SG = HERE.parent / ".venv/bin/spritegrid"
SKALA = 8
# urutan baca: baris atas->bawah, kiri->kanan. (id, tag, catatan)
SHEET = {
    "Hijabi mom Chef Pixel Emote Sheet.png": ("karakter", "ibu", [
        ("ibu-senyum", "senyum diam netral", "pose default"), ("ibu-jelasin", "jelasin tangan-terbuka ngomong", ""),
        ("ibu-nunjuk", "nunjuk tunjuk arah", "menghadap kanan; flipH buat nunjuk kiri"), ("ibu-jempol", "jempol setuju berhasil", ""),
        ("ibu-kaget", "kaget syok hook", ""), ("ibu-mikir", "mikir bingung tanya", ""),
        ("ibu-wajan", "masak pegang-wajan dapur", ""), ("ibu-tepok-jidat", "salah malu lupa facepalm", "")]),
    "Pixel Boy Pose Sprite anak Sheet.png": ("karakter", "anak", [
        ("anak-diam", "diam netral", ""), ("anak-lari", "lari buru-buru", ""), ("anak-numpahin", "tumpah air jatuh salah", "gelas tumpah"),
        ("anak-nangis", "nangis sedih", ""), ("anak-senang", "senang horee berhasil", "")]),
    "Pixel Grandma Expression Sprite Sheet.png": ("karakter", "nenek", [
        ("nenek-senyum", "senyum netral sutil", ""), ("nenek-nasihat", "nasihat tips jari-atas", ""),
        ("nenek-ketawa", "ketawa senang", ""), ("nenek-tersipu", "malu tersipu", ""), ("nenek-mikir", "mikir ragu", "")]),
    "Retro Pixel Kitchen Icon Grid.png": ("properti", "dapur", [
        ("wajan-minyak", "wajan minyak goreng masak", ""), ("rice-cooker", "nasi rice-cooker magicom", ""),
        ("nasi-piring", "nasi piring makan", ""), ("kompor", "kompor gas api", ""), ("sabun-cuci", "sabun cuci-piring botol", ""),
        ("keset", "keset bau lantai welcome", "tulisan WELCOME"), ("lemon", "lemon jeruk asam", "kuning terang, warnai ulang kalau perlu"),
        ("baking-soda", "baking-soda soda-kue bersih", "tulisan BAKING SODA"), ("cuka", "cuka asam botol bersih", "tulisan CUKA"),
        ("garam", "garam toples", "tulisan GARAM"), ("spons", "spons cuci-piring", ""), ("tong-sampah", "sampah tong buang", ""),
        ("tetes-air", "air tetes basah", "biru, warnai ulang ikut palet"), ("asap", "asap uap bau panas", ""),
        ("ciprat-minyak", "ciprat minyak muncrat", "kuning, warnai ulang ikut palet")]),
}


def label(mask):  # komponen terhubung 8-arah, tanpa scipy
    lab = np.zeros(mask.shape, int); n = 0
    for y, x in zip(*np.nonzero(mask)):
        if lab[y, x]: continue
        n += 1; st = [(y, x)]; lab[y, x] = n
        while st:
            cy, cx = st.pop()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = cy + dy, cx + dx
                    if 0 <= yy < mask.shape[0] and 0 <= xx < mask.shape[1] and mask[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; st.append((yy, xx))
    return lab, n


def dilate(m, r):
    out = m.copy()
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            out |= np.roll(np.roll(m, dy, 0), dx, 1)
    return out


hasil = []
for file, (jenis, grup, daftar) in SHEET.items():
    with tempfile.TemporaryDirectory() as d:
        out = pathlib.Path(d) / "g.png"
        subprocess.run([str(SG), str(SRC / file), "-o", str(out)], check=True, capture_output=True)
        a = np.asarray(Image.open(out).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    fg = ~((g > 120) & (g - np.maximum(r, b) > 60))  # latar + spill hijau; sage hijab (selisih ~40) aman
    for r_dil in (3, 2, 1, 4):  # dilasi: tanda kilat/keringat ikut sprite-nya; kecilin kalau sprite nempel
        lab, n = label(dilate(fg, r_dil))
        comps = []
        for i in range(1, n + 1):
            ys, xs = np.nonzero(lab == i)
            if len(ys) >= 60: comps.append((ys.min(), ys.max() + 1, xs.min(), xs.max() + 1))  # buang serpihan
        if len(comps) == len(daftar): break
    # urut baris (pusat y) lalu x
    comps.sort(key=lambda c: (c[0] + c[1]) / 2)
    baris, cur = [], [comps[0]]
    for c in comps[1:]:
        if (c[0] + c[1]) / 2 - (cur[-1][0] + cur[-1][1]) / 2 > 20: baris.append(cur); cur = [c]
        else: cur.append(c)
    baris.append(cur)
    urut = [c for row in baris for c in sorted(row, key=lambda c: c[2])]
    assert len(urut) == len(daftar), f"{file}: ketemu {len(urut)} sprite, harusnya {len(daftar)}"
    for (y0, y1, x0, x1), (sid, tag, cat) in zip(urut, daftar):
        rgb = a[y0:y1, x0:x1].astype(np.uint8); al = (fg & (lab > 0))[y0:y1, x0:x1]
        q = Image.fromarray(rgb).quantize(32, method=Image.Quantize.MEDIANCUT).convert("RGB")
        img = Image.merge("RGBA", (*q.split(), Image.fromarray((al * 255).astype(np.uint8))))
        img = img.resize((img.width * SKALA, img.height * SKALA), Image.NEAREST)
        img.save(HERE / "sprite" / f"{sid}.png")
        hasil.append({"id": sid, "file": f"sprite/{sid}.png", "jenis": "pose" if jenis == "karakter" else "properti",
                      "tag": [grup] + tag.split(), "ukuran": list(img.size), "catatan": cat})
    print(file, "->", len(urut))
(HERE / "sprite.json").write_text(json.dumps(hasil, indent=1, ensure_ascii=False))
