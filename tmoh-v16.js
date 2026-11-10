/* Tmoh V16 — six-section student journey, grounded study tools and truthful ChatBook UI.
 * Additive only: tmoh2 remains the primary profile storage; existing worker unchanged.
 */
(function(){
'use strict';
if(typeof VIEWS==='undefined'||typeof d==='undefined'||typeof PAGES==='undefined')return;
const E=x=>esc(String(x??''));
const DAYMS=86400000;
const SUBJECT_ICONS={'اللغة العربية':'📖','اللغة الإنجليزية':'🌍','اللغة الأجنبية الأولى':'🌍','الرياضيات':'📐','الفيزياء':'⚡','الكيمياء':'🧪','الأحياء':'🌿','العلوم':'🔬','التاريخ':'🏺','الجغرافيا':'🗺️','الفلسفة والمنطق':'💭','العلوم المتكاملة':'🌌','البرمجة والذكاء الاصطناعي':'💻'};
const ico=s=>SUBJECT_ICONS[s]||'📘';
const daysAgo=(n=0)=>{let dt=new Date();dt.setHours(0,0,0,0);dt.setDate(dt.getDate()-n);return dt.getTime()};
const localDay=x=>{let dt=new Date(x);return Number.isFinite(+dt)?`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`:''};
const today=()=>localDay(Date.now());
const getStudy=()=>{if(!d.tm16Study||typeof d.tm16Study!=='object')d.tm16Study={};return d.tm16Study};
const lessonLibrary=()=>window.TMOH_STUDY_CONTENT?.lessons||[];
const gradeNum=()=>({'الصف الأول الثانوي':1,'الصف الثاني الثانوي':2,'الصف الثالث الثانوي':3})[d.grade]||0;
const norm=x=>String(x||'').replace(/\s+/g,' ').trim();
const lessonList=subject=>{
 let list=lessonLibrary().filter(l=>l.grade===gradeNum()&&norm(l.subject)===norm(subject)).map(l=>({id:l.id,title:l.title,unit:l.unit,source:l}));
 let existing=new Set(list.map(l=>norm(l.title)));
 for(const u of d.curriculum?.[subject]||[])for(const t of u.lessons||[]){if(!existing.has(norm(t))){list.push({id:'',title:t,unit:u.unit,source:null});existing.add(norm(t))}}
 return list;
};
const selectedLesson=()=>lessonList(getStudy().subject).find(l=>l.id?l.id===getStudy().lessonId:(!getStudy().lessonId&&l.title===getStudy().lessonTitle))||null;
const subjects=()=>[...new Set((d.subjects||[]).filter(Boolean))];
const weekSessions=()=>d.sessions.filter(x=>Number(x.end)>=daysAgo(6));
const studyMinutes=s=>Math.round((s||d.sessions).reduce((a,x)=>a+(Number(x.ms)||0),0)/60000);
const completion=()=>{
 const keys=new Set(Object.keys(d.done||{}));
 const comp=d.studyV1?.completed||{};
 const total=lessons().length;
 const names=Object.entries(comp).filter(([k,v])=>v).length;
 return {count:keys.size+names,total:total||null};
};
const points=()=>Math.max(0,xp());
const achievementList=()=>badges().filter(x=>x[2]);
const picBadge=(n,title,sub,icon)=>`<div class="tv16-stat"><span class="tv16-stat-ico">${icon}</span><b>${E(n)}</b><span>${E(title)}</span><small>${E(sub)}</small></div>`;
const panel=(title,content,extra='')=>`<section class="tv16-panel"><div class="tv16-panel-header"><h2>${title}</h2>${extra}</div>${content}</section>`;
const action=(title,icon,p,desc)=>`<button type="button" class="tv16-action" data-go="${p}"><span class="tv16-action-emoji">${icon}</span><strong>${title}</strong><small>${desc}</small></button>`;
const empty=x=>`<p class="tv16-empty">${x}</p>`;
const weekStats=()=>{
 const start=localDay(daysAgo(6)),end=today(),tasks=d.tasks.filter(t=>t.date>=start&&t.date<=end),done=tasks.filter(t=>t.done),minutes=studyMinutes(weekSessions());
 return {tasks,done,minutes,rate:tasks.length?Math.round(done.length/tasks.length*100):null};
};
const badgeText=()=>`<div class="tv16-inline-badges"><span>🎓 ${E(d.grade)}</span><span>${E(d.system)}</span>${d.demo?'<span>🧪 حساب تجريبي</span>':''}</div>`;
const lastMood=()=>[...(d.feelings||[])].filter(x=>x&&x.value).sort((a,b)=>(b.at||0)-(a.at||0))[0];
const taskMarkup=list=>list.length?list.map(t=>`<label class="tv16-task ${t.done?'tv16-task-done':''}"><input type="checkbox" data-v16="task" data-id="${E(t.id)}" ${t.done?'checked':''}><span><strong>${E(t.title)}</strong><small>${E(t.subject||'عام')}${t.time?' · '+E(t.time):''}</small></span><span class="tv16-task-status">${t.done?'مكتملة':'مفتوحة'}</span></label>`).join(''):empty('مفيش مهام محددة لليوم. تقدر تضيف مهمة من مخطط المذاكرة.');
const weeklyBars=()=>{
 const records=Array.from({length:7},(_,i)=>{let f=daysAgo(6-i),v=d.sessions.filter(s=>s.end>=f&&s.end<f+DAYMS);return {day:new Date(f).toLocaleDateString('ar-EG',{weekday:'short'}),min:studyMinutes(v)}});
 const max=Math.max(1,...records.map(x=>x.min));
 return `<div class="tv16-bars" role="img" aria-label="دقائق المذاكرة في آخر 7 أيام">${records.map(x=>`<div class="tv16-bar-col"><b>${x.min||'–'}</b><div class="tv16-bar-track"><span style="height:${x.min?Math.max(4,Math.round(100*x.min/max)):0}%"></span></div><small>${E(x.day)}</small></div>`).join('')}</div>`;
};
const recentThings=()=>{
 let a=[];
 (d.sessions||[]).slice(-6).forEach(s=>a.push({at:s.end,txt:`⏱️ مذاكرة ${E(s.subject||'عام')} لمدة ${Math.round((s.ms||0)/60000)} دقيقة`}));
 (d.tasks||[]).filter(t=>t.done).slice(-5).forEach(t=>a.push({at:Date.parse(t.date||'')||0,txt:`✅ مهمة مكتملة: ${E(t.title)}`}));
 (d.rewardClaims||[]).slice(-5).forEach(g=>a.push({at:Number(g.at||g.date)||0,txt:`🎁 مكافأة مستحقة`}));
 return a.sort((x,y)=>y.at-x.at).slice(0,5).map(x=>`<p class="tv16-feed-item">${x.txt}</p>`).join('')||empty('لسه مفيش إنجازات مسجلة. أول خطوة تبدأ بجلسة واحدة.');
};
function home(){
 const wk=weekStats(),compl=completion(),last=d.sessions.at(-1),feel=lastMood(),left=d.tasks.filter(t=>!t.done).length;
 const first=d.name?.trim().split(/\s+/)[0]||'يا بطل',greet=new Date().getHours()<12?'صباح الخير':new Date().getHours()<18?'مساء النشاط':'مساء الخير';
 const level=Math.floor(points()/100)+1;
 return `<div class="tv16-root tv16-home">
 <section class="tv16-hero"><div>${badgeText()}<p class="tv16-kicker">✦ يوم جديد في رحلتك</p><h1>${greet} يا ${E(first)} 👋</h1><p>🚀 ${d.dream?`حلمك إنك تبقى <b>${E(d.dream)}</b>، وكل خطوة واقعية بتقربك منه.`:'اختار حلمك من ملفك، وكل خطوة مذاكرة هتقربك منه.'}</p><div class="tv16-hero-buttons"><button class="primary" data-go="studyhub">📚 ابدأ مذاكرتك</button><button class="soft" data-go="journey">🚀 شوف تقدمك</button></div></div><div class="tv16-hero-art" aria-hidden="true">✨<span>🚀</span>🌙</div></section>
 <div class="tv16-stat-grid">${picBadge(wk.rate===null?'—':wk.rate+'%','إنجاز الأسبوع',wk.tasks.length?`${wk.done.length} من ${wk.tasks.length} مهمة محددة`:'لا توجد مهام هذا الأسبوع','🎯')}${picBadge((studyMinutes(d.sessions)/60).toFixed(1),'ساعات المذاكرة',`${d.sessions.length} جلسة محفوظة`,'⏱️')}${picBadge(left,'المهام المتبقية','مهمة لم تكتمل بعد','📋')}${picBadge(points(),'نقاط الإنجاز',`المستوى ${level}`,'⭐')}</div>
 <div class="tv16-two">${panel('📋 مهام اليوم',taskMarkup(d.tasks.filter(x=>x.date===today())),`<button class="soft tv16-mini" data-go="planner">كل المهام</button>`)}${panel('📈 تطور إنجازك الأسبوعي',weeklyBars())}</div>
 <div class="tv16-two">${panel('💜 رحلتك النفسية',`<p class="tv16-muted">${feel?'آخر شعور: <b>'+E(feel.value)+'</b>':'تقدر تسجل شعورك لو حابب، وده اختياري.'}</p><div class="tv16-moods">${[['😊','سعيد'],['🌿','أشعر بالراحة'],['🚀','أشعر بالحماس'],['😴','أشعر بالتعب'],['😐','أشعر بالملل']].map(x=>`<button type="button" data-v16="mood" data-value="${E(x[1])}">${x[0]}<small>${x[1]}</small></button>`).join('')}</div>`)}${panel('🕒 آخر جلسة مذاكرة',last?`<div class="tv16-last"><div class="tv16-last-emoji">${ico(last.subject)}</div><div><h3>${E(last.subject||'مذاكرة عامة')}</h3><p>${E(last.lesson||'بدون درس محدد')}</p><small>${Math.round(last.ms/60000)} دقيقة · ${new Date(last.end).toLocaleDateString('ar-EG')}</small></div></div><button class="primary" data-go="studyhub">استكمل المذاكرة</button>`:empty('لسه مفيش جلسة محفوظة. يلا نبدأ!'))}</div>
 <div class="tv16-two">${panel('🏅 آخر إنجازاتك',recentThings())}${panel('🌟 مستواك ومكافآتك',`<div class="tv16-level-line"><b>المستوى ${level}</b><span>${points()%100} / 100 نقطة للمستوى التالي</span></div><div class="tv16-progress"><span style="width:${points()%100}%"></span></div><p class="tv16-muted">${achievementList().length} وسام مكتسب · ${d.rewardClaims?.length||0} مكافأة مستحقة</p><button class="soft" data-go="rewards">افتح خزنة المكافآت 🎁</button>`)}</div></div>`;
}
function nav(){
 const aside=document.getElementById('sidebar');if(!aside)return;
 let el=document.getElementById('tv16Nav');if(!el){el=document.createElement('nav');el.id='tv16Nav';el.setAttribute('aria-label','الأقسام الرئيسية');aside.insertBefore(el,document.getElementById('nav'));}
 const links=[['home','⌂','الرئيسية'],['studyhub','📚','المذاكرة'],['chatbook','🤖','ChatBook'],['rewards','🏆','التحفيز والمكافآت'],['journey','🚀','رحلتي وتقدمي'],['utilities','🧰','أدوات أخرى']];
 el.innerHTML=links.map(([key,icon,name])=>`<button type="button" data-tv16-nav="${key}"><span>${icon}</span>${name}</button>`).join('');
 const set=()=>{const hash=location.hash.replace(/^#\//,'')||'home';const group=({assistant:'chatbook',focus:'studyhub',rest:'studyhub',studytools:'studyhub',curriculum:'studyhub',books:'studyhub',exams:'studyhub',mistakes:'studyhub',backlog:'studyhub',smartbacklog:'studyhub',planner:'studyhub',notes:'utilities',mylibrary:'utilities',settings:'utilities',report:'journey',analytics:'journey',achievements:'rewards',cards:'studyhub'})[hash]||hash;el.querySelectorAll('button').forEach(b=>{const active=b.dataset.tv16Nav===group;b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})};set();
 if(!el.dataset.bound){el.dataset.bound='1';el.addEventListener('click',e=>{let b=e.target.closest('[data-tv16-nav]');if(b)go(b.dataset.tv16Nav)});window.addEventListener('hashchange',set);}
}
function study(){
 const state=getStudy(),sub=state.subject,subjectList=subjects();const current=selectedLesson();
 if(sub&&!subjectList.includes(sub)){state.subject='';state.lessonId='';state.lessonTitle='';return study()}
 if(!sub)return `<div class="tv16-root"><div class="tv16-pagehead"><div><p class="tv16-kicker">📚 منطقة المذاكرة</p><h1>اختار المادة اللي هتذاكرها</h1><p>موادك حسب ملفك: ${E(d.grade)} · ${E(d.system)}. كل الأدوات في مكان واحد.</p></div><button class="soft" data-go="settings">تعديل المواد</button></div><div class="tv16-subject-grid">${subjectList.map(s=>`<button class="tv16-subject" data-v16="subject" data-subject="${E(s)}"><span>${ico(s)}</span><strong>${E(s)}</strong><small>${lessonList(s).filter(x=>!!x.source).length} درس تأسيسي متاح</small></button>`).join('')||empty('مفيش مواد في ملفك. أضف موادك من الإعدادات.')}</div>${panel('📕 مكتبة المناهج',`<p class="tv16-muted">الكتب المنشورة في مكتبة طموح العامة متاحة لكل الطلاب، وتقدر تضيف كتبك الشخصية كمان. ليست كل الكتب الرسمية متوفرة بعد.</p><button class="soft" data-go="books">افتح الكتب حسب الصف والمادة</button>`)}</div>`;
 const lessonsAvailable=lessonList(sub);
 return `<div class="tv16-root"><div class="tv16-pagehead"><div><p class="tv16-kicker">📚 المذاكرة › ${E(sub)}</p><h1>${ico(sub)} ${E(sub)}</h1><p>اختار الدرس مرة واحدة، وبعدها كل الأدوات هتشتغل عليه.</p></div><button class="soft" data-v16="back">← كل المواد</button></div>
 <div class="tv16-panel tv16-choose"><label for="tv16Lesson">الدرس الحالي</label><select id="tv16Lesson"><option value="">-- اختار الدرس --</option>${lessonsAvailable.map((x,i)=>`<option value="${i}" ${(x.id?state.lessonId===x.id:!state.lessonId&&state.lessonTitle===x.title)?'selected':''}>${E(x.unit)} · ${E(x.title)}${x.source?'':' (بدون شرح موثق)'}</option>`).join('')}</select><p class="tv16-muted">${lessonsAvailable.length?'الدروس النصية هنا تأسيسية، وليست كتب الوزارة الرسمية الكاملة.':'لا توجد دروس نصية متاحة للمادة دي حاليًا. مؤقت المذاكرة ومراجعة أخطائك والتراكمات ما زالوا متاحين.'}</p><button type="button" class="soft tv16-mini" data-go="books">📕 افتح كتاب المادة</button></div>
 <div class="tv16-tool-grid">
 ${[['timer','⏱️','ابدأ العد','مؤقت مع راحة بعد الجلسة'],['summary','📝','لخصلي','نص أو صوت أو خريطة'],['explain','💡','اشرحلي','شرح من الدرس المختار'],['quiz','📋','اعملي امتحان','أسئلة وتسجيل النتيجة'],['mistakes','🎯','راجع أخطائي','إجاباتك وتصحيحها'],['backlog','📚','قولي تراكماتي','المهام والدروس المتأخرة']].map(x=>`<button class="tv16-tool" data-v16="tool" data-tool="${x[0]}"><span>${x[1]}</span><strong>${x[2]}</strong><small>${x[3]}</small></button>`).join('')}
 </div>${state.mode?toolResult(state.mode,current):''}</div>`;
}
function mapView(l){return `<div class="tv16-mindmap"><div class="tv16-mindmain">${E(l.title)}</div><div class="tv16-mindpoints">${(l.points||[]).map(p=>`<div>${E(p)}</div>`).join('')}</div></div>`}
function toolResult(mode,l){
 const s=getStudy();const needSource=['summary','explain','quiz'].includes(mode);
 if(needSource&&!l?.source)return panel('📖 محتوى الدرس غير متاح',`<p>علشان ما نديكش معلومات غلط، مش هنولّد شرح أو امتحان من غير نص درس قابل للتحقق. اختار درسًا تأسيسيًا متاحًا أو أضف كتابك إلى المكتبة.</p><button class="soft" data-go="books">📕 إضافة كتاب / مصدر</button>`);
 if(mode==='summary'){
  const f=s.format||'text',x=l.source;
  return panel('📝 تلخيص: '+E(l.title),`<div class="tv16-format">${[['text','📝 نصي'],['audio','🔊 صوتي'],['visual','🧠 مصوّر']].map(z=>`<button type="button" class="${f===z[0]?'primary':'soft'}" data-v16="format" data-format="${z[0]}">${z[1]}</button>`).join('')}</div>${f==='visual'?mapView(x):`<div class="tv16-source-summary"><b>${E(x.intro)}</b><ul>${(x.points||[]).map(p=>`<li>${E(p)}</li>`).join('')}</ul><p>💡 ${E(x.detail)}</p></div>`}${f==='audio'?'<button class="primary" data-v16="listen">▶ استمع للتلخيص</button><button class="soft" data-v16="stopVoice">■ إيقاف الصوت</button><p class="tv16-muted">القراءة الصوتية تعتمد على الأصوات المتاحة في جهازك.</p>':''}<p class="tv16-disclaimer">المصدر: درس تأسيسي أصلي من طموح؛ ليس نقلًا عن كتاب الوزارة.</p>`)
 }
 if(mode==='explain'){const x=l.source;return panel('💡 شرح '+E(l.title),`<p class="tv16-big-intro">${E(x.intro)}</p><h3>افهم الفكرة</h3><p>${E(x.detail)}</p><h3>أهم النقاط</h3><ul>${x.points.map(p=>`<li>${E(p)}</li>`).join('')}</ul><h3>مثال تطبيقي</h3><p>${E(x.example)}</p><p class="tv16-disclaimer">المصدر: درس تأسيسي أصلي من طموح. لو محتاج شرح أكتر، افتح ChatBook مع سياق الدرس، وتحقق من أي إضافة خارج النص.</p><button class="primary" data-v16="askLesson">🤖 ناقش الدرس في ChatBook</button>`)}
 if(mode==='quiz'){
  const x=l.source,qs=x.questions||[];
  if(!qs.length)return panel('📋 تدريب '+E(l.title),`<p>المصدر الحالي مفيهوش أسئلة مُراجَعة للدرس ده.</p><button class="soft" data-go="exams">افتح بنك أسئلتك</button>`);
  return panel('📋 اختبر فهمك: '+E(l.title),`<p class="tv16-muted">${qs.length} أسئلة تأسيسية محفوظة مع الدرس. ليست امتحان وزارة رسميًا.</p><form id="tv16QuizForm">${qs.map((q,i)=>`<fieldset class="tv16-question"><legend>${i+1}. ${E(q.question)}</legend>${q.choices.map((opt,j)=>`<label><input required type="radio" name="q${i}" value="${j}"> ${E(opt)}</label>`).join('')}</fieldset>`).join('')}<button class="primary" type="submit">صحح واحفظ نتيجتي</button></form><div id="tv16QuizResult"></div>`);
 }
 if(mode==='mistakes'){
  const errs=d.mistakes.filter(m=>m.subject===s.subject&&(!l||!m.lesson||norm(m.lesson)===norm(l.title)));return panel('🎯 أخطائي في '+E(s.subject),`${errs.length?errs.map(m=>`<div class="tv16-error"><strong>${E(m.q)}</strong><p>إجابتك: ${E(m.mine||'—')} · الإجابة الصحيحة: <b>${E(m.right)}</b></p><small>${m.rev?'✅ تمت مراجعة الخطأ':'⏳ محتاج مراجعة'}</small></div>`).join(''):empty('لسه مفيش أخطاء مسجلة في المادة دي.')}<button class="soft" data-go="mistakes">افتح بنك الأخطاء الكامل</button>`)
 }
 if(mode==='backlog'){
  const bs=d.backlog.filter(b=>b.subject===s.subject&&(b.subs||[]).some(x=>!x.done));const tasks=d.tasks.filter(t=>t.subject===s.subject&&!t.done);return panel('📚 تراكماتي في '+E(s.subject),`${bs.map(b=>`<p class="tv16-feed-item"><b>${E(b.title)}</b> · ${b.subs.filter(x=>!x.done).length} خطوة متبقية ${b.due?'· الموعد '+E(b.due):''}</p>`).join('')}${tasks.map(t=>`<p class="tv16-feed-item">📋 ${E(t.title)} ${t.date?'· '+E(t.date):''}</p>`).join('')}${!bs.length&&!tasks.length?empty('مفيش تراكمات أو مهام مفتوحة مسجلة للمادة دي.'):''}<button class="primary" data-go="smartbacklog">📅 اعمل خطة للتراكمات</button>`)
 }
 return '';
}
const oldAssistant=VIEWS.assistant;
function chatbook(){
 if(aiState==='unknown'&&CONFIG.AI_URL){aiState='checking';pingAI()}
 const s=getStudy(),l=selectedLesson();
 const modes=[['ask','💬','اسألني أي سؤال','اسأل عن معلومة أو درس'],['photo','📸','صوّر سؤالك','قراءة الصور تحتاج خدمة صور'],['pdf','📄','ارفع ملف PDF','من مكتبتي — المصدر يفضل على جهازك'],['understand','🧠','فهمني المعلومة','شرح خطوة بخطوة'],['review','🔎','حلل إجابتي','ناقش الخطأ وسببه'],['help','✍️','ساعدني في الحل','تلميحات بدل حل جاهز'],['translate','🌐','ترجملي','معاني الكلمات والسياق'],['discuss','📚','ناقشني في درس','أسئلة متدرجة أثناء الحوار']];
 return `<div class="tv16-root tv16-chatbook"><div class="tv16-chathead"><p>🤖 ChatBook</p><h1>مساعدك الذكي في رحلة التعلم</h1><span>اسأل، افهم، ناقش، وتعلم</span></div><div class="tv16-chatmodes">${modes.map(x=>`<button type="button" data-v16="chatmode" data-mode="${x[0]}"><span>${x[1]}</span><strong>${x[2]}</strong><small>${x[3]}</small></button>`).join('')}</div><p class="tv16-chat-caution">⚠️ المساعد الحالي يرد نصيًا وقد يُخطئ في الإجابات. المحتوى الرسمي الكامل ودعم الصور/PDF المباشر لم يُربطا بخدمة Cloudflare بعد؛ لا تنسب إليه مصدرًا لم يستخدمه.</p>${s.subject&&l?`<div class="tv16-panel"><p>📖 الدرس المختار: <b>${E(s.subject)} — ${E(l.title)}</b></p><button class="soft" data-v16="chatmode" data-mode="discuss">ناقشني فيه</button></div>`:''}<div id="tv16-chat-content">${oldAssistant()}</div></div>`;
}
const oldRewards=VIEWS.rewards,oldJourney=VIEWS.journey;
function rewards(){const lev=Math.floor(points()/100)+1,claim=d.rewardClaims?.length||0,awards=achievementList();
 return `<div class="tv16-root"><div class="tv16-pagehead"><div><p class="tv16-kicker">🏆 التحفيز والمكافآت</p><h1>كل إنجاز صغير بيقربك من حلمك</h1><p>تحديات معرفية ومكافآت آمنة على حسب هوايتك، من غير ضغط أو مقارنة.</p></div></div><div class="tv16-stat-grid tv16-rewards-stats">${picBadge(points(),'نقاط الإنجاز','من النشاط الدراسي الحقيقي','⭐')}${picBadge(awards.length,'أوسمتك','شارات مكتسبة','🏅')}${picBadge(lev,'مستواك','كل 100 نقطة مستوى','🚀')}${picBadge(claim,'مكافآتك','مكافآت فتحتها','🎁')}</div>${panel('📈 تقدم المستوى',`<div class="tv16-level-line"><b>المستوى ${lev}</b><span>${points()%100} / 100</span></div><div class="tv16-progress"><span style="width:${points()%100}%"></span></div>`)}${panel('🎁 خزنة المكافآت',`<p>هوايتك الحالية: <strong>${E(d.hobby||'اختار هوايتك من ملفك')}</strong>. المكافآت محتوى وتجارب معرفية وليست مشتريات حقيقية.</p><div class="tv16-reward-preview">${[['📚','القراءة'],['🎨','الرسم'],['💻','البرمجة'],['✍️','الكتابة']].map(x=>`<span>${x[0]} ${x[1]}</span>`).join('')}</div><button class="primary" data-v16="oldRewards">عرض متجر المكافآت والتحديات</button>`)}<div id="tv16OldRewards" hidden>${oldRewards()}</div></div>`;
}
function journey(){const w=weekStats(),c=completion(),recent=weekSessions(),sg={};for(const s of recent)sg[s.subject||'عام']=(sg[s.subject||'عام']||0)+(s.ms||0)/60000;const last=lastMood();
 return `<div class="tv16-root"><div class="tv16-pagehead"><div><p class="tv16-kicker">🚀 رحلتي وتقدمي</p><h1>كل خطوة بتقربك من حلمك</h1><p>${d.dream?'حلمك: '+E(d.dream):'حدد حلمك من الملف الشخصي علشان نربط الأهداف بيه.'}</p></div><button class="soft" data-go="report">تقرير الأداء الكامل</button></div><div class="tv16-stat-grid">${picBadge(d.sessions.length,'جلسة مذاكرة','إجمالي الجلسات','⏱️')}${picBadge((studyMinutes(d.sessions)/60).toFixed(1),'ساعة مذاكرة','ساعات محفوظة','📚')}${picBadge(c.count,'درس مكتمل','من سجلات التقدم','✅')}${picBadge(w.rate===null?'—':w.rate+'%','إنجاز الأسبوع',`${w.done.length}/${w.tasks.length} مهمة`,'🎯')}</div><div class="tv16-two">${panel('📊 ماذا أنجزت هذا الأسبوع؟',`<p>${w.done.length} مهمة من أصل ${w.tasks.length} مهمة مجدولة، و${w.minutes} دقيقة مذاكرة محفوظة.</p><h3>المواد اللي اتقدمت فيها</h3>${Object.entries(sg).sort((a,b)=>b[1]-a[1]).map(x=>`<p class="tv16-feed-item">${E(x[0])}: ${Math.round(x[1])} دقيقة</p>`).join('')||empty('لسه مفيش جلسات هذا الأسبوع.')}`)}${panel('📝 ما الذي يحتاج تحسينًا؟',`<p>المهام غير المنجزة هذا الأسبوع: <b>${w.tasks.length-w.done.length}</b></p><p>أخطاء تحتاج مراجعة: <b>${d.mistakes.filter(m=>!m.rev).length}</b></p><p>الهدف الواقعي المقترح: ${w.minutes?`استمر على ${Math.max(15,Math.round(w.minutes/7))} دقيقة يوميًا، وراجع درسًا واحدًا.`:'ابدأ بـ15 دقيقة يوميًا ومهمة بسيطة واحدة.'}</p><button class="soft" data-go="smartbacklog">نظّم التراكمات</button>`)}</div><div class="tv16-two">${panel('💜 رحلتي النفسية',last?`<p>آخر شعور سجلته: <b>${E(last.value)}</b></p><p class="tv16-muted">سجل شخصي اختياري، مش تشخيص نفسي.</p>`:empty('لسه مفيش تسجيل مشاعر.'))}${panel('🎖️ آخر إنجازاتي',recentThings())}</div>${panel('🌟 رحلتي نحو حلمي',`<p>${d.dream?'🎯 '+E(d.dream):'حدد حلمك من ملفك أولًا.'}</p><p>أهداف مكتملة: ${(d.dreamGoals||[]).filter(x=>x.done).length} من ${(d.dreamGoals||[]).length}</p><button class="primary" data-v16="oldJourney">فتح أهدافي وتفاصيل رحلتي</button>`)}<div id="tv16OldJourney" hidden>${oldJourney()}</div></div>`;
}
function utilities(){const items=[['calc','🧮','الآلة الحاسبة','حسابات بسيطة وآمنة'],['notes','📝','ملاحظاتي','حفظ الأفكار والملاحظات'],['mylibrary','📚','مكتبتي','ملخصات وملفات شخصية'],['calendar','📅','التقويم','المهام والمواعيد'],['dictionary','🌐','القاموس','كلمات ومعاني مفيدة'],['settings','👤','ملفي الشخصي','تعديل البيانات والهواية'],['settings','⚙️','الإعدادات','اللغة والنسخ الاحتياطي'],['support','🛟','المساعدة والدعم','ملاحظة محلية واقتراح']];return `<div class="tv16-root"><div class="tv16-pagehead"><div><p class="tv16-kicker">🧰 الأدوات المساعدة</p><h1>كل أدواتك في مكان واحد</h1><p>من غير تكرار أدوات المذاكرة أو ChatBook.</p></div></div><div class="tv16-utilities">${items.map(x=>action(x[2],x[1],x[0],x[3])).join('')}</div><details class="tv16-panel tv16-more"><summary>✨ أقسام إضافية من طموح (الوظائف القديمة محفوظة)</summary><div class="tv16-morelinks">${[['movement','🚶 الحركة'],['weekstory','📷 ذكريات الأسبوع'],['focusroom','🕯️ غرفة التركيز'],['quickquiz','⚡ اختبار سريع'],['cards','🗂️ كروت المراجعة'],['health','🌿 راحتي'],['cloudsync','☁️ المزامنة الاختيارية'],['league','🏆 دوري الأصدقاء'],['library','🔗 روابط المكتبة'],['bacc','🎓 البكالوريا']].filter(x=>VIEWS[x[0]]).map(x=>`<button class="soft" data-go="${x[0]}">${x[1]}</button>`).join('')}</div></details></div>`}
function calc(){return `<div class="tv16-root">${panel('🧮 الآلة الحاسبة',`<form id="tv16Calc" class="tv16-calc"><input id="tv16A" type="number" step="any" required placeholder="العدد الأول"><select id="tv16Op"><option value="+">+</option><option value="-">−</option><option value="*">×</option><option value="/">÷</option></select><input id="tv16B" type="number" step="any" required placeholder="العدد الثاني"><button class="primary">احسب</button></form><p id="tv16CalcAnswer" class="tv16-answer" role="status"></p>`)}<button class="soft" data-go="utilities">← أدوات أخرى</button></div>`}
function calendar(){return `<div class="tv16-root">${panel('📅 تقويم المهام والمواعيد',`<form id="tv16EventForm" class="tv16-eventform"><input name="title" maxlength="100" required placeholder="موعد امتحان أو واجب"><input name="date" type="date" required value="${today()}"><button class="primary">أضف الموعد</button></form>${[...d.tasks.map(t=>({id:null,title:t.title,date:t.date,done:t.done})),...(d.tm16Events||[])].filter(x=>x.date).sort((a,b)=>a.date.localeCompare(b.date)).map(x=>`<p class="tv16-feed-item">📌 ${E(x.date)} · ${E(x.title)} ${x.done?'✅':''}${x.id?`<button class="soft tv16-mini" data-v16="removeEvent" data-id="${E(x.id)}">حذف</button>`:''}</p>`).join('')||empty('مافيش مواعيد مسجلة.')}`)}<button class="soft" data-go="utilities">← أدوات أخرى</button></div>`}
function dictionary(){const a=[['achieve','يحقق'],['dream','حلم'],['study','يذاكر'],['focus','تركيز'],['progress','تقدم'],['goal','هدف'],['مذاكرة','study'],['هدف','goal'],['إنجاز','achievement'],['طموح','ambition']];return `<div class="tv16-root">${panel('🌍 قاموس مبسط',`<form id="tv16DictForm" class="tv16-eventform"><input id="tv16Word" required placeholder="ابحث عن كلمة عربية أو إنجليزية"><button class="primary">ابحث</button></form><p id="tv16DictAnswer" role="status">القاموس المحلي محدود بكلمات شائعة فقط. للترجمة الحرة استخدم ChatBook مع مراجعة النتيجة.</p><div class="tv16-dictionary-list">${a.slice(0,6).map(x=>`<span>${x[0]} — ${x[1]}</span>`).join('')}</div>`)}<button class="soft" data-go="chatbook">🤖 ترجمة نص مع ChatBook</button></div>`}
function support(){return `<div class="tv16-root">${panel('🛟 المساعدة والدعم',`<p class="tv16-disclaimer">هذا النموذج يحفظ الاقتراح محليًا في ملفك فقط، ولا يرسله إلى فريق دعم حقيقي. لن نعرض رسالة "تم الإرسال" بدون خدمة مُتصلة.</p><form id="tv16SupportForm"><label>اكتب المشكلة أو الاقتراح<textarea name="message" required minlength="5" maxlength="1500" rows="4" placeholder="احكيلنا المشكلة..."></textarea></label><button class="primary">احفظ الاقتراح على الجهاز</button></form>${(d.tm16Support||[]).slice(-8).reverse().map(x=>`<p class="tv16-feed-item">${E(x.text)} <small>${E(x.date)}</small></p>`).join('')||empty('مافيش اقتراحات محفوظة.')}`)}<button class="soft" data-go="utilities">← أدوات أخرى</button></div>`}
// Register route titles so the previous router and existing feature pages keep working.
[['studyhub','📚 المذاكرة',study],['chatbook','🤖 ChatBook',chatbook],['utilities','🧰 أدوات أخرى',utilities],['calc','🧮 الآلة الحاسبة',calc],['calendar','📅 التقويم',calendar],['dictionary','🌐 القاموس',dictionary],['support','🛟 المساعدة والدعم',support]].forEach(([key,label,fn])=>{if(!PAGES.some(x=>x[0]===key))PAGES.push([key,label]);VIEWS[key]=fn});
VIEWS.home=home;VIEWS.rewards=rewards;VIEWS.journey=journey;VIEWS.assistant=chatbook;
const content=document.getElementById('content');
content.addEventListener('click',e=>{
 const b=e.target.closest('[data-v16]');if(!b||!d)return;
 const a=b.dataset.v16,s=getStudy(),l=selectedLesson();
 if(a==='task')return;
 if(a==='mood'){d.feelings=d.feelings||[];d.feelings.push({value:b.dataset.value,date:today(),at:Date.now()});save();render('home');return msg('اتسجل شعورك على جهازك 💜')}
 if(a==='subject'){s.subject=b.dataset.subject;s.lessonId='';s.lessonTitle='';s.mode='';save();return render('studyhub')}
 if(a==='back'){s.subject='';s.lessonId='';s.lessonTitle='';s.mode='';save();return render('studyhub')}
 if(a==='tool'){
  const t=b.dataset.tool;
  if(t==='timer'){
   if(!d.timer.since){cut('subject',s.subject||'');cut('lesson',l?.title||'');}
   go('focus');return;
  }
  if(['summary','explain','quiz'].includes(t)&&!l){s.mode=t;save();return render('studyhub')}
  s.mode=t;save();return render('studyhub');
 }
 if(a==='format'){s.format=b.dataset.format;save();return render('studyhub')}
 if(a==='listen'){
  if(!l?.source||!window.speechSynthesis)return msg('جهازك لا يدعم القراءة الصوتية');
  speechSynthesis.cancel();let u=new SpeechSynthesisUtterance([l.title,l.source.intro,...l.source.points,l.source.detail].join('، '));u.lang='ar-EG';u.rate=.9;speechSynthesis.speak(u);return;
 }
 if(a==='stopVoice'){window.speechSynthesis?.cancel();return}
 if(a==='askLesson'||a==='chatmode'){
  const mode=a==='askLesson'?'discuss':b.dataset.mode;
  if(mode==='pdf')return go('books');
  if(mode==='photo')return msg('خدمة ChatBook الحالية نصية فقط؛ تصوير السؤال وإرساله للذكاء الاصطناعي غير مفعّل بعد. اكتب نص السؤال بدلًا من ذلك.');
  const v={ask:'',understand:'اشرح لي الفكرة التالية خطوة بخطوة، ولا تدّعِ وجود مصدر لم تطّلع عليه: ',review:'هذه إجابتي. حللها وحدد الصحيح والخطأ مع الأسباب: ',help:'ساعدني في حل المسألة بالتلميحات خطوة بخطوة، ولا تعطيني الحل كاملًا فورًا: ',translate:'ترجم النص الآتي مع شرح المعاني حسب السياق: ',discuss:'ناقشني في الدرس بسؤال واحد كل مرة وانتظر إجابتي: '}[mode]||'';
  const lessonContext=l?.source?`الصف ${d.grade}، ${l.subject}، درس «${l.title}». مرجع تأسيسي من طموح (غير رسمي): ${l.source.intro} ${l.source.points.join('؛ ')}. ${l.source.detail}`:l?`الصف ${d.grade}، درس «${l.title}» في ${s.subject}. ليس معك نص موثق للدرس؛ لا تنسب كلامك لمنهج الوزارة.`:'';
  const caution=' لا تخترع مصادر، واذكر إذا كانت المعلومة خارج النص؛ لا تزعم أنها من كتاب الوزارة. ';
  const prompt=(v+caution+(lessonContext?(' '+lessonContext):'')).slice(0,600);
  if(location.hash!=='#/chatbook'){go('chatbook');setTimeout(()=>{let el=document.getElementById('aq');if(el){el.value=prompt;el.focus();}},80)}else{let el=document.getElementById('aq');if(el){el.value=prompt;el.focus();el.scrollIntoView({block:'nearest',behavior:'smooth'})}}
  return;
 }
 if(a==='oldRewards'||a==='oldJourney'){const id=a==='oldRewards'?'tv16OldRewards':'tv16OldJourney';const x=document.getElementById(id);if(x){x.hidden=!x.hidden;b.textContent=x.hidden?'عرض التفاصيل':'إخفاء التفاصيل';if(!x.hidden&&id==='tv16OldRewards')initRewardCanvas()}return}
 if(a==='removeEvent'){d.tm16Events=(d.tm16Events||[]).filter(x=>x.id!==b.dataset.id);save();render('calendar');return}
});
content.addEventListener('change',e=>{
 if(!d)return;const el=e.target;
 if(el.dataset.v16==='task'){
   const t=d.tasks.find(x=>String(x.id)===String(el.dataset.id));if(!t)return;t.done=el.checked;save();render('home');return;
 }
 if(el.id==='tv16Lesson'){
  const s=getStudy(),idx=Number(el.value),l=el.value===''?null:lessonList(s.subject)[idx];
  s.lessonId=l?.id||'';s.lessonTitle=l?.title||'';s.mode='';save();render('studyhub');return;
 }
});
content.addEventListener('submit',e=>{
 if(!d)return;const f=e.target;
 if(f.id==='tv16QuizForm'){
  e.preventDefault();const l=selectedLesson();if(!l?.source)return;
  let qs=l.source.questions||[],ans=qs.map((_,i)=>{let x=f.querySelector(`input[name="q${i}"]:checked`);return x?+x.value:null});if(ans.some(x=>x===null))return msg('جاوب على كل الأسئلة الأول');
  let score=0,answerHTML=[];qs.forEach((q,i)=>{let ok=q.answer===ans[i];if(ok)score++;else{let key='tv16:'+l.source.id+':'+i+':'+Date.now();d.mistakes.push({subject:l.source.subject,lesson:l.title,cat:'تدريب تأسيسي',q:q.question,img:'',mine:q.choices[ans[i]],right:q.choices[q.answer],why:'مراجعة فهم الدرس',rev:false,date:today(),tm16id:key});}answerHTML.push(`<div class="tv16-feed-item">${ok?'✅':'❌'} ${E(q.question)}<p>${E(q.explanation||'')} — الصحيحة: ${E(q.choices[q.answer])}</p></div>`)});
  d.tm16Quizzes=d.tm16Quizzes||[];d.tm16Quizzes.push({at:Date.now(),subject:l.source.subject,lesson:l.title,sourceId:l.source.id,score,total:qs.length});save();
  f.querySelectorAll('input,button').forEach(x=>x.disabled=true);
  const result=document.getElementById('tv16QuizResult');if(result)result.innerHTML=`<h3>نتيجتك: ${score} من ${qs.length}</h3>${answerHTML.join('')}<button type="button" class="soft" data-go="mistakes">راجع أخطاءك</button>`;return;
 }
 if(f.id==='tv16Calc'){e.preventDefault();let a=Number(f.querySelector('#tv16A').value),b=Number(f.querySelector('#tv16B').value),op=f.querySelector('#tv16Op').value;let res=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:b===0?NaN:a/b;document.getElementById('tv16CalcAnswer').textContent=Number.isFinite(res)?`النتيجة: ${res}`:'لا يمكن القسمة على صفر أو إجراء عملية غير صالحة';return}
 if(f.id==='tv16EventForm'){e.preventDefault();let t=f.elements.title.value.trim(),date=f.elements.date.value;if(!t||!/^\d{4}-\d{2}-\d{2}$/.test(date))return;d.tm16Events=d.tm16Events||[];d.tm16Events.push({id:'e'+Date.now(),title:t.slice(0,100),date});save();render('calendar');return}
 if(f.id==='tv16DictForm'){e.preventDefault();let word=norm(document.getElementById('tv16Word').value).toLowerCase(),dict={achieve:'يحقق',dream:'حلم',study:'يذاكر',focus:'تركيز',progress:'تقدم',goal:'هدف','مذاكرة':'study','هدف':'goal','إنجاز':'achievement','طموح':'ambition'};document.getElementById('tv16DictAnswer').textContent=dict[word]?`المعنى: ${dict[word]}`:'الكلمة غير موجودة في القاموس المحلي المحدود. استخدم ChatBook للترجمة الحرة.';return}
 if(f.id==='tv16SupportForm'){e.preventDefault();let t=f.elements.message.value.trim();if(t.length<5)return;d.tm16Support=d.tm16Support||[];d.tm16Support.push({date:today(),text:t.slice(0,1500)});save();render('support');return msg('تم حفظ الاقتراح على جهازك فقط')}
});
// Main nav is a sibling of the legacy nav, so older links and deep routes remain available.
nav();if(d&&!document.getElementById('app')?.classList.contains('hide'))queueMicrotask(()=>route());const aside=document.getElementById('sidebar');if(aside){new MutationObserver(()=>{if(!document.getElementById('tv16Nav'))nav()}).observe(aside,{childList:true});}
window.TMOH_V16=Object.freeze({version:16,weekStats,subjects,lessonList});
})();
