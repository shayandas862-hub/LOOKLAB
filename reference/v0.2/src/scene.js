/* ================= Live scene (three.js) ================= */
const Live=(function(){
'use strict';
const D=id=>document.getElementById(id);
const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI;
const wrap180=a=>{a=((a+180)%360+360)%360-180;return a;};
let T=null,renderer,scene,camera,cv,wrapEl,ray,rt,rtBuf,ready=false,visible=false,dirty=true,raf=0;
let key,fillL,hemi,lampL,gizmo,gizmoHit,keyLine,focus,shadowCatcher,selBox=null,selRing;
const surfaces=[],roots={},TARGET={x:0,y:1.1,z:0.2};
let S=null,logN=0,refSel=0,busy=false,matching=false,flagged={},jsonTimer=0;
const anaCache={};
const syncStatic=[],syncSel=[];

const OUTFITS=[
 {name:'Noir trench',type:'coat',color:'#2b2f3a',accent:'#c9a26b',pants:'#1d1f26'},
 {name:'Red silk dress',type:'dress',color:'#a3192b',accent:'#e6c37a',pants:'#1d1f26'},
 {name:'Street hoodie',type:'hoodie',color:'#b5452f',accent:'#e9dcc8',pants:'#2c3550'},
 {name:'Linen safari',type:'jacket',color:'#b8a77e',accent:'#6b5a3a',pants:'#c9bb96'},
 {name:'Charcoal suit',type:'suit',color:'#34363d',accent:'#9b2f2f',pants:'#2a2b31'}
];
const COLORS={red:'#b3202f',crimson:'#a3192b',green:'#2f7a4a',emerald:'#1f6b47',blue:'#2c5aa0',navy:'#1f2c55',black:'#191a1e',white:'#e9e6df',cream:'#e8dcc0',yellow:'#d9b43a',mustard:'#c79a2a',orange:'#d2701f',purple:'#62418f',violet:'#62418f',grey:'#6a6d74',gray:'#6a6d74',brown:'#6d4a32',teal:'#1f7478',pink:'#d27a9a',rust:'#b5452f',beige:'#c9b896',olive:'#6b6f3a',maroon:'#6b1e2a',gold:'#c9a26b',silver:'#b9bcc2'};
const GARMENTS={trench:'coat',coat:'coat',overcoat:'coat',dress:'dress',gown:'dress',saree:'dress',hoodie:'hoodie',sweatshirt:'hoodie',suit:'suit',blazer:'suit',jacket:'jacket',shirt:'jacket',safari:'jacket',tee:'jacket'};

function defaults(){return {
  cam:{az:16,el:11,dist:6.4,lens:35},
  light:{x:-3,y:3,z:2.2,int:1.25,kel:5600,soft:.4,fill:1.5,lamp:1,amb:.14},
  plateRelit:true,face:true,mode:'floor',sel:'mara',
  els:[
    {id:'mara',name:'Mara',kind:'cast',hero:true,mode:'card',skin:'#dba185',hair:'#1b1512',hairStyle:'long',outfit:{...OUTFITS[0]},x:-0.7,y:0,z:0.4,rot:0,scale:1,asset:'cast:mara'},
    {id:'dev',name:'Dev',kind:'cast',hero:false,mode:'card',skin:'#8d5a3c',hair:'#0f0d0c',hairStyle:'short',outfit:{...OUTFITS[2]},x:0.95,y:0,z:-0.1,rot:0,scale:1.03,asset:'cast:dev'},
    {id:'chair',name:'Armchair',kind:'prop',prop:'armchair',color:'#7a4e3a',x:2.5,y:0,z:-1.3,rot:-35,scale:1},
    {id:'table',name:'Side table',kind:'prop',prop:'table',color:'#6d5239',x:-2.6,y:0,z:-1.5,rot:0,scale:1},
    {id:'lamp',name:'Floor lamp',kind:'prop',prop:'lamp',color:'#d9a15a',x:3.3,y:0,z:-2.2,rot:0,scale:1}
  ]};}

/* ---------- log ---------- */
function log(tier,text,rule,sample){
  logN++;const ol=D('lvLog'),li=document.createElement('li');
  li.innerHTML=`<span class="n">${String(logN).padStart(2,'0')}</span><span class="tier ${tier}">${tier}</span><div class="msg">${text}<span class="meta">${rule||''}${sample?'<span class="smp">sample</span>':''}</span></div>`;
  ol.appendChild(li);ol.scrollTop=ol.scrollHeight;D('lvLogCount').textContent=`${logN} rows`;
}
function status(t){D('lvStatus').textContent=t;}

/* ---------- procedural art ---------- */
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
function shade(hex,amt){const n=parseInt(hex.slice(1),16);let r=n>>16,g=(n>>8)&255,b=n&255;const f=amt<0?0:255,t=Math.abs(amt);r=Math.round(r+(f-r)*t);g=Math.round(g+(f-g)*t);b=Math.round(b+(f-b)*t);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function noise(c,w,h,a){for(let i=0;i<w*h/30;i++){const v=Math.random()<.5?0:255;c.fillStyle=`rgba(${v},${v},${v},${a*Math.random()})`;c.fillRect(Math.random()*w,Math.random()*h,2,2);}}
function drawCharacter(cv,e){
  const c=cv.getContext('2d'),o=e.outfit;c.clearRect(0,0,256,512);
  const poly=(pts,f,st)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();c.fillStyle=f;c.fill();if(st){c.strokeStyle=st;c.lineWidth=1.5;c.stroke();}};
  const ell=(x,y,rx,ry,f)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=f;c.fill();};
  const seam='rgba(0,0,0,.25)',dress=o.type==='dress',legC=dress?e.skin:o.pants;
  if(e.hairStyle==='long')poly([[92,58],[164,58],[174,205],[82,205]],e.hair);
  poly([[102,285],[127,285],[125,478],[104,478]],legC,seam);poly([[129,285],[154,285],[152,478],[131,478]],legC,seam);
  ell(112,487,18,8,'#15161a');ell(144,487,18,8,'#15161a');
  poly([[116,108],[140,108],[143,146],[113,146]],e.skin,seam);
  let sleeve=o.color;
  if(o.type==='coat'){
    poly([[82,136],[174,136],[186,348],[70,348]],o.color,seam);
    poly([[128,140],[104,136],[120,236]],shade(o.color,-.3));poly([[128,140],[152,136],[136,236]],shade(o.color,-.3));
    poly([[116,136],[140,136],[128,172]],'#e8e2d6');
    poly([[79,238],[177,238],[177,250],[79,250]],o.accent);
    for(const y of [262,292,322])ell(128,y,4,4,o.accent);
  }else if(o.type==='dress'){
    sleeve=e.skin;
    poly([[98,138],[158,138],[154,212],[198,362],[58,362],[102,212]],o.color,seam);
    poly([[100,206],[156,206],[156,218],[100,218]],o.accent);
    poly([[106,138],[150,138],[128,176]],e.skin);
  }else if(o.type==='hoodie'){
    poly([[84,138],[172,138],[176,268],[80,268]],o.color,seam);
    ell(128,144,36,15,shade(o.color,-.25));
    poly([[96,214],[160,214],[164,258],[92,258]],shade(o.color,-.12),seam);
    c.strokeStyle=o.accent;c.lineWidth=2;c.beginPath();c.moveTo(120,150);c.lineTo(118,196);c.moveTo(136,150);c.lineTo(138,196);c.stroke();
  }else{
    poly([[84,136],[172,136],[170,254],[86,254]],o.color,seam);
    poly([[128,138],[108,136],[124,230]],shade(o.color,-.25));poly([[128,138],[148,136],[132,230]],shade(o.color,-.25));
    poly([[118,136],[138,136],[128,164]],'#ece6da');
    if(o.type==='suit'){poly([[124,150],[132,150],[134,214],[128,226],[122,214]],o.accent);}
    else{poly([[96,176],[116,176],[116,200],[96,200]],null,seam);c.strokeStyle=seam;c.strokeRect(96,176,20,24);c.strokeRect(140,176,20,24);}
  }
  poly([[86,140],[66,152],[60,302],[82,306]],sleeve,seam);poly([[170,140],[190,152],[196,302],[174,306]],sleeve,seam);
  ell(70,314,9,12,e.skin);ell(186,314,9,12,e.skin);
  ell(128,72,33,41,e.skin);ell(95,76,5,9,e.skin);ell(161,76,5,9,e.skin);
  c.fillStyle=e.hair;c.beginPath();c.ellipse(128,58,36,31,0,Math.PI,0);c.fill();
  poly([[92,58],[100,86],[96,100],[90,80]],e.hair);poly([[164,58],[156,86],[160,100],[166,80]],e.hair);
  if(e.hairStyle==='bun')ell(128,26,15,13,e.hair);
  ell(115,77,4.5,2.6,'#241a16');ell(141,77,4.5,2.6,'#241a16');
  c.strokeStyle='rgba(30,18,14,.55)';c.lineWidth=2;c.beginPath();c.moveTo(108,68);c.lineTo(122,66);c.moveTo(134,66);c.lineTo(148,68);c.stroke();
  c.strokeStyle='rgba(120,60,56,.8)';c.lineWidth=2;c.beginPath();c.moveTo(119,100);c.quadraticCurveTo(128,105,137,100);c.stroke();
}
function boxBlur(src,w,h,r){
  const tmp=new Float32Array(w*h),out=new Float32Array(w*h),k=1/(2*r+1);
  for(let y=0;y<h;y++){let s=0;const o=y*w;for(let x=-r;x<=r;x++)s+=src[o+clamp(x,0,w-1)];for(let x=0;x<w;x++){tmp[o+x]=s*k;s+=src[o+Math.min(w-1,x+r+1)]-src[o+Math.max(0,x-r)];}}
  for(let x=0;x<w;x++){let s=0;for(let y=-r;y<=r;y++)s+=tmp[clamp(y,0,h-1)*w+x];for(let y=0;y<h;y++){out[y*w+x]=s*k;s+=tmp[Math.min(h-1,y+r+1)*w+x]-tmp[Math.max(0,y-r)*w+x];}}
  return out;
}
/* normals from the cutout's own silhouette (a rounded-body height field) plus painted detail */
function makeNormal(src){
  const w=src.width,h=src.height,d=src.getContext('2d').getImageData(0,0,w,h).data,n=w*h;
  let a=new Float32Array(n);const lum=new Float32Array(n);
  for(let i=0;i<n;i++){a[i]=d[i*4+3]/255;lum[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)/255;}
  let b=a;for(let p=0;p<4;p++)b=boxBlur(b,w,h,10);
  const hg=new Float32Array(n);for(let i=0;i<n;i++)hg[i]=b[i]*30+lum[i]*a[i]*1.6;
  const out=mk(w,h),oc=out.getContext('2d'),im=oc.createImageData(w,h),o=im.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const i=y*w+x,dx=(hg[y*w+Math.min(w-1,x+1)]-hg[y*w+Math.max(0,x-1)])*.5,dy=(hg[Math.min(h-1,y+1)*w+x]-hg[Math.max(0,y-1)*w+x])*.5;
    let nx=-dx,ny=dy,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    o[i*4]=(nx*.5+.5)*255;o[i*4+1]=(ny*.5+.5)*255;o[i*4+2]=(nz*.5+.5)*255;o[i*4+3]=255;
  }
  oc.putImageData(im,0,0);return out;
}
function cardFromImage(img,tol){
  const cvv=mk(256,512),c=cvv.getContext('2d');
  const s=Math.min(256/img.width,512/img.height),dw=img.width*s,dh=img.height*s,x0=(256-dw)/2,y0=512-dh;
  c.drawImage(img,x0,y0,dw,dh);
  const id=c.getImageData(0,0,256,512),d=id.data;
  const pts=[[x0+3,y0+3],[x0+dw-4,y0+3],[x0+3,y0+dh*.5],[x0+dw-4,y0+dh*.5]];let br=0,bg=0,bb=0;
  for(const [px,py] of pts){const i=((py|0)*256+(px|0))*4;br+=d[i];bg+=d[i+1];bb+=d[i+2];}br/=4;bg/=4;bb/=4;
  for(let i=0;i<256*512;i++){
    const o=i*4,dist=Math.hypot(d[o]-br,d[o+1]-bg,d[o+2]-bb)/441;
    const a=clamp((dist-tol)/(tol*.8+.02),0,1);d[o+3]=d[o+3]*a;
  }
  c.putImageData(id,0,0);return cvv;
}
function plateCanvases(){
  const wall=(w,h)=>{
    const A=mk(w,h),B=mk(w,h),a=A.getContext('2d');
    a.fillStyle='#b9b1a4';a.fillRect(0,0,w,h);noise(a,w,h,.06);
    a.fillStyle='#958d80';a.fillRect(0,h*.68,w,h*.3);a.fillStyle='#ded8cb';a.fillRect(0,h*.675,w,h*.014);a.fillRect(0,h*.97,w,h*.03);
    a.strokeStyle='rgba(0,0,0,.16)';a.lineWidth=2;for(let i=0;i<8;i++)a.strokeRect(w*(.02+i*.123),h*.72,w*.1,h*.22);
    const wx=w*.14,wy=h*.12,ww=w*.26,wh=h*.54;
    a.fillStyle='#e9e5dc';a.fillRect(wx-8,wy-8,ww+16,wh+16);a.fillStyle='#9fb6c6';a.fillRect(wx,wy,ww,wh);
    a.fillStyle='#e9e5dc';a.fillRect(wx+ww/2-4,wy,8,wh);a.fillRect(wx,wy+wh/2-4,ww,8);
    a.fillStyle='#5b4636';a.fillRect(w*.8,h*.1,w*.12,h*.88);a.strokeStyle='rgba(0,0,0,.3)';a.strokeRect(w*.815,h*.15,w*.09,h*.3);a.strokeRect(w*.815,h*.52,w*.09,h*.38);a.fillStyle='#c9a26b';a.fillRect(w*.83,h*.55,6,14);
    a.fillStyle='#3b2f26';a.fillRect(w*.52,h*.2,w*.15,h*.3);a.fillStyle='#d3bd86';a.fillRect(w*.525,h*.215,w*.14,h*.27);a.fillStyle='#8c5a3a';a.beginPath();a.arc(w*.595,h*.36,h*.06,0,7);a.fill();a.fillStyle='#4e6a5a';a.fillRect(w*.53,h*.42,w*.13,h*.05);
    const b=B.getContext('2d');b.drawImage(A,0,0);b.globalCompositeOperation='multiply';
    let g=b.createRadialGradient(wx+ww/2,wy+wh/2,10,wx+ww/2,wy+wh/2,w*.75);g.addColorStop(0,'#ffffff');g.addColorStop(.45,'#bdb7ae');g.addColorStop(1,'#4d4945');b.fillStyle=g;b.fillRect(0,0,w,h);
    b.globalCompositeOperation='source-over';b.fillStyle='#f6faff';b.fillRect(wx,wy,ww,wh);b.fillStyle='#e9e5dc';b.fillRect(wx+ww/2-4,wy,8,wh);b.fillRect(wx,wy+wh/2-4,ww,8);
    b.globalCompositeOperation='screen';g=b.createRadialGradient(wx+ww/2,wy+wh/2,10,wx+ww/2,wy+wh/2,w*.4);g.addColorStop(0,'rgba(255,240,215,.4)');g.addColorStop(1,'rgba(255,240,215,0)');b.fillStyle=g;b.fillRect(0,0,w,h);
    return {A,B};
  };
  const floor=(w,h)=>{
    const A=mk(w,h),B=mk(w,h),a=A.getContext('2d');const cols=['#a77a4e','#9b6f45','#b3855a','#a07248'];
    for(let y=0,r=0;y<h;y+=h/18,r++){const off=(r%2)*w*.12;for(let x=-off;x<w;x+=w*.24){a.fillStyle=cols[(Math.random()*4)|0];a.fillRect(x,y,w*.24,h/18);a.strokeStyle='rgba(0,0,0,.28)';a.strokeRect(x,y,w*.24,h/18);}}
    noise(a,w,h,.06);
    const b=B.getContext('2d');b.drawImage(A,0,0);b.globalCompositeOperation='multiply';
    let g=b.createLinearGradient(0,0,0,h);g.addColorStop(0,'#d8d2ca');g.addColorStop(1,'#6f6a64');b.fillStyle=g;b.fillRect(0,0,w,h);
    b.globalCompositeOperation='screen';g=b.createLinearGradient(0,0,0,h*.75);g.addColorStop(0,'rgba(255,238,205,.5)');g.addColorStop(1,'rgba(255,238,205,0)');b.fillStyle=g;
    b.beginPath();b.moveTo(w*.14,0);b.lineTo(w*.40,0);b.lineTo(w*.66,h*.75);b.lineTo(w*.02,h*.75);b.closePath();b.fill();
    return {A,B};
  };
  const side=(w,h,flip)=>{
    const A=mk(w,h),B=mk(w,h),a=A.getContext('2d');a.fillStyle='#b4ada0';a.fillRect(0,0,w,h);noise(a,w,h,.06);
    a.fillStyle='#8f887b';a.fillRect(0,h*.68,w,h*.3);a.fillStyle='#ded8cb';a.fillRect(0,h*.675,w,h*.014);a.fillRect(0,h*.97,w,h*.03);
    const b=B.getContext('2d');b.drawImage(A,0,0);b.globalCompositeOperation='multiply';
    const g=b.createLinearGradient(flip?w:0,0,flip?0:w,0);g.addColorStop(0,'#5a5651');g.addColorStop(1,'#d0cac2');b.fillStyle=g;b.fillRect(0,0,w,h);
    return {A,B};
  };
  return {back:wall(768,308),floor:floor(768,720),left:side(720,308,false),right:side(720,308,true)};
}
/* flatten low-frequency light out of a photo: a crude intrinsic decomposition */
function delight(src){
  const w=src.width,h=src.height,A=mk(w,h),a=A.getContext('2d');a.drawImage(src,0,0);
  const sm=mk(48,Math.max(8,Math.round(48*h/w))),sc=sm.getContext('2d');sc.imageSmoothingQuality='high';sc.drawImage(src,0,0,sm.width,sm.height);
  const bg=mk(w,h),bc=bg.getContext('2d');bc.imageSmoothingEnabled=true;bc.imageSmoothingQuality='high';bc.drawImage(sm,0,0,w,h);
  const id=a.getImageData(0,0,w,h),bd=bc.getImageData(0,0,w,h),d=id.data,b=bd.data;
  let mean=0;for(let i=0;i<w*h;i++)mean+=(b[i*4]*.3+b[i*4+1]*.59+b[i*4+2]*.11);mean/=w*h;
  for(let i=0;i<w*h;i++){const o=i*4,l=Math.max(24,b[o]*.3+b[o+1]*.59+b[o+2]*.11),f=mean/l;d[o]=Math.min(255,d[o]*f);d[o+1]=Math.min(255,d[o+1]*f);d[o+2]=Math.min(255,d[o+2]*f);}
  a.putImageData(id,0,0);return A;
}

