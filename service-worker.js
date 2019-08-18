const CACHE_NAME = "carplate-v1";
// dirty way
const baseUrl = self.location.host.startsWith("localhost") ? `http://${self.location.host}` : `https://${self.location.host}/car`;
console.log(baseUrl);
const URLS_CACHE_ONLY = [
];

const URLS_OVER_NETWORK_WITH_CACHE_FALLBACK = [
  `${baseUrl}/index.js`,
  `${baseUrl}/index.html`,
  `${baseUrl}/carplate.json`,
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(URLS_CACHE_ONLY.concat(URLS_OVER_NETWORK_WITH_CACHE_FALLBACK));
      })
      .catch(err => {
        console.error(err);
        return new Promise((resolve, reject) => {
          reject('Error' + err);
        });
      })
  );
});

self.addEventListener("fetch", function (event) {
  const requestURL = new URL(event.request.url);
  if (requestURL.pathname === '/') {
    event.respondWith(getByNetworkFallingBackByCache("/index.html"));
  }
  else if(URLS_OVER_NETWORK_WITH_CACHE_FALLBACK.includes(requestURL.href) 
  || URLS_OVER_NETWORK_WITH_CACHE_FALLBACK.includes(requestURL.pathname)) {
    event.respondWith(getByNetworkFallingBackByCache(event.request))
  }
  else if(URLS_CACHE_ONLY.includes(requestURL.href || URLS_CACHE_ONLY.includes(requestURL.pathname))) {
    event.respondWith(getByCacheOnly(event.request));
  }
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
      caches.keys().then(function (cacheNames) {
          return Promise.all(
              cacheNames.map(function (cacheName) {
                  if (CACHE_NAME !== cacheName && cacheName.startsWith("carplate")) {
                      return caches.delete(cacheName);
                  }
              })
          );
      })
  );
});

/**
 * 1. We fetch the request over the network
 * 2. If successful we add the new response to the cache
 * 3. If failed we return the result from the cache
 *
 * @param request
 * @param showAlert
 * @returns Promise
 */
const getByNetworkFallingBackByCache = (request, showAlert = false) => {
  return caches.open(CACHE_NAME).then((cache) => {
      return fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
      }).catch(() => {
          if (showAlert) {
              alert('You are in offline mode. The data may be outdated.')
          }
          return caches.match(request);
      });
  });
};
/**
* Get from cache
*
* @param request
* @returns Promise
*/
const getByCacheOnly = (request) => {
  return caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((response) => {
          return response;
      });
  });
};