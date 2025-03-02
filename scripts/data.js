// تعريف مصفوفة الأخبار


const newsData = [
    {
        id: 1,
        title: "عنوان الخبر الأول",
        date: "2024-01-15",
        image: "news1.jpg",
        excerpt: "ملخص الخبر الأول...",
        // ... باقي البيانات
    },
    // ... باقي الأخبار
];

// استدعاء البيانات من ملف JSON
async function loadNewsData() {
    try {
        const response = await fetch('../data/news.json');
        const data = await response.json();
        newsData = data.news.sort((a, b) => new Date(b.date) - new Date(a.date));
        return newsData;
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        return [];
    }
}

// دوال مساعدة للتعامل مع البيانات
function getNewsById(id) {
    return newsData.find(item => item.id === id);
}

function getRelatedNews(article, limit = 5) {
    return newsData
        .filter(item => 
            item.id !== article.id && 
            item.categories.some(cat => article.categories.includes(cat))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
}

function filterNewsByCategory(category) {
    if (category === 'all') return newsData;
    if (category === 'latest') return [...newsData].slice(0, 6);
    return newsData.filter(item => 
        item.categories.includes(category) && !item.categories.includes('projects')
    );
}

function searchNews(query) {
    const searchTerm = normalizeText(query);
    return newsData.filter(item => {
        const normalizedTitle = normalizeText(item.title);
        const normalizedExcerpt = normalizeText(item.excerpt);
        const normalizedContent = normalizeText(item.content);
        
        return normalizedTitle.includes(searchTerm) || 
               normalizedExcerpt.includes(searchTerm) || 
               normalizedContent.includes(searchTerm);
    });
}

// دالة تنظيف النص للبحث
function normalizeText(text) {
    return text
        .replace(/[أإآا]/g, 'ا')
        .replace(/[ىي]/g, 'ي')
        .replace(/ة/g, 'ه')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

// جعل الدوال متاحة عالمياً
window.newsData = newsData;
window.getNewsById = getNewsById;
window.getRelatedNews = getRelatedNews;
window.filterNewsByCategory = filterNewsByCategory;
window.searchNews = searchNews; 