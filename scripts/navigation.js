// التحكم في القائمة الجانبية
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const scrollTopBtn = document.querySelector('.scroll-to-top');
const scrollDownBtn = document.querySelector('.scroll-down');

function toggleMenu() {
    menuToggle.classList.toggle('active');
    mainNav.classList.toggle('active');
}

function closeMenu() {
    menuToggle.classList.remove('active');
    mainNav.classList.remove('active');
}

menuToggle?.addEventListener('click', toggleMenu);

// التحكم في ظهور زر العودة للأعلى
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn?.classList.add('visible');
    } else {
        scrollTopBtn?.classList.remove('visible');
    }
});

// تحسين زر التمرير للأسفل
if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            statsSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });

    // إخفاء الزر عند التمرير
    window.addEventListener('scroll', () => {
        const heroSection = document.querySelector('.hero-section');
        const heroBottom = heroSection?.getBoundingClientRect().bottom;
        
        if (window.pageYOffset > 100) {
            scrollDownBtn.classList.remove('visible');
            scrollDownBtn.style.opacity = '0';
            scrollTopBtn?.classList.add('visible');
        } else {
            scrollDownBtn.classList.add('visible');
            scrollDownBtn.style.opacity = '1';
            scrollTopBtn?.classList.remove('visible');
        }

        // إعادة ظهور زر التمرير للأسفل عند العودة للأعلى
        if (window.pageYOffset === 0) {
            setTimeout(() => {
                scrollDownBtn.classList.add('visible');
                scrollDownBtn.style.opacity = '1';
            }, 300);
        }
    });

    // إظهار الزر عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        scrollDownBtn.classList.add('visible');
        scrollDownBtn.style.opacity = '1';
    });
}

// العودة للأعلى عند النقر على الزر
scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// التحكم في ظهور واختفاء الشريط العلوي
let lastScrollTop = 0;
const header = document.querySelector('.main-header');
const scrollThreshold = 50;
let scrollTimer;

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // إلغاء المؤقت السابق
    clearTimeout(scrollTimer);
    
    // إظهار الشريط عند التمرير لأعلى
    if (scrollTop < lastScrollTop) {
        header.classList.remove('hidden');
    } 
    // إخفاء الشريط عند التمرير لأسفل وتجاوز المسافة المحددة
    else if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
        header.classList.add('hidden');
    }
    
    lastScrollTop = scrollTop;

    // إظهار الشريط بعد توقف التمرير
    scrollTimer = setTimeout(() => {
        header.classList.remove('hidden');
    }, 1500);
});

// إظهار الشريط عند تحريك الماوس لأعلى الصفحة
document.addEventListener('mousemove', (e) => {
    if (e.clientY < 100) {
        header.classList.remove('hidden');
    }
}); 