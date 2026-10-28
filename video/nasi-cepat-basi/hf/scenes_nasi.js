/* ===== NASI CEPAT BASI: adegan (gaya hf2, STYLE v2). Dipakai build_nasi.py: S, DUR, B, TIMING sudah didefinisikan. ===== */
const CREAM="#F6EBD9";
function TT(id,offs,keep){ // judul per kata, waktu dari data-start di HTML
  const el=$(id),st=parseFloat(el.dataset.start),du=parseFloat(el.dataset.duration);
  [...el.querySelectorAll(".w")].forEach((wd,i)=>{
    const o=offs[i]||0;
    if(o<=0){gsap.set(wd,{opacity:1});return}
    tl.fromTo(wd,{y:50,opacity:0,scale:.92},{y:0,opacity:1,scale:1,duration:.45,ease:"power3.out",immediateRender:false},st+o);
  });
  if(!keep)tl.to(id,{opacity:0,y:-24,duration:.2,ease:"power2.in"},st+du-.22);
}
function popIn(el,t,from=2.2){tl.fromTo(el,{opacity:0,scale:from},{opacity:1,scale:1,duration:.3,ease:"power3.out",immediateRender:false},t)}
function fadeAt(el,t,d=.25){tl.to(el,{opacity:0,duration:d},t)}

/* ---------- latar per palet ---------- */
function bgA(s,seed){ // dapur malam: arang + sorot hangat
  mk("rect",{width:1080,height:1920,fill:"#1E1A17"},s);
  mk("polygon",{points:"380,0 620,0 960,1300 120,1300",fill:"#FFF2D0","fill-opacity":.10,filter:"url(#fB30)"},s);
  mk("ellipse",{cx:468,cy:1180,rx:700,ry:360,fill:"url(#gGlow)",opacity:.4},s);
  bokeh(s,seed,9,120,700,"#E8A33D",.22);
  mk("rect",{x:-40,y:1150,width:1160,height:800,fill:"#2A211B"},s);
  const rr=rng(seed+1);for(let i=0;i<14;i++){const y=1180+i*34+rr()*8;mk("path",{d:`M-20,${y} Q540,${y-10+rr()*20} 1120,${y}`,fill:"none",stroke:"#120D0A","stroke-opacity":.4,"stroke-width":2+rr()*3},s)}
  const fg=mk("g",{filter:"url(#fB14)"},s);
  mk("rect",{x:-160,y:1330,width:520,height:110,rx:50,fill:"#0C0A09","fill-opacity":.9,transform:"rotate(-8 -160 1330)"},fg);
}
function bgC(s,seed){ // teal gelap, penjelasan
  mk("rect",{width:1080,height:1920,fill:"url(#gTeal)"},s);
  mk("ellipse",{cx:468,cy:860,rx:620,ry:520,fill:"url(#gLight)",opacity:.10},s);
  bokeh(s,seed,8,150,1500,"#EDEFEA",.08);
  mk("rect",{x:-40,y:1180,width:1160,height:800,fill:"#0F1E20"},s);
  const rr=rng(seed+2);for(let i=0;i<12;i++){const y=1200+i*40+rr()*10;mk("path",{d:`M-20,${y} Q${300+rr()*200},${y-8+rr()*16} 1120,${y}`,fill:"none",stroke:"#2A4A4D","stroke-opacity":.5,"stroke-width":3},s)}
}
function bgB(s,seed){ // dapur pagi: krem + meja kayu
  mk("rect",{width:1080,height:1920,fill:"#F4EDE1"},s);
  mk("ellipse",{cx:200,cy:300,rx:520,ry:420,fill:"url(#gLight)",opacity:.8},s);
  const bk=mk("g",{filter:"url(#fB30)"},s);
  mk("circle",{cx:880,cy:420,r:140,fill:"#C9B79A","fill-opacity":.5},bk);mk("circle",{cx:120,cy:700,r:110,fill:"#A9744F","fill-opacity":.3},bk);
  mk("rect",{x:0,y:1050,width:1080,height:900,fill:"url(#gWood)"},s);
  const r=rng(seed);for(let i=0;i<28;i++){const y=1070+i*32+r()*8;mk("path",{d:`M-20,${y} Q${300+r()*200},${y-14+r()*28} ${700+r()*200},${y+r()*10} T1120,${y}`,fill:"none",stroke:"#6B4A33","stroke-opacity":.18+r()*.2,"stroke-width":2+r()*3},s)}
  mk("rect",{x:0,y:1046,width:1080,height:14,fill:"#2B2623","fill-opacity":.22,filter:"url(#fB6)"},s);
  // foreground buram biar meja tidak kosong: kain lap kotak-kotak, talenan, sendok kayu
  const fg=mk("g",{filter:"url(#fB14)"},s);
  mk("rect",{x:-120,y:1480,width:620,height:260,rx:30,fill:"#F4EDE1",transform:"rotate(-6 -120 1480)"},fg);
  for(let i=0;i<7;i++)mk("rect",{x:-120+i*90,y:1470,width:44,height:300,fill:"#D9482B","fill-opacity":.55,transform:"rotate(-6 -120 1480)"},fg);
  mk("rect",{x:640,y:1420,width:520,height:340,rx:40,fill:"#C99A6B",transform:"rotate(8 640 1420)"},fg);
  mk("rect",{x:300,y:1700,width:700,height:60,rx:30,fill:"#6B4A33","fill-opacity":.8,transform:"rotate(-3 300 1700)"},fg);
}

