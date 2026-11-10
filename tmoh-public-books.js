/* Tmoh V17 public curriculum library. Additive, no backend secrets.
   Publishes curated book links/files to all visitors via static manifest.
   Personal study records stay in tmoh2, and Cloudflare AI is unchanged.
 */
(function(){
'use strict';
if(typeof VIEWS==='undefined' || !VIEWS.books || !window.TMOH_SCHOOLBOOKS)return;
const original=VIEWS.books;
const E=v=>esc(String(v??''));
const subjects={
  0:['اللغة العربية','اللغة الإنجليزية','الرياضيات','العلوم','الدراسات الاجتماعية'],
  1:['اللغة العربية','اللغة الإنجليزية','الرياضيات','العلوم','الدراسات الاجتماعية'],
  2:['اللغة العربية','اللغة الإنجليزية','الرياضيات','العلوم','الدراسات الاجتماعية'],
  3:['اللغة العربية','اللغة الإنجليزية','الرياضيات','العلوم المتكاملة','التاريخ','الفلسفة والمنطق','البرمجة والذكاء الاصطناعي'],
  4:['اللغة العربية','اللغة الإنجليزية','الرياضيات','الفيزياء','الكيمياء','الأحياء','التاريخ','الجغرافيا'],
  5:['اللغة العربية','اللغة الإنجليزية','الرياضيات البحتة','تطبيقات الرياضيات','الفيزياء','الكيمياء','الأحياء','التاريخ','الجغرافيا السياسية']
};
let catalog=[],loadStatus='loading',openBook=null;
const OFFICIAL_LIBRARY='https://studentbooks.moe.gov.eg/Books';
const EXTERNAL_INDEX='https://miskeg.app/books/';
const GRADE_INDEX={0:'https://miskeg.app/books/general-prep-1/',1:'https://miskeg.app/books/general-prep-2/',2:'https://miskeg.app/books/general-prep-3/',3:'https://miskeg.app/books/general-secondary-1/',4:'https://miskeg.app/books/general-secondary-2/',5:'https://miskeg.app/books/general-secondary-3/'};
function sourcesPanel(grade){
 const index=GRADE_INDEX[grade]||EXTERNAL_INDEX;
 return `<section class="card tpb-sources"><b>📚 فين تلاقي باقي كتب الصف؟</b><p>الكتب المباشرة المعروضة هنا هي روابط إلى استضافة الوزارة نفسها، مش نسخ مرفوعة على طموح. بعض ملفات PDF لم نتمكن من اختبار فتحها؛ راجع بيانات الطبعة على الكتاب. وباقي الكتب افتحها من المصادر التالية:</p><div class="tpb-source-links"><a class="primary" target="_blank" rel="noopener noreferrer" href="${OFFICIAL_LIBRARY}">مكتبة الوزارة الرسمية ↗</a><a class="soft" target="_blank" rel="noopener noreferrer" href="${index}">فهرس مساعد خارجي للكتب ↗</a></div><small>الفهرس المساعد موقع غير حكومي، وبيذكر إصدارات 2026–2027، لكن لازم تتأكد من طبعة كل PDF. لا تعتمد طبعة مختلفة قبل مراجعتها في موقع الوزارة.</small></section>`;
}

function safeURL(raw){
 if(typeof raw!=='string'||!raw.trim())return '';
 let s=raw.trim();
 // Files hosted in this Tmoh repository, published only if sharing is permitted.
 if(/^books\/[a-z0-9_\-./]+\.pdf$/i.test(s)&&!s.split('/').some(p=>p==='.'||p==='..'||!p))return new URL(s,location.href.split('#')[0]).href;
 // Restrict linked PDFs to Egyptian Ministry of Education domains.
 try{let u=new URL(s);const h=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||u.username||u.password||!(/\.pdf(?:$|[?#])/i.test(u.pathname+u.search)))return '';
  if(h==='moe.gov.eg'||h.endsWith('.moe.gov.eg')||h==='elearnningcontent.blob.core.windows.net')return u.href;
 }catch{}
 return '';
}
function sanitize(book){
 if(!book||typeof book!=='object')return null;
 const grade=Number(book.grade),term=String(book.term||''),subject=String(book.subject||'').trim(),title=String(book.title||'').trim(),id=String(book.id||'').trim(),edition=String(book.edition||'').trim(),url=safeURL(book.url);
 if(!Number.isInteger(grade)||grade<0||grade>5||!['1','2','annual'].includes(term)||!subject||!title||!url||!/^pub-[a-z0-9_-]{3,72}$/i.test(id))return null;
 if(title.length>150||subject.length>90||edition.length>35)return null;
 return {id,grade,term,subject,title,edition,url,source:String(book.source||'').slice(0,100)};
}
function count(g,subject){return catalog.filter(b=>b.grade===g&&b.subject===subject).length}
function getPage(b){const n=Number(d?.tmohPublicBookPages?.[b.id]);return Number.isInteger(n)&&n>=1&&n<=3000?n:1}
function filtered(ui){return catalog.filter(b=>b.grade===ui.grade&&b.subject===ui.subject&&b.term===ui.term)}
function list(ui){const books=filtered(ui);
 return `<section class="card tpb-shared" aria-label="كتب متاحة لجميع الطلاب"><div class="tpb-header"><div><h3>🌐 كتب المدرسة المتاحة لكل الطلاب</h3><p>الروابط دي بتنشرها إدارة طموح مرة واحدة وبتظهر لكل طلاب الصف. ملفات PDF نفسها على استضافة وزارة التعليم، وفتح كل ملف لم يُختبر بعد.</p></div><span class="tpb-count">${books.length} رابط PDF</span></div>
 ${books.length?books.map(b=>`<div class="tpb-row"><span>📕</span><div><strong>${E(b.title)}</strong><small>${E(b.edition||'سنة الطبعة غير محددة')} · ${E(b.source||'مصدر الكتاب مدرج في الفهرس العام')}</small></div><button type="button" class="primary" data-tpb="open" data-id="${E(b.id)}">اقرأ الكتاب</button></div>`).join(''):`<p class="tpb-empty">${loadStatus==='loading'?'جاري تحميل فهرس الكتب…':loadStatus==='error'?'تعذر تحميل فهرس الكتب العامة. تأكد من الاتصال وحاول تحديث الصفحة.':'لسه ما تمش نشر كتاب عام للمادة والترم ده. تقدر تستخدم الكتب الشخصية أو تفتح موقع الوزارة.'}</p>`}${sourcesPanel(ui.grade)}</section>`;
}
function shelfNotice(ui){let n=catalog.filter(x=>x.grade===ui.grade).length;
 return `<section class="card tpb-notice"><b>🌐 المكتبة العامة للصف</b><p>${loadStatus==='loading'?'جاري تحميل الفهرس…':loadStatus==='error'?'تعذر الاتصال بفهرس الكتب العامة.':'روابط PDF المفهرسة لهذا الصف: '+n+'. اضغط على أي مادة علشان تشوف كتبها.'}</p><small>الكتب التي يضيفها الطالب بنفسه تظل شخصية، ولا تظهر لطلاب آخرين.</small></section>${sourcesPanel(ui.grade)}`;
}
function reader(b){let page=getPage(b);return `<div class="tpb-reader"><div class="tpb-reader-head"><button type="button" class="soft" data-tpb="back">← رجوع إلى المادة</button><div><h2>📕 ${E(b.title)}</h2><p>${E(window.TMOH_SCHOOLBOOKS.grades[b.grade])} • ${E(b.subject)} • ${E(b.edition||'طبعة غير محددة')}</p></div></div><div class="card"><div class="tpb-controls"><label>آخر صفحة وصلت لها <input id="tpbPage" type="number" min="1" max="3000" value="${page}"></label><button type="button" class="primary" data-tpb="save">حفظ الصفحة</button><a class="soft" href="${E(b.url)}" target="_blank" rel="noopener noreferrer">فتح الكتاب في نافذة جديدة</a></div><p class="tpb-help">لو الكتاب ما ظهرش هنا، افتحه في نافذة جديدة. رابط الوزارة ممكن يمنع العرض داخل موقع آخر. حفظ الصفحة بيخصك إنت بس.</p><iframe class="tpb-frame" title="قارئ كتاب ${E(b.title)}" src="${E(b.url+'#page='+page)}" loading="lazy" referrerpolicy="no-referrer" sandbox="allow-same-origin allow-scripts allow-downloads"></iframe></div></div>`}
VIEWS.books=function(){const html=original(),ui=window.TMOH_SCHOOLBOOKS.read();
 if(openBook&&(ui.grade!==openBook.grade||ui.subject!==openBook.subject||ui.term!==openBook.term))openBook=null;
 if(openBook)return reader(openBook);
 if(ui.subject && !ui.activeId){
   const anchor='<div class="tmb-add-grid">';
   return html.includes(anchor)?html.replace(anchor,list(ui)+anchor):html+list(ui);
 }
 if(!ui.subject){
  const anchor='<div class="card tmb-footnote">';
  return html.includes(anchor)?html.replace(anchor,shelfNotice(ui)+anchor):html+shelfNotice(ui);
 }
 return html;
};
const content=document.getElementById('content');
content?.addEventListener('click',e=>{let b=e.target.closest('[data-tpb]');if(!b||!d)return;
 const op=b.dataset.tpb;
 if(op==='open'){const ui=window.TMOH_SCHOOLBOOKS.read();const item=filtered(ui).find(x=>x.id===b.dataset.id);if(!item)return;openBook=item;render('books');}
 if(op==='back'){openBook=null;render('books');}
 if(op==='save'&&openBook){const n=Number(document.getElementById('tpbPage')?.value);if(!Number.isInteger(n)||n<1||n>3000){msg('اكتب رقم صفحة صحيح بين 1 و3000');return;}
  if(!d.tmohPublicBookPages||typeof d.tmohPublicBookPages!=='object')d.tmohPublicBookPages={};d.tmohPublicBookPages[openBook.id]=n;save();render('books');msg('اتحفظت الصفحة ✅');}
});
window.addEventListener('hashchange',()=>{if(!location.hash.includes('/books'))openBook=null});
fetch('./tmoh-public-books.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('bad status');return r.json()}).then(obj=>{
 if(!obj||obj.schemaVersion!==1||!Array.isArray(obj.books)||obj.books.length>3000)throw Error('bad catalog');
 const seen=new Set();catalog=obj.books.map(sanitize).filter(x=>{if(!x||seen.has(x.id))return false;seen.add(x.id);return true});loadStatus='ready';
 }).catch(()=>{catalog=[];loadStatus='error'}).finally(()=>{if(d&&location.hash.includes('/books'))render('books');});
window.TMOH_PUBLIC_BOOKS=Object.freeze({count:()=>catalog.length,filter:grade=>catalog.filter(b=>b.grade===grade),getStatus:()=>loadStatus});
})();
