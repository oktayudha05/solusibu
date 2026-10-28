#!/usr/bin/env python3
"""Rakit index.html video nasi-cepat-basi (gaya hf2, STYLE v2) dari:
  - ../../tes-motion/hf2/index.html : CSS, defs, pustaka JS (tetes, api, riak, caption, dll)  [dipotong di penanda]
  - timing.json (hasil tts_nasi.py) : durasi adegan + waktu kata
  - scenes_nasi.js                  : adegan nasi
Jalankan setiap kali timing.json atau scenes_nasi.js berubah:  python3 build_nasi.py"""
import json
from pathlib import Path
D = Path(__file__).parent
H = (D.parent.parent / "tes-motion" / "hf2" / "index.html").read_text()
timing = json.loads((D / "timing.json").read_text())
S = [a["mulai"] for a in timing]
DUR = [a["durasi"] for a in timing]
END = round(S[-1] + DUR[-1], 3)

def cue(si, word, nth=0):
    hits = [timing[si]["mulai"] + k[1] for k in timing[si]["kata"] if k[0].lower().strip(".,?!:;") == word.lower()]
    if len(hits) <= nth:
        raise SystemExit(f"kata '{word}' (adegan {si}) tidak ketemu. Kata: {[k[0] for k in timing[si]['kata']]}")
    return round(hits[nth], 3)

B = {
 "makan": cue(0, "makan"), "buang": cue(0, "buang"),
 "lihat": cue(1, "Kelihatannya"), "cium": cue(1, "Baunya"), "rasa": cue(1, "Rasanya"), "tapi": cue(1, "Tapi"),
 "s2_flame": cue(2, "Dimasak"), "s2_cool": cue(2, "dingin"), "s2_wake": cue(2, "bangun"),
 "jangan": cue(4, "jangan"), "sendok": cue(4, "Sendok"), "sekitar": cue(4, "sekitar"), "masuk4": cue(4, "masuk"),
 "sehari": cue(5, "sehari"), "panasin": cue(5, "Panasin"),
 "sejam6": cue(6, "sejam"), "masuk6": cue(6, "masuk"),
 "narend": round(S[6] + timing[6]["kata"][-1][2] + .3, 3),
}

# ---- judul: (id, kelas palet, start, end, html) ----
def ln(cls, txt, hl=False):
    return f'<span class="ln {cls}"><span class="w{" hl" if hl else ""}">{txt}</span></span>'
TITLES = [
 ("t0", "tA", S[0], S[1], ln("s100", "Nasi ga bau") + ln("s130", "= aman?", True)),
 ("t1a", "tA", S[1], B["tapi"] - .05, ln("s150", "Normal", True)),
 ("t1b", "tA", B["tapi"] - .05, S[2], ln("s100", "Belum tentu") + ln("s150", "aman", True)),
 ("t2a", "tC", S[2], B["s2_cool"], ln("s150", "Spora", True) + ln("sm s60", "tahan panas")),
 ("t2b", "tC", B["s2_cool"], S[3], ln("s88", "Dingin pelan") + ln("s110", "= bangun", True)),
 ("t3", "tC", S[3], S[4], ln("s130", "Kuman") + ln("s100", "berkembang", True)),
 ("t4a", "tB", S[4], B["sendok"], ln("s100", "Jangan di") + ln("s96", "rice cooker", True)),
 ("t4b", "tB", B["sendok"], B["sekitar"], ln("s100", "Sendok ke") + ln("s96", "wadah kecil", True)),
 ("t4c", "tB", B["sekitar"], S[5], ln("s130", "Sejam", True) + ln("s96", "lalu kulkas")),
 ("t5a", "tB", S[5], B["panasin"], ln("s100", "Habiskan") + ln("s150", "sehari", True)),
 ("t5b", "tB", B["panasin"], S[6], ln("s130", "Panasin") + ln("s150", "sekali", True)),
 ("t6", "tB", S[6], END, ln("s110", "Sejam", True) + ln("s76", "habis masak,") + ln("s76", "masuk kulkas.")),
]

# ---- kepala: CSS + defs dari hf2, ditambah gradien nasi/kulkas ----
head = H[:H.index('<div id="root"')]
head = head.replace("</style>", ".s76{font-size:76px}.s84{font-size:84px}.s96{font-size:96px}\n</style>", 1)
head = head.replace("</defs>", """ <radialGradient id="gRice" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".6" stop-color="#F1E8D4"/><stop offset="1" stop-color="#D9CCB0"/></radialGradient>
 <linearGradient id="gBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FBF6EA"/><stop offset="1" stop-color="#D9CDB3"/></linearGradient>
 <linearGradient id="gCooker" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D2D6D8"/></linearGradient>
 <linearGradient id="gSteel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F6F7"/><stop offset="1" stop-color="#BCC7CC"/></linearGradient>
 <radialGradient id="gCold" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#F2FDFF"/><stop offset="1" stop-color="#A3D6E8"/></radialGradient>
</defs>""", 1)