/* ---------- objek bintang ---------- */
function riceMound(par,cx,cy,rx,ry,n,seed){
  const r=rng(seed),pts=[];
  for(let i=0;i<n;i++){const a=r()*PI,d=Math.sqrt(r());pts.push([cx+Math.cos(a)*rx*d,cy-Math.sin(a)*ry*d,r()*180,r()])}
  pts.sort((p,q)=>p[1]-q[1]);
  const g=mk("g",{},par);
  pts.forEach(([x,y,rot,q])=>mk("ellipse",{cx:x.toFixed(1),cy:y.toFixed(1),rx:(10+q*3).toFixed(1),ry:(4.4+q*1.4).toFixed(1),fill:"url(#gRice)",stroke:"#CFC3A8","stroke-width":1.2,transform:`rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`},g));
  return g;
}
function bowl(par,cx,cy,w){
  const g=mk("g",{},par);
  mk("ellipse",{cx,cy:cy+w*.8+8,rx:w*.55,ry:w*.09,fill:"#000","fill-opacity":.3,filter:"url(#fB14)"},g);
  mk("path",{d:`M${cx-w},${cy} Q${cx-w*.95},${cy+w*.8} ${cx},${cy+w*.8} Q${cx+w*.95},${cy+w*.8} ${cx+w},${cy}Z`,fill:"url(#gBowl)",stroke:"#BDB097","stroke-width":4},g);
  mk("path",{d:`M${cx-w*.9},${cy+w*.3} Q${cx},${cy+w*.5} ${cx+w*.9},${cy+w*.3}`,fill:"none",stroke:"#B9573A","stroke-width":10,"stroke-linecap":"round","stroke-opacity":.8},g);
  mk("ellipse",{cx,cy,rx:w,ry:w*.17,fill:"#CFC4AE",stroke:"#BDB097","stroke-width":4},g);
  return g;
}
function bowlFront(par,cx,cy,w){return mk("path",{d:`M${cx-w},${cy} A${w},${w*.17} 0 0 0 ${cx+w},${cy}`,fill:"none",stroke:"#F6F0E3","stroke-width":12,"stroke-linecap":"round"},par)}
function spoon(par){
  const g=mk("g",{},par);
  mk("path",{d:"M40,-6 Q200,-40 380,-120",stroke:"#5B6265","stroke-width":26,"stroke-linecap":"round",fill:"none"},g);
  mk("path",{d:"M40,-6 Q200,-40 380,-120",stroke:"url(#gMetal)","stroke-width":18,"stroke-linecap":"round",fill:"none"},g);
  mk("ellipse",{cx:0,cy:0,rx:78,ry:46,fill:"url(#gMetal)",stroke:"#5B6265","stroke-width":4},g);
  mk("ellipse",{cx:-6,cy:-4,rx:60,ry:32,fill:"#4A5154","fill-opacity":.4},g);
  return g;
}
function riceCooker(par){
  const g=mk("g",{},par);
  mk("ellipse",{cx:0,cy:210,rx:260,ry:22,fill:"#000","fill-opacity":.28,filter:"url(#fB14)"},g);
  mk("path",{d:"M-230,0 q-40,0 -40,44 M230,0 q40,0 40,44",fill:"none",stroke:"#7C8386","stroke-width":16,"stroke-linecap":"round"},g);
  mk("rect",{x:-230,y:-60,width:460,height:262,rx:58,fill:"url(#gCooker)",stroke:"#A9AEB0","stroke-width":4},g);
  mk("path",{d:"M-218,-56 Q-218,-196 0,-196 Q218,-196 218,-56Z",fill:"url(#gCooker)",stroke:"#A9AEB0","stroke-width":4},g);
  mk("rect",{x:-46,y:-224,width:92,height:30,rx:15,fill:"#3A4043"},g);
  mk("rect",{x:-130,y:56,width:260,height:78,rx:20,fill:"#3A4043"},g);
  mk("circle",{cx:-80,cy:95,r:11,fill:"#E8A33D"},g);mk("circle",{cx:-40,cy:95,r:11,fill:"#6A7174"},g);mk("circle",{cx:0,cy:95,r:11,fill:"#6A7174"},g);
  mk("path",{d:"M-150,-130 Q-90,-170 -20,-176",fill:"none",stroke:"#fff","stroke-width":12,"stroke-linecap":"round","stroke-opacity":.7},g);
  return g;
}
function wadah(par){
  const g=mk("g",{},par);
  mk("ellipse",{cx:0,cy:98,rx:195,ry:16,fill:"#000","fill-opacity":.25,filter:"url(#fB14)"},g);
  mk("path",{d:"M-185,0 L-152,78 Q-148,92 -130,92 L130,92 Q148,92 152,78 L185,0Z",fill:"#CFE6EE","fill-opacity":.7,stroke:"#7FA9B8","stroke-width":5},g);
  mk("ellipse",{cx:0,cy:0,rx:185,ry:30,fill:"#E3F1F5",stroke:"#7FA9B8","stroke-width":5},g);
  const rice=riceMound(g,0,8,150,26,70,11);
  mk("path",{d:"M-185,0 A185,30 0 0 0 185,0",fill:"none",stroke:"#7FA9B8","stroke-width":5},g);
  return {g,rice};
}
function fridge(par){
  const g=mk("g",{},par);
  mk("ellipse",{cx:0,cy:346,rx:250,ry:20,fill:"#000","fill-opacity":.3,filter:"url(#fB14)"},g);
  mk("rect",{x:-200,y:-330,width:400,height:670,rx:36,fill:"url(#gSteel)",stroke:"#97A3A9","stroke-width":5},g);
  mk("rect",{x:-170,y:-300,width:340,height:610,rx:20,fill:"url(#gCold)"},g);
  [-110,40,190].forEach(y=>mk("rect",{x:-170,y,width:340,height:14,fill:"#fff","fill-opacity":.75},g));
  const door=mk("g",{},g);
  mk("rect",{x:-200,y:-330,width:400,height:670,rx:36,fill:"url(#gSteel)",stroke:"#97A3A9","stroke-width":5},door);
  mk("rect",{x:-200,y:-118,width:400,height:8,fill:"#97A3A9"},door);
  mk("rect",{x:150,y:-250,width:16,height:110,rx:8,fill:"#5B6265"},door);mk("rect",{x:150,y:-70,width:16,height:150,rx:8,fill:"#5B6265"},door);
  gsap.set(door,{transformOrigin:"0% 50%"});
  return {g,door};
}
function clock(par,r){
  const g=mk("g",{},par);
  mk("circle",{r:r+14,fill:"#2B2623"},g);mk("circle",{r,fill:"#FBF6EA"},g);
  for(let i=0;i<12;i++){const a=i*30*PI/180,l=i%3?r*.1:r*.18;mk("line",{x1:Math.sin(a)*(r-6),y1:-Math.cos(a)*(r-6),x2:Math.sin(a)*(r-6-l),y2:-Math.cos(a)*(r-6-l),stroke:"#2B2623","stroke-width":i%3?5:9,"stroke-linecap":"round"},g)}
  [[12,0,-1],[3,1,0],[6,0,1],[9,-1,0]].forEach(([n,dx,dy])=>{const t=mk("text",{x:dx*r*.62,y:dy*r*.62+r*.09,"text-anchor":"middle","font-family":"Poppins","font-weight":700,"font-size":r*.26,fill:"#2B2623"},g);t.textContent=n});
  const hour=mk("g",{},g),min=mk("g",{},g);
  mk("line",{x1:0,y1:r*.08,x2:0,y2:-r*.5,stroke:"#2B2623","stroke-width":r*.09,"stroke-linecap":"round"},hour);
  mk("line",{x1:0,y1:r*.1,x2:0,y2:-r*.78,stroke:"#D9482B","stroke-width":r*.06,"stroke-linecap":"round"},min);
  mk("circle",{r:r*.07,fill:"#2B2623"},g);
  return {g,hour,min};
}
function spore(par,x,y,r){const g=mk("g",{},par);mk("circle",{r:r*1.7,fill:"#E8A33D","fill-opacity":.3},g);mk("circle",{r,fill:"#6B4A33",stroke:"#E8A33D","stroke-width":3},g);mk("circle",{cx:-r*.3,cy:-r*.3,r:r*.25,fill:"#fff","fill-opacity":.4},g);gsap.set(g,{x,y});return g}
function rod(par,x,y,rot,sc=1){ // kuman: batang pendek ala ilustrasi sains (abu-hijau kalem, bukan cacing)
  const g=mk("g",{opacity:0},par);
  mk("rect",{x:-15*sc,y:-5.5*sc,width:30*sc,height:11*sc,rx:5.5*sc,fill:"#9DBCA6",stroke:"#3E6150","stroke-width":2.5},g);
  mk("circle",{cx:-5*sc,cy:0,r:1.8*sc,fill:"#3E6150","fill-opacity":.7},g);mk("circle",{cx:5*sc,cy:0,r:1.8*sc,fill:"#3E6150","fill-opacity":.7},g);
  gsap.set(g,{x,y,rotation:rot});return g}
