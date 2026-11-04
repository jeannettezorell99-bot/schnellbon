var CACHE = "schnellbon-v4";
var FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (ev) {
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
});

self.addEventListener("activate", function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (ev) {
  if (ev.request.method !== "GET") return;
  ev.respondWith(
    caches.match(ev.request).then(function (cached) {
      var fetchPromise = fetch(ev.request).then(function (resp) {
        if (resp && resp.status === 200) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(ev.request, copy); });
        }
        return resp;
      }).catch(function () { return cached; });
      return cached || fetchPromise;
    })
  );
});
