const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];

/* Intro (une fois par session) */
const intro=$('#intro');
if(intro){
  if(sessionStorage.getItem('yw_seen')){intro.remove()}
  else setTimeout(()=>{intro.classList.add('done');sessionStorage.setItem('yw_seen',1);setTimeout(()=>intro.remove(),1100)},3100);
}

/* Navbar, barre de progression & bouton haut de page */
const nav=$('.nav'),prog=$('#progress'),topBtn=$('#top');
const navLinks=$$('.links a[href^="#"]');
const secs=navLinks.map(a=>$(a.getAttribute('href'))).filter(Boolean);
addEventListener('scroll',()=>{
  if(nav)nav.classList.toggle('s',scrollY>40);
  if(prog){
    const h=document.documentElement.scrollHeight-innerHeight;
    prog.style.width=(h>0?(scrollY/h)*100:0)+'%';
  }
  if(topBtn)topBtn.classList.toggle('show',scrollY>500);
  const y=scrollY+140;
  secs.forEach((sec,i)=>{
    const on=y>=sec.offsetTop&&y<sec.offsetTop+sec.offsetHeight;
    navLinks[i].classList.toggle('active',on);
  });
},{passive:true});
if(topBtn)topBtn.onclick=()=>scrollTo({top:0,behavior:'smooth'});

const bg=$('.burger'),lk=$('.links');
if(bg){
  bg.onclick=()=>{const open=lk.classList.toggle('open');bg.setAttribute('aria-expanded',open)};
  $$('.links a').forEach(a=>a.onclick=()=>{lk.classList.remove('open');bg.setAttribute('aria-expanded','false')});
}

/* Hero : vitrine photo interactive + arrière-plan flouté (5 photos) */
const hvImgs=$$('.hv-img'),bgSlides=$$('.bg-slide'),hvDots=$$('.hv-dots button');
if(hvImgs.length){
  let k=0,timer;
  const go=n=>{
    hvImgs[k].classList.remove('on');
    if(bgSlides[k])bgSlides[k].classList.remove('on');
    if(hvDots[k])hvDots[k].classList.remove('on');
    k=(n+hvImgs.length)%hvImgs.length;
    hvImgs[k].classList.add('on');
    if(bgSlides[k])bgSlides[k].classList.add('on');
    if(hvDots[k])hvDots[k].classList.add('on');
  };
  const start=()=>{clearInterval(timer);timer=setInterval(()=>go(k+1),4500)};
  hvDots.forEach((d,idx)=>d.onclick=()=>{go(idx);start()});
  start();
}
const t=$('.typed');
if(t){
  const w=JSON.parse(t.dataset.w);let i=0,j=0,d=0;
  (function tick(){
    const s=w[i];j+=d?-1:1;t.textContent=s.slice(0,j);
    let ms=d?35:75;
    if(!d&&j===s.length){d=1;ms=1600}
    else if(d&&!j){d=0;i=(i+1)%w.length;ms=300}
    setTimeout(tick,ms);
  })();
}

/* Filtres Certifications */
const cBtns=$$('[data-cfilter]'),cCards=$$('#cert-grid .card');
if(cBtns.length){
  cBtns.forEach(b=>b.onclick=()=>{
    cBtns.forEach(x=>x.classList.remove('on'));b.classList.add('on');
    const f=b.dataset.cfilter;
    cCards.forEach(c=>c.classList.toggle('hide',f!=='all'&&c.dataset.ccat!==f));
  });
}

/* Aperçu des documents & captures projets (modal) */
const cm=$('#cert-modal');
if(cm){
  const closeCm=()=>cm.classList.remove('open');
  $$('.view-doc').forEach(btn=>btn.onclick=()=>{
    $('#cm-img').src=btn.dataset.img;
    $('#cm-img').alt=btn.dataset.title;
    $('#cm-title').textContent=btn.dataset.title;
    $('#cm-meta').textContent=btn.dataset.meta;
    cm.classList.add('open');
  });
  $('#cm-close').onclick=closeCm;
  cm.onclick=e=>{if(e.target===cm)closeCm()};
  addEventListener('keydown',e=>{if(e.key==='Escape'&&cm.classList.contains('open'))closeCm()});
}