function wiggle(el,t0,t1,amp=14){const r=rng(Math.round(t0*100));loop(t0,t1,.28,(t)=>tl.to(el,{rotation:`+=${((r()-.5)*2*amp).toFixed(1)}`,x:`+=${((r()-.5)*8).toFixed(1)}`,duration:.28,ease:"sine.inOut"},t))}
function stampX(par,x,y,sz){
  const g=mk("g",{opacity:0},par),f=mk("g",{filter:"url(#fWob)"},g);
  mk("path",{d:`M${-sz},${-sz} L${sz},${sz}`,stroke:"#C8372D","stroke-width":sz*.34,"stroke-linecap":"round"},f);
  mk("path",{d:`M${sz},${-sz} L${-sz},${sz}`,stroke:"#C8372D","stroke-width":sz*.34,"stroke-linecap":"round"},f);
  mk("circle",{r:sz*1.35,fill:"none",stroke:"#C8372D","stroke-width":sz*.14,"stroke-opacity":1},f);
  gsap.set(g,{x,y});return g;
}
function chip(par,x,y,w,h,txt,fs=44,bg="rgba(0,0,0,.55)",fg=CREAM){
  const g=mk("g",{opacity:0},par);
  mk("rect",{x,y,width:w,height:h,rx:h/2,fill:bg},g);
  const t=mk("text",{x:x+w/2,y:y+h/2+fs*.35,"text-anchor":"middle","font-family":"Poppins","font-weight":700,"font-size":fs,fill:fg},g);t.textContent=txt;
  return g;
}
function steam(par,x0,x1,y,t0,t1,seed,sz=40,per=.35,op=.3){
  loop(t0,t1,per,(t,i)=>{const q=rng(seed+i),e=mk("circle",{cx:x0+q()*(x1-x0),cy:y,r:sz*(.8+q()),fill:"#fff",opacity:0,filter:"url(#fB14)"},par);
    tl.fromTo(e,{y:0,opacity:op},{y:-300,opacity:0,duration:1.8,ease:"power1.out",immediateRender:false},t)});
}
function coldSpecks(par,x0,x1,y0,y1,t0,t1,seed){
  const r=rng(seed);for(let i=0;i<22;i++){const e=mk("circle",{cx:x0+r()*(x1-x0),cy:y0+r()*(y1-y0),r:2+r()*3,fill:"#fff","fill-opacity":.6},par);
    tl.to(e,{y:-40-r()*60,x:(r()-.5)*40,duration:(t1-t0)+1,ease:"none"},t0)}
}
function drift(w,t0,t1,s0,s1,org="50% 60%"){ // dorongan kamera tipis (maks ~2,5%) supaya objek tidak merayap masuk ke kotak judul
  const k=.4,a=1+(s0-1)*k,b=1+(s1-1)*k;
  gsap.set(w,{transformOrigin:org});tl.fromTo(w,{scale:a},{scale:b,duration:t1-t0,ease:"none",immediateRender:false},t0)}