/* ---------- meshes ---------- */
const tex=(cvs,srgb)=>{const t=new T.CanvasTexture(cvs);if(srgb)t.encoding=T.sRGBEncoding;t.anisotropy=4;return t;};
function genCast(e){
  if(e._img){e._cv=cardFromImage(e._img,e.keyTol||.22);}
  else{e._cv=mk(256,512);drawCharacter(e._cv,e);}
  e._nv=makeNormal(e._cv);
}
function cardMesh(e){
  const geo=new T.PlaneGeometry(.875,1.75);geo.translate(0,.875,0);
  const map=tex(e._cv,true),nm=tex(e._nv,false);
  const mat=new T.MeshStandardMaterial({map,normalMap:nm,normalScale:new T.Vector2(1,1),alphaTest:.5,roughness:.85,metalness:0,side:T.DoubleSide});
  const m=new T.Mesh(geo,mat);
  m.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map,alphaTest:.5});
  return m;
}
function meshChar(e){
  const g=new T.Group(),M=(c,r)=>new T.MeshStandardMaterial({color:c,roughness:r||.8}),o=e.outfit,dress=o.type==='dress',legC=dress?e.skin:o.pants;
  const cyl=(rt_,rb_,h,mat,x,y,z,rz)=>{const m=new T.Mesh(new T.CylinderGeometry(rt_,rb_,h,20),mat);m.position.set(x,y,z);if(rz)m.rotation.z=rz;g.add(m);return m;};
  cyl(.07,.06,.85,M(legC),-.09,.43,0);cyl(.07,.06,.85,M(legC),.09,.43,0);
  for(const x of [-.09,.09]){const s=new T.Mesh(new T.BoxGeometry(.11,.06,.22),M('#15161a'));s.position.set(x,.03,.04);g.add(s);}
  if(dress)cyl(.15,.32,.85,M(o.color),0,.9,0);else if(o.type==='coat')cyl(.2,.26,.95,M(o.color),0,.95,0);else cyl(.19,.21,.64,M(o.color),0,1.12,0);
  const sl=M(dress?e.skin:o.color);cyl(.045,.04,.66,sl,-.25,1.12,0,.08);cyl(.045,.04,.66,sl,.25,1.12,0,-.08);
  for(const x of [-.285,.285]){const h=new T.Mesh(new T.SphereGeometry(.045,12,12),M(e.skin));h.position.set(x,.76,0);g.add(h);}
  cyl(.05,.05,.12,M(e.skin),0,1.46,0);
  const head=new T.Mesh(new T.SphereGeometry(.11,24,20),M(e.skin,.7));head.scale.set(1,1.18,1);head.position.set(0,1.54,0);g.add(head);
  const hair=new T.Mesh(new T.SphereGeometry(.118,20,16,0,Math.PI*2,0,Math.PI*.55),M(e.hair,.6));hair.scale.set(1,1.1,1.05);hair.position.set(0,1.57,-.01);g.add(hair);
  return g;
}
function propMesh(e){
  const g=new T.Group(),M=(c,r)=>new T.MeshStandardMaterial({color:c,roughness:r||.8}),col=e.color||'#7a4e3a';
  const box=(w,h,d,c,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),M(c));m.position.set(x,y,z);g.add(m);return m;};
  if(e.prop==='armchair'){
    box(.75,.18,.7,col,0,.3,0);box(.75,.62,.14,shade(col,-.12),0,.66,-.32);box(.14,.3,.7,shade(col,-.1),-.4,.45,0);box(.14,.3,.7,shade(col,-.1),.4,.45,0);
    for(const x of [-.33,.33])for(const z of [-.3,.3])box(.06,.22,.06,'#2a1d16',x,.11,z);
  }else if(e.prop==='table'){
    box(.9,.05,.55,col,0,.72,0);for(const x of [-.4,.4])for(const z of [-.22,.22])box(.05,.7,.05,shade(col,-.2),x,.35,z);
    const cup=new T.Mesh(new T.CylinderGeometry(.045,.04,.09,16),M('#e9e5dc',.4));cup.position.set(.2,.795,0);g.add(cup);box(.22,.03,.16,'#3b4a66',-.2,.765,.05);
  }else if(e.prop==='lamp'){
    const base=new T.Mesh(new T.CylinderGeometry(.18,.2,.04,24),M('#22201e',.5));base.position.y=.02;g.add(base);
    const pole=new T.Mesh(new T.CylinderGeometry(.018,.018,1.5,10),M('#22201e',.5));pole.position.y=.77;g.add(pole);
    const shd=new T.Mesh(new T.CylinderGeometry(.12,.22,.3,24,1,true),new T.MeshBasicMaterial({color:0xffd9a0,side:T.DoubleSide}));shd.position.y=1.6;shd.userData.noShadow=true;g.add(shd);
  }else{box(.5,.5,.5,col,0,.25,0);for(const y of [.1,.25,.4])box(.52,.03,.52,shade(col,-.25),0,y,0);}
  return g;
}

