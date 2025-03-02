document.addEventListener('DOMContentLoaded', async () => {
    // الحصول على معرّف المشروع من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // إذا لم يكن هناك معرّف مشروع، نعود إلى صفحة المشروعات
    if (!projectId) {
        window.location.href = 'projects.html';
        return;
    }

    try {
        // تحميل بيانات المشروعات
        const response = await fetch('../data/projects.json');
        const data = await response.json();
        
        // البحث عن المشروع المطلوب
        const project = data.projects.find(p => p.id === projectId);
        
        // إذا لم يتم العثور على المشروع، نعود إلى صفحة المشروعات
        if (!project) {
            window.location.href = 'projects.html';
            return;
        }

        // عرض بيانات المشروع
        displayProject(project);
        
        // عرض المشروعات المشابهة
        displayRelatedProjects(project, data.projects);
        
        // تفعيل التمرير للأعلى
        setupScrollToTopButton();
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        window.location.href = 'projects.html';
    }
});

/**
 * عرض بيانات المشروع
 * @param {Object} project - بيانات المشروع
 */
function displayProject(project) {
    // تحديث عنوان الصفحة
    document.title = `${project.title} - مشروعات الطاقة المتجددة في مصر`;
    
    // العنوان والحالة
    document.getElementById('projectTitle').textContent = project.title;
    
    const statusBadge = document.getElementById('projectStatus');
    statusBadge.textContent = project.status;
    statusBadge.classList.add(getStatusClass(project.status));
    statusBadge.insertAdjacentHTML('afterbegin', getStatusIcon(project.status) + ' ');
    
    // المعلومات الأساسية
    document.querySelector('#projectLocation span').textContent = project.location;
    document.querySelector('#projectDate span').textContent = `${project.date.start} - ${project.date.end}`;
    document.querySelector('#projectCapacity span').textContent = project.capacity;
    document.querySelector('#projectBudget span').textContent = project.budget;
    
    // الصورة والتصنيفات
    document.getElementById('projectImage').src = project.image;
    document.getElementById('projectImage').alt = project.title;
    
    const categoryBadges = document.getElementById('projectCategory');
    categoryBadges.innerHTML = project.category.map(cat => `
        <div class="category-badge">
            ${getCategoryIcon(cat)} ${cat}
        </div>
    `).join('');
    
    // الوصف والتفاصيل
    document.getElementById('projectDescription').textContent = project.description;
    
    // قائمة الفوائد
    const benefitsList = document.getElementById('projectBenefits');
    benefitsList.innerHTML = project.details.benefits.map(benefit => `
        <li>${benefit}</li>
    `).join('');
    
    // قسم كلمات مفتوحة - إذا وجد
    if (project.details.openWords) {
        const openWordsContainer = document.getElementById('projectOpenWords');
        openWordsContainer.innerHTML = processText(project.details.openWords);
    } else {
        // إخفاء القسم إذا لم يكن هناك محتوى
        const openWordsSection = document.getElementById('projectOpenWords').closest('.content-section');
        if (openWordsSection) {
            openWordsSection.style.display = 'none';
        }
    }
    
    // التقنية المستخدمة
    if (project.details.technology) {
        document.getElementById('projectTechnology').textContent = project.details.technology;
    } else {
        document.getElementById('projectTechnology').textContent = 'غير محدد';
    }
    
    // المساحة
    if (project.details.area) {
        document.getElementById('projectArea').textContent = project.details.area;
    } else {
        document.getElementById('projectArea').textContent = 'غير محدد';
    }
    
    // مراحل التنفيذ
    const phasesList = document.getElementById('projectPhases');
    if (project.details.phases && project.details.phases.length > 0) {
        phasesList.innerHTML = project.details.phases.map(phase => `
            <li>${phase}</li>
        `).join('');
    } else {
        phasesList.innerHTML = '<li>لا توجد معلومات عن مراحل التنفيذ</li>';
    }
    
    // الشركاء
    const partnersList = document.getElementById('projectPartners');
    if (project.details.partners && project.details.partners.length > 0) {
        partnersList.innerHTML = project.details.partners.map(partner => `
            <li>${partner}</li>
        `).join('');
    } else {
        partnersList.innerHTML = '<li>لا توجد معلومات عن الشركاء</li>';
    }
}

/**
 * معالجة النص لإضافة الصور المضمنة والروابط
 * @param {string} text - النص المراد معالجته
 * @returns {string} النص المعالج مع الصور والروابط
 */