/* ===== 0 HOOK: sendok menggantung di atas nasi, jawaban ditahan ===== */
(function(){
  const T0=S[0],T1=T0+DUR[0],s=SV("sc_0"),w=W("sc_0");
  bgA(s,3);
  bowl(s,468,860,290);
  riceMound(s,468,860,272,150,320,21);
  bowlFront(s,468,860,290);
  steam(s,300,640,760,T0,T1,40,36,.3,.32);
  [[60,700],[60,780],[60,860]].forEach(([x,y],i)=>{
    const p=mk("path",{d:`M${x},${y} q50,-34 110,0 t110,0`,fill:"none",stroke:CREAM,"stroke-width":8,"stroke-linecap":"round",opacity:0},s);
    loop(T0+i*.2,T1,.9,(t)=>tl.fromTo(p,{x:-20,opacity:0},{x:50,opacity:.7,duration:.45,ease:"power2.out",yoyo:true,repeat:1,immediateRender:false},t));
  });
  const sp=spoon(s);riceMound(sp,0,-4,54,28,40,33);
  // sendok menggantung rendah di atas nasi; gagangnya tidak boleh masuk kotak judul (y < ~580)
  gsap.set(sp,{x:500,y:722,rotation:-4,scale:.7});
  tl.to(sp,{y:712,duration:.8,yoyo:true,repeat:Math.ceil(DUR[0]/.8),ease:"sine.inOut"},T0);
  tl.to(sp,{x:400,rotation:-8,duration:.35,ease:"power2.out"},B.makan);
  tl.to(sp,{x:620,rotation:2,duration:.35,ease:"power2.out"},B.buang);
  tl.to(sp,{x:500,rotation:-4,duration:.5,ease:"power2.inOut"},B.buang+.7);
  gsap.set(w,{transformOrigin:"50% 55%"});
  tl.fromTo(w,{scale:1.07},{scale:1.02,duration:2.2,ease:"power3.out",immediateRender:false},T0);
  tl.to(w,{scale:1.04,duration:DUR[0]-2.2,ease:"none"},T0+2.2);
  TT("#t0",[0,0]);
})();

