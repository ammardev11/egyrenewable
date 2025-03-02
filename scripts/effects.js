/**
 * إضافة مؤثرات خاصة لموقع الطاقة المتجددة
 * تم تبسيط المؤثرات للحصول على تجربة مستخدم أفضل
 * يعمل على جميع الأجهزة: الكمبيوتر، الجوال، والأجهزة اللوحية
 */

// التأكد من عدم تطبيق المؤثرات أكثر من مرة
let effectsInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
    if (effectsInitialized) return;
    effectsInitialized = true;
    
    // إضافة المؤثرات المطلوبة فقط
    initScrollProgressBar();    // شريط تقدم التمرير
    initRevealEffects();        // تأثير الظهور التدريجي للعناصر
    init3DCardEffects();        // تأثيرات البطاقات (بشكل مبسط)
    
    // تحقق دوري للتأكد من ظهور المؤثرات
    setTimeout(checkEffectsVisibility, 1000);
});

// وظيفة للتحقق من ظهور المؤثرات
function checkEffectsVisibility() {
    // التحقق من شريط التقدم
    if (!document.querySelector('.scroll-progress-container')) {
        console.log('Reinitializing scroll progress bar');
        initScrollProgressBar();
    }
    
    // التحقق من تأثيرات الظهور
    initRevealEffects();
}

// تأثيرات البطاقات المتقدمة (مبسطة)
function init3DCardEffects() {
    // تعيين دعم الماوس إلى true لتمكين التأثيرات على جميع الأجهزة
    const hasMouseSupport = true;

    // التحقق من البطاقات التي لم يتم إضافة التأثيرات لها بعد
    const cards = document.querySelectorAll('.project-card, .news-card, .stat-card, .team-member, .about-card');
    
    cards.forEach(card => {
        // تجنب إضافة التأثيرات مرة أخرى إذا تم إضافتها سابقاً
        if (!card.classList.contains('card-with-effect')) {
            // إضافة فئة التأثير
            card.classList.add('card-with-effect');
            
            // متغيرات CSS المخصصة للتأثير ثلاثي الأبعاد
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
            card.style.setProperty('--xPos', '50%');
            card.style.setProperty('--yPos', '50%');
            
            // إضافة التأثير ثلاثي الأبعاد لجميع الأجهزة
            card.addEventListener('mousemove', function(e) {
                // تحديد مركز البطاقة
                const rect = card.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // حساب البعد عن المركز بالدرجات
                const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 3;
                const rotateX = ((centerY - e.clientY) / (rect.height / 2)) * 3;
                
                // حساب موضع المؤشر كنسبة مئوية
                const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                
                // تطبيق التدوير والانعكاس
                card.style.setProperty('--rotateX', rotateX + 'deg');
                card.style.setProperty('--rotateY', rotateY + 'deg');
                card.style.setProperty('--xPos', xPercent + '%');
                card.style.setProperty('--yPos', yPercent + '%');
                
                card.classList.add('card-3d-effect');
            });
            
            // إعادة البطاقة للوضع الأصلي عند رفع المؤشر
            card.addEventListener('mouseleave', function() {
                card.style.setProperty('--rotateX', '0deg');
                card.style.setProperty('--rotateY', '0deg');
                card.style.setProperty('--xPos', '50%');
                card.style.setProperty('--yPos', '50%');
                
                card.classList.remove('card-3d-effect');
            });
            
            // تأثير عند النقر
            card.addEventListener('mousedown', function() {
                card.classList.add('card-click-effect');
            });
            
            card.addEventListener('animationend', function() {
                card.classList.remove('card-click-effect');
            });
        }
    });
    
    // تأثيرات خاصة للأزرار - تطبيق على جميع الأجهزة
    const buttons = document.querySelectorAll('.details-btn, .read-more, .filter-btn, .social-btn, button.primary');
    
    buttons.forEach(button => {
        if (!button.classList.contains('button-with-effect')) {
            button.classList.add('button-with-effect');
            
            button.addEventListener('mousemove', function(e) {
                const rect = button.getBoundingClientRect();
                const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
                const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
                
                button.style.setProperty('--xPos', xPercent + '%');
                button.style.setProperty('--yPos', yPercent + '%');
            });
        }
    });
}

