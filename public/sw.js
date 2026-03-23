self.addEventListener('push', function(event) {
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { title: 'New Notification', body: event.data.text() };
        }
    }

    const title = data.title || 'Urbandrive Notification';
    const options = {
        body: data.body || 'You have a new message.',
        icon: '/logo-icon.png',
        badge: '/logo-icon.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            const targetUrl = event.notification.data.url || '/';
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(new URL(targetUrl, self.location.origin).href) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