/* ===== 1 NORMAL tapi belum tentu aman ===== */
(function(){
  const T0=S[1],T1=T0+DUR[1],s=SV("sc_1"),w=W("sc_1");
  bgA(s,9);
  const grp=mk("g",{},s);
  bowl(grp,468,880,290);riceMound(grp,468,880,272,150,300,25);bowlFront(grp,468,880,290);
  steam(s,320,620,780,T0,T1,60,34,.35,.28);
  const lbl=["LIHAT","CIUM","RASA"],tt=[B.lihat,B.cium,B.rasa],xs=[48,328,608];
  lbl.forEach((txt,i)=>{
    const c=chip(s,xs[i],590,250,86,txt,44);
    const ck=mk("g",{opacity:0},c);mk("circle",{cx:xs[i]+205,cy:633,r:24,fill:"#2F7D4F"},ck);mk("path",{d:`M${xs[i]+194},633 l8,9 l16,-18`,fill:"none",stroke:"#F4EDE1","stroke-width":6,"stroke-linecap":"round","stroke-linejoin":"round"},ck);
    gsap.set(c,{transformOrigin:`${xs[i]+125}px 633px`});
    tl.fromTo(c,{opacity:0,y:30},{opacity:1,y:0,duration:.35,ease:"power3.out",immediateRender:false},tt[i]-.2);
    tl.fromTo(ck,{opacity:0,scale:0},{opacity:1,scale:1,duration:.3,ease:"back.out(2)",transformOrigin:`${xs[i]+205}px 633px`,immediateRender:false},tt[i]+.35);
  });
  const x=stampX(s,468,870,100);popIn(x,B.tapi,1.5); // lingkaran r=135 -> puncak y 735, jauh di bawah chip (y<=676)
  tl.to(grp,{opacity:.45,duration:.3},B.tapi);
  const red=mk("ellipse",{cx:468,cy:870,rx:420,ry:240,fill:"#C8372D",opacity:0,filter:"url(#fB30)"},s);
  tl.fromTo(red,{opacity:.45},{opacity:.12,duration:.6,immediateRender:false},B.tapi);
  shake(w,B.tapi,22,9);
  drift(w,T0,T1,1.0,1.06);
  TT("#t1a",[0,0]);TT("#t1b",[.05,.3]);
})();

/* ===== 2 SPORA: tahan panas, bangun pas dingin pelan (palet C) ===== */
(function(){
  const T0=S[2],T1=T0+DUR[2],s=SV("sc_2"),w=W("sc_2");
  bgC(s,61);
  const glow=mk("ellipse",{cx:468,cy:1260,rx:600,ry:200,fill:"url(#gGlow)",opacity:0},s);
  const fl=mk("g",{opacity:0},s);flameRow(fl,140,800,1250,B.s2_flame,B.s2_cool,81,1.6);
  tl.to(glow,{opacity:.9,duration:.3},B.s2_flame);tl.to(glow,{opacity:0,duration:.6},B.s2_cool-.2);
  tl.to(fl,{opacity:1,duration:.2},B.s2_flame);tl.to(fl,{opacity:0,duration:.4},B.s2_cool-.2);
  // butir beras raksasa (potongan) + spora
  const gr=mk("g",{},s);
  const gf=mk("g",{filter:"url(#fWob)"},gr);
  mk("ellipse",{rx:320,ry:170,fill:"url(#gRice)",stroke:"#CFC3A8","stroke-width":8},gf);
  mk("path",{d:"M-250,-40 Q0,-100 250,-40 M-260,20 Q0,-30 260,20 M-220,80 Q0,40 220,80",fill:"none",stroke:"#D9CCB0","stroke-width":5,"stroke-linecap":"round","stroke-opacity":.8},gr);
  const heat=mk("ellipse",{rx:320,ry:170,fill:"#F26B21",opacity:0},gr);
  tl.to(heat,{opacity:.4,duration:.5},B.s2_flame);tl.to(heat,{opacity:0,duration:1.2},B.s2_cool);
  const sp=[[-190,-30],[-90,50],[10,-60],[110,30],[190,-20],[-20,70],[60,-10]].map(([x,y])=>spore(gr,x,y,15));
  gsap.set(gr,{x:400,y:800,rotation:-8});
  tl.fromTo(gr,{scale:.6,opacity:0},{scale:.9,opacity:1,duration:.5,ease:"power3.out",immediateRender:false},T0+.05);
  // termometer kecil di kanan (suhu naik 100, lalu turun pelan)
  const yT=c=>900-c*3.2;
  const th=mk("g",{filter:"url(#fWob)"},s);
  mk("rect",{x:810,y:500,width:70,height:420,rx:35,fill:"#EDEFEA","fill-opacity":.14,stroke:"#A7ADAF","stroke-width":6},th);
  mk("circle",{cx:845,cy:960,r:54,fill:"#EDEFEA","fill-opacity":.14,stroke:"#A7ADAF","stroke-width":6},th);
  const merc=mk("rect",{x:828,y:yT(30),width:34,height:965-yT(30),rx:17,fill:"#4C9BD6"},s);
  const bulb=mk("circle",{cx:845,cy:960,r:40,fill:"#4C9BD6"},s);
  // label kualitatif saja (tanpa angka suhu): PANAS saat dimasak, DINGIN saat didiamkan
  const lp=mk("text",{x:790,y:590,"text-anchor":"end","font-family":"Poppins","font-weight":700,"font-size":48,fill:"#F26B21",opacity:0},s);lp.textContent="panas";
  const ld=mk("text",{x:790,y:900,"text-anchor":"end","font-family":"Poppins","font-weight":700,"font-size":48,fill:"#9ED8E4",opacity:0},s);ld.textContent="dingin";
  tl.to(lp,{opacity:1,duration:.3},B.s2_flame);tl.to(lp,{opacity:0,duration:.3},B.s2_cool);
  tl.to(ld,{opacity:1,duration:.3},B.s2_cool+.5);
  tl.to(merc,{attr:{y:yT(100),height:965-yT(100)},duration:.7,ease:"power2.out"},B.s2_flame);
  tl.to([merc,bulb],{fill:"#C8372D",duration:.4},B.s2_flame);
  tl.to(merc,{attr:{y:yT(30),height:965-yT(30)},duration:2.6,ease:"power1.inOut"},B.s2_cool);
  tl.to([merc,bulb],{fill:"#4C9BD6",duration:2.2},B.s2_cool);
  // spora bangun: membengkak pelan lalu pecah jadi batang kuman
  sp.forEach((e,i)=>{
    tl.to(e,{scale:1.7,duration:Math.max(.5,B.s2_wake-B.s2_cool+.3),ease:"power1.in"},B.s2_cool+i*.08);
    const tx=[-190,-90,10,110,190,-20,60][i],ty=[-30,50,-60,30,-20,70,-10][i];
    [[-1,1],[1,-1]].forEach(([dx,dy],k)=>{
      const rr=rod(gr,tx+dx*40,ty+dy*26,(k?-20:25)+i*8,1.1);
      tl.fromTo(rr,{opacity:0,scale:.2},{opacity:1,scale:1,duration:.35,ease:"back.out(2)",immediateRender:false},B.s2_wake+i*.07+k*.05);
      wiggle(rr,B.s2_wake+.5+i*.07,T1,16);
    });
    tl.to(e,{opacity:.55,duration:.3},B.s2_wake+i*.07);
  });
  shake(w,B.s2_wake,10,7);
  drift(w,T0,T1,1.0,1.07);
  TT("#t2a",[0,.45]);TT("#t2b",[.05,.3]);
})();

