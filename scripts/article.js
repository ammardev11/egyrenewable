document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const newsId = urlParams.get('id');

    if (!newsId) {
        window.location.href = 'news.html';
        return;
    }

    try {
        const response = await fetch('../data/news.json');
        const data = await response.json();
        const article = data.news.find(item => item.id === newsId);
        
        if (!article) {
            window.location.href = 'news.html';
            return;
        }

        displayArticle(article);
        displayRelatedNews(article, data.news);
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        window.location.href = 'news.html';
    }
});

function displayArticle(article) {
    // تحديث عنوان الصفحة
    document.title = `${article.title} - الطاقة المتجددة في مصر`;
    
    // تحديث محتوى المقال
    document.getElementById('articleTitle').textContent = article.title;
    document.getElementById('articleDate').textContent = formatDate(article.date);
    document.getElementById('articleImage').src = article.image;
    document.getElementById('articleImage').alt = article.title;
    document.getElementById('articleContent').innerHTML = formatContent(article.content);
    
    // تحديث التصنيفات
    document.getElementById('articleCategories').innerHTML = article.categories
        .map(cat => `<span class="category">${getCategoryName(cat)}</span>`)
        .join('');
}

function displayRelatedNews(currentArticle, allNews) {
    const relatedNews = allNews
        .filter(item => 
            item.id !== currentArticle.id && 
            item.categories.some(cat => currentArticle.categories.includes(cat))
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    document.getElementById('relatedNewsList').innerHTML = relatedNews
        .map(item => `
            <a href="?id=${item.id}" class="related-item">
                <img src="${item.image}" alt="${item.title}">
                <div class="related-content">
                    <h4>${item.title}</h4>
                    <time datetime="${item.date}">${formatDate(item.date)}</time>
                </div>
            </a>
        `).join('');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getCategoryName(category) {
    const categories = {
        'solar': 'الطاقة الشمسية',
        'wind': 'طاقة الرياح',
        'hydro': 'الطاقة المائية',
        'research': 'أبحاث وتطوير'
    };
    return categories[category] || category;
}

function formatContent(content) {
    if (!content) return '';
    
    // تقسيم النص إلى فقرات
    const paragraphs = content.split('\n\n');
    
    // معالجة كل فقرة
    const processedParagraphs = paragraphs.map(paragraph => {
        // البحث عن نمط includeimg("URL") وتحويله إلى عنصر img
        const imgPattern = /includeimg\("([^"]+)"\)/g;
        // البحث عن نمط includeUrl("URL","TEXT") وتحويله إلى رابط
        const urlPattern = /includeUrl\("([^"]+)","([^"]+)"\)/g;
        
        if (imgPattern.test(paragraph)) {
            // إذا كانت الفقرة تحتوي فقط على صورة
            return paragraph.replace(imgPattern, (match, url) => {
                return `<img src="${url}" alt="صورة توضيحية" class="inline-image">`;
            });
        } else {
            // معالجة الروابط في الفقرات النصية
            let processedPara = paragraph;
            
            // تحويل كل الروابط في الفقرة
            if (urlPattern.test(processedPara)) {
                processedPara = processedPara.replace(urlPattern, (match, url, text) => {
                    return `<a href="${url}" target="_blank" class="inline-link">${text}</a>`;
                });
            }
            
            // إرجاع الفقرة كاملة
            return `<p>${processedPara}</p>`;
        }
    });
    
    return processedParagraphs.join('');
} 