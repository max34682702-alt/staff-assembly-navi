const CACHE_NAME = "staff-assembly-navi-v3";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(cacheAppShell());
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(appUrl("./"), copy));
          return response;
        })
        .catch(async () => (await caches.match(appUrl("./"))) || caches.match(appUrl("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(async () => (await caches.match(event.request)) || caches.match(appUrl("./")));
    })
  );
});

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL.map(appUrl));

  try {
    const response = await fetch(appUrl("./"));
    const html = await response.clone().text();
    await cache.put(appUrl("./"), response);

    const assetUrls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((path) => !path.startsWith("http") && !path.startsWith("data:"))
      .map(appUrl);

    await cache.addAll([...new Set(assetUrls)]);
  } catch {
    // 事前キャッシュに失敗しても、利用中に取得できたファイルはfetch時に保存します。
  }
}

function appUrl(path) {
  return new URL(path, self.registration.scope).toString();
}