/* ===== 3 KUMAN berkembang di suhu ruang ===== */
(function(){
  const T0=S[3],T1=T0+DUR[3],s=SV("sc_3"),w=W("sc_3");
  bgC(s,71);
  const cl=clock(s,125);gsap.set(cl.g,{x:468,y:735});
  tl.fromTo(cl.min,{rotation:0},{rotation:360*4,duration:DUR[3],ease:"none",immediateRender:false},T0);
  tl.fromTo(cl.hour,{rotation:0},{rotation:120,duration:DUR[3],ease:"none",immediateRender:false},T0);
  tl.fromTo(cl.g,{scale:.7,opacity:0},{scale:1,opacity:1,duration:.4,ease:"power3.out",immediateRender:false},T0+.05);
  bowl(s,468,1010,270);
  riceMound(s,468,1010,252,110,260,29);
  bowlFront(s,468,1010,270);
  // kuman bertambah: awalnya sedikit, makin banyak
  const r=rng(77),N=40;
  for(let i=0;i<N;i++){
    const x=468+(r()-.5)*400,y=1000-r()*60,t=T0+.2+Math.pow(i/N,1.5)*(DUR[3]-.5);
    const rr=rod(s,x,y,r()*180,1.0);
    tl.fromTo(rr,{opacity:0,scale:.2},{opacity:1,scale:1,duration:.3,ease:"back.out(2)",immediateRender:false},t);
    wiggle(rr,t+.3,T1,18);
  }
  drift(w,T0,T1,1.0,1.08);
  TT("#t3",[0,.35]);
})();

