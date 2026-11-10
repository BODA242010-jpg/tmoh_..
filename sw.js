/* Tmoh V12 — scope-safe PWA offline shell. Do not clear storage or other repositories' caches. */
const scopePath=new URL(self.registration.scope).pathname.replace(/[^\w-]+/g,'-');
const PREFIX='tmoh-app-'+scopePath+'-',CACHE=PREFIX+'v18-official-links-1';
const FILES=['./','index.html','manifest.json','app.js','style.css','icon.svg','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png','tmoh-install.js','tmoh-install.css','tmoh-v13.css','tmoh-i18n.js','tmoh-schoolbooks.js','tmoh-v16.js','tmoh-v16.css','tmoh-public-books.js','tmoh-public-books.css','tmoh-public-books.json','tmoh-schoolbooks.css','tmoh-v6.js','tmoh-v6.css','tmoh-study.js','tmoh-study.css','tmoh-study-content.js','cloud-auth.js','cloud-config.js','rewards-ai-config.js','tmoh-sky.js','tmoh-sky.css','tmoh-league.js','tmoh-league.css','tmoh-tools.js','tmoh-tools.css','tmoh-v8.css','tmoh-v8-library.js','tmoh-v8-helpbox.js','tmoh-v9.js','tmoh-v9.css','tmoh-flow.js','tmoh-flow.css'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 if(request.method!=='GET'||url.origin!==location.origin||!url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
 if(url.pathname.toLowerCase().endsWith('.pdf'))return; // Let browser handle large PDFs; do not cache in PWA shell
 event.respondWith(caches.open(CACHE).then(cache=>fetch(request).then(response=>{
   if(response.ok&&response.type==='basic')event.waitUntil(cache.put(request,response.clone()).catch(()=>{}));
   return response;
 }).catch(async()=>{
   const cached=await cache.match(request);if(cached)return cached;
   if(request.mode==='navigate')return (await cache.match('index.html'))||(await cache.match('./'))||new Response('غير متصل بالإنترنت',{status:503});
   return new Response('غير متصل بالإنترنت',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
 })));
});
