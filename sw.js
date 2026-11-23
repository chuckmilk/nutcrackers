// Nutcracker Keeper offline support
const V='nk-shell-v1',IMG='nk-img-v1';
const SHELL=['./','index.html','catalog.json','emb.bin','icon.png','icon-512.png','manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!==IMG).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin===location.origin){ // network first so updates arrive; cached copy when offline
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match('index.html'))));
    return;
  }
  if(u.hostname==='cdn11.bigcommerce.com'||u.hostname==='cdn.jsdelivr.net'||u.hostname==='fonts.gstatic.com'||u.hostname==='fonts.googleapis.com'){
    e.respondWith(caches.open(IMG).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;
      try{const r=await fetch(e.request);if(r.ok||r.type==='opaque')c.put(e.request,r.clone());return r}catch(err){return hit||Response.error()}}));
  }
});