/* ===== 4 HABIS MASAK: bukan di rice cooker, sendok ke wadah kecil, sejam, kulkas (palet B) ===== */
(function(){
  const T0=S[4],T1=T0+DUR[4],s=SV("sc_4"),w=W("sc_4");
  bgB(s,41);
  // (a) rice cooker + silang
  const ck=riceCooker(s);gsap.set(ck,{x:468,y:845,scale:1.22});
  const xs=stampX(s,468,835,145);
  steam(s,360,580,570,T0,B.sendok,90,34,.3,.5);
  tl.fromTo(ck,{y:940,opacity:0},{y:845,opacity:1,duration:.45,ease:"power3.out",immediateRender:false},T0+.05);
  popIn(xs,B.jangan+.1,1.5);
  shake(w,B.jangan+.1,14,7);
  tl.to([ck,xs],{x:-420,duration:.45,ease:"power2.in"},B.sendok-.2);
  // (b) sendok ke wadah kecil
  const wd=wadah(s);gsap.set(wd.g,{x:468,y:880,scale:1.5,opacity:0});gsap.set(wd.rice,{opacity:0});
  tl.fromTo(wd.g,{opacity:0,y:960},{opacity:1,y:880,duration:.45,ease:"power3.out",immediateRender:false},B.sendok+.1);
  const sp=spoon(s);riceMound(sp,0,-4,54,28,40,35);gsap.set(sp,{x:-200,y:640,rotation:-20,scale:.9,opacity:0});
  tl.fromTo(sp,{opacity:0},{opacity:1,duration:.1,immediateRender:false},B.sendok+.15);
  tl.to(sp,{x:360,y:760,rotation:-12,duration:.6,ease:"power2.out"},B.sendok+.2);
  tl.fromTo(wd.rice,{opacity:0,scale:.6},{opacity:1,scale:1,duration:.4,ease:"power2.out",transformOrigin:"50% 100%",immediateRender:false},B.sendok+.8);
  tl.to(sp,{x:-300,y:600,duration:.5,ease:"power2.in"},B.sendok+1.0);
  tl.to(sp,{opacity:0,duration:.1},B.sendok+1.45);
  // (c) jam berputar sejam
  const cl=clock(s,190);gsap.set(cl.g,{x:468,y:810,opacity:0});
  tl.to(wd.g,{x:770,y:1000,scale:.75,duration:.5,ease:"power2.inOut"},B.sekitar-.1);
  tl.fromTo(cl.g,{opacity:0,scale:.5},{opacity:1,scale:1,duration:.4,ease:"back.out(1.6)",immediateRender:false},B.sekitar);
  tl.fromTo(cl.min,{rotation:0},{rotation:360,duration:1.3,ease:"power2.inOut",immediateRender:false},B.sekitar+.2);
  tl.fromTo(cl.hour,{rotation:0},{rotation:30,duration:1.3,ease:"power2.inOut",immediateRender:false},B.sekitar+.2);
  // (d) kulkas: wadah masuk, pintu menutup
  const fr=fridge(s);gsap.set(fr.g,{x:690,y:885,scale:.86,opacity:0});gsap.set(fr.door,{scaleX:1});
  tl.to(cl.g,{x:210,y:800,scale:.6,duration:.45,ease:"power2.inOut"},B.masuk4-.1);
  tl.fromTo(fr.g,{opacity:0,x:800},{opacity:1,x:690,duration:.4,ease:"power3.out",immediateRender:false},B.masuk4-.1);
  tl.to(fr.door,{scaleX:.12,duration:.3,ease:"power2.out"},B.masuk4+.15);
  tl.to(wd.g,{x:690,y:918,scale:.54,duration:.45,ease:"power2.inOut"},B.masuk4+.25);
  tl.to(fr.door,{scaleX:1,duration:.3,ease:"power2.in"},B.masuk4+.8);
  coldSpecks(s,560,820,620,1000,B.masuk4,T1,401);
  drift(w,T0,T1,1.0,1.06);
  TT("#t4a",[0,.35]);TT("#t4b",[.05,.3]);TT("#t4c",[.05,.3]);
})();

/* ===== 5 KULKAS sehari, panasin sekali ===== */
(function(){
  const T0=S[5],T1=T0+DUR[5],s=SV("sc_5"),w=W("sc_5");
  bgB(s,51);
  const fr=fridge(s);gsap.set(fr.g,{x:380,y:935,scale:.92});gsap.set(fr.door,{scaleX:1}); // puncak y ~631, di bawah judul (bawah ~560)
  tl.to(fr.door,{scaleX:.12,duration:.4,ease:"power2.out"},T0+.05);
  const wd=wadah(s);gsap.set(wd.g,{x:380,y:972,scale:.7});
  coldSpecks(s,240,560,560,1100,T0,B.panasin,501);
  // kalender "1 hari"
  const cal=mk("g",{opacity:0},s);
  mk("rect",{x:660,y:640,width:220,height:260,rx:24,fill:"#FFFFFF",stroke:"#CFC3A8","stroke-width":5},cal);
  mk("path",{d:"M660,664 Q660,640 684,640 L856,640 Q880,640 880,664 L880,700 L660,700Z",fill:"#D9482B"},cal);
  [700,770,840].forEach(x=>mk("circle",{cx:x,cy:640,r:9,fill:"#2B2623"},cal));
  const cn=mk("text",{x:770,y:830,"text-anchor":"middle","font-family":"Montserrat","font-weight":800,"font-size":130,fill:"#2B2623"},cal);cn.textContent="1";
  const ch=mk("text",{x:770,y:884,"text-anchor":"middle","font-family":"Poppins","font-weight":700,"font-size":44,fill:"#D9482B"},cal);ch.textContent="HARI";
  gsap.set(cal,{svgOrigin:"770 770",x:-10,y:50});
  tl.fromTo(cal,{opacity:0,scale:.4,rotation:-8},{opacity:1,scale:1.1,rotation:0,duration:.45,ease:"back.out(1.8)",immediateRender:false},B.sehari-.2);
  // panasin sekali: ganti ke mangkuk mengepul
  const bgrp=mk("g",{opacity:0},s);
  bowl(bgrp,468,930,340);riceMound(bgrp,468,930,320,170,360,57);bowlFront(bgrp,468,930,340);
  tl.to([fr.g,cal],{opacity:0,duration:.25},B.panasin-.1);
  tl.to(wd.g,{opacity:0,duration:.25},B.panasin-.1);
  tl.fromTo(bgrp,{opacity:0,y:60},{opacity:1,y:0,duration:.4,ease:"power3.out",immediateRender:false},B.panasin);
  steam(s,230,700,800,B.panasin+.1,T1,520,50,.22,.55);
  const bd=mk("g",{opacity:0},s);
  mk("circle",{cx:800,cy:680,r:70,fill:"#D9482B"},bd);
  const bt=mk("text",{x:800,y:706,"text-anchor":"middle","font-family":"Montserrat","font-weight":800,"font-size":72,fill:"#F4EDE1"},bd);bt.textContent="1×";
  gsap.set(bd,{transformOrigin:"800px 680px"});
  tl.fromTo(bd,{opacity:0,scale:.3},{opacity:1,scale:1,duration:.4,ease:"back.out(1.8)",immediateRender:false},B.panasin+.5);
  drift(w,T0,T1,1.0,1.06);
  TT("#t5a",[0,.3]);TT("#t5b",[.05,.3]);
})();

