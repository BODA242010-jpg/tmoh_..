/* Tmoh V9 — tested, local-first enhancements and honest feature gates.
   Does NOT alter the existing chatbot, cloud auth, rewards worker, or storage key.
   Disabled cloud controls are hidden in the UI, not deleted from user data/code.
*/
(function () {
  'use strict';
  if (typeof VIEWS === 'undefined' || typeof PAGES === 'undefined') return;
  const E = v => esc(String(v ?? ''));
  const cloudReady = () => Boolean(window.TMOH_CLOUD?.status?.().configured);
  const rewardsReady = () => Boolean(String(window.TMOH_REWARDS_AI?.url || '').trim());
  const profile = () => d && d.id;
  const friendlyDate = t => new Date(t).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  const localDate = t => { const a = new Date(t); return `${a.getFullYear()}-${String(a.getMonth()+1).padStart(2,'0')}-${String(a.getDate()).padStart(2,'0')}`; };
  function hiddenRoute(key) {
    const idx = PAGES.findIndex(x => x[0] === key);
    if (idx >= 0) PAGES.splice(idx, 1);
    document.querySelectorAll(`#nav [data-page="${key}"]`).forEach(x => x.remove());
  }
  // Avoid displaying a broken signup panel when the owner has not connected an auth provider.
  if (!cloudReady()) hiddenRoute('cloudsync');
  // Label curriculum accurately: supplied material is original practice content, not full state textbooks.
  const curr = PAGES.find(x => x[0] === 'curriculum');
  if (curr) curr[1] = '📖 الدروس والمراجعة';
  const activeCurr = document.querySelector('#nav [data-page="curriculum"]');
  if (activeCurr) activeCurr.textContent = curr[1];
  const oldLeague = VIEWS.league;
  VIEWS.league = () => {
    if (cloudReady()) return oldLeague();
    const start = new Date(); start.setHours(0,0,0,0); start.setDate(start.getDate() - (start.getDay()+6)%7);
    const total = (d.sessions || []).filter(s => Number(s.end) >= +start).reduce((v,s) => v + Math.max(0,Number(s.ms)||0),0);
    const minutes = Math.round(total/60000), goal = Math.max(60,Number(d.weekGoal)||600);
    const pct = Math.min(100, Math.round(100*minutes/goal));
    const titles = [['🥉','برونزي',0],['🥈','فضي',150],['🥇','ذهبي',400],['💎','ماسي',900]];
    const current = titles.filter(x => minutes >= x[2]).at(-1);
    return `<div class="heading"><div><h1>🏆 تحدّي الأسبوع الشخصي</h1><p>نافس نفسك واحتفل بالتقدّم، من غير ترتيب وهمي لطلاب آخرين.</p></div></div>
      <div class="card tm9-personal"><div class="tm9-emoji">${current[0]}</div><h2>مستوى ${current[1]}</h2>
      <p>ذاكرت <b>${minutes} دقيقة</b> من هدفك الأسبوعي <b>${goal} دقيقة</b></p>
      <div class="tm9-progress"><span style="width:${pct}%"></span></div><p>${pct}% من هدفك</p>
      <div class="btnrow"><button class="primary" data-go="focus">ابدأ جلسة مذاكرة</button><button class="soft" data-go="journey">اعرض تقدّمي</button></div></div>`;
  };
  const originalWeekStory = VIEWS.weekstory;
  const originalMovement = VIEWS.movement;
  const DB = 'tmoh-desk-memories-v1', STORE='desk', PHOTO_MAX = 3*1024*1024, ORIGINAL_MAX=16*1024*1024;
  let dbPromise=null, previewURL=null;
  const photos = () => { if (!d) return []; if (!Array.isArray(d.deskMemories)) d.deskMemories = []; return d.deskMemories; };
  function openDB() {
    if (!window.indexedDB) return Promise.reject(Error('هذا المتصفح لا يدعم تخزين الصور'));
    if (!dbPromise) dbPromise = new Promise((resolve,reject) => {
      const req = indexedDB.open(DB,1);
      req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>{dbPromise=null;reject(req.error||Error('تعذر تخزين الصورة'));};
    });
    return dbPromise;
  }
  async function stored(key, value, write=false) {
    const db=await openDB();
    return new Promise((resolve,reject)=>{
      const t=db.transaction(STORE,write?'readwrite':'readonly'),s=t.objectStore(STORE);
      const req=write?(value===undefined?s.delete(key):s.put(value,key)):s.get(key);
      t.oncomplete=()=>resolve(req.result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error);
    });
  }
  const key = (pid,id) => `${pid}:${id}`;
  function closePreview() { if (previewURL) { URL.revokeObjectURL(previewURL); previewURL=null; } }
  window.addEventListener('hashchange',closePreview);
  function weekPhotosMarkup() {
    const all=photos().slice().sort((a,b)=>b.at-a.at);
    return `<section class="card tm9-desk" id="tm9Desk"><h2>📸 صور مكتب المذاكرة (اختيارية)</h2>
      <p class="muted">صوّر مكتبك أو اختار صورة من هاتفك. الصور نفسها محفوظة <b>على جهازك فقط</b>، بدون رفع أو إرسال للشات بوت. عند تفعيل حساب سحابي اختياري قد يتزامن تاريخ التصوير فقط. لا تصوّر أشخاصًا أو مستندات شخصية.</p>
      <form id="tm9PhotoForm" class="tm9-photo-form"><label>صورة المكتب <input type="file" id="tm9Photo" accept="image/jpeg,image/png,image/webp" required></label>
      <button class="primary">احفظ الصورة في ذكرياتي</button></form>
      <p class="tiny">حد أقصى 24 صورة، وتُضغط الصورة محليًا لتوفير المساحة. النسخة الاحتياطية JSON تحفظ فهرس الصور فقط؛ احتفظ بنسخ الصور الأصلية.</p>
      ${all.length ? `<div class="tm9-photo-list">${all.slice(0,24).map(x=>`<div class="tm9-photo"><span>🖼️ ${E(friendlyDate(x.at))}</span><span class="tm9-photo-commands"><button class="soft" data-tm9="preview" data-id="${E(x.id)}">عرض</button><button class="soft" data-tm9="removePhoto" data-id="${E(x.id)}">حذف</button></span></div>`).join('')}</div>`:'<p class="muted">مافيش صور محفوظة لسه.</p>'}
      <div class="tm9-photo-preview" id="tm9DeskPreview" hidden></div>
      <button class="primary" type="button" data-tm9="weeklyCollage">احفظ كولاج الأسبوع بالصور والمشاعر PNG</button>
    </section>`;
  }
  VIEWS.weekstory = () => originalWeekStory() + weekPhotosMarkup();
  async function imageBlob(file) {
    const bitmap = await createImageBitmap(file);
    try {
      const max=1250,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));
      const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(bitmap.width*scale));cv.height=Math.max(1,Math.round(bitmap.height*scale));
      const c=cv.getContext('2d');if(!c)throw Error('Canvas غير مدعوم');c.drawImage(bitmap,0,0,cv.width,cv.height);
      const blob=await new Promise(resolve=>cv.toBlob(resolve,'image/jpeg',0.76));
      if(!blob || blob.size>PHOTO_MAX)throw Error('حجم الصورة كبير بعد الضغط');return blob;
    } finally { bitmap.close(); }
  }
  async function addPhoto(form) {
    const file=form.querySelector('#tm9Photo')?.files?.[0];
    if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type))return msg('اختار صورة JPG أو PNG أو WebP');
    if(file.size>ORIGINAL_MAX || !file.size)return msg('اختار صورة أصغر من 16 ميجابايت');
    if(photos().length>=24)return msg('الحد الأقصى 24 صورة. احذف صورة قديمة أولًا');
    const pid=profile(),id='desk-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);
    const button=form.querySelector('button');button.disabled=true;
    try {
      const blob=await imageBlob(file);await stored(key(pid,id),blob,true);
      if(!d || profile()!==pid){await stored(key(pid,id),undefined,true);return;}
      photos().push({id,at:Date.now(),size:blob.size});save();render('weekstory');msg('الصورة اتحفظت على الجهاز ✅');
    } catch (err) { console.warn('Tmoh desk photo could not be saved:',err);msg('تعذر حفظ الصورة. تأكد من مساحة التخزين ودعم المتصفح.');button.disabled=false; }
  }
  async function fetchPhoto(id) {
    const meta=photos().find(x=>x.id===id);if(!meta)return null;
    const b=await stored(key(profile(),id));if(!(b instanceof Blob))throw Error('الصورة الأصلية مش موجودة على الجهاز');
    return b;
  }
  async function previewPhoto(id) {
    const b=await fetchPhoto(id);if(!b)return;closePreview();previewURL=URL.createObjectURL(b);
    const container=document.getElementById('tm9DeskPreview');if(!container)return;
    const img=document.createElement('img');img.alt='صورة المكتب المحفوظة';img.src=previewURL;container.replaceChildren(img);container.hidden=false;
  }
  async function removePhoto(id) {
    if(!confirm('هل تريد حذف صورة المكتب من هذا الجهاز نهائيًا؟'))return;
    await stored(key(profile(),id),undefined,true);
    d.deskMemories=photos().filter(x=>x.id!==id);save();closePreview();render('weekstory');msg('اتحذفت الصورة');
  }
  async function weeklyCollage() {
    if(!d)return;
    const pid=profile(),start=new Date();start.setHours(0,0,0,0);start.setDate(start.getDate()-6);
    const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=1536;
    const x=canvas.getContext('2d');if(!x)return msg('المتصفح لا يدعم تصميم الصورة');
    x.fillStyle='#eef1ff';x.fillRect(0,0,1024,1536);
    x.fillStyle='#4936a8';x.fillRect(0,0,1024,232);
    x.direction='rtl';x.textAlign='right';x.fillStyle='#fff';x.font='bold 55px Cairo,Arial';x.fillText('Tmoh | ذكريات أسبوعي',965,90);
    x.font='32px Cairo,Arial';x.fillText(String(d.name||'طالب').slice(0,30),965,165);
    for(let i=0;i<7;i++) {
      const dt=new Date(+start+i*864e5),date=localDate(+dt),top=260+i*174;
      const next=new Date(dt);next.setDate(next.getDate()+1);
      const sessions=(d.sessions||[]).filter(s=>Number(s.end)>=+dt && Number(s.end)<+next);
      const minutes=Math.round(sessions.reduce((v,s)=>v+(Number(s.ms)||0),0)/60000);
      const feels=(d.feelings||[]).filter(z=>localDate(Number(z.at||z.end||0))===date);
      const rec=photos().filter(z=>localDate(z.at)===date).at(-1);
      x.fillStyle=i%2?'#fff':'#f9faff';x.fillRect(44,top,936,158);
      x.fillStyle='#2e2855';x.font='bold 28px Cairo,Arial';x.fillText(friendlyDate(+dt),950,top+44);
      x.font='25px Cairo,Arial';x.fillText(`${minutes} دقيقة • ${sessions.length} جلسة`,950,top+83);
      x.font='22px Cairo,Arial';x.fillText(String(feels.at(-1)?.value||'بدون تسجيل شعور').slice(0,32),950,top+123);
      if(rec){try{
        const blob=await stored(key(pid,rec.id));if(blob instanceof Blob){const bmp=await createImageBitmap(blob);
          const boxX=60,boxY=top+10,boxW=225,boxH=138;
          const scale=Math.max(boxW/bmp.width,boxH/bmp.height),w=bmp.width*scale,h=bmp.height*scale;
          x.save();x.beginPath();x.rect(boxX,boxY,boxW,boxH);x.clip();x.drawImage(bmp,boxX+(boxW-w)/2,boxY+(boxH-h)/2,w,h);x.restore();bmp.close();
        }
      }catch(_e){ /* JSON restoration may have a metadata entry without bytes */}}
    }
    x.fillStyle='#5d5181';x.font='24px Cairo,Arial';x.fillText('كل خطوة صغيرة بتقرّبك من حلمك • الصور على جهازك',960,1504);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)return msg('تعذر تصدير الكولاج');const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='Tmoh-weekly-memories.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    msg('اتجهز كولاج الأسبوع ✅');
  }
  // Optional longer physical break: actual 15-minute count-up; never awards study minutes.
  const steps=[
    ['🚶','مشي هادئ في مكان آمن','ابدأ بتحريك جسمك بهدوء.'],
    ['🙆','إرخاء الكتفين والذراعين','حرّك كتفيك في حدود الراحة من غير شد.'],
    ['🧍','تمدد لطيف','قف وحرّك جسمك ببطء، ووقف لو حسيت بألم.'],
    ['🌿','تنفس هادئ','خد نفسًا طبيعيًا واسترح، من غير حبس النفس.'],
    ['💧','اشرب مياه واستعد للمذاكرة','ارجع للمذاكرة في الوقت المناسب ليك.']
  ];
  function moveState(){if(!d.v9Movement||typeof d.v9Movement!=='object')d.v9Movement={at:null};return d.v9Movement;}
  function movingBlock(){const s=moveState(),seconds=s.at?Math.min(900,Math.max(0,Math.floor((Date.now()-s.at)/1000))):0,idx=Math.min(4,Math.floor(seconds/180)),v=steps[idx];return `<div class="card tm9-move" id="tm9Move"><h2>🧘 مرشد حركة 15 دقيقة — اختياري</h2>
  <p class="muted">استراحة مريحة بخمس خطوات بسيطة، وليست علاجًا أو بديلًا عن النصيحة الطبية. توقف إذا شعرت بألم أو دوخة.</p>
  <div class="tm9-move-figure" aria-hidden="true">${v[0]}</div><h3 id="tm9MoveStep">${E(v[1])}</h3><p id="tm9MoveHint">${E(v[2])}</p>
  <div id="tm9MoveClock" class="tm9-move-clock">${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} / 15:00</div>
  <div class="tm9-progress"><span id="tm9MoveBar" style="width:${seconds/9}%"></span></div>
  <div class="btnrow">${!s.at?'<button class="primary" data-tm9="startMovement">ابدأ مرشد الحركة</button>':`<button class="soft" data-tm9="stopMovement">إلغاء الاستراحة</button>${seconds>=900?'<button class="primary" data-tm9="finishMovement">سجل إتمام الاستراحة</button>':''}`}</div>
  <p class="tiny">العداد هنا للاستراحة فقط، مش بيتضاف لساعات المذاكرة، ومش بيكافئ على وقت غير موثوق.</p></div>`;}
  VIEWS.movement=()=>originalMovement()+movingBlock();
  const originalDelete=acts.delp;
  acts.delp=b=>{const pid=profile(),imgs=photos().map(x=>key(pid,x.id));originalDelete(b);if(pid && !R.profiles[pid])Promise.allSettled(imgs.map(k=>stored(k,undefined,true))).catch(()=>{});};
  // Visible, opt-in diagnostics. A failed network probe is not proof that the Worker is down.
  function health(){
    return `<div class="heading"><div><h1>🧪 فحص منصة Tmoh</h1><p>اختبار صريح للوظائف على جهازك. لا يتم إرسال بيانات دراسية عند الفحص.</p></div></div>
    <div class="card tm9-health"><h2>حالة الميزات</h2>
    <p>💾 الحفظ المحلي: نظام أساسي يعمل على الجهاز.</p>
    <p>📚 المواد المتاحة داخل Tmoh: <b>${window.TMOH_STUDY_CONTENT?.lessons?.length||0}</b> درسًا تأسيسيًا؛ ليست كتب وزارة كاملة.</p>
    <p>☁️ حسابات الطلاب: <b>${cloudReady()?'إعدادات الاتصال موجودة، يحتاج تجربة حساب حقيقي':'غير مفعّلة؛ زر التسجيل مخفي'}</b></p>
    <p>🌟 الدوري الجماعي: <b>${cloudReady()?'يحتاج تأكيد صلاحيات قاعدة البيانات':'غير مفعّل؛ الدوري الشخصي يعمل'}</b></p>
    <p>🧠 أسئلة الذكاء الاصطناعي: <b>${rewardsReady()?'عنوان الخدمة مضبوط؛ يحتاج اختبار':'غير متصلة؛ أسئلة المكافآت المحلية تعمل'}</b></p>
    <p>👥 الأصدقاء والمجموعات: <b>غير منفذة بعد؛ لا يوجد زر وهمي</b></p>
    <p>🌍 اللغة الإنجليزية الكاملة: <b>غير مكتملة؛ الواجهة الحالية عربية</b></p>
    <button type="button" class="primary" data-tm9="testHealth">افحص الحفظ والمكتبة وPWA والمساعد</button>
    <div id="tm9HealthResult" role="status" aria-live="polite"></div></div>`;
  }
  VIEWS.health=health;
  if(!PAGES.some(x=>x[0]==='health'))PAGES.push(['health','🧪 فحص المنصة']);
  if(d&&!document.getElementById('app').classList.contains('hide')&&!document.querySelector('#nav [data-page="health"]')){
    const nav=document.getElementById('nav'),button=document.createElement('button');button.dataset.page='health';button.textContent='🧪 فحص المنصة';button.addEventListener('click',()=>go('health'));nav.append(button);
  }
  if(d&&['weekstory','movement','league','health','cloudsync'].includes((location.hash||'').replace('#/',''))){if(!cloudReady()&&location.hash==='#/cloudsync')go('settings');else route();}
  function localTest(){try{const k='tmoh-v9-check-'+Date.now(),v='ok-'+Date.now();localStorage.setItem(k,v);const fine=localStorage.getItem(k)===v;localStorage.removeItem(k);return fine;}catch(_e){return false;}}
  async function idbTest(){const k='test-'+Date.now(),b=new Blob(['تم'],{type:'text/plain'});await stored(k,b,true);const out=await stored(k);await stored(k,undefined,true);return out instanceof Blob && await out.text()==='تم';}
  async function workerTest(){
    const url=(typeof CONFIG!=='undefined'&&CONFIG.AI_URL)||'';if(!url)return 'رابط المساعد غير مضبوط';
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6500);
    try {const r=await fetch(url,{method:'GET',signal:controller.signal,cache:'no-store'});return r.ok?'أجاب الخادم على الطلب (رد الشات نفسه لم يُختبر)':'الخادم رد بحالة '+r.status+'؛ يحتاج مراجعة';}
    catch(_e){return 'تعذر التحقق من الاتصال من هذا المتصفح؛ ليس دليلًا على تعطل الشات';}
    finally {clearTimeout(timeout);}
  }
  async function runHealth(){const box=document.getElementById('tm9HealthResult');if(!box)return;box.textContent='جاري فحص التخزين والاتصال…';
    const okLocal=localTest(),idb=await idbTest().catch(()=>false);
    const pwa=Boolean('serviceWorker' in navigator),reg=pwa?await navigator.serviceWorker.getRegistration().catch(()=>null):null;
    const worker=await workerTest();if(!document.getElementById('tm9HealthResult'))return;
    box.replaceChildren();const lines=[
      `الحفظ المحلي: ${okLocal?'✅ نجح اختبار الكتابة والقراءة':'❌ لم ينجح'}`,
      `مكتبة الملفات والصور (IndexedDB): ${idb?'✅ نجح اختبار تخزين ملف تجريبي':'⚠️ تعذر الاختبار'}`,
      `تطبيق PWA: ${reg?.active?'✅ يوجد Service Worker نشط':pwa?'⚠️ مدعوم لكن لم يُرصد Worker نشط':'⚠️ غير مدعوم في هذا المتصفح'}`,
      `المساعد الذكي: ${worker}`
    ];for(const line of lines){let p=document.createElement('p');p.textContent=line;box.append(p);}
  }
  const root=document.getElementById('content');
  root.addEventListener('submit',e=>{if(e.target.id==='tm9PhotoForm'&&d){e.preventDefault();addPhoto(e.target);}});
  root.addEventListener('click',async e=>{
    const b=e.target.closest('[data-tm9]');if(!b||!d)return;
    const op=b.dataset.tm9;try{
      if(op==='testHealth'){b.disabled=true;await runHealth();b.disabled=false;}
      if(op==='preview')await previewPhoto(b.dataset.id);
      if(op==='removePhoto')await removePhoto(b.dataset.id);
      if(op==='weeklyCollage'){b.disabled=true;await weeklyCollage();b.disabled=false;}
      if(op==='startMovement'){moveState().at=Date.now();save();render('movement');}
      if(op==='stopMovement'){moveState().at=null;save();render('movement');}
      if(op==='finishMovement'){
        const m=moveState();if(!m.at||Date.now()-m.at<900000)return msg('استكمل 15 دقيقة الأول');
        m.at=null;d.tmohTools=d.tmohTools||{};d.tmohTools.movementLog=Array.isArray(d.tmohTools.movementLog)?d.tmohTools.movementLog:[];
        d.tmohTools.movementLog.push({at:Date.now(),seconds:900,kind:'guided15'});save();render('movement');msg('اتسجلت استراحتك ✅');
      }
    } catch(_e){msg('حصلت مشكلة أثناء تنفيذ العملية. جرّب مرة أخرى.');if(b.isConnected)b.disabled=false;}
  });
  setInterval(()=>{
    if(!d||page!=='movement'||!document.getElementById('tm9Move'))return;
    const m=moveState();if(!m.at)return;
    const secs=Math.min(900,Math.max(0,Math.floor((Date.now()-m.at)/1000))),idx=Math.min(4,Math.floor(secs/180));
    const clock=document.getElementById('tm9MoveClock'),bar=document.getElementById('tm9MoveBar'),label=document.getElementById('tm9MoveStep'),hint=document.getElementById('tm9MoveHint');
    if(clock)clock.textContent=`${String(Math.floor(secs/60)).padStart(2,'0')}:${String(secs%60).padStart(2,'0')} / 15:00`;
    if(bar)bar.style.width=secs/9+'%';if(label)label.textContent=steps[idx][1];if(hint)hint.textContent=steps[idx][2];
    const icon=document.querySelector('#tm9Move .tm9-move-figure');if(icon)icon.textContent=steps[idx][0];
    if(secs>=900&&!document.querySelector('[data-tm9="finishMovement"]')){
      const btn=document.createElement('button');btn.className='primary';btn.dataset.tm9='finishMovement';btn.textContent='سجل إتمام الاستراحة';document.querySelector('#tm9Move .btnrow')?.append(btn);
    }
  },1000);
  window.TMOH_V9={get ready(){return {cloud:cloudReady(),aiRewards:rewardsReady()};},localTest,idbTest};
})();
