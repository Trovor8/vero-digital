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
$$('[data-rot]:not([data-rot-ext])').forEach(r=>{const w=[...r.children];let i=0;setInterval(()=>{const a=w[i];a.classList.remove('on');a.classList.add('out');setTimeout(()=>a.classList.remove('out'),700);i=(i+1)%w.length;w[i].classList.add('on');if(r.closest('#hero'))$$('#hero .lead-x .lx').forEach((l,j)=>l.classList.toggle('on',j===i))},3600)});
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
/* industries matrix: on phones show one business at a time */
(()=>{const mx=document.querySelector('.gr-mx');if(!mx)return;const ths=[...mx.querySelectorAll('thead th')].slice(1);if(!ths.length)return;
const pick=document.createElement('div');pick.className='mx-pick';pick.setAttribute('role','tablist');
ths.forEach((th,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','tab');b.innerHTML=th.innerHTML;b.onclick=()=>set(i+1);pick.appendChild(b)});
mx.parentNode.insertBefore(pick,mx);
function set(c){mx.dataset.col=c;[...pick.children].forEach((b,j)=>{b.classList.toggle('on',j===c-1);b.setAttribute('aria-selected',j===c-1)})}set(1)})();
/* Europe card: say hello in your language */
document.querySelectorAll('.eu').forEach(c=>{const hi=c.querySelector('.eu-hi');c.querySelectorAll('[data-hi]').forEach(b=>b.addEventListener('click',()=>{c.querySelectorAll('[data-hi]').forEach(x=>x.classList.toggle('on',x===b));hi.classList.remove('pop');void hi.offsetWidth;hi.textContent=b.dataset.hi;hi.classList.add('pop')}))});
/* phones: long stacks become swipeable decks with tabs, arrows and a counter */
(()=>{const mq=matchMedia('(max-width:760px)');
document.querySelectorAll('.core3,.projects,.ailist,.aicards,.sys,.cine,.svgrid,.ctry').forEach(box=>{
  const items=[...box.children];if(items.length<3)return;
  const heads=items.map(c=>c.querySelector('h3,h4')||c.querySelector('b'));
  const tabs=items.length<=7&&heads.every(Boolean)?document.createElement('div'):null;
  if(tabs){tabs.className='dk-tabs';heads.forEach((h,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=h.innerHTML;b.onclick=()=>go(items[i]);tabs.appendChild(b)});box.parentNode.insertBefore(tabs,box)}
  const nav=document.createElement('div');nav.className='dk-nav';nav.innerHTML='<button type="button" class="dk-p" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button><span class="dk-c"></span><span class="dk-bar"><i></i></span><button type="button" class="dk-n" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>';
  box.after(nav);box.classList.add('mdeck');
  const vis=()=>items.filter(c=>getComputedStyle(c).display!=='none');
  const cur=()=>{const v=vis(),mid=box.scrollLeft+box.clientWidth/2;let k=0,d=1e9;v.forEach((c,i)=>{const e=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(e<d){d=e;k=i}});return k};
  function go(el){box.scrollTo({left:el.offsetLeft-(box.clientWidth-el.offsetWidth)/2,behavior:'smooth'})}
  function upd(){if(!mq.matches)return;const v=vis(),k=cur();nav.querySelector('.dk-c').textContent=(k+1)+' / '+v.length;nav.querySelector('.dk-bar i').style.width=((k+1)/v.length*100)+'%';
    nav.querySelector('.dk-p').disabled=k===0;nav.querySelector('.dk-n').disabled=k===v.length-1;
    if(tabs){const idx=items.indexOf(v[k]);[...tabs.children].forEach((b,j)=>b.classList.toggle('on',j===idx));const on=tabs.children[idx];if(on)tabs.scrollTo({left:on.offsetLeft-(tabs.clientWidth-on.offsetWidth)/2,behavior:'smooth'})}}
  let raf=0;box.addEventListener('scroll',()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(upd)},{passive:true});
  nav.querySelector('.dk-p').onclick=()=>{const v=vis();go(v[Math.max(0,cur()-1)])};nav.querySelector('.dk-n').onclick=()=>{const v=vis();go(v[Math.min(v.length-1,cur()+1)])};
  new MutationObserver(()=>{box.scrollLeft=0;upd()}).observe(box,{subtree:false,childList:true,attributes:true,attributeFilter:['class','style']});
  items.forEach(c=>new MutationObserver(()=>{requestAnimationFrame(()=>{box.scrollLeft=0;upd()})}).observe(c,{attributes:true,attributeFilter:['style','hidden']}));
  addEventListener('resize',upd);upd();
})})();

/* "Simple for you" steps on phones: story-style timeline — tap a node, swipe, or let it play */
document.querySelectorAll('.how3').forEach(box=>{
  const steps=[...box.children];if(!steps.length)return;
  const bar=document.createElement('div');bar.className='stp';bar.setAttribute('role','tablist');
  bar.innerHTML=steps.map((s,i)=>`<button type="button" role="tab" aria-label="${i+1}"><i><em></em></i><b>0${i+1}</b><span>${(s.querySelector('h4')||{}).innerHTML||''}</span></button>`).join('');
  box.parentNode.insertBefore(bar,box);
  const btns=[...bar.children],mq=matchMedia('(max-width:1000px)');let cur=0,t0=performance.now(),paused=false,raf=0;const DUR=4200;
  function set(i,user){cur=(i+steps.length)%steps.length;t0=performance.now();if(user)paused=true;
    steps.forEach((s,j)=>s.classList.toggle('on',j===cur));btns.forEach((b,j)=>{b.classList.toggle('on',j===cur);b.classList.toggle('done',j<cur);b.setAttribute('aria-selected',j===cur);b.querySelector('em').style.width=j<cur||(paused&&j===cur)?'100%':'0%'})}
  function tick(now){raf=requestAnimationFrame(tick);if(!mq.matches||paused)return;const r=box.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight){t0=now;return}
    const k=Math.min(1,(now-t0)/DUR);btns[cur].querySelector('em').style.width=(k*100)+'%';if(k>=1)set(cur+1)}
  btns.forEach((b,i)=>b.onclick=()=>set(i,true));
  let sx=null;box.addEventListener('touchstart',e=>{sx=e.touches[0].clientX},{passive:true});box.addEventListener('touchend',e=>{if(sx==null)return;const dx=e.changedTouches[0].clientX-sx;sx=null;if(Math.abs(dx)>40)set(cur+(dx<0?1:-1),true)},{passive:true});
  set(0);raf=requestAnimationFrame(tick);
});
/* footer: live clocks, collapsible link groups on phones, spotlight wordmark */
(()=>{const ft=document.querySelector('.ft');if(!ft)return;
  const clk=[...ft.querySelectorAll('.ft-clk')];
  const tick=()=>clk.forEach(c=>{try{const d=new Date(),f=new Intl.DateTimeFormat('en-GB',{timeZone:c.dataset.tz,hour:'2-digit',minute:'2-digit'});const h=+new Intl.DateTimeFormat('en-GB',{timeZone:c.dataset.tz,hour:'numeric',hour12:false}).format(d);c.querySelector('time').textContent=f.format(d);c.classList.toggle('open',h>=9&&h<19)}catch(e){}});
  tick();setInterval(tick,20000);
  ft.querySelectorAll('.ft-h').forEach(b=>b.addEventListener('click',()=>{const c=b.closest('.ft-col'),o=!c.classList.contains('open');c.classList.toggle('open',o);b.setAttribute('aria-expanded',o)}));
  const big=ft.querySelector('.ft-big');if(big){let auto=true,t=0;const set=(x,y)=>{big.style.setProperty('--mx',x+'%');big.style.setProperty('--my',y+'%')};
    const mv=e=>{const p=e.touches?e.touches[0]:e,r=big.getBoundingClientRect();auto=false;set((p.clientX-r.left)/r.width*100,(p.clientY-r.top)/r.height*100);clearTimeout(big._t);big._t=setTimeout(()=>auto=true,2500)};
    big.addEventListener('pointermove',mv);big.addEventListener('touchmove',mv,{passive:true});
    (function loop(){t+=.006;if(auto){set(50+42*Math.sin(t*1.3),50+30*Math.sin(t*2.1))}requestAnimationFrame(loop)})();}
})();
