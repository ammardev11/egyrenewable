const CACHE_NAME = 'renewable-energy-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles/main.css',
    './styles/variables.css',
    './styles/project-details.css',
    './styles/projects.css',
    './styles/statistics.css',
    './styles/news.css',
    './styles/article.css',
    './styles/about.css',
    './scripts/main.js',
    './scripts/theme.js',
    './scripts/projects.js',
    './scripts/project-details.js',
    './scripts/statistics.js',
    './scripts/news.js',
    './scripts/article.js',
    './scripts/sw-updater.js',
    './assets/images/logo.svg',
    './assets/images/Designer-Photoroom.png',
    './assets/images/hero-image.png',
    './assets/images/hero-image2.png',
    './assets/images/hero-image3.png',
    './manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('فتح ذاكرة التخزين المؤقت');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('إزالة ذاكرة التخزين المؤقت القديمة:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// استراتيجية الاستجابة: Cache First, ثم الشبكة
self.addEventListener('fetch', event => {
    try {
        // التحقق من أن مخطط URL مدعوم (http أو https)
        const url = new URL(event.request.url);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            // تجاهل الطلبات من مخططات URL غير مدعومة
            return;
        }
        
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    // إعادة الاستجابة من ذاكرة التخزين المؤقت إذا وجدت
                    if (response) {
                        return response;
                    }
                    
                    // إذا لم تكن موجودة في ذاكرة التخزين المؤقت، قم بجلبها من الشبكة
                    return fetch(event.request.clone())
                        .then(netResponse => {
                            // تخزين النسخة الجديدة في ذاكرة التخزين المؤقت
                            // يجب إنشاء نسخة جديدة لأن الاستجابة تستخدم مرة واحدة فقط
                            if (!netResponse || netResponse.status !== 200 || netResponse.type !== 'basic') {
                                return netResponse;
                            }
                            
                            // التحقق مرة أخرى من أن URL له مخطط مدعوم
                            try {
                                const responseUrl = new URL(netResponse.url);
                                if (responseUrl.protocol !== 'http:' && responseUrl.protocol !== 'https:') {
                                    return netResponse;
                                }
                                
                                const responseToCache = netResponse.clone();
                                
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        try {
                                            cache.put(event.request, responseToCache);
                                        } catch (error) {
                                            console.error('خطأ في تخزين الاستجابة في ذاكرة التخزين المؤقت:', error);
                                        }
                                    });
                            } catch (error) {
                                console.error('خطأ في معالجة URL الاستجابة:', error);
                            }
                                
                            return netResponse;
                        })
                        .catch(error => {
                            console.error('خطأ في جلب البيانات:', error);
                            // في حالة فشل الاتصال، يمكننا تقديم صفحة فشل الاتصال بالإنترنت
                            if (event.request.mode === 'navigate') {
                                return caches.match('./index.html');
                            }
                        });
                })
                .catch(error => {
                    console.error('خطأ في مطابقة الذاكرة المؤقتة:', error);
                })
        );
    } catch (error) {
        console.error('خطأ في معالجة الطلب:', error);
    }
}); 