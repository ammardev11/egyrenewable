let newsData = [];
const ITEMS_PER_PAGE = 6;
let currentPage = 1;
let filteredResults = [];

// تحميل البيانات عند بدء التطبيق
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../data/news.json');
        const data = await response.json();
        newsData = data.news.sort((a, b) => new Date(b.date) - new Date(a.date));
        filteredResults = [...newsData];
        displayNews();
        initializeSearch();
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
});

function displayNews(news = filteredResults) {
    const newsGrid = document.querySelector('.news-grid');
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedNews = news.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    if (news.length === 0) {
        newsGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>لم يتم العثور على نتائج</h3>
                <p>لم نتمكن من العثور على أي خبر يطابق بحثك</p>
                <button class="reset-search" onclick="resetSearch()">
                    <i class="fas fa-redo"></i>
                    عرض كل الأخبار
                </button>
            </div>
        `;
        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            paginationContainer.style.display = 'none';
        }
        return;
    }

    const paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) {
        paginationContainer.style.display = 'flex';
    }
    
    newsGrid.innerHTML = paginatedNews.map(item => `
        <article class="news-card">
            <img src="${item.image}" alt="${item.title}" class="news-image">
            <div class="news-content">
                <span class="news-date">${formatDate(item.date)}</span>
                <h3 class="news-title">${item.title}</h3>
                <p class="news-excerpt">${item.excerpt}</p>
                <button onclick="window.location.href='article.html?id=${item.id}'" class="details-btn">
                    عرض التفاصيل
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
        </article>
    `).join('');

    displayPagination(news.length);
}

// إنشاء أزرار الترقيم
function displayPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginationContainer = document.querySelector('.pagination') || createPaginationContainer();
    
    let paginationHTML = `
        <button class="page-btn first" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-double-right"></i>
            الأول
        </button>
        <button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-angle-right"></i>
        </button>
        <div class="page-numbers">
    `;

    // عرض أرقام الصفحات مع مراعاة عدم عرض الكثير منها
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    // إضافة النقاط في البداية إذا لزم الأمر
    if (startPage > 1) {
        paginationHTML += `
            <button class="page-btn number" data-page="1">1</button>
            ${startPage > 2 ? '<span class="dots">...</span>' : ''}
        `;
    }

    // إضافة أرقام الصفحات
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-btn number ${currentPage === i ? 'active' : ''}" 
                    data-page="${i}">${i}</button>
        `;
    }

    // إضافة النقاط في النهاية إذا لزم الأمر
    if (endPage < totalPages) {
        paginationHTML += `
            ${endPage < totalPages - 1 ? '<span class="dots">...</span>' : ''}
            <button class="page-btn number" data-page="${totalPages}">${totalPages}</button>
        `;
    }

    paginationHTML += `
        </div>
        <button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''}>
            <i class="fas fa-angle-left"></i>
        </button>
        <button class="page-btn last" ${currentPage === totalPages ? 'disabled' : ''}>
            الأخير
            <i class="fas fa-angle-double-left"></i>
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;
    setupPaginationEvents(totalPages);
}

// إنشاء حاوية الترقيم
function createPaginationContainer() {
    const container = document.createElement('div');
    container.className = 'pagination';
    document.querySelector('.news-grid').insertAdjacentElement('afterend', container);
    return container;
}

// تنسيق التاريخ
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-EG', options);
}

// إعداد أحداث الترقيم
function setupPaginationEvents(totalPages) {
    const pagination = document.querySelector('.pagination');
    
    pagination.addEventListener('click', (e) => {
        const target = e.target.closest('.page-btn');
        if (!target || target.disabled) return;

        if (target.classList.contains('first')) {
            currentPage = 1;
        } else if (target.classList.contains('last')) {
            currentPage = totalPages;
        } else if (target.classList.contains('prev')) {
            currentPage = Math.max(1, currentPage - 1);
        } else if (target.classList.contains('next')) {
            currentPage = Math.min(totalPages, currentPage + 1);
        } else if (target.classList.contains('number')) {
            currentPage = parseInt(target.dataset.page);
        }
        
        displayNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// إعداد روابط الأخبار
function setupNewsLinks() {
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newsId = link.dataset.newsId;
            window.location.href = `article.html?id=${newsId}`;
        });
    });
}

// دالة لتنظيف النص للبحث
function normalizeText(text) {
    // التعامل مع القيم غير المعرفة
    if (text === undefined || text === null || text === '') {
        return '';
    }
    
    // تحويل الرقم إلى نص إذا لزم الأمر
    if (typeof text !== 'string') {
        text = String(text);
    }
    
    return text
        .replace(/[أإآا]/g, 'ا') // توحيد الألف
        .replace(/[ىيئ]/g, 'ي')   // توحيد الياء - إضافة الحرف ئ
        .replace(/ة/g, 'ه')      // توحيد التاء المربوطة
        .replace(/\s+/g, ' ')    // توحيد المسافات
        .trim()
        .toLowerCase();
}

// تحديث دالة البحث
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    const filterTags = document.querySelectorAll('.filter-tag');
    let activeFilter = 'all';

    searchInput.addEventListener('input', (e) => {
        currentPage = 1;
        const searchTerm = normalizeText(e.target.value);
        
        filteredResults = newsData.filter(item => {
            const normalizedTitle = normalizeText(item.title);
            const normalizedExcerpt = normalizeText(item.excerpt);
            const normalizedContent = normalizeText(item.content);
            
            const matchesSearch = 
                normalizedTitle.includes(searchTerm) || 
                normalizedExcerpt.includes(searchTerm) || 
                normalizedContent.includes(searchTerm);

            const matchesFilter = activeFilter === 'all' || 
                                (activeFilter === 'latest' ? true : 
                                item.categories.includes(activeFilter));
            
            return matchesSearch && matchesFilter;
        });

        displayNews(filteredResults);
    });

    filterTags.forEach(tag => {
        tag.addEventListener('click', () => {
            currentPage = 1;
            filterTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeFilter = tag.dataset.filter;
            
            if (activeFilter === 'all') {
                filteredResults = [...newsData];
            } else if (activeFilter === 'latest') {
                filteredResults = [...newsData].slice(0, 6);
            } else {
                filteredResults = newsData.filter(item => item.categories.includes(activeFilter));
            }
            
            const searchTerm = normalizeText(searchInput.value);
            if (searchTerm) {
                filteredResults = filteredResults.filter(item => {
                    const normalizedTitle = normalizeText(item.title);
                    const normalizedExcerpt = normalizeText(item.excerpt);
                    const normalizedContent = normalizeText(item.content);
                    
                    return normalizedTitle.includes(searchTerm) || 
                           normalizedExcerpt.includes(searchTerm) || 
                           normalizedContent.includes(searchTerm);
                });
            }
            
            displayNews(filteredResults);
        });
    });
}

// تهيئة الصفحة وفحص URL
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (newsId) {
        showNewsDetails(newsId);
    } else {
        displayNews();
        initializeSearch();
    }
});

// عرض تفاصيل الخبر
function showNewsDetails(newsId) {
    const newsItem = newsData.find(item => item.id === newsId);
    if (!newsItem) return;

    window.scrollTo(0, 0);

    const mainContent = document.querySelector('main');
    const container = mainContent.querySelector('.container');
    const originalContent = container.innerHTML;

    // البحث عن الأخبار ذات الصلة
    const relatedNews = newsData
        .filter(item => 
            item.id !== newsId && 
            item.categories.some(cat => newsItem.categories.includes(cat))
        )
        .slice(0, 5);

    container.innerHTML = `
        <div class="news-article-page">
            <button class="back-btn">
                <i class="fas fa-arrow-right"></i>
                عودة للأخبار
            </button>
            <div class="article-container">
                <div class="article-main">
                    <div class="article-header">
                        <h1 class="article-title">${newsItem.title}</h1>
                        <div class="article-meta">
                            <span class="article-date">${formatDate(newsItem.date)}</span>
                            <div class="article-categories">
                                ${newsItem.categories.map(cat => `
                                    <span class="category-tag">${getCategoryName(cat)}</span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <img src="${newsItem.image}" alt="${newsItem.title}" class="article-image">
                    <div class="article-content">
                        ${formatArticleContent(newsItem.content)}
                    </div>
                </div>
                <aside class="related-news">
                    <h3 class="related-news-title">أخبار ذات صلة</h3>
                    <div class="related-news-list">
                        ${relatedNews.map(item => `
                            <article class="related-news-item" data-news-id="${item.id}">
                                <img src="${item.image}" alt="${item.title}" class="related-news-image">
                                <div class="related-news-content">
                                    <h4 class="related-news-item-title">${item.title}</h4>
                                    <span class="related-news-date">${formatDate(item.date)}</span>
                                </div>
                            </article>
                        `).join('')}
                    </div>
                </aside>
            </div>
        </div>
    `;

    // إضافة حدث للزر العودة
    const backBtn = document.querySelector('.back-btn');
    backBtn.addEventListener('click', () => {
        container.innerHTML = originalContent;
        window.history.pushState({}, '', 'news.html');
        setupNewsLinks();
        initializeSearch();
    });
}

// دالة لتنسيق محتوى المقال
function formatArticleContent(content) {
    // هنا يمكنك إضافة معالجة النص مثل تحويل الماركداون أو HTML
    // مثال بسيط:
    return content
        .split('\n\n')
        .map(paragraph => `<p>${paragraph}</p>`)
        .join('');
}

// دالة مساعدة للحصول على اسم الفئة بالعربية
function getCategoryName(category) {
    const categories = {
        'solar': 'الطاقة الشمسية',
        'wind': 'طاقة الرياح',
        'hydro': 'الطاقة المائية',
        'projects': 'مشروعات',
        'research': 'أبحاث وتطوير'
    };
    return categories[category] || category;
}

// دالة إعادة تعيين البحث
function resetSearch() {
    const searchInput = document.querySelector('.search-input');
    searchInput.value = '';
    filteredResults = [...newsData];
    currentPage = 1;
    displayNews();
    
    // إعادة تنشيط زر "الكل" في الفلاتر
    const allFilterBtn = document.querySelector('[data-filter="all"]');
    if (allFilterBtn) {
        document.querySelectorAll('.filter-tag').forEach(btn => btn.classList.remove('active'));
        allFilterBtn.classList.add('active');
    }
}

// إضافة التنسيقات CSS
const style = document.createElement('style');
style.textContent = `
    .no-results {
        grid-column: 1 / -1;
        text-align: center;
        padding: var(--spacing-xl);
        background: var(--surface-color);
        border-radius: 15px;
        margin: var(--spacing-xl) 0;
    }

    .no-results i {
        font-size: 3rem;
        color: var(--text-light);
        margin-bottom: var(--spacing-md);
    }

    .no-results h3 {
        font-size: 1.5rem;
        color: var(--text-color);
        margin-bottom: var(--spacing-sm);
    }

    .no-results p {
        color: var(--text-light);
        margin-bottom: var(--spacing-lg);
    }

    .reset-search {
        padding: var(--spacing-sm) var(--spacing-lg);
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: var(--spacing-sm);
        transition: all 0.3s ease;
    }

    .reset-search:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    }

    .reset-search i {
        font-size: 1rem;
        margin: 0;
    }
`;
document.head.appendChild(style); 