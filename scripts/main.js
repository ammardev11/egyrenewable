// تحميل المحتوى من ملف JSON
async function loadContent() {
  try {
    const response = await fetch("/data/content.json");
    const data = await response.json();

    // تحديث وصف القسم الرئيسي
    const heroDescription = document.querySelector(".hero-description");
    heroDescription.textContent = data.hero.description;
  } catch (error) {
    console.error("خطأ في تحميل المحتوى:", error);
  }
}

// تنفيذ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadContent);

async function loadHomeContent() {
  try {
    const response = await fetch("../data/content.json");
    const data = await response.json();

    // تحميل الإحصائيات
    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid) {
      statsGrid.innerHTML = Object.entries(data.short_overview)
        .map(
          ([key, stat]) =>
            `
                   <div class="stat-card">
            <div class="stat-value">
                ${stat.value}
                <span class="stat-unit">${stat.unit}</span>
            </div>
            <div class="stat-growth positive">
                <i class="fas fa-arrow-up"></i>
                ${stat.growth}%
            </div>
            <p class="stat-description">${stat.description}</p>
        </div>
                `
        )
        .join("");
    }
  } catch (error) {
    console.error("Error loading content:", error);
  }
}

// تحميل المحتوى عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadHomeContent);

// وظيفة التمرير السلس
function scrollToElement(element) {
  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// إضافة حدث النقر على زر التمرير
const scrollDownBtn = document.querySelector(".scroll-down");
const scrollTopBtn = document.querySelector(".scroll-to-top");

scrollDownBtn?.addEventListener("click", () => {
  const statsSection = document.querySelector(".stats-section");
  scrollToElement(statsSection);
  scrollDownBtn.classList.remove("visible");
});

// التحكم في ظهور واختفاء الأزرار
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;

  // إخفاء زر التمرير للأسفل فقط عند التمرير لأسفل
  if (scrollPosition > 100) {
    scrollDownBtn?.classList.remove("visible");
  }

  // زر العودة للأعلى
  if (scrollPosition > 300) {
    scrollTopBtn?.classList.add("visible");
  } else {
    scrollTopBtn?.classList.remove("visible");
  }
});

// إضافة حدث النقر على زر العودة للأعلى
scrollTopBtn?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// إظهار زر التمرير للأسفل عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  scrollDownBtn?.classList.add("visible");
});

// التحكم في ظهور واختفاء الشريط العلوي
let lastScrollTop = 0;
const header = document.querySelector(".main-header");
const scrollThreshold = 50;
let scrollTimer;

window.addEventListener("scroll", () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // إلغاء المؤقت السابق
  clearTimeout(scrollTimer);

  // إظهار الشريط عند التمرير لأعلى
  if (scrollTop < lastScrollTop) {
    header.classList.remove("hidden");
  }
  // إخفاء الشريط عند التمرير لأسفل وتجاوز المسافة المحددة
  else if (scrollTop > lastScrollTop && scrollTop > scrollThreshold) {
    header.classList.add("hidden");
  }

  lastScrollTop = scrollTop;

  // إظهار الشريط بعد توقف التمرير
  scrollTimer = setTimeout(() => {
    header.classList.remove("hidden");
  }, 1500);
});

// إظهار الشريط عند تحريك الماوس لأعلى الصفحة
document.addEventListener("mousemove", (e) => {
  if (e.clientY < 100) {
    header.classList.remove("hidden");
  }
});

// التحكم في القائمة الجانبية
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
let overlay;

function createOverlay() {
  overlay = document.createElement("div");
  overlay.className = "overlay";
  document.body.appendChild(overlay);
}

function toggleMenu() {
  menuToggle.classList.toggle("active");
  mainNav.classList.toggle("active");
}

function closeMenu() {
  menuToggle.classList.remove("active");
  mainNav.classList.remove("active");
}

menuToggle?.addEventListener("click", toggleMenu);

// إغلاق القائمة عند النقر على الروابط
mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("#")) {
      closeMenu();
      window.location.href = href;
    }
  });
});