/* ===== 6 PENUTUP: sejam habis masak, masuk kulkas (tahan ±2 dtk buat screenshot) ===== */
(function(){
  const T0=S[6],T1=T0+DUR[6],s=SV("sc_6"),w=W("sc_6");
  bgB(s,61);
  const cl=clock(s,118);gsap.set(cl.g,{x:250,y:895,opacity:0}); // puncak y ~763, judul 3 baris berakhir ~585
  tl.fromTo(cl.g,{opacity:0,scale:.5},{opacity:1,scale:1,duration:.45,ease:"back.out(1.6)",immediateRender:false},T0+.1);
  tl.fromTo(cl.min,{rotation:0},{rotation:360,duration:1.4,ease:"power2.inOut",immediateRender:false},B.sejam6);
  tl.fromTo(cl.hour,{rotation:0},{rotation:30,duration:1.4,ease:"power2.inOut",immediateRender:false},B.sejam6);
  // arc sapuan 12 -> 1
  const arc=mk("path",{d:"M250,755 A140,140 0 0 1 320,774",fill:"none",stroke:"#D9482B","stroke-width":14,"stroke-linecap":"round",opacity:0},s);
  tl.fromTo(arc,{opacity:0},{opacity:1,duration:.3,immediateRender:false},B.sejam6+1.2);
  const fr=fridge(s);gsap.set(fr.g,{x:705,y:910,scale:.54,opacity:0});gsap.set(fr.door,{scaleX:.12});
  tl.fromTo(fr.g,{opacity:0,x:785},{opacity:1,x:705,duration:.4,ease:"power3.out",immediateRender:false},T0+.3);
  const wd=wadah(s);gsap.set(wd.g,{x:430,y:1010,scale:.4,opacity:0});
  tl.fromTo(wd.g,{opacity:0,y:1050},{opacity:1,y:1010,duration:.4,ease:"power3.out",immediateRender:false},T0+.5);
  tl.to(wd.g,{x:705,y:932,scale:.38,duration:.7,ease:"power2.inOut"},B.masuk6-.1);
  tl.to(fr.door,{scaleX:1,duration:.35,ease:"power2.in"},B.masuk6+.7);
  coldSpecks(s,600,800,700,1050,T0,T1,601);
  // sapuan detik: jam terus berdetak selama tahan layar
  const sec=mk("line",{x1:0,y1:12,x2:0,y2:-86,stroke:"#2B2623","stroke-width":4,"stroke-linecap":"round",opacity:0},cl.g);
  tl.to(sec,{opacity:1,duration:.2},B.narend);
  tl.fromTo(sec,{rotation:0},{rotation:360*2,duration:T1-B.narend,ease:"none",immediateRender:false},B.narend);
  // ajakan simpan (muncul di slot caption setelah narasi selesai)
  const pill=mk("g",{opacity:0},s);
  mk("rect",{x:96,y:1082,width:744,height:150,rx:75,fill:"#2B2623"},pill);
  mk("path",{d:"M150,1112 L208,1112 L208,1202 L179,1180 L150,1202Z",fill:"#F4EDE1",stroke:"#F4EDE1","stroke-width":6,"stroke-linejoin":"round"},pill);
  const p1=mk("text",{x:240,y:1147,"font-family":"Poppins","font-weight":700,"font-size":44,fill:"#F4EDE1"},pill);p1.textContent="Simpan buat pas ragu";
  const p2=mk("text",{x:240,y:1203,"font-family":"Poppins","font-weight":700,"font-size":44,fill:"#F4EDE1"},pill);p2.textContent="sama nasi semalam";
  tl.fromTo(pill,{opacity:0,y:40},{opacity:1,y:0,duration:.45,ease:"power3.out",immediateRender:false},B.narend+.1);
  drift(w,T0,T1,1.0,1.07);
  TT("#t6",[0,.2,.45],true);
})();
