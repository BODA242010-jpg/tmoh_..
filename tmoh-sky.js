/* Tmoh V11: cinematic dream portal, only after a real successful entry.
   All profile/authentication and assistant logic stay in the existing app modules. */
(function(){
  'use strict';
  let sequence=0, cleanup=null;
  function flyIn(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    if(cleanup)cleanup();
    const overlay=document.createElement('div');
    overlay.className='tmoh-sky-portal';
    overlay.setAttribute('aria-hidden','true');
    overlay.innerHTML=`<div class="tmoh-portal-space"></div><div class="tmoh-portal-halo"></div><div class="tmoh-portal-ring ring-a"></div><div class="tmoh-portal-ring ring-b"></div><div class="tmoh-portal-cloud one"></div><div class="tmoh-portal-cloud two"></div><div class="tmoh-portal-cloud three"></div><div class="tmoh-portal-cloud four"></div><div class="tmoh-portal-cloud five"></div><div class="tmoh-portal-cloud six"></div><div class="tmoh-portal-center"><span class="tmoh-portal-symbol">✦</span><strong>Tmoh</strong><small>رحلتك بدأت</small></div><div class="tmoh-portal-flash"></div>`;
    const id=++sequence;
    let timer;
    const stop=()=>{
      if(timer)clearTimeout(timer);
      overlay.remove();
      if(sequence===id){document.body.classList.remove('tmoh-entering');cleanup=null;}
    };
    cleanup=stop;
    document.body.appendChild(overlay);
    document.body.classList.add('tmoh-entering');
    overlay.addEventListener('animationend',e=>{if(e.target===overlay)stop()},{once:true});
    timer=setTimeout(stop,2300); // Avoid a stuck overlay on slow or paused browsers.
  }
  window.TMOH_SKY=Object.freeze({flyIn});
})();