/* ---------- build ---------- */
function buildElement(e){
  const g=new T.Group();g.userData.eid=e.id;
  if(e.kind==='cast'){if(!e._cv)genCast(e);g.add(e.mode==='card'?cardMesh(e):meshChar(e));}
  else g.add(propMesh(e));
  g.traverse(o=>{if(o.isMesh&&!o.userData.noShadow){o.castShadow=true;o.receiveShadow=true;}});
  roots[e.id]=g;scene.add(g);
}
function rebuildElement(id){
  const e=S.els.find(x=>x.id===id);if(!e)return;
  if(roots[id]){scene.remove(roots[id]);roots[id].traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const m=o.material;['map','normalMap'].forEach(k=>m[k]&&m[k].dispose());m.dispose();}});delete roots[id];}
  buildElement(e);applyTransforms();if(S.sel===id)selectVisual();dirty=true;
}
function buildRoom(){
  const P=plateCanvases();
  const mkS=(geo,pair,pos,rot,rough)=>{
    const baked=new T.MeshBasicMaterial({map:tex(pair.B,true)}),relit=new T.MeshStandardMaterial({map:tex(pair.A,true),roughness:rough});
    const m=new T.Mesh(geo,relit);m.position.set(...pos);if(rot)m.rotation.set(...rot);m.receiveShadow=true;scene.add(m);
    const s={mesh:m,baked,relit,pair};surfaces.push(s);return s;
  };
  mkS(new T.PlaneGeometry(8,7.5),P.floor,[0,0,.75],[-Math.PI/2,0,0],.55);
  mkS(new T.PlaneGeometry(8,3.2),P.back,[0,1.6,-3],null,.95);
  mkS(new T.PlaneGeometry(7.5,3.2),P.left,[-4,1.6,.75],[0,Math.PI/2,0],.95);
  mkS(new T.PlaneGeometry(7.5,3.2),P.right,[4,1.6,.75],[0,-Math.PI/2,0],.95);
  shadowCatcher=new T.Mesh(new T.PlaneGeometry(8,7.5),new T.ShadowMaterial({opacity:.5}));
  shadowCatcher.rotation.x=-Math.PI/2;shadowCatcher.position.set(0,.004,.75);shadowCatcher.receiveShadow=true;scene.add(shadowCatcher);
}
function setPlateMode(){for(const s of surfaces)s.mesh.material=S.plateRelit?s.relit:s.baked;shadowCatcher.visible=!S.plateRelit;D('lvPlate').setAttribute('aria-pressed',S.plateRelit);dirty=true;}
function buildRig(){
  key=new T.SpotLight(0xffffff,1,0,rad(52),.4,1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.near=.6;key.shadow.camera.far=16;key.shadow.bias=-.0008;key.shadow.normalBias=.02;
  focus=new T.Object3D();scene.add(focus,key,key.target);key.target=focus;
  fillL=new T.DirectionalLight(0xffffff,.3);fillL.target=focus;scene.add(fillL);
  hemi=new T.HemisphereLight(0xffffff,0x2a2622,.14);scene.add(hemi);
  lampL=new T.PointLight(0xffc27a,.9,9,1.2);scene.add(lampL);
  gizmo=new T.Group();
  gizmo.add(new T.Mesh(new T.SphereGeometry(.13,20,16),new T.MeshBasicMaterial({color:0xf2a24a})));
  gizmoHit=new T.Mesh(new T.SphereGeometry(.38,12,10),new T.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));gizmo.add(gizmoHit);
  const ring=new T.Mesh(new T.RingGeometry(.2,.23,32),new T.MeshBasicMaterial({color:0xf2a24a,transparent:true,opacity:.6,side:T.DoubleSide}));ring.userData.billboard=true;gizmo.add(ring);
  gizmo.userData.eid='key';scene.add(gizmo);
  keyLine=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),new T.Vector3(0,-1,0)]),new T.LineBasicMaterial({color:0xf2a24a,transparent:true,opacity:.45}));scene.add(keyLine);
  selRing=new T.Mesh(new T.RingGeometry(.42,.47,48).rotateX(-Math.PI/2),new T.MeshBasicMaterial({color:0xf2a24a,transparent:true,opacity:.85}));selRing.position.y=.012;selRing.visible=false;scene.add(selRing);
}
function kcol(k){const c=keyColor(k),m=Math.max(c[0],c[1],c[2]);return new T.Color(c[0]/m,c[1]/m,c[2]/m);}
function heroEl(){return S.els.find(e=>e.hero&&e.kind==='cast')||S.els.find(e=>e.kind==='cast');}
function updateFocus(){const h=heroEl();focus.position.set(h?h.x:0,1.4,h?h.z:0);}
function polar(){
  const f=focus.position,L=S.light,dx=L.x-f.x,dy=L.y-f.y,dz=L.z-f.z,dist=Math.hypot(dx,dy,dz)||.001;
  return {az:wrap180(deg(Math.atan2(dx,dz))-S.cam.az),el:deg(Math.asin(clamp(dy/dist,-1,1))),dist};
}
function setPolar(p){
  const c=polar(),az=p.az!=null?p.az:c.az,el=p.el!=null?p.el:c.el,dist=p.dist!=null?p.dist:c.dist,f=focus.position;
  const th=rad(az+S.cam.az),h=dist*Math.cos(rad(el));
  S.light.x=clamp(f.x+h*Math.sin(th),-3.8,3.8);S.light.z=clamp(f.z+h*Math.cos(th),-2.9,4.4);S.light.y=clamp(f.y+dist*Math.sin(rad(el)),.5,3.1);
}
function applyTransforms(){
  for(const e of S.els){const r=roots[e.id];if(!r)continue;r.position.set(e.x,e.y,e.z);r.scale.setScalar(e.scale);if(!(e.kind==='cast'&&e.mode==='card'&&S.face))r.rotation.y=rad(e.rot);}
  updateFocus();
  const lamp=S.els.find(e=>e.prop==='lamp');if(lamp)lampL.position.set(lamp.x,lamp.y+1.55*lamp.scale,lamp.z);
  dirty=true;
}
function applyLight(){
  const L=S.light;updateFocus();
  key.position.set(L.x,L.y,L.z);key.color=kcol(L.kel);key.intensity=L.int;key.penumbra=.12+.85*L.soft;
  if(key.shadow.radius!==undefined)key.shadow.radius=1+L.soft*7;
  const pz=polar(),fp=new T.Vector3();
  const th=rad(-pz.az+S.cam.az),h=4*Math.cos(rad(8));fp.set(focus.position.x+h*Math.sin(th),focus.position.y-1.4+.6,focus.position.z+h*Math.cos(th));
  fillL.position.copy(fp);fillL.color=kcol(6500);fillL.intensity=L.int/Math.pow(2,L.fill)*.9;
  hemi.intensity=L.amb;
  const hasLamp=S.els.some(e=>e.prop==='lamp');lampL.intensity=(L.lamp&&hasLamp)?.9:0;
  gizmo.position.set(L.x,L.y,L.z);
  keyLine.geometry.setFromPoints([new T.Vector3(L.x,L.y,L.z),focus.position.clone()]);
  dirty=true;
}
function placeCamera(){
  const c=S.cam,a=rad(c.az),e=rad(c.el);
  camera.position.set(TARGET.x+c.dist*Math.sin(a)*Math.cos(e),TARGET.y+c.dist*Math.sin(e),TARGET.z+c.dist*Math.cos(a)*Math.cos(e));
  camera.lookAt(TARGET.x,TARGET.y,TARGET.z);camera.fov=deg(2*Math.atan(12/c.lens));camera.updateProjectionMatrix();camera.updateMatrixWorld();dirty=true;
}
function prepFrame(){
  for(const e of S.els){if(e.kind==='cast'&&e.mode==='card'&&S.face){const r=roots[e.id];if(r)r.rotation.y=Math.atan2(camera.position.x-e.x,camera.position.z-e.z)+rad(e.rot);}}
  gizmo.children.forEach(c=>{if(c.userData.billboard)c.quaternion.copy(camera.quaternion);});
  if(selBox)selBox.update();
  const s=S.els.find(e=>e.id===S.sel);if(s&&selRing.visible){selRing.position.set(s.x,.012,s.z);selRing.scale.setScalar(Math.max(.7,s.scale));}
}
function frame(){prepFrame();renderer.render(scene,camera);}
function loop(){raf=0;if(!visible)return;if(dirty){dirty=false;frame();}raf=requestAnimationFrame(loop);}
function kick(){if(visible&&!raf)raf=requestAnimationFrame(loop);}

