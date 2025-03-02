/**
 * ملف لتحديث Service Worker وإدارته
 */

// تحديث Service Worker إذا كان هناك تغيير
function updateServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.update();
            }
        });
    }
}

// تسجيل Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
                    
                    // التحقق من وجود تحديثات كل ساعة
                    setInterval(() => {
                        registration.update();
                        console.log('جاري التحقق من تحديثات Service Worker...');
                    }, 60 * 60 * 1000);
                })
                .catch(error => {
                    console.error('فشل تسجيل Service Worker:', error);
                });
        });

        // الاستماع لأحداث تحديث Service Worker
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('تم تحديث Service Worker، جاري تحديث الصفحة...');
            window.location.reload();
        });
    }
}

// تنظيف ذاكرة التخزين المؤقت القديمة
function clearOldCaches() {
    if ('caches' in window) {
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // يمكنك تحديد الذاكرة المؤقتة التي تريد الاحتفاظ بها هنا
                    if (cacheName !== 'renewable-energy-v2') {
                        console.log('إزالة ذاكرة التخزين المؤقت القديمة:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        });
    }
}

// تنفيذ الوظائف
registerServiceWorker();
clearOldCaches();

// تحديث Service Worker عند تحميل الصفحة
updateServiceWorker();

// تصدير الوظائف للاستخدام في ملفات أخرى
export { updateServiceWorker, clearOldCaches }; 