function processText(text) {
    if (!text) return '';
    
    // تقسيم النص إلى فقرات
    const paragraphs = text.split('\n');
    
    // معالجة كل فقرة
    const processedParagraphs = paragraphs.map(paragraph => {
        // البحث عن نمط includeimg("URL") وتحويله إلى عنصر img
        const imgPattern = /includeimg\("([^"]+)"\)/g;
        const videoPattern = /includeVideo\("([^"]+)"\)/g;
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
            
            // إضافة دعم للصيغة البديلة [[URL|TEXT]]
            const altUrlPattern = /\[\[([^\|\]]+)\|([^\]]+)\]\]/g;
            if (altUrlPattern.test(processedPara)) {
                processedPara = processedPara.replace(altUrlPattern, (match, url, text) => {
                    return `<a href="${url}" target="_blank" class="inline-link">${text}</a>`;
                });
            }
            
            if (videoPattern.test(processedPara)) {
                processedPara = processedPara.replace(videoPattern, (match, url) => {
                    return `<iframe width="100%" height="315" src="${url}" controls class="inline-video"></iframe>`;
                    
                });
            }
            // إرجاع الفقرة كاملة
            return `<p>${processedPara}</p>`;
        }
    });
    
    return processedParagraphs.join('');
}

/**
 * عرض المشروعات المشابهة
 * @param {Object} currentProject - المشروع الحالي
 * @param {Array} allProjects - جميع المشروعات
 */
function displayRelatedProjects(currentProject, allProjects) {
    // تصفية المشروعات المتشابهة بناءً على الفئة
    const relatedProjects = allProjects
        .filter(project => 
            project.id !== currentProject.id && 
            project.category.some(cat => currentProject.category.includes(cat))
        )
        .slice(0, 4); // عرض أقصى 4 مشروعات مشابهة

    // إذا لم تكن هناك مشروعات مشابهة، نعرض مشروعات أخرى عشوائية
    if (relatedProjects.length === 0) {
        const otherProjects = allProjects
            .filter(project => project.id !== currentProject.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 4);
            
        displayRelatedProjectsHTML(otherProjects);
    } else {
        displayRelatedProjectsHTML(relatedProjects);
    }
}

/**
 * عرض HTML المشروعات المشابهة
 * @param {Array} projects - المشروعات المراد عرضها
 */
function displayRelatedProjectsHTML(projects) {
    const relatedList = document.getElementById('relatedProjectsList');
    relatedList.innerHTML = projects.map(project => `
        <a href="?id=${project.id}" class="related-item">
            <img src="${project.image}" alt="${project.title}">
            <div class="related-content">
                <h4>${project.title}</h4>
                <div class="meta">
                    <span>
                        <i class="fas fa-map-marker-alt"></i>
                        ${project.location}
                    </span>
                    <span>
                        <i class="${getCategoryIconClass(project.category[0])}"></i>
                        ${project.category[0]}
                    </span>
                </div>
            </div>
        </a>
    `).join('');
}

/**
 * إعداد زر العودة للأعلى
 */
function setupScrollToTopButton() {
    const scrollButton = document.querySelector('.scroll-to-top');
    
    // إظهار/إخفاء الزر عند التمرير
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });
    
    // التمرير للأعلى عند النقر على الزر
    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/**
 * الحصول على صنف حالة المشروع
 * @param {string} status - حالة المشروع
 * @returns {string} صنف الحالة
 */
function getStatusClass(status) {
    const statusMap = {
        'مكتمل': 'completed',
        'جاري التنفيذ': 'inprogress',
        'مخطط له': 'planned'
    };
    return statusMap[status] || 'planned';
}

/**
 * الحصول على أيقونة حالة المشروع
 * @param {string} status - حالة المشروع
 * @returns {string} HTML الأيقونة
 */
function getStatusIcon(status) {
    const iconMap = {
        'مكتمل': '<i class="fas fa-check-circle"></i>',
        'جاري التنفيذ': '<i class="fas fa-cog fa-spin"></i>',
        'مخطط له': '<i class="fas fa-calendar-plus"></i>'
    };
    return iconMap[status] || '<i class="fas fa-info-circle"></i>';
}

/**
 * الحصول على أيقونة فئة المشروع
 * @param {string} category - فئة المشروع
 * @returns {string} HTML الأيقونة
 */
function getCategoryIcon(category) {
    return `<i class="${getCategoryIconClass(category)}"></i>`;
}

/**
 * الحصول على صنف أيقونة فئة المشروع
 * @param {string} category - فئة المشروع
 * @returns {string} صنف الأيقونة
 */
function getCategoryIconClass(category) {
    const iconMap = {
        'طاقة شمسية': 'fas fa-sun',
        'طاقة رياح': 'fas fa-wind',
        'طاقة نووية': 'fas fa-atom',
        'طاقة مائية': 'fas fa-water',
        'كتلة حيوية': 'fas fa-leaf'
    };
    return iconMap[category] || 'fas fa-bolt';
} 