/* ---------- selection and UI ---------- */
function selectVisual(){
  if(selBox){scene.remove(selBox);selBox=null;}
  const r=roots[S.sel];
  if(r){selBox=new T.BoxHelper(r,0xf2a24a);scene.add(selBox);selRing.visible=true;}else selRing.visible=false;
  dirty=true;
}
function select(id){S.sel=id;selectVisual();renderEls();buildSel();}
function mkSlider(host,list,label,min,max,step,get,set,fmt,onChange){
  const row=document.createElement('div');row.className='row';const id='lv_'+Math.random().toString(36).slice(2,8);
  row.innerHTML=`<label for="${id}">${label}</label><output class="mono"></output><input id="${id}" type="range" min="${min}" max="${max}" step="${step}">`;
  host.appendChild(row);const inp=row.querySelector('input'),out=row.querySelector('output');
  const sync=()=>{const v=get();inp.value=v;out.textContent=fmt(v);inp.style.setProperty('--pct',((v-min)/(max-min)*100)+'%');};
  inp.addEventListener('input',()=>{set(+inp.value);sync();changed();});
  inp.addEventListener('change',()=>{if(onChange)onChange(+inp.value);});
  list.push(sync);sync();return sync;
}
function changed(){applyTransforms();applyLight();scheduleJson();refreshBadges();syncAll();}
function syncAll(){syncStatic.forEach(f=>f());syncSel.forEach(f=>f());}
function renderEls(){
  const host=D('lvEls');host.innerHTML='';
  const items=[{id:'key',name:'Key light',k:'light'},...S.els.map(e=>({id:e.id,name:e.name,k:e.kind==='cast'?(e.mode==='card'?'card':'mesh'):'prop',warn:badge(e)}))];
  for(const it of items){
    const b=document.createElement('button');b.type='button';b.className='btn el';b.setAttribute('aria-pressed',S.sel===it.id);
    b.innerHTML=`<span class="k">${it.k}</span><span>${it.name}</span><span class="w">${it.warn||''}</span>`;
    b.addEventListener('click',()=>select(it.id));host.appendChild(b);
  }
}
function badge(e){
  if(e.kind!=='cast'||e.mode!=='card'||S.face)return '';
  const cd=deg(Math.atan2(camera.position.x-e.x,camera.position.z-e.z)),off=Math.abs(wrap180(cd-e.rot));
  return off>35?`⚠ ${Math.round(off)}° off-axis`:'';
}
function refreshBadges(){
  let html=false;
  for(const e of S.els){const w=badge(e);if(w&&!flagged[e.id]){flagged[e.id]=1;log('RT',`R11: ${e.name}'s card is ${w.replace('⚠ ','')} → a flat cutout breaks here. Upgrade to a mesh (image → 3D, cloud) or limit the orbit.`,'R11');html=true;}
    if(!w&&flagged[e.id]){flagged[e.id]=0;html=true;}}
  renderElsQuiet();
}
let elsT=0;function renderElsQuiet(){if(elsT)return;elsT=setTimeout(()=>{elsT=0;renderEls();},120);}
function slidersFor(e,host){
  const nm=e.name;
  mkSlider(host,syncSel,'Left / right',-3.7,3.7,.01,()=>e.x,v=>e.x=v,v=>v.toFixed(2)+' m');
  mkSlider(host,syncSel,'Height',0,2.5,.01,()=>e.y,v=>e.y=v,v=>v.toFixed(2)+' m');
  mkSlider(host,syncSel,'Depth',-2.8,4.3,.01,()=>e.z,v=>e.z=v,v=>v.toFixed(2)+' m');
  mkSlider(host,syncSel,'Scale',.5,1.8,.01,()=>e.scale,v=>e.scale=v,v=>v.toFixed(2)+'×');
  mkSlider(host,syncSel,'Rotation',-180,180,1,()=>e.rot,v=>e.rot=v,v=>Math.round(v)+'°',()=>log('T3',`you set ${nm} rotation`,'human'));
}
function buildSel(){
  syncSel.length=0;const host=D('lvSel');host.innerHTML='';
  if(S.sel==='key'){
    D('lvSelTitle').textContent='Selected · Key light';
    const L=S.light;
    mkSlider(host,syncSel,'Left / right',-3.8,3.8,.01,()=>L.x,v=>L.x=v,v=>v.toFixed(2)+' m');
    mkSlider(host,syncSel,'Height',.5,3.1,.01,()=>L.y,v=>L.y=v,v=>v.toFixed(2)+' m');
    mkSlider(host,syncSel,'Depth',-2.9,4.4,.01,()=>L.z,v=>L.z=v,v=>v.toFixed(2)+' m');
    return;
  }
  const e=S.els.find(x=>x.id===S.sel);if(!e)return;
  D('lvSelTitle').textContent=`Selected · ${e.name}`;
  slidersFor(e,host);
  if(e.kind==='cast'){
    const ow=document.createElement('div');ow.className='grp';ow.innerHTML='<span class="lbl">Outfit</span><div class="outfits"></div>';host.appendChild(ow);
    const oh=ow.querySelector('.outfits');
    OUTFITS.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='btn';b.innerHTML=`<i style="background:${o.color}"></i>${o.name}`;b.addEventListener('click',()=>generateOutfit(e,o,'preset'));oh.appendChild(b);});
    const pr=document.createElement('div');pr.className='addrow';pr.innerHTML='<input type="text" id="lvPrompt" placeholder="e.g. green trench coat, gold accents" aria-label="Outfit prompt"><button class="btn" type="button" id="lvGen">Generate</button>';host.appendChild(pr);
    pr.querySelector('#lvGen').addEventListener('click',()=>{const t=pr.querySelector('#lvPrompt').value,o=parsePrompt(t);if(!o){log('T2',`outfit prompt “${t.replace(/</g,'&lt;')}” → stand-in only reads a colour plus a garment word (e.g. “green trench coat”). A real edit model takes any text.`,'R12',true);return;}generateOutfit(e,o,t);});
    const mb=document.createElement('button');mb.type='button';mb.className='btn';mb.textContent=e.mode==='card'?'Upgrade to 3D mesh':'Back to 2.5D card';
    mb.addEventListener('click',()=>toggleMode(e));host.appendChild(mb);
    const up=document.createElement('div');up.className='fieldrow';up.innerHTML='<label>Use my photo (plain background works best) <input type="file" accept="image/*" id="lvUp"></label>';host.appendChild(up);
    up.querySelector('#lvUp').addEventListener('change',ev=>uploadCast(e,ev.target.files[0]));
    if(e._img)mkSlider(host,syncSel,'Key tolerance',.05,.6,.01,()=>e.keyTol||.22,v=>{e.keyTol=v;},v=>v.toFixed(2),()=>{rebuildElement(e.id);});
  }else if(S.els.length>1){
    const rm=document.createElement('button');rm.type='button';rm.className='btn';rm.textContent='Remove';rm.addEventListener('click',()=>{S.els=S.els.filter(x=>x.id!==e.id);scene.remove(roots[e.id]);delete roots[e.id];log('T3',`you removed ${e.name}`,'human');select('mara');changed();});host.appendChild(rm);
  }
}
function parsePrompt(t){
  const words=(t||'').toLowerCase().split(/[^a-z]+/).filter(Boolean);let col=null,col2=null,type=null;
  for(const w of words){if(COLORS[w]){if(!col)col=COLORS[w];else if(!col2)col2=COLORS[w];}if(GARMENTS[w]&&!type)type=GARMENTS[w];}
  if(!col&&!type)return null;
  const base=OUTFITS.find(o=>o.type===(type||'coat'))||OUTFITS[0];
  return {name:t,type:type||base.type,color:col||base.color,accent:col2||base.accent,pants:base.pants};
}
function generateOutfit(e,o,src){
  if(busy)return;busy=true;
  log('RT','R12: outfit request → instruction-edit image model with the person\'s reference image (cloud), then a face-similarity check before it is accepted','R12',true);
  const t0=performance.now();D('lvJobChip').textContent='outfit job…';D('lvJobBar').style.width='0%';
  const steps=reduced?1:12;let i=0;
  const tick=()=>{i++;D('lvJobBar').style.width=(i/steps*100)+'%';
    if(i<steps){setTimeout(tick,70);return;}
    e.outfit={name:o.name,type:o.type,color:o.color,accent:o.accent,pants:o.pants};delete e._cv;e._img=null;e.asset='cast:'+e.id;
    rebuildElement(e.id);buildSel();renderEls();scheduleJson();busy=false;D('lvJobChip').textContent='idle';
    log('T2',`outfit applied to ${e.name}: ${o.type}, ${o.color} (stand-in: drawn procedurally, not generated)`,'R12',true);
  };tick();
}
function toggleMode(e){
  e.mode=e.mode==='card'?'mesh':'card';
  log('RT',e.mode==='mesh'?'R10/R11: upgrade card → mesh (image → 3D, cloud GPU, minutes). Stand-in: primitive mesh in the same outfit.':'back to 2.5D card: cheaper, fixed viewpoint','R11',e.mode==='mesh');
  rebuildElement(e.id);buildSel();renderEls();scheduleJson();
}
function uploadCast(e,file){
  if(!file)return;const fr=new FileReader();
  fr.onload=()=>{const im=new Image();im.onload=()=>{e._img=im;e.keyTol=.22;e.asset='upload:'+(file.name||'photo').slice(0,40);e.mode='card';rebuildElement(e.id);buildSel();renderEls();scheduleJson();
    log('T1',`${e.name} ← your photo “${(file.name||'').replace(/</g,'')}”: cutout by colour key, normals from the silhouette`,'R10',true);};im.src=fr.result;};
  fr.readAsDataURL(file);
}
function uploadPlate(file){
  if(!file)return;const fr=new FileReader();
  fr.onload=()=>{const im=new Image();im.onload=()=>{
    const B=mk(768,308);B.getContext('2d').drawImage(im,0,0,768,308);const A=delight(B),s=surfaces[1];
    s.baked.map=tex(B,true);s.relit.map=tex(A,true);s.baked.needsUpdate=true;s.relit.needsUpdate=true;dirty=true;
    log('T1','plate photo mapped on the back wall; de-lit albedo = photo ÷ its own low-frequency light (crude intrinsic decomposition)','R14',true);};im.src=fr.result;};
  fr.readAsDataURL(file);
}

