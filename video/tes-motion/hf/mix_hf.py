#!/usr/bin/env python3
"""narasi.mp3 + sfx sintetis (ffmpeg lavfi) -> assets/mix.mp3. Waktu sfx = aksi di index.html."""
import subprocess
from pathlib import Path
A = Path(__file__).parent / "assets"
def ff(*a): subprocess.run(["ffmpeg","-y","-loglevel","error",*a],check=True)
def noise(name,d,flt): ff("-f","lavfi","-i",f"anoisesrc=d={d}:c=white:a=0.9,{flt}",str(A/f"x_{name}.wav"))
def tone(name,d,f,flt): ff("-f","lavfi","-i",f"sine=f={f}:d={d},{flt}",str(A/f"x_{name}.wav"))
noise("splash",.7,"highpass=f=1200,lowpass=f=7000,afade=t=out:st=0.05:d=0.65,volume=0.9")
noise("big",1.0,"highpass=f=700,lowpass=f=6000,afade=t=out:st=0.05:d=0.95,volume=1.0")
noise("whoosh",.6,"bandpass=f=1800:w=1.5,afade=t=in:d=0.3,afade=t=out:st=0.3:d=0.3")
noise("swell",1.6,"highpass=f=2500,afade=t=in:d=1.5,afade=t=out:st=1.5:d=0.1,volume=0.7")
noise("hiss",.8,"highpass=f=3500,afade=t=out:st=0.1:d=0.7,volume=0.8")
noise("wipe",.5,"bandpass=f=1200:w=1,afade=t=in:d=0.15,afade=t=out:st=0.2:d=0.3")
noise("sizzle",2.2,"highpass=f=4500,afade=t=in:d=0.2,afade=t=out:st=1.0:d=1.2,volume=0.6")
tone("boom",.6,70,"afade=t=out:st=0.02:d=0.58,volume=2.2")
tone("thunk",.3,110,"afade=t=out:st=0.02:d=0.28,volume=1.4")
tone("plop",.18,520,"afade=t=out:st=0.01:d=0.17")
tone("ding",.5,1320,"afade=t=out:st=0.02:d=0.48,volume=0.6")
S=[("splash",2.45),("whoosh",4.6),("whoosh",7.1),("ding",8.0),("thunk",11.2),("thunk",11.6),("whoosh",11.85),
   ("whoosh",14.1),("plop",15.6),("hiss",19.2),("hiss",20.3),("hiss",21.3),("hiss",22.05),("swell",23.9),
   ("big",25.5),("boom",25.5),("big",25.9),("splash",26.3),("sizzle",26.2),("splash",27.5),("wipe",30.9),("wipe",31.4),("wipe",31.75),("wipe",32.1),("wipe",32.45),("ding",33.0),("plop",34.4),("ding",36.1)]
VOL={"big":.6,"boom":.6,"splash":.5,"swell":.3,"hiss":.3,"sizzle":.35}
ins=["-i",str(A/"narasi.mp3")];fl=[]
for i,(n,t) in enumerate(S):
    ins+=["-i",str(A/f"x_{n}.wav")]; ms=int(t*1000)
    fl.append(f"[{i+1}]adelay={ms}|{ms},volume={VOL.get(n,.35)}[s{i}]")
mix="[0]"+"".join(f"[s{i}]" for i in range(len(S)))+f"amix=inputs={len(S)+1}:normalize=0:dropout_transition=0,alimiter=limit=0.95[o]"
ff(*ins,"-filter_complex",";".join(fl+[mix]),"-map","[o]","-t","38.05","-c:a","libmp3lame","-q:a","3",str(A/"mix.mp3"))
for f in A.glob("x_*.wav"): f.unlink()
print("ok")