/* Copie rapide email / téléphone */
const toast=$('#toast');
const showToast=msg=>{if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>toast.classList.remove('show'),2400)};
$$('[data-copy]').forEach(a=>a.addEventListener('click',()=>{
  const val=a.dataset.copy;
  if(navigator.clipboard){
    navigator.clipboard.writeText(val).then(()=>showToast('Copié : '+val)).catch(()=>{});
  }
}));

/* Profil façon Instagram + likes */
const grid=$('#pgrid');
if(grid){
  const P=[
    ['p1.jpg','Noir & blanc, bonnes vibes'],
    ['p2.jpeg','Focus. Code. Répéter. 💻'],
    ['p3.jpg','Pause nature 🌿'],
    ['p4.jpeg','Toujours en mouvement ✨'],
    ['p5.jpg','Prêt pour le prochain projet 🚀'],
    ['p6.jpeg','Souvenir d’enfance 👶'],
    ['p7.jpeg','Ambiance nocturne 🌙'],
    ['p8.jpeg','Tradition & racines 🇹🇳'],
    ['p9.jpeg','Moment inoubliable 📸']
  ];
  const BASE={};
  let L={};try{L=JSON.parse(localStorage.getItem('yw_likes')||'{}')}catch(e){}
  const key=f=>f.replace(/[^a-z0-9]/gi,'_');
  const n=f=>(BASE[f]||0)+(L[f]?1:0),tot=()=>P.reduce((s,[f])=>s+n(f),0);
  let cur=0;
  grid.innerHTML=P.map(([f,c],i)=>`<div class="tile rv" data-i="${i}"><img src="assets/photos/${encodeURIComponent(f)}" alt="${c}" loading="lazy"><div><i class="fa-solid fa-heart"></i><b id="c-${key(f)}">0</b></div></div>`).join('');
  const render=bump=>{
    const T=$('#total');T.textContent=tot();
    if(bump){T.classList.add('bump');setTimeout(()=>T.classList.remove('bump'),300)}
    P.forEach(([f])=>{const el=$('#c-'+key(f));if(el)el.textContent=n(f)});
    const f=P[cur][0],h=$('#hrt');
    h.className='hrt fa-heart '+(L[f]?'fa-solid on':'fa-regular');
    $('#lc').textContent=n(f)+' j’aime';
  };
  const like=force=>{
    const f=P[cur][0];
    if(force)L[f]=true;else L[f]?delete L[f]:L[f]=true;
    try{localStorage.setItem('yw_likes',JSON.stringify(L))}catch(e){}
    render(true);
  };
  const show=i=>{
    cur=(i+P.length)%P.length;
    $('#limg').src=`assets/photos/${encodeURIComponent(P[cur][0])}`;
    $('#cap').innerHTML=`<b>yassin_wannassi</b> ${P[cur][1]}`;
    render();
  };
  const lb=$('#lb'),close=()=>lb.classList.remove('open');
  grid.onclick=e=>{const tile=e.target.closest('.tile');if(tile){show(+tile.dataset.i);lb.classList.add('open')}};
  $('.x').onclick=close;
  lb.onclick=e=>{if(e.target===lb)close()};
  $('.ar.l').onclick=()=>show(cur-1);
  $('.ar.r').onclick=()=>show(cur+1);
  $('#hrt').onclick=()=>like();
  let last=0;
  $('#im').onclick=()=>{
    const now=Date.now();
    if(now-last<350){like(true);const b=$('#big');b.classList.remove('go');void b.offsetWidth;b.classList.add('go')}
    last=now;
  };
  addEventListener('keydown',e=>{
    if(!lb.classList.contains('open'))return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')show(cur-1);
    if(e.key==='ArrowRight')show(cur+1);
  });
  render();
}

/* Compteurs + apparition au scroll */
const co=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  co.unobserve(e.target);
  const el=e.target,m=+el.dataset.n;let v=0;
  const s=setInterval(()=>{el.textContent=++v;if(v>=m)clearInterval(s)},180);
}),{threshold:.6});
$$('[data-n]').forEach(el=>co.observe(el));

const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
}),{threshold:.12});
$$('.rv').forEach((el,i)=>{el.style.transitionDelay=(i%3)*.1+'s';io.observe(el)});