/* ---------- pointer ---------- */
const ptrs=new Map();let drag=null,pinch=null,ndc=null;
function setRay(ev){const r=cv.getBoundingClientRect();ndc=new T.Vector2(((ev.clientX-r.left)/r.width)*2-1,-((ev.clientY-r.top)/r.height)*2+1);ray.setFromCamera(ndc,camera);}
function pick(ev){
  setRay(ev);const list=[gizmo];for(const id in roots)list.push(roots[id]);
  const hits=ray.intersectObjects(list,true);
  for(const h of hits){let o=h.object;while(o&&!o.userData.eid)o=o.parent;if(o)return o.userData.eid;}
  return null;
}
function planeHit(y){const pl=new T.Plane(new T.Vector3(0,1,0),-y),v=new T.Vector3();return ray.ray.intersectPlane(pl,v)?v:null;}
function target(id){return id==='key'?S.light:S.els.find(e=>e.id===id);}
function onDown(ev){
  cv.setPointerCapture(ev.pointerId);ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(ptrs.size===2){drag=null;const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),dist:S.cam.dist};return;}
  const id=pick(ev);
  if(id){
    const t=target(id);if(S.sel!==id)select(id);
    const p0=planeHit(t.y);drag={id,sx:ev.clientX,sy:ev.clientY,ox:p0?t.x-p0.x:0,oz:p0?t.z-p0.z:0,y0:t.y,rot0:t.rot||0,moved:false};
  }else drag={id:null,sx:ev.clientX,sy:ev.clientY,az:S.cam.az,el:S.cam.el};
  ev.preventDefault();
}
function onMove(ev){
  if(ptrs.has(ev.pointerId))ptrs.set(ev.pointerId,{x:ev.clientX,y:ev.clientY});
  if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];S.cam.dist=clamp(pinch.dist*pinch.d/Math.max(10,Math.hypot(a.x-b.x,a.y-b.y)),3,9);placeCamera();changed();return;}
  if(!drag)return;
  if(!drag.id){S.cam.az=clamp(drag.az-(ev.clientX-drag.sx)*.3,-58,58);S.cam.el=clamp(drag.el+(ev.clientY-drag.sy)*.2,1,50);placeCamera();applyLight();changed();return;}
  const t=target(drag.id);drag.moved=true;
  if(S.mode==='floor'){setRay(ev);const p0=planeHit(t.y);if(p0){if(drag.id==='key'){t.x=clamp(p0.x+drag.ox,-3.8,3.8);t.z=clamp(p0.z+drag.oz,-2.9,4.4);}else{t.x=clamp(p0.x+drag.ox,-3.7,3.7);t.z=clamp(p0.z+drag.oz,-2.8,4.3);}}}
  else if(S.mode==='lift'){t.y=clamp(drag.y0-(ev.clientY-drag.sy)*.012,drag.id==='key'?.5:0,drag.id==='key'?3.1:2.5);}
  else if(drag.id!=='key'){t.rot=wrap180(drag.rot0+(ev.clientX-drag.sx)*.6);}
  changed();
}
function onUp(ev){
  ptrs.delete(ev.pointerId);if(ptrs.size<2)pinch=null;
  if(drag&&drag.moved){const n=drag.id==='key'?'key light':(target(drag.id).name);log('T3',`you ${S.mode==='floor'?'moved':S.mode==='lift'?'lifted':'turned'} ${n}`,'human');}
  drag=null;
}
function onKey(ev){
  const t=target(S.sel);if(!t)return;const st=ev.shiftKey?.25:.08;let h=true;
  if(ev.key==='ArrowLeft')t.x-=st;else if(ev.key==='ArrowRight')t.x+=st;else if(ev.key==='ArrowUp')t.z-=st;else if(ev.key==='ArrowDown')t.z+=st;else h=false;
  if(h){ev.preventDefault();changed();}
}