// تطبيق التمرير الناعم على جميع الروابط الداخلية
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (link && link.hash && link.href.includes(window.location.pathname)) {
    e.preventDefault();
    const target = document.querySelector(link.hash);
    if (target) {
      scrollToElement(target);
    }
  }
});

// تحسين أداء التمرير
let scrollTimeout;
window.addEventListener(
  "scroll",
  () => {
    clearTimeout(scrollTimeout);
    document.body.classList.add("is-scrolling");

    scrollTimeout = setTimeout(() => {
      document.body.classList.remove("is-scrolling");
    }, 150);
  },
  { passive: true }
);

// تحسين التنقل بين الصفحات
mainNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!link.getAttribute("href").startsWith("#")) {
      closeMenu();
    }
  });
});

// تحميل آخر خبرين في الصفحة الرئيسية
async function loadLatestNews() {
  try {
    const response = await fetch("./data/news.json");
    const newsData = await response.json();

    // ترتيب الأخبار والمقالات حسب التاريخ وأخذ آخر خبرين
    const latestNews = newsData.news
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 2);

    const newsGrid = document.querySelector(".latest-news");
    if (newsGrid) {
      newsGrid.innerHTML = latestNews
        .map(
          (news) => `
                <article class="news-card">
                    <img src="${news.image}" alt="${
            news.title
          }" class="news-image">
                    <div class="news-content">
                        <span class="news-date">${formatDate(news.date)}</span>
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-excerpt">${news.excerpt}</p>
                        <a href="pages/article.html?id=${
                          news.id
                        }" class="details-btn">
                            عرض التفاصيل
                            <i class="fas fa-arrow-left"></i>
                        </a>
                    </div>
                </article>
            `
        )
        .join("");
    }
  } catch (error) {
    console.error("خطأ في تحميل الأخبار والمقالات:", error);
  }
}

// تنسيق التاريخ
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("ar-EG", options);
}

// تحميل الأخبار عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", loadLatestNews);

// مؤثر تتبع المؤشر - إضافة جديدة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة مؤثر تتبع المؤشر
    // راجع effects.js للتأثيرات الجديدة
});

// الأشكال الهندسية المتحركة في الخلفية - إضافة جديدة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة الأشكال الهندسية المتحركة
    // راجع effects.js للتأثيرات الجديدة
});

// مولد الطاقة المتجددة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة مولد الطاقة
    // راجع effects.js للتأثيرات الجديدة
});

// تأثيرات البطاقات المتقدمة - إضافة جديدة
document.addEventListener('DOMContentLoaded', function() {
    // تم نقل جميع تأثيرات البطاقات إلى ملف effects.js
    console.log('تم نقل تأثيرات البطاقات إلى effects.js');
});

// شريط تقدم التمرير - إضافة جديدة
document.addEventListener('DOMContentLoaded', function() {
    // تم نقل شريط تقدم التمرير إلى ملف effects.js
    console.log('تم نقل شريط تقدم التمرير إلى effects.js');
});

// تأثير الظهور التدريجي للعناصر عند التمرير - إضافة جديدة
document.addEventListener('DOMContentLoaded', function() {
    // تم نقل تأثير الظهور التدريجي إلى ملف effects.js
    console.log('تم نقل تأثير الظهور التدريجي إلى effects.js');
});

// مؤثر توليد الطاقة المتجددة التفاعلي - إضافة جديدة مبتكرة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة مولد الطاقة
    console.log('تم إزالة مولد الطاقة المتجددة');
});

// مؤثر محاكاة الطاقة المتجددة في الصفحة - إضافة جديدة مبتكرة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة محاكاة الطاقة المتجددة
    console.log('تم إزالة مؤثر محاكاة الطاقة المتجددة');
});

// مؤثر خلفية موجات الطاقة المتجددة - إضافة جديدة مبتكرة
document.addEventListener('DOMContentLoaded', function() {
    // تم إزالة مؤثر موجات الطاقة المتجددة
    console.log('تم إزالة مؤثر موجات الطاقة المتجددة');
});
