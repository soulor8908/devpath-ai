// public/sw.js
// Service Worker：缓存静态资源 + 离线 fallback 到首页 + 推送通知
// 采用 stale-while-revalidate 策略
// 扩展：push / notificationclick 事件（PWA 通知基础设施）
// 扩展：periodicsync 事件（P0.1 后台定期检查，让 AI "在呼吸"）

const SW_VERSION = "v3";
const CACHE_NAME = "devpath-v2";
const STATIC_ASSETS = ["/", "/learn", "/review", "/rest", "/stats", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached ?? caches.match("/"));
      return cached ?? fetchPromise;
    })
  );
});

// === PWA 推送通知 ===
// 收到 push 时弹出"该学习了"提醒
self.addEventListener("push", (event) => {
  let payload = { title: "devpath 提醒", body: "该学习了 📚" };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    if (event.data) payload.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "devpath-reminder",
      data: { url: payload.url ?? "/" },
    })
  );
});

// 点击通知 → 聚焦/打开应用
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate?.(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

// === Periodic Background Sync（P0.1：让 AI 从"被调用"变成"在呼吸"）===
// 后台定期检查：有待复习卡片 → 复习通知；连续 3 天未学习 → 回归通知
// 通知点击复用上方的 notificationclick 处理器，通过 data.url 跳转 /review 或 /learn
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "devpath-background-check") {
    event.waitUntil(doBackgroundCheck());
  }
});

// 原生 IndexedDB 打开（SW 中无法 import idb-keyval）
// 数据库 'devpath-db'，object store 'keyval'（与 idb-keyval 兼容）
function openDevpathDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("devpath-db", 1);
    req.onupgradeneeded = () => {
      // 数据库不存在时创建与 idb-keyval 兼容的 'keyval' store
      if (!req.result.objectStoreNames.contains("keyval")) {
        req.result.createObjectStore("keyval");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 读取 'keyval' store 中所有 key
function idbGetAllKeys(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keyval", "readonly");
    const req = tx.objectStore("keyval").getAllKeys();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// 读取 'keyval' store 中某个 key 的值
function idbGet(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("keyval", "readonly");
    const req = tx.objectStore("keyval").get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function doBackgroundCheck() {
  let db;
  try {
    db = await openDevpathDB();
  } catch {
    // 数据库无法打开，静默退出
    return;
  }
  try {
    const now = Date.now();
    let dueCount = 0;
    let lastLearnTs = 0;

    const allKeys = await idbGetAllKeys(db);

    // 1. 检查待复习卡片（review_log: 前缀，检查 due <= now）
    const reviewKeys = allKeys.filter(
      (k) => typeof k === "string" && k.startsWith("review_log:")
    );
    for (const k of reviewKeys) {
      const rec = await idbGet(db, k).catch(() => undefined);
      if (rec && typeof rec.due === "string") {
        const dueTs = new Date(rec.due).getTime();
        if (!isNaN(dueTs) && dueTs <= now) dueCount++;
      }
    }

    // 2. 检查最后学习时间（learn_log: 前缀，取最新 timestamp/date）
    const learnKeys = allKeys.filter(
      (k) => typeof k === "string" && k.startsWith("learn_log:")
    );
    for (const k of learnKeys) {
      const rec = await idbGet(db, k).catch(() => undefined);
      if (!rec) continue;
      const ts = rec.timestamp
        ? new Date(rec.timestamp).getTime()
        : rec.date
          ? new Date(rec.date).getTime()
          : 0;
      if (!isNaN(ts) && ts > lastLearnTs) lastLearnTs = ts;
    }

    const online = (self.navigator && self.navigator.onLine) ?? true;

    // 3. 有待复习卡片且用户可能在线 → 复习通知
    if (dueCount > 0 && online) {
      await self.registration.showNotification("📚 该复习了", {
        body: `你有 ${dueCount} 张卡片到期，打开复习继续吧`,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "devpath-review-due",
        data: { url: "/review" },
      });
    }

    // 4. 连续 3 天未学习 → 回归通知
    const daysSinceLastLearn =
      lastLearnTs > 0 ? Math.floor((now - lastLearnTs) / (24 * 60 * 60 * 1000)) : -1;
    if (daysSinceLastLearn >= 3) {
      await self.registration.showNotification("回来学习吧 💪", {
        body:
          daysSinceLastLearn >= 7
            ? `已经 ${daysSinceLastLearn} 天没学习了，是时候回来继续了`
            : `你已经 ${daysSinceLastLearn} 天没学习了，别让节奏断了`,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        tag: "devpath-comeback",
        data: { url: "/learn" },
      });
    }
  } catch (e) {
    console.warn("[sw] background check failed:", e);
  } finally {
    if (db) db.close();
  }
}
