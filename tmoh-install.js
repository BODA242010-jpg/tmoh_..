/* Tmoh V12: installation assistant. Doesn't access student profiles or API keys. */
(()=>{'use strict';
  const $=s=>document.querySelector(s);
  const dialog=$('#tmohInstDialog'), openers=['#tmohInstallHeader','#tmohInstallLogin'].map($).filter(Boolean);
  if(!dialog || !openers.length) return;
  const close=$('#tmohInstClose'), later=$('#tmohInstDismiss'), confirm=$('#tmohInstConfirm');
  let deferredPrompt=null, lastFocus=null;
  const isStandalone=()=>window.matchMedia?.('(display-mode: standalone)').matches || !!navigator.standalone;
  const isIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1);
  const isAndroid=()=>/Android/i.test(navigator.userAgent);
  const isMobile=()=>/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  const isSafari=()=> /^((?!chrome|android|crios|fxios|edgios).)*safari/i.test(navigator.userAgent);
  function updateButtons(){openers.forEach(btn=>{btn.hidden=isStandalone()});}
  function renderInstructions(){
    const desc=$('#tmohInstDescription'),steps=$('#tmohInstSteps');
    confirm.hidden=!deferredPrompt;
    if(isIOS()){
      desc.textContent='على الآيفون والآيباد ثبّت التطبيق من قائمة المشاركة في Safari.';
      steps.innerHTML='<ol><li>افتح موقع Tmoh في Safari.</li><li>اضغط زر المشاركة (Share).</li><li>اختر «إضافة إلى الشاشة الرئيسية» (Add to Home Screen).</li><li>اضغط «إضافة». ستظهر أيقونة Tmoh.</li></ol>';
      if(!isSafari())desc.textContent='لو خيار الإضافة غير ظاهر، افتح الموقع في Safari واتبع الخطوات.';
    }else if(isAndroid()){
      desc.textContent=deferredPrompt?'يمكنك تثبيت Tmoh الآن.':'ثبّت Tmoh من خيارات المتصفح على جهازك.';
      steps.innerHTML='<ol><li>افتح الموقع في Google Chrome.</li><li>اضغط قائمة الثلاث نقاط ⋮.</li><li>اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».</li><li>وافق على التثبيت، ثم افتحه من الشاشة الرئيسية.</li></ol>';
    }else if(!isMobile()){
      desc.textContent=deferredPrompt?'اضغط «تثبيت التطبيق» للحصول على نافذة مستقلة.':'يمكن تثبيت Tmoh على الكمبيوتر من Chrome أو Edge.';
      steps.innerHTML='<ol><li>افتح الموقع في Chrome أو Microsoft Edge.</li><li>اضغط رمز التثبيت في شريط العنوان، أو افتح قائمة المتصفح.</li><li>اختر «تثبيت Tmoh» أو «التطبيقات → تثبيت هذا الموقع كتطبيق».</li><li>ستجد Tmoh في التطبيقات وقائمة ابدأ أو سطح المكتب.</li></ol>';
    }else{
      desc.textContent='ثبّت الموقع من قائمة المتصفح على جهازك.';
      steps.innerHTML='<ol><li>افتح قائمة المتصفح.</li><li>اختر تثبيت التطبيق أو إضافة إلى الشاشة الرئيسية.</li><li>أكّد التثبيت.</li></ol>';
    }
  }
  function show(){if(isStandalone())return;lastFocus=document.activeElement;renderInstructions();dialog.hidden=false;close.focus();}
  function hide(){dialog.hidden=true;lastFocus?.focus?.();}
  openers.forEach(btn=>btn.addEventListener('click',show));
  close.addEventListener('click',hide);later.addEventListener('click',hide);
  dialog.addEventListener('click',e=>{if(e.target===dialog)hide()});
  document.addEventListener('keydown',e=>{if(dialog.hidden)return;if(e.key==='Escape')hide();if(e.key==='Tab'){const els=[...dialog.querySelectorAll('button:not([hidden])')].filter(x=>x.getClientRects().length);const first=els[0],last=els.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;});
  confirm.addEventListener('click',async()=>{
    if(!deferredPrompt){renderInstructions();return}
    const prompt=deferredPrompt;deferredPrompt=null;
    try{await prompt.prompt();await prompt.userChoice;}catch{ /* A browser can reject unsupported install prompts. */ }
    hide();updateButtons();
  });
  window.addEventListener('appinstalled',()=>{deferredPrompt=null;hide();updateButtons();});
  updateButtons();
})();