/* ---------- reference, matching ---------- */
function cheekStats(rgb,w,h,base){
  const sc=base.lens/85,rx=.62*sc,ry=.80*sc,cy=-.14+base.tilt*.05,a=[];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
    const px=(x+.5)/w*2-1,py=((y+.5)/h*2-1)*(h/w),ex=Math.abs(px/rx),ey=(py-cy)/ry;
    if(ex>=.25&&ex<=.65&&ey>=.15&&ey<=.55){const o=(y*w+x)*3;a.push([lumD(rgb[o],rgb[o+1],rgb[o+2]),rgb[o]/Math.max(rgb[o+2],.02)]);}
  }
  return statsFrom(a);
}
function statsFrom(a){
  if(a.length<6)return null;a.sort((x,y)=>x[0]-y[0]);const n=a.length,p10=a[Math.floor(n*.1)][0],p90=a[Math.floor(n*.9)][0];let rb=0,c=0;for(let k=Math.floor(n*.8);k<n;k++){rb+=a[k][1];c++;}
  return {y90:p90,y10:p10,ratio:Math.pow(p90,2.2)/Math.max(Math.pow(p10,2.2),.002),rb:rb/c};
}
function analyse(i){
  if(anaCache[i])return anaCache[i];
  const R=REFS[i],img=renderScene(R.p,W,H,.012).rgb,low=downsample(img,W,H,6);
  const base={...NEUTRAL,lens:R.p.lens,yaw:R.p.yaw,tilt:R.p.tilt,lamp:R.p.lamp,wall:R.p.wall};
  const head=renderScene(base,FW,FH,0).head,f=createFit(low,FW,FH,base);let r;do{r=f.step();}while(!r.done);
  return anaCache[i]={img,A:r.p,err:r.err,st:cheekStats(img,W,H,base),lamp:R.p.lamp};
}
let mcam=null,rtm=null;
/* a close measurement camera on the hero's cheeks, sharing the scene's lights */
function faceStats(){
  const hero=heroEl();if(!hero)return null;
  if(!rtm){rtm=new T.WebGLRenderTarget(256,256);rtm.texture.encoding=T.sRGBEncoding;rtBuf=new Uint8Array(256*256*4);mcam=new T.PerspectiveCamera(14,1,.1,30);}
  prepFrame();
  const sc=hero.scale,hc=new T.Vector3(hero.x,hero.y+1.5*sc,hero.z),dir=camera.position.clone().sub(hc).normalize();
  mcam.position.copy(hc).addScaledVector(dir,1.3);mcam.lookAt(hc);mcam.updateProjectionMatrix();mcam.updateMatrixWorld();
  const old=renderer.getRenderTarget();renderer.setRenderTarget(rtm);renderer.render(scene,mcam);renderer.readRenderTargetPixels(rtm,0,0,256,256,rtBuf);renderer.setRenderTarget(old);
  const right=new T.Vector3().setFromMatrixColumn(mcam.matrixWorld,0),cyy=hero.mode==='card'?1.442:1.47,arr=[];
  for(const sg of [-1,1]){
    const p0=new T.Vector3(hero.x,hero.y+cyy*sc,hero.z).addScaledVector(right,sg*.044*sc),v=p0.clone().project(mcam),v2=p0.clone().addScaledVector(right,.022*sc).project(mcam);
    const cx=(v.x*.5+.5)*256,cy=(v.y*.5+.5)*256,r=Math.max(2,Math.abs(v2.x-v.x)*.5*256);
    for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(256,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(256,Math.ceil(cx+r));x++){
      if((x-cx)*(x-cx)+(y-cy)*(y-cy)>r*r)continue;const o=(y*256+x)*4,R=rtBuf[o]/255,G=rtBuf[o+1]/255,B=rtBuf[o+2]/255;arr.push([lumD(R,G,B),R/Math.max(B,.02)]);
    }
  }
  return statsFrom(arr);
}
function lookDist(fs,rs){
  if(!fs||!rs)return 1;
  const a=Math.min(1,Math.abs(Math.log2(fs.ratio/rs.ratio))/2.5),b=Math.min(1,Math.abs(fs.y90-rs.y90)/.35),c=Math.min(1,Math.abs(Math.log(fs.rb/rs.rb))/.5);
  return .5*a+.35*b+.15*c;
}
function showMatch(fs,rs,label){
  const d=lookDist(fs,rs),m=Math.round(100*(1-d));
  D('lvMatchChip').textContent=fs?`match ${m}%`:'hero out of frame';D('lvMatchBar').style.width=(fs?m:0)+'%';
  const st=D('lvStats');
  st.innerHTML=(fs&&rs)?`<span class="chip">cheek lit : shadow  scene ${fs.ratio.toFixed(1)} : 1  ·  ref ${rs.ratio.toFixed(1)} : 1</span><span class="chip">key brightness  scene ${fs.y90.toFixed(2)}  ·  ref ${rs.y90.toFixed(2)}</span><span class="chip">warmth R/B  scene ${fs.rb.toFixed(2)}  ·  ref ${rs.rb.toFixed(2)}</span>`:'<span class="chip">hero not in frame</span>';
  return m;
}
function measureNow(){const a=analyse(refSel);const fs=faceStats();return showMatch(fs,a.st);}
function setRef(i){
  refSel=i;const a=analyse(i);paint(D('lvRefThumb'),a.img,W,H);
  D('lvRefSeg').querySelectorAll('.btn').forEach((b,k)=>b.setAttribute('aria-checked',k===i));
  if(ready)measureNow();
}
function applyKnobs(v){
  S.light.int=v.int;S.light.fill=v.fill;S.light.kel=v.kel;S.light.amb=v.amb;setPolar({az:v.az,el:v.el});applyLight();
}
function matchLight(){
  if(matching||!ready)return;matching=true;D('lvMatch').disabled=true;
  const i=refSel,a=analyse(i),A=a.A,R=REFS[i];
  log('T0',`reference “${R.name}” measured: key az ${Math.round(A.az)}°, el ${Math.round(A.el)}°, ${Math.round(A.kel)} K, softness ${A.soft.toFixed(2)}, fill 1:${Math.pow(2,A.fill).toFixed(1)} (tab 1's fit, residual ${a.err.toFixed(3)})`,'R4');
  S.light.soft=A.soft;S.light.lamp=a.lamp?1:0;
  let v={az:clamp(A.az,-170,170),el:clamp(A.el,5,70),int:clamp(A.int*1.15,.3,2.4),fill:A.fill,kel:A.kel,amb:.04};
  applyKnobs(v);syncAll();
  const K=[['az',-170,170,20,2,'key azimuth'],['el',5,70,10,2,'key elevation'],['int',.3,2.4,.25,.03,'key intensity'],['fill',0,3.5,.5,.08,'fill ratio'],['kel',2800,7000,600,80,'colour temp'],['amb',0,.3,.08,.01,'ambient']];
  const steps={};K.forEach(k=>steps[k[0]]=k[3]);
  const ev=(vv)=>{applyKnobs(vv);return lookDist(faceStats(),a.st);};
  let cur=ev(v),iter=0;
  log('RT',`direction from the reference applied, match ${Math.round((1-cur)*100)}% → refine exposure, fill and direction against the measured face (R13)`,'R13');
  const tick=()=>{
    iter++;let best=null,bestD=cur;
    for(const [k,lo,hi] of K)for(const dir of [-1,1]){const q={...v};q[k]=clamp(v[k]+dir*steps[k],lo,hi);if(q[k]===v[k])continue;const d=ev(q);if(d<bestD-1e-6){bestD=d;best={k,q};}}
    let done=false;
    if(best&&cur-bestD>.002){if(cur-bestD>.01)log('T0',`iter ${String(iter).padStart(2,'0')} · ${K.find(k=>k[0]===best.k)[5]} → match ${Math.round((1-bestD)*100)}%`,'R7');v=best.q;cur=bestD;}
    else{let all=true;for(const k of K){steps[k[0]]=Math.max(k[4],steps[k[0]]/2);if(steps[k[0]]>k[4]*1.001)all=false;}if(all)done=true;}
    applyKnobs(v);syncAll();
    if(iter>=26)done=true;
    if(done){
      const m=measureNow();matching=false;D('lvMatch').disabled=false;
      log('RT',m>=85?`match ${m}% ≥ 85% → accepted (R13)`:`match ${m}% < 85% → escalate: hero pass, or your call (T3) (R13)`,'R13');scheduleJson();return;
    }
    if(reduced)tick();else setTimeout(tick,50);
  };
  tick();
}