// شريط تقدم التمرير
function initScrollProgressBar() {
    // التحقق من أن العنصر غير موجود بالفعل
    if (document.querySelector('.scroll-progress-container')) return;
    
    // إنشاء شريط التقدم
    const body = document.querySelector('body');
    const progressContainer = document.createElement('div');
    progressContainer.className = 'scroll-progress-container';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress-bar';
    
    // إضافة العناصر للصفحة
    progressContainer.appendChild(progressBar);
    body.appendChild(progressContainer);
    
    // متغيرات لتتبع التمرير
    let lastScrollTop = 0;
    let scrollTimer;
    const scrollThreshold = 10; // خفض العتبة لضمان ظهور شريط التقدم
    
    // تحديث شريط التقدم عند التمرير
    function updateScrollProgress() {
        // تحديد الارتفاع الكلي للصفحة (مع مراعاة التمرير)
        const documentHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        ) - window.innerHeight;
        
        // تحديد موضع التمرير الحالي
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // حساب النسبة المئوية للتمرير
        const scrollPercentage = Math.min(100, Math.max(0, (scrollTop / documentHeight) * 100));
        
        // تحديث عرض شريط التقدم
        progressBar.style.width = scrollPercentage + '%';
        
        // إظهار/إخفاء شريط التقدم
        if (scrollTop > scrollThreshold) {
            progressContainer.classList.add('visible');
        } else {
            progressContainer.classList.remove('visible');
        }
        
        // إخفاء الشريط بعد التوقف عن التمرير لفترة (للشاشات الصغيرة فقط)
        if (window.innerWidth < 768) {
            clearTimeout(scrollTimer);
            
            scrollTimer = setTimeout(function() {
                if (scrollTop > scrollThreshold) {
                    progressContainer.classList.remove('visible');
                }
            }, 2000);
        }
        
        // تحديث آخر موضع تمرير
        lastScrollTop = scrollTop;
    }
    
    // تسجيل المستمعين
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress, { passive: true });
    
    // تحديث أولي
    updateScrollProgress();
    
    // تحقق من عرض الصفحة للكشف عن مشاكل التوافق
    if (window.innerWidth > 1024 && !progressContainer.offsetWidth) {
        console.warn('Scroll progress bar might have display issues. Trying alternative rendering...');
        setTimeout(updateScrollProgress, 500);
    }
}

// تأثير الظهور التدريجي للعناصر عند التمرير
function initRevealEffects() {
    // العناصر المستهدفة
    const targetElements = [
        '.project-card', '.news-card', '.stat-card', '.team-member', '.about-card',
        '.about-section', '.section-container', '.chart-container', '.article-content p',
        '.article-image', '.statistics-section', '.progress-table', '.project-details',
        'h2', 'h3', '.search-section', '.statistics-header', '.projects-header', '.about-header'
    ];
    
    // تحويل المصفوفة إلى سلسلة CSS محددة بفواصل
    const selectorString = targetElements.join(', ');
    
    // الحصول على جميع العناصر المستهدفة
    const elements = document.querySelectorAll(selectorString);
    
    // إضافة فئة الظهور لكل عنصر
    elements.forEach((element, index) => {
        // تحديد نوع التأثير بشكل عشوائي (أو حسب نوع العنصر)
        let effectClass = 'reveal-element';
        
        // إضافة تأثيرات مختلفة حسب نوع العنصر
        if (element.classList.contains('project-card') || element.classList.contains('team-member')) {
            effectClass += index % 2 === 0 ? ' reveal-left' : ' reveal-right';
        } else if (element.tagName === 'H2' || element.tagName === 'H3') {
            effectClass += ' reveal-scale';
        } else if (element.classList.contains('stat-card')) {
            effectClass += ' reveal-rotate';
        }
        
        // إضافة تأخير تسلسلي للبطاقات المتجاورة
        if (element.parentElement && element.parentElement.children.length > 1) {
            const siblings = element.parentElement.children;
            const elementIndex = Array.from(siblings).indexOf(element);
            
            if (elementIndex >= 0 && elementIndex < 5) {
                effectClass += ` reveal-delay-${elementIndex + 1}`;
            }
        }
        
        // إضافة الفئات الخاصة بالتأثير
        const classes = effectClass.split(' ');
        classes.forEach(cls => {
            if (!element.classList.contains(cls)) {
                element.classList.add(cls);
            }
        });
    });
    
    // دالة للتحقق من رؤية العناصر - تحسين للعمل على جميع الأجهزة
    function checkVisibility() {
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            // الارتفاع المرئي من الشاشة
            const windowHeight = window.innerHeight;
            
            // عتبة الظهور (30% من ارتفاع العنصر)
            const revealThreshold = 0.3;
            
            // التحقق من أن العنصر ضمن مجال الرؤية
            if (elementTop < windowHeight - (element.offsetHeight * revealThreshold) && elementBottom > 0) {
                element.classList.add('revealed');
            }
        });
    }
    
    // تحديث عند التمرير للتأكد من عمل التأثير على جميع الأجهزة
    window.addEventListener('scroll', checkVisibility);
    
    // تحديث أولي (للعناصر المرئية عند التحميل)
    checkVisibility();
    
    // تأكد من فحص رؤية العناصر مرة أخرى بعد التحميل
    window.addEventListener('load', checkVisibility);
}

// فحص رؤية التأثيرات كل فترة
setInterval(checkEffectsVisibility, 1000);

// دالة فحص رؤية التأثيرات
function checkEffectsVisibility() {
    const elements = document.querySelectorAll('.reveal-element');
    
    // إذا كانت لدينا عناصر مرئية لم يتم تطبيق التأثير عليها، أعد تهيئة التأثيرات
    if (elements.length > 0) {
        const windowHeight = window.innerHeight;
        let hasVisibleElementsWithoutEffect = false;
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight && !element.classList.contains('revealed')) {
                hasVisibleElementsWithoutEffect = true;
            }
        });
        
        if (hasVisibleElementsWithoutEffect) {
            initRevealEffects();
        }
    }
} 