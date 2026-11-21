(function(){
const CONTACT_EMAIL='hello@verosolutions.com';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const LANGS=['en','pt','da'];
let lang=(()=>{try{return localStorage.getItem('vd-lang')}catch(e){return null}})();
if(!LANGS.includes(lang)){const n=(navigator.language||'').toLowerCase();lang=n.startsWith('pt')?'pt':(n.startsWith('da')||n.startsWith('nb')||n.startsWith('no'))?'da':'en'}
const L=(en,pt,da)=>lang==='pt'?pt:lang==='da'?da:en;
function setLang(l){lang=l;document.documentElement.lang=l;try{localStorage.setItem('vd-lang',l)}catch(e){}$$('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.set===l));$$('option[data-en]').forEach(o=>{o.textContent=o.dataset[l]||o.dataset.en})}
$$('.lang button').forEach(b=>b.onclick=()=>setLang(b.dataset.set));setLang(lang);
/* mobile drawer (left) */
(()=>{const bg=$('#burger'),mn=$('#mnav'),vl=$('#mveil');if(!bg||!mn)return;
  const set=o=>{mn.classList.toggle('open',o);if(vl)vl.classList.toggle('open',o);document.documentElement.classList.toggle('mn-lock',o);bg.setAttribute('aria-expanded',o);mn.setAttribute('aria-hidden',!o);if(o)setTimeout(()=>{const x=$('#mx');x&&x.focus({preventScroll:true})},80)};
  window.VERO_MNAV=set;bg.onclick=()=>set(true);$('#mx').onclick=()=>set(false);if(vl)vl.onclick=()=>set(false);
  $$('#mnav a').forEach(a=>a.addEventListener('click',()=>set(false)));addEventListener('keydown',e=>{if(e.key==='Escape'&&mn.classList.contains('open'))set(false)});
  const here=(location.pathname.split('/').pop()||'index.html');$$('#mnav .mn-links a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')===here));
  let sx=null;mn.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});mn.addEventListener('touchend',e=>{if(sx!==null&&e.changedTouches[0].clientX-sx<-60)set(false);sx=null},{passive:true});
})();
/* rotating word */
$$('[data-rot]:not([data-rot-ext])').forEach(r=>{const w=[...r.children];let i=0;setInterval(()=>{const a=w[i];a.classList.remove('on');a.classList.add('out');setTimeout(()=>a.classList.remove('out'),700);i=(i+1)%w.length;w[i].classList.add('on')},2600)});
/* service filter */
function filt(f){$$('#svTabs button').forEach(b=>b.classList.toggle('on',b.dataset.f===f));$$('.sv').forEach((c,k)=>{const s=f==='all'||c.dataset.c===f;c.classList.toggle('hide',!s);if(s){c.style.animation='none';c.offsetHeight;c.style.animation='';c.style.animationDelay=(k%8)*0.03+'s'}})}
$$('#svTabs button').forEach(b=>b.onclick=()=>filt(b.dataset.f));
if($('#svTabs')&&location.hash){const h=location.hash.slice(1);if($(`#svTabs [data-f="${h}"]`))filt(h)}
/* industries */
$$('.gr-tabs button').forEach(b=>b.onclick=()=>{$$('.gr-tabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.gr-panel').forEach(p=>p.classList.toggle('on',p.dataset.p===b.dataset.n))});
/* before/after */
const cmp=$('#cmp');if(cmp){let drag=false;const setX=e=>{const r=cmp.getBoundingClientRect();const x=((e.touches?e.touches[0].clientX:e.clientX)-r.left)/r.width;cmp.style.setProperty('--x',Math.max(0,Math.min(1,x))*100+'%')};
cmp.addEventListener('pointerdown',e=>{drag=true;setX(e)});addEventListener('pointerup',()=>drag=false);cmp.addEventListener('pointermove',e=>{if(drag||e.pointerType==='mouse')setX(e)});cmp.addEventListener('touchmove',e=>setX(e),{passive:true});
$$('#baTabs button').forEach(b=>b.onclick=()=>{$$('#baTabs button').forEach(x=>x.classList.toggle('on',x===b));$('#baB').src='img/work/'+b.dataset.b+'.jpg';$('#baA').src='img/work/'+b.dataset.a+'.jpg'})}
/* form */
const form=$('#form');if(form)form.onsubmit=e=>{e.preventDefault();const m=$('#fmsg');const n=$('#fn').value.trim(),em=$('#fe').value.trim(),msg=$('#fm').value.trim();
  if(!n||!/^\S+@\S+\.\S+$/.test(em)){m.textContent=L('Please add your name and a valid email.','Indique o seu nome e um email válido.','Skriv dit navn og en gyldig e-mail.');return}
  const t=document.querySelector('input[name=t]:checked').value,c=$('#fc').selectedOptions[0].textContent;
  const body=`Name: ${n}\nBusiness: ${$('#fb').value.trim()||'-'}\nEmail: ${em}\nCountry: ${c}\nInterest: ${t}\nLanguage: ${lang.toUpperCase()}\n\n${msg}`;
  location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Vero Solutions — '+t+' — '+n)+'&body='+encodeURIComponent(body);
  m.textContent=L('Your email app should open with the request ready to send.','A sua app de email deve abrir com o pedido pronto a enviar.','Din mailapp åbner med forespørgslen klar til at sende.')};
/* reveal + counters + chat */
function count(el){const to=+el.dataset.count,t0=performance.now();const f=n=>{const p=Math.min(1,(n-t0)/1400);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function playChat(box){const ms=[...box.querySelectorAll('.msg')],ty=box.querySelector('.typing');let i=0;
  const next=()=>{if(i>=ms.length){setTimeout(()=>{ms.forEach(m=>m.classList.remove('show'));i=0;setTimeout(next,600)},6000);return}
    const m=ms[i];if(m.classList.contains('a')){ty.classList.add('show');m.before(ty);setTimeout(()=>{ty.classList.remove('show');m.classList.add('show');i++;setTimeout(next,1300)},1300)}
    else{m.classList.add('show');i++;setTimeout(next,m.classList.contains('s')?900:1100)}};next()}
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target);x.target.querySelectorAll('[data-count]').forEach(count);if(x.target.id==='chat')playChat(x.target)}}),{rootMargin:'0px 0px -8% 0px'});
$$('.rv').forEach(el=>io.observe(el));
/* cinematic house */
const hs=$('#house');if(hs){
  const L=[...hs.querySelectorAll('.hl')],C=[...hs.querySelectorAll('.hcap')],R=[...hs.querySelectorAll('.house-rail i')];
  const AT=[0,.13,.26,.39,.54,.70,.86,1.01];const ext=k=>k<3;
  const cl=v=>Math.max(0,Math.min(1,v));const picked={};
  const upd=()=>{const r=hs.getBoundingClientRect(),h=hs.offsetHeight-innerHeight,p=cl(-r.top/h);
    let i=0;while(i<L.length-1&&p>=AT[i+1])i++;
    const loc=cl((p-AT[i])/(AT[i+1]-AT[i]));
    const tr=ext(i)?cl((loc-.25)/.75):cl((loc-.78)/.22);
    L.forEach((l,k)=>{let o=0;if(k===i)o=1;else if(k===i+1)o=tr;l.style.opacity=o;l.style.zIndex=k===i+1?2:1;
      const lp=k===i?loc:k===i+1?0:0;l.style.transform=`scale(${1.04-0.04*(k===i?loc:0)})`});
    const act=tr>.5&&i+1<L.length?i+1:i;
    C.forEach((c,k)=>c.classList.toggle('on',k===act));R.forEach((x,k)=>x.classList.toggle('on',k===act));
    // auto-cycle finishes while scrolling, unless the visitor picked one
    [['k',4],['b',5]].forEach(([key,idx])=>{if(picked[key]!==undefined||i!==idx)return;const imgs=L[idx].querySelectorAll('img');const v=Math.min(imgs.length-1,Math.floor(loc*imgs.length*1.15));setVar(key,v,false)})};
  function setVar(key,v,user){const l=hs.querySelector(`.hl[data-k="${key}"]`),c=hs.querySelector(`.hcap[data-k="${key}"]`);
    l.querySelectorAll('img').forEach((im,j)=>im.classList.toggle('on',j===v));c.querySelectorAll('.hchips button').forEach((b,j)=>b.classList.toggle('on',j===v));if(user)picked[key]=v}
  hs.querySelectorAll('.hcap').forEach(c=>c.querySelectorAll('.hchips button').forEach(b=>b.onclick=()=>setVar(c.dataset.k,+b.dataset.v,true)));
  addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);upd()}
const yr=$('#yr');if(yr)yr.textContent=new Date().getFullYear();
requestAnimationFrame(()=>setTimeout(()=>$$('.hx,.ph').forEach(h=>h.classList.add('go')),80));
})();