/* ---------- hero render (stand-in) ---------- */
function heroRender(){
  if(busy||!ready)return;busy=true;D('lvHero').disabled=true;
  const a=analyse(refSel);
  log('RT','R13: hero pass → diffusion relight / harmonise (cloud GPU, seconds to minutes), conditioned on this proxy\'s depth, normals, light rig and the reference','R13',true);
  prepFrame();renderer.render(scene,camera);
  const pc=D('lvProxyOut'),hc=D('lvHeroOut'),pcx=pc.getContext('2d'),hcx=hc.getContext('2d');
  pcx.drawImage(cv,0,0,pc.width,pc.height);
  const src=pcx.getImageData(0,0,pc.width,pc.height),d=src.data,n=pc.width*pc.height;
  const ms=[0,0,0],ss=[0,0,0];for(let i=0;i<n;i++)for(let c=0;c<3;c++)ms[c]+=d[i*4+c]/255;for(let c=0;c<3;c++)ms[c]/=n;
  for(let i=0;i<n;i++)for(let c=0;c<3;c++){const q=d[i*4+c]/255-ms[c];ss[c]+=q*q;}for(let c=0;c<3;c++)ss[c]=Math.sqrt(ss[c]/n)+1e-4;
  const rf=a.img,rn=W*H,mt=[0,0,0],st=[0,0,0];for(let i=0;i<rn;i++)for(let c=0;c<3;c++)mt[c]+=rf[i*3+c];for(let c=0;c<3;c++)mt[c]/=rn;
  for(let i=0;i<rn;i++)for(let c=0;c<3;c++){const q=rf[i*3+c]-mt[c];st[c]+=q*q;}for(let c=0;c<3;c++)st[c]=Math.sqrt(st[c]/rn)+1e-4;
  const out=hcx.createImageData(pc.width,pc.height),o=out.data;
  for(let i=0;i<n;i++){
    const x=i%pc.width,y=(i/pc.width)|0,vg=1-.28*(Math.pow((x/pc.width-.5)*2,2)*.6+Math.pow((y/pc.height-.5)*2,2)*.4),gn=(hash2(x,y)-.5)*.05;
    for(let c=0;c<3;c++){const s=d[i*4+c]/255,t=(s-ms[c])*clamp(st[c]/ss[c],.6,1.6)+mt[c];let vv=(s*.45+t*.55)*vg+gn;o[i*4+c]=clamp(vv,0,1)*255;}o[i*4+3]=255;
  }
  hcx.putImageData(out,0,0);
  try{const tmp=mk(pc.width,pc.height),tc=tmp.getContext('2d');tc.filter='blur(7px)';tc.drawImage(hc,0,0);hcx.globalCompositeOperation='screen';hcx.globalAlpha=.22;hcx.drawImage(tmp,0,0);hcx.globalAlpha=1;hcx.globalCompositeOperation='source-over';}catch(e){}
  D('lvCmp').hidden=false;
  const steps=reduced?1:20;let i=0;D('lvJobChip').textContent='cloud job (simulated)';
  const tick=()=>{i++;D('lvJobBar').style.width=(i/steps*100)+'%';if(i<steps){setTimeout(tick,90);return;}
    D('lvJobChip').textContent='done';busy=false;D('lvHero').disabled=false;
    log('T2','hero frame returned (stand-in: per-channel colour transfer toward the reference, bloom, grain, vignette)','R13',true);};
  tick();
}

/* ---------- scene graph JSON ---------- */
function toJSON(){
  const L=S.light,c=S.cam,r=x=>+(+x).toFixed(3);
  return {version:1,camera:{az:r(c.az),el:r(c.el),dist:r(c.dist),lens:Math.round(c.lens)},
    light:{x:r(L.x),y:r(L.y),z:r(L.z),intensity:r(L.int),kelvin:Math.round(L.kel),softness:r(L.soft),fillStops:r(L.fill),practical:L.lamp?1:0,ambient:r(L.amb)},
    plate:{relit:S.plateRelit},cardsFaceCamera:S.face,
    elements:S.els.map(e=>{const o={id:e.id,name:e.name,kind:e.kind};
      if(e.kind==='cast')Object.assign(o,{hero:!!e.hero,mode:e.mode,asset:e.asset,skin:e.skin,hair:e.hair,hairStyle:e.hairStyle,outfit:{type:e.outfit.type,color:e.outfit.color,accent:e.outfit.accent,pants:e.outfit.pants}});
      else Object.assign(o,{prop:e.prop,color:e.color});
      Object.assign(o,{x:r(e.x),y:r(e.y),z:r(e.z),rot:Math.round(e.rot),scale:r(e.scale)});return o;})};
}
function scheduleJson(){if(jsonTimer)return;jsonTimer=setTimeout(()=>{jsonTimer=0;const ta=D('lvJson');if(document.activeElement!==ta){ta.value=JSON.stringify(toJSON(),null,2);D('lvJsonMsg').textContent='in sync';}},200);}
function applyJSON(txt){
  let j;try{j=JSON.parse(txt);}catch(err){D('lvJsonMsg').textContent='not valid JSON: '+err.message;return false;}
  try{
    if(!j||!Array.isArray(j.elements)||!j.elements.length)throw new Error('needs an "elements" array');
    const num=(v,d)=>Number.isFinite(+v)?+v:d,c=j.camera||{},L=j.light||{};
    S.cam={az:clamp(num(c.az,16),-58,58),el:clamp(num(c.el,11),1,50),dist:clamp(num(c.dist,6.4),3,9),lens:clamp(num(c.lens,35),24,135)};
    S.light={x:clamp(num(L.x,-3),-3.8,3.8),y:clamp(num(L.y,3),.5,3.1),z:clamp(num(L.z,2.2),-2.9,4.4),int:clamp(num(L.intensity,1.25),.2,2.5),kel:clamp(num(L.kelvin,5600),2800,7000),soft:clamp(num(L.softness,.4),0,1),fill:clamp(num(L.fillStops,1.5),0,3.5),lamp:num(L.practical,1)?1:0,amb:clamp(num(L.ambient,.14),0,.6)};
    S.plateRelit=j.plate?!!j.plate.relit:true;S.face=j.cardsFaceCamera!==false;
    for(const id in roots){scene.remove(roots[id]);delete roots[id];}
    S.els=j.elements.map((e,i)=>{
      const base={id:String(e.id||('el'+i)),name:String(e.name||e.id||('Element '+i)),kind:e.kind==='prop'?'prop':'cast',x:clamp(num(e.x,0),-3.7,3.7),y:clamp(num(e.y,0),0,2.5),z:clamp(num(e.z,0),-2.8,4.3),rot:num(e.rot,0),scale:clamp(num(e.scale,1),.5,1.8)};
      if(base.kind==='cast'){const o=e.outfit||{};return {...base,hero:!!e.hero,mode:e.mode==='mesh'?'mesh':'card',asset:e.asset,skin:e.skin||'#dba185',hair:e.hair||'#1b1512',hairStyle:e.hairStyle||'short',outfit:{name:'custom',type:GARMENTS[o.type]?GARMENTS[o.type]:(['coat','dress','hoodie','suit','jacket'].includes(o.type)?o.type:'coat'),color:o.color||'#2b2f3a',accent:o.accent||'#c9a26b',pants:o.pants||'#1d1f26'}};}
      return {...base,prop:['armchair','table','lamp','crate'].includes(e.prop)?e.prop:'crate',color:e.color||'#7a4e3a'};
    });
    if(!S.els.some(e=>e.kind==='cast'&&e.hero)){const f=S.els.find(e=>e.kind==='cast');if(f)f.hero=true;}
    S.els.forEach(buildElement);placeCamera();setPlateMode();D('lvFace').setAttribute('aria-pressed',S.face);
    S.sel=S.els[0].id;applyTransforms();applyLight();selectVisual();renderEls();buildSel();syncAll();measureNow();
    D('lvJsonMsg').textContent='applied';log('T3','scene graph JSON applied','human');return true;
  }catch(err){D('lvJsonMsg').textContent='rejected: '+err.message;return false;}
}

