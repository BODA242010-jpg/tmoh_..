/* Tmoh V10 - connected learning journey. Local-first, additive, no chatbot edits.
   The sole study-time source remains app.js/d.timer and its acts.tend(). */
(function(){
 'use strict';
 if(typeof VIEWS==='undefined'||typeof acts==='undefined'||typeof PAGES==='undefined')return;
 const $$one=s=>document.querySelector(s);
 const safe=x=>esc(String(x??''));
 const NAV_GROUPS=[
  ['📖 الدراسة والمصادر',['studytools','curriculum','books','bacc','mylibrary','library','notes','assistant']],
  ['⏱️ الوقت والخطة',['focus','focusroom','planner','weekplan','backlog','smartbacklog','daily']],
  ['🧠 الاختبارات والمكافآت',['exams','quickquiz','cards','mistakes','rewards']],
  ['🌿 راحتي وتقدّمي',['rest','movement','weekstory','journey','achievements','museum','league','mascot','analytics','report']],
  ['⚙️ أدوات أخرى',['settings','health','cloudsync']]
 ];
 const allKeys = new Set(NAV_GROUPS.flatMap(x=>x[1]));
 const now=()=>Date.now();
 const storage=()=>{if(!d.tmohFlow||typeof d.tmohFlow!=='object')d.tmohFlow={};return d.tmohFlow};
 const hasLesson=()=>!!window.TMOH_STUDY_CONTENT?.lessons?.some(l=>l.id===d?.tmohTools?.lessonId);
 const activeLesson=()=>window.TMOH_STUDY_CONTENT?.lessons?.find(l=>l.id===d?.tmohTools?.lessonId);
 const format=seconds=>`${String(Math.floor(Math.max(0,seconds)/60)).padStart(2,'0')}:${String(Math.max(0,seconds)%60).padStart(2,'0')}`;
 const chosenSubject=()=>d.timer?.subject || activeLesson()?.subject || '';
 const chosenLesson=()=>d.timer?.lesson || activeLesson()?.title || '';
 // Group the same original page buttons: nothing functional is removed.
 let grouping=false;
 function groupNav(){
   const nav=$$one('#nav');if(!nav||grouping||$$one('#app')?.classList.contains('hide'))return;
   const direct=[...nav.children].filter(n=>n.matches?.('button[data-page]'));
   if(nav.querySelector('.tf-nav-section') && direct.every(b=>b.dataset.page==='home'))return;
   const old=[...nav.querySelectorAll('button[data-page]')];if(!old.length)return;
   grouping=true;
   try{
    const frag=document.createDocumentFragment();
    const pinned=old.find(x=>x.dataset.page==='home');
    if(pinned){pinned.classList.add('tf-home-link');frag.append(pinned)}
    const used=new Set(pinned?['home']:[]);
    for(const [name,keys] of NAV_GROUPS){
     const members=keys.map(k=>old.find(b=>b.dataset.page===k)).filter(Boolean);
     if(!members.length)continue;
     members.forEach(b=>used.add(b.dataset.page));
     const details=document.createElement('details');details.className='tf-nav-section';details.dataset.tfGroup=name;
     const summary=document.createElement('summary');summary.textContent=name;
     const items=document.createElement('div');items.className='tf-nav-items';members.forEach(b=>items.append(b));
     details.append(summary,items);frag.append(details);
    }
    const left=old.filter(b=>!used.has(b.dataset.page));
    if(left.length){const details=document.createElement('details');details.className='tf-nav-section';details.dataset.tfGroup='المزيد';const s=document.createElement('summary');s.textContent='🧩 المزيد';const c=document.createElement('div');c.className='tf-nav-items';left.forEach(b=>c.append(b));details.append(s,c);frag.append(details)}
    nav.replaceChildren(frag);syncActiveNav();
   }finally{grouping=false;}
 }
 function syncActiveNav(){
  const nav=$$one('#nav');if(!nav)return;
  const p=location.hash.replace(/^#\//,'')||'home';
  nav.querySelectorAll('.tf-nav-section').forEach(g=>{
   const selected=!!g.querySelector(`button[data-page="${CSS.escape(p)}"]`);
   g.classList.toggle('tf-current',selected);
   if(selected)g.open=true;
  });
 }
 const nav=$$one('#nav');if(nav){const obs=new MutationObserver(()=>{if(!grouping)queueMicrotask(groupNav)});obs.observe(nav,{childList:true});}
 window.addEventListener('hashchange',()=>{queueMicrotask(syncActiveNav);hideReminder()});
 const originalTend=acts.tend;
 acts.tend=function(b){
  if(!d)return originalTend.call(this,b);
  const duration=elapsed(),sessionBefore=d.sessions.length,subject=chosenSubject(),lesson=chosenLesson();
  originalTend.call(this,b); // the original is the sole writer of study sessions and mood prompt
  if(d && d.sessions.length>sessionBefore && duration>=60000){
   const f=storage();f.restDue=true;f.remindAfter=0;f.lastSession={at:now(),minutes:Math.round(duration/60000),subject,lesson};
   f.break={minutes:duration>=3600000?10:5,startedAt:null,done:false};
   save();go('rest');if(page==='rest')route();
  }
 };
 // Session reminders use the running original timer, not a new counter.
 let reminder=null;
 function hideReminder(){if(reminder){reminder.remove();reminder=null;}}
 function showReminder(){
  if(reminder||!d)return;
  const goal=Number(d.timer.goal)||60,mins=Math.min(60,Math.max(5,goal));
  reminder=document.createElement('div');reminder.className='tf-backdrop';
  reminder.innerHTML=`<section class="tf-reminder" role="dialog" aria-modal="true" aria-labelledby="tf-reminder-title" aria-describedby="tf-reminder-desc"><div class="tf-breath">🌿</div><h2 id="tf-reminder-title">برافو! وقت استراحة قصيرة</h2><p id="tf-reminder-desc">ذاكرت حوالي <b>${Math.floor(elapsed()/60000)} دقيقة</b>. احفظ الجلسة وابدأ راحة مناسبة، أو كمّل لما تكون جاهز.</p><div class="tf-actions"><button class="primary" data-tf-modal="end">احفظ الجلسة وروح للراحة</button><button class="soft" data-tf-modal="later">كمّل شوية</button></div></section>`;
  document.body.append(reminder);
  reminder.querySelector('[data-tf-modal="end"]').focus();
 }
 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-tf-modal]');if(!b||!d)return;
  e.preventDefault();
  const cmd=b.dataset.tfModal;hideReminder();
  if(cmd==='end')acts.tend();
  if(cmd==='later'){storage().remindAfter=now()+15*60000;save();}
 });
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&reminder){hideReminder();if(d){storage().remindAfter=now()+15*60000;save();}}});
 setInterval(()=>{
   if(!d||document.hidden||reminder)return;
   const t=d.timer;if(!t?.since)return;
   // App's inactivity guard keeps elapsed honest; never prompt for an abandoned tab.
   if(t.beat&&now()-t.beat>110000)return;
   const threshold=Math.min(60,Math.max(5,Number(t.goal)||60))*60000;
   if(elapsed()<threshold)return;
   if((storage().remindAfter||0)>now())return;
   showReminder();
 },3000);
 function moodPanel(){
  if(!d.pendingFeeling)return '';
  const feelings=[['😐','أشعر بالملل'],['😴','أشعر بالتعب'],['🚀','أشعر بالحماس'],['🌿','أشعر بالراحة']];
  return `<section class="tf-feelings"><h3>💜 بعد المذاكرة، إيه شعورك؟ <small>اختياري</small></h3><div class="tf-actions">${feelings.map(x=>`<button type="button" class="soft" data-act="feeling" data-v="${safe(x[1])}">${x[0]} ${x[1]}</button>`).join('')}<button class="soft" data-act="skipFeeling">تخطي</button></div></section>`;
 }
 function recentMood(){const f=storage(),m=d.tmohTools?.lastMood||d.feelings?.at(-1);return m && (!f.lastSession || Number(m.at)>=f.lastSession.at) ? m.value : ''; }
 function lastMoodAdvice(){const v=recentMood();
  if(v==='أشعر بالتعب')return 'لو لسه تعبان، خلي الراحة أطول وخد وقتك قبل ما تبدأ.';
  if(v==='أشعر بالملل')return 'بعد الراحة جرّب أسئلة خفيفة أو غيّر طريقة مراجعة الدرس.';
  if(v==='أشعر بالحماس')return 'جميل! اختار هدفًا صغيرًا للجلسة اللي جاية.';
  if(v==='أشعر بالراحة')return 'حافظ على التوازن، وكل إنجاز ليه قيمة.';
  return 'استراحة بسيطة وشوية مياه ممكن يساعدوك ترجع بنشاط.';
 }
 function restView(){
  const f=storage(),b=f.break||{minutes:5,startedAt:null,done:false},session=f.lastSession;
  const running=Boolean(d.timer.since);
  const left=b.startedAt?Math.max(0,b.minutes*60-Math.floor((now()-b.startedAt)/1000)):b.minutes*60;
  const done=!!b.done||Boolean(b.startedAt&&left===0);
  const title=session?`بعد مذاكرة ${safe(session.minutes)} دقيقة${session.subject?' في '+safe(session.subject):''}`:'استراحة بدون ضغط';
  const progress=b.startedAt?Math.min(100,100-left/(b.minutes*60)*100):0;
  return `<div class="heading"><div><h1>🌿 وقت الراحة</h1><p>استراحة من رحلة المذاكرة — بدون احتسابها ضمن ساعات الدراسة</p></div></div>
    <div class="card tf-rest"><div class="tf-rest-emoji" aria-hidden="true">${done?'✨':'☁️'}</div><h2>${done?'خلصت الراحة، نورت تاني!':running?'المذاكرة لسه شغالة':title}</h2>
    <p class="muted">${running?'اقفل جلسة المذاكرة واحفظها قبل ما تبدأ وقت الراحة.':done?'مفيش أي استعجال. اختار الخطوة المناسبة ليك.':lastMoodAdvice()}</p>
    ${running?'<button type="button" class="primary" data-tf="endStudy">إنهاء المذاكرة وحفظ الجلسة</button>':
      `<div class="tf-break-time" id="tfBreakClock" role="timer">${format(left)}</div><div class="tf-rest-progress"><span id="tfBreakBar" style="width:${progress}%"></span></div>
       ${!b.startedAt&&!done?`<div class="tf-rest-choices"><span>مدة الراحة:</span>${[5,10,15].map(x=>`<button type="button" class="${b.minutes===x?'primary':'soft'}" data-tf="duration" data-min="${x}">${x} دقائق</button>`).join('')}</div><button type="button" class="primary" data-tf="startBreak">▶ ابدأ وقت الراحة</button>`:''}
       ${b.startedAt&&!done?'<button class="soft" type="button" data-tf="finishEarly">إنهاء الراحة بدري</button>':''}
       ${done?'<p role="status">✅ وقت الراحة انتهى. مستعد تكمل؟</p>':''}`}
    <p class="tiny">ممكن تتحرك بهدوء وتشرب مياه. الراحة اختيارية، ومش هتتحسب كمذاكرة.</p></div>
    ${!running?moodPanel():''}
    <div class="card tf-next"><h3>🎯 اختار الخطوة اللي بعد الراحة</h3><div class="tf-actions">
       <button class="primary" type="button" data-tf="backToStudy">📖 ارجع للمذاكرة</button>
       <button class="soft" type="button" data-go="studytools">🧠 راجع الدرس وحل أسئلة</button>
       <button class="soft" type="button" data-go="planner">📅 شوف مهامك</button>
       <button class="soft" type="button" data-go="movement">🚶 حركة خفيفة (اختياري)</button>
       ${recentMood()==='أشعر بالملل'?'<button class="soft" type="button" data-go="rewards">🎁 نشاط ممتع من المكافآت</button>':''}
       ${recentMood()==='أشعر بالحماس'?'<button class="soft" type="button" data-go="planner">✨ خطط لإنجاز صغير</button>':''}
    </div></div>`;
 }
 VIEWS.rest=restView;
 if(!PAGES.some(p=>p[0]==='rest'))PAGES.push(['rest','🌿 وقت الراحة']);
 function nextStep(){
  const f=storage();if(d.timer.since)return ['⏱️ جلسة شغالة دلوقتي','كمّل مذاكرتك، وهنفكرك بالاستراحة لما توصل لهدفك.','focus','ارجع للعداد'];
  if(f.restDue)return ['🌿 استراحتك مستنياك','جلستك اتحفظت. خد وقتك قبل ما تبدأ من جديد.','rest','ابدأ الاستراحة'];
  if(d.pendingFeeling)return ['💜 طمّنا عليك','قيّم شعورك بعد المذاكرة وخد استراحة صغيرة.','rest','سجّل شعورك'];
  const hasPending=d.tasks?.some(t=>!t.done&&t.date===iso());
  if(hasLesson())return ['📖 كمّل درسك المختار',`${activeLesson().subject} — ${activeLesson().title}`,'studytools','افتح أدوات الدرس'];
  if(hasPending)return ['📅 عندك مهمة النهارده','افتح مخطط المذاكرة وحدد مهمة تبدأ بيها.','planner','شوف مهمة اليوم'];
  return ['🚀 ابدأ رحلة جديدة','اختار الدرس وبعده كل الأدوات هتكون جاهزة ليك.','studytools','اختار درس'];
 }
 function stepper(step){const steps=['اختار درس','ذاكر','استرح','راجع'];return `<div class="tf-mini-steps" aria-label="مراحل الرحلة">${steps.map((x,i)=>`<span class="${i===step?'current':''}">${i+1}. ${x}</span>`).join('')}</div>`;}
 const oldHome=VIEWS.home;
 VIEWS.home=()=>{
  const [label,desc,dest,cta]=nextStep();
  const f=storage(),step=(d.timer.since?1:f.restDue?2:hasLesson()?3:0);
  return `<section class="tf-journey-card"><div><span class="tf-eyebrow">🧭 رحلتك في Tmoh</span><h2>${safe(label)}</h2><p>${safe(desc)}</p>${stepper(step)}</div><div class="tf-journey-action"><button class="primary" data-go="${dest}">${safe(cta)}</button></div></section>`+oldHome();
 };
 const oldFocus=VIEWS.focus;
 VIEWS.focus=()=>`<div class="tf-inline-guide">⏱️ اختار المادة والدرس، وابدأ المذاكرة. بعد ${Math.min(60,Math.max(5,Number(d.timer.goal)||60))} دقيقة هنفكّرك براحة. <button class="soft" data-go="rest">🌿 وقت الراحة</button></div>`+oldFocus();
 for(const [key,items] of [
  ['studytools',[['⏱️ ابدأ المذاكرة','focus'],['📅 مهامك','planner']]],
  ['planner',[['📖 اختار درس','studytools'],['⏱️ ابدأ الجلسة','focus']]],
  ['smartbacklog',[['📅 خطتي اليومية','planner'],['⏱️ ابدأ مذاكرة','focus']]],
  ['exams',[['⚑ راجع أخطاءك','mistakes'],['🗂️ الفلاش كاردز','cards']]],
  ['mistakes',[['📖 أدوات الدرس','studytools'],['🗂️ كروت مراجعة','cards']]],
  ['cards',[['✅ اختبر نفسك','exams'],['📖 شرح الدرس','studytools']]],
  ['rewards',[['📅 مهامك','planner'],['🏆 إنجازاتك','achievements']]],
  ['movement',[['🌿 مؤقت الراحة','rest'],['📖 متابعة المذاكرة','focus']]],
  ['weekstory',[['🏆 إنجازاتك','achievements'],['📖 ارجع للدرس','studytools']]]
 ]){
  if(!VIEWS[key])continue;const original=VIEWS[key];
  VIEWS[key]=()=>original()+`<section class="tf-context-links"><p>🔗 الخطوة المناسبة بعد القسم ده</p><div class="tf-actions">${items.map(x=>`<button type="button" class="soft" data-go="${x[1]}">${x[0]}</button>`).join('')}</div></section>`;
 }
 function completedBreak(){const f=storage(),b=f.break;if(!b||b.done)return false;
  if(b.startedAt&&now()-b.startedAt>=b.minutes*60000){b.done=true;f.restDue=false;f.breakLog=(f.breakLog||[]).slice(-100);f.breakLog.push({at:now(),minutes:b.minutes});save();return true;}return false;
 }
 function renderRest(){if(page==='rest'){render('rest');}}
 document.getElementById('content')?.addEventListener('click',e=>{
  const btn=e.target.closest('[data-tf]');if(!btn||!d)return;
  const f=storage(),b=f.break||{minutes:5,startedAt:null,done:false},op=btn.dataset.tf;
  if(op==='endStudy'){acts.tend();return;}
  if(op==='duration'&&!b.startedAt){b.minutes=Math.max(5,Math.min(15,Number(btn.dataset.min)||5));f.break=b;save();renderRest();return;}
  if(op==='startBreak'){
   if(d.timer.since)return msg('احفظ جلسة المذاكرة الأول');
   if(!b.startedAt){b.startedAt=now();b.done=false;f.break=b;f.restDue=true;save();renderRest();}return;
  }
  if(op==='finishEarly'){if(b.startedAt&&!b.done){b.done=true;f.restDue=false;b.finishedEarly=true;save();renderRest();}return;}
  if(op==='backToStudy'){if(b.startedAt&&!b.done){if(!confirm('وقت الراحة لسه شغال. تحب تنهيه وترجع للمذاكرة؟'))return;b.done=true;f.restDue=false;b.finishedEarly=true;save();}else if(f.restDue&&!b.startedAt){f.restDue=false;save();}go('focus');return;}
 });
 setInterval(()=>{
  if(!d||page!=='rest')return;
  if(completedBreak())return renderRest();
  const b=storage().break;if(!b||!b.startedAt||b.done)return;
  const remaining=Math.max(0,b.minutes*60-Math.floor((now()-b.startedAt)/1000));
  const clock=$$one('#tfBreakClock'),bar=$$one('#tfBreakBar');if(clock)clock.textContent=format(remaining);if(bar)bar.style.width=(100-remaining/(b.minutes*60)*100)+'%';
 },1000);
 // Forward-compatible repair for a direct /rest deep link, and for navigation after profile switching.
 if(d){groupNav();if(location.hash==='#/rest')route();}
 window.TMOH_FLOW={groupNav,nextStep,checkBreak:completedBreak};
})();