# ---- badan ----
body = [f'<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1080" data-height="1920">', ""]
for i in range(len(S)):
    body.append(f'<div id="sc_{i}" class="scn clip" data-start="{S[i]}" data-duration="{DUR[i]}" data-track-index="1"><div class="world"><svg viewBox="0 0 1080 1920"></svg></div></div>')
body.append("")
for tid, pal, a, b, html in TITLES:
    body.append(f'<div id="{tid}" class="ttl {pal} clip" data-start="{round(a,3)}" data-duration="{round(b-a,3)}" data-track-index="2">{html}</div>')
body.append(f'''
<svg id="lens" class="clip" data-start="0" data-duration="{END}" data-track-index="3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920"></svg>
<div id="vig" class="clip" data-start="0" data-duration="{END}" data-track-index="4"></div>
<div id="grain" class="clip" data-start="0" data-duration="{END}" data-track-index="5"></div>
<div id="cap" class="clip" data-start="0" data-duration="{END}" data-track-index="6"></div>
<audio id="mix" src="assets/mix.wav" data-start="0" data-duration="{END}" data-track-index="9"></audio>
</div>
''')

# ---- JS: pustaka hf2 + data + adegan + caption ----
lib = H[H.index("const tl=gsap.timeline"):H.index("/* ===== HOOK")].replace("const END=42.51;", f"const END={END};")
import re
NASK = json.loads((D.parent / "naskah.json").read_text())
SENT = []  # jumlah kata per kalimat ASLI naskah (bukan teks TTS yang titiknya diganti koma)
for i, a in enumerate(NASK["adegan"]):
    counts = [len(x.split()) for x in re.split(r"(?<=[.?!:])\s+", a["narasi"].strip()) if x]
    if sum(counts) != len(timing[i]["kata"]):
        counts = [len(timing[i]["kata"])]  # jaga-jaga kalau token TTS beda jumlah
    SENT.append(counts)
CAPJS = """/* ===== caption: 3-6 kata, putus di akhir kalimat naskah asli ===== */
const cap=$("#cap");
tl.set(cap,{"--bg":"rgba(244,237,225,.9)","--fg":"#2B2623","--hi":"#D9482B"},__S4__);
TIMING.forEach((a,si)=>{
  const gs=[];let idx=0;
  SENT[si].forEach(n=>{
    const sw=a.kata.slice(idx,idx+n);idx+=n;if(!sw.length)return;
    const parts=Math.max(Math.ceil(sw.length/5),Math.ceil(sw.map(k=>k[0]).join(" ").length/28));
    const size=Math.ceil(sw.length/parts);
    for(let p=0;p<sw.length;p+=size)gs.push(sw.slice(p,p+size));
  });
  gs.forEach((gr,gi)=>{
    const st=a.mulai+gr[0][1]-.06,en=gi+1<gs.length?a.mulai+gs[gi+1][0][1]-.06:a.mulai+gr[gr.length-1][2]+.4;
    const e=document.createElement("div");e.className="cg";
    gr.forEach((k,i)=>{const b=document.createElement("b");b.textContent=k[0]+(i<gr.length-1?" ":"");e.appendChild(b)});
    cap.appendChild(e);
    tl.fromTo(e,{opacity:0,y:18,scale:.97},{opacity:1,y:0,scale:1,duration:.15,ease:"power2.out",immediateRender:false},st);
    tl.set(e,{opacity:0},en);
    [...e.children].forEach((b,i)=>{const bt=a.mulai+gr[i][1];tl.set(b,{color:"var(--hi)"},bt);tl.set(b,{color:"var(--fg)"},Math.min(en,a.mulai+gr[i][2]+.05))});
  });
});

window.__timelines["main"]=tl;
tl.seek(0);
</script>
</body>
</html>
"""
tail = CAPJS.replace("__S4__", str(S[4]))
scenes = (D / "scenes_nasi.js").read_text()  # CREAM didefinisikan di scenes_nasi.js (pustaka hf2 tidak punya)
data = f"const TIMING={json.dumps(timing, ensure_ascii=False)};\nconst S={json.dumps(S)},DUR={json.dumps(DUR)},B={json.dumps(B)},SENT={json.dumps(SENT)};\n"
js = "<script>\n" + data + lib + "\n" + scenes + "\n" + tail
(D / "index.html").write_text(head + "\n".join(body) + js)
print("index.html ok, durasi", END, "| beat:", json.dumps(B))