/* ---------- init ---------- */
const reducedMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reduced=reducedMotion;
function resize(){if(!renderer)return;const w=wrapEl.clientWidth,h=wrapEl.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();dirty=true;kick();}
function buildStatic(){
  const L=()=>S.light;
  mkSlider(D('lvLight'),syncStatic,'Key azimuth',-170,170,1,()=>polar().az,v=>{setPolar({az:v});},v=>`${v>0?'+':''}${Math.round(v)}° ${v<-2?'left':v>2?'right':'front'}`,()=>log('T3','you set key azimuth','human'));
  mkSlider(D('lvLight'),syncStatic,'Key elevation',-10,80,1,()=>polar().el,v=>{setPolar({el:v});},v=>`${Math.round(v)}°`);
  mkSlider(D('lvLight'),syncStatic,'Key distance',1.5,6,.05,()=>polar().dist,v=>{setPolar({dist:v});},v=>`${v.toFixed(2)} m`);
  mkSlider(D('lvLight'),syncStatic,'Intensity',.2,2.5,.01,()=>L().int,v=>L().int=v,v=>`${v.toFixed(2)}×`);
  mkSlider(D('lvLight'),syncStatic,'Colour temperature',2800,7000,50,()=>L().kel,v=>L().kel=v,v=>`${Math.round(v)} K`);
  mkSlider(D('lvLight'),syncStatic,'Softness',0,1,.01,()=>L().soft,v=>L().soft=v,v=>`${Math.round(v*100)}%`);
  mkSlider(D('lvLight'),syncStatic,'Fill ratio',0,3.5,.05,()=>L().fill,v=>L().fill=v,v=>`1 : ${Math.pow(2,v).toFixed(1)}`);
  mkSlider(D('lvLight'),syncStatic,'Ambient',0,.6,.01,()=>L().amb,v=>L().amb=v,v=>v.toFixed(2));
  const sw=document.createElement('div');sw.className='switch';sw.innerHTML='<span>Practical lamp</span><button class="btn" type="button" role="switch" aria-checked="true" id="lvLampBtn">On</button>';D('lvLight').appendChild(sw);
  const lb=sw.querySelector('button');const lampSync=()=>{lb.setAttribute('aria-checked',S.light.lamp?'true':'false');lb.textContent=S.light.lamp?'On':'Off';};syncStatic.push(lampSync);lampSync();
  lb.addEventListener('click',()=>{S.light.lamp=S.light.lamp?0:1;changed();log('T3',`you switched the practical lamp ${S.light.lamp?'on':'off'}`,'human');});
  mkSlider(D('lvCam'),syncStatic,'Focal length',24,135,1,()=>S.cam.lens,v=>{S.cam.lens=v;placeCamera();},v=>`${Math.round(v)} mm`);
  mkSlider(D('lvCam'),syncStatic,'Orbit',-58,58,1,()=>S.cam.az,v=>{S.cam.az=v;placeCamera();},v=>`${v>0?'+':''}${Math.round(v)}°`);
  mkSlider(D('lvCam'),syncStatic,'Camera height',1,50,1,()=>S.cam.el,v=>{S.cam.el=v;placeCamera();},v=>`${Math.round(v)}°`);
  mkSlider(D('lvCam'),syncStatic,'Distance',3,9,.05,()=>S.cam.dist,v=>{S.cam.dist=v;placeCamera();},v=>`${v.toFixed(2)} m`);
  const pf=document.createElement('div');pf.className='fieldrow';pf.innerHTML='<label>Use my location photo on the back wall <input type="file" accept="image/*" id="lvPlateUp"></label>';D('lvPlateG').appendChild(pf);
  pf.querySelector('input').addEventListener('change',ev=>uploadPlate(ev.target.files[0]));
  const pn=document.createElement('p');pn.className='hint left';pn.textContent='“Relit plate” off shows the photo as shot, with its own baked light. Turn it on and the plate reacts to your key.';D('lvPlateG').appendChild(pn);
}
function seedLog(){
  D('lvLog').innerHTML='';logN=0;
  log('T1','Mara, Dev: person photos → cutout (SAM-class) + depth/normals → 2.5D cards',  'R10',true);
  log('T1','plate photos → proxy room (floor + 3 walls) with de-lit albedo and the photo\'s baked light kept separately','R14',true);
  log('T2','armchair, table, lamp: image → 3D (TRELLIS-class, cloud GPU) would return meshes; stand-ins are primitives','R10',true);
  log('RT','router: people → cards (cheap, fixed viewpoint). Props → meshes. Plate → projected room. Image model only at the edges.','R10');
}
function init(){
  if(ready)return;
  T=window.THREE;const msg=D('vpMsg');
  if(!T){msg.textContent='three.js could not be loaded (offline or blocked). The Reference fit tab still works.';msg.classList.add('on');status('three.js missing');return;}
  cv=D('lvCanvas');wrapEl=D('vpWrap');
  try{renderer=new T.WebGLRenderer({canvas:cv,antialias:true});}catch(err){msg.textContent='WebGL is not available in this browser, so the live scene cannot run.';msg.classList.add('on');status('no WebGL');return;}
  renderer.outputEncoding=T.sRGBEncoding;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  scene=new T.Scene();scene.background=new T.Color(0x0b0a09);camera=new T.PerspectiveCamera(38,16/9,.1,60);ray=new T.Raycaster();
  S=defaults();buildRoom();buildRig();S.els.forEach(buildElement);
  placeCamera();setPlateMode();applyTransforms();applyLight();
  cv.addEventListener('pointerdown',onDown);cv.addEventListener('pointermove',onMove);cv.addEventListener('pointerup',onUp);cv.addEventListener('pointercancel',onUp);cv.addEventListener('keydown',onKey);
  cv.addEventListener('wheel',ev=>{ev.preventDefault();S.cam.dist=clamp(S.cam.dist*(1+Math.sign(ev.deltaY)*.06),3,9);placeCamera();changed();},{passive:false});
  D('lvMode').querySelectorAll('.btn').forEach(b=>b.addEventListener('click',()=>{S.mode=b.dataset.mode;D('lvMode').querySelectorAll('.btn').forEach(x=>x.setAttribute('aria-checked',x===b));}));
  D('lvThirds').addEventListener('click',e=>{const on=e.currentTarget.getAttribute('aria-pressed')!=='true';e.currentTarget.setAttribute('aria-pressed',on);wrapEl.classList.toggle('showthirds',on);});
  D('lvFace').addEventListener('click',e=>{S.face=!S.face;e.currentTarget.setAttribute('aria-pressed',S.face);applyTransforms();refreshBadges();scheduleJson();});
  D('lvPlate').addEventListener('click',()=>{S.plateRelit=!S.plateRelit;setPlateMode();scheduleJson();log('T3',`plate: ${S.plateRelit?'relit by your key (albedo × your light)':'as shot (baked light stays; shadows via a shadow catcher)'}`,'R14');});
  D('lvMatch').addEventListener('click',matchLight);D('lvHero').addEventListener('click',heroRender);
  D('lvReset').addEventListener('click',()=>{S=defaults();for(const id in roots){scene.remove(roots[id]);delete roots[id];}S.els.forEach(buildElement);placeCamera();setPlateMode();D('lvFace').setAttribute('aria-pressed',true);D('lvMode').querySelectorAll('.btn').forEach(x=>x.setAttribute('aria-checked',x.dataset.mode==='floor'));applyTransforms();applyLight();select('mara');syncAll();measureNow();scheduleJson();log('T3','you reset the scene','human');});
  D('lvAdd').addEventListener('click',()=>{const k=D('lvAddSel').value,names={armchair:'Armchair',table:'Side table',lamp:'Floor lamp',crate:'Crate'},n=S.els.filter(e=>e.prop===k).length;
    const e={id:k+(n+1)+Math.random().toString(36).slice(2,5),name:names[k]+(n?` ${n+1}`:''),kind:'prop',prop:k,color:{armchair:'#7a4e3a',table:'#6d5239',lamp:'#d9a15a',crate:'#8a6a45'}[k],x:(Math.random()-.5)*2,y:0,z:1.6+Math.random(),rot:0,scale:1};
    S.els.push(e);buildElement(e);select(e.id);changed();log('T3',`you added ${e.name}`,'human');});
  D('lvJsonCopy').addEventListener('click',()=>{const t=D('lvJson').value;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(()=>{D('lvJsonMsg').textContent='copied';},()=>{D('lvJson').select();D('lvJsonMsg').textContent='select + copy';});else{D('lvJson').select();D('lvJsonMsg').textContent='select + copy';}});
  D('lvJsonApply').addEventListener('click',()=>applyJSON(D('lvJson').value));
  D('lvJson').addEventListener('input',()=>{D('lvJsonMsg').textContent='edited, not applied';});
  const seg=D('lvRefSeg');REFS.forEach((R,i)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.setAttribute('role','radio');b.setAttribute('aria-checked',i===0);b.textContent=R.name;b.addEventListener('click',()=>{if(!matching)setRef(i);});seg.appendChild(b);});
  buildStatic();seedLog();renderEls();buildSel();
  ready=true;
  if('ResizeObserver' in window){new ResizeObserver(resize).observe(wrapEl);}else window.addEventListener('resize',resize);
  status('ready · drag anything');
  setRef(0);scheduleJson();resize();
  const fs=faceStats();
  log('T0','scene measured on the hero\'s cheeks; run “Match light to reference” to drive the rig from the reference','R4');
  showMatch(fs,analyse(refSel).st);
}
function onShow(){visible=true;if(!ready)init();dirty=true;kick();resize();}
function onHide(){visible=false;}
return {onShow,onHide,get api(){return {S:()=>S,select,matchLight,applyJSON,toJSON,measureNow,faceStats,polar,setPolar,changed,camera:()=>camera,renderer:()=>renderer,roots,heroRender,generateOutfit,toggleMode,parsePrompt,OUTFITS,ready:()=>ready};}};
})();

/* tabs */
(function(){
  const tabs=[['tabFitBtn','tabFit'],['tabLiveBtn','tabLive'],['tabArchBtn','tabArch']],g=id=>document.getElementById(id);
  function show(pid){
    tabs.forEach(([b,p])=>{const on=p===pid;g(b).setAttribute('aria-selected',on);g(p).hidden=!on;});
    if(pid==='tabLive')Live.onShow();else Live.onHide();
    if(pid==='tabFit'){try{sizePlan();drawPlan();}catch(e){}}
  }
  tabs.forEach(([b,p])=>g(b).addEventListener('click',()=>show(p)));
  const h=location.hash;if(h==='#live')show('tabLive');else if(h==='#how')show('tabArch');
})();
