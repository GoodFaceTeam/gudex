// public/sw.js

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.message,
      icon: '/apple-touch-icon.png',
      badge: '/favicon-32x32.png',
      data: { url: data.url || '/' } // Ссылка, куда перекинет при клике
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'gudex.', options)
    );
  } catch (e) {
    console.error('Push error:', e);
  }
});

// Обработка клика по уведомлению в фоне
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});