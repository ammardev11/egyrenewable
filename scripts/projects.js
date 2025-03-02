class ProjectsManager {
    constructor() {
        this.projects = [];
        this.filteredProjects = [];
        this.currentPage = 1;
        this.ITEMS_PER_PAGE = 6;
        this.initializeElements();
        this.loadProjects();
    }

    initializeElements() {
        // عناصر البحث والفلترة
        this.searchInput = document.getElementById('searchInput');
        console.log('عنصر البحث: ', this.searchInput);
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.locationFilter = document.getElementById('locationFilter');
        this.statusFilter = document.getElementById('statusFilter');
        this.projectsList = document.querySelector('.projects-grid');

        // إضافة مستمعي الأحداث
        this.filterButtons?.forEach(btn => {
            btn.addEventListener('click', (e) => this.handleFilterClick(e));
        });
        this.locationFilter?.addEventListener('change', () => this.applyFilters());
        this.statusFilter?.addEventListener('change', () => this.applyFilters());
    }

    async loadProjects() {
        try {
            const response = await fetch('../data/projects.json');
            const data = await response.json();
            this.projects = data.projects;
            this.filteredProjects = [...this.projects];
            console.log('تم تحميل البيانات: ', this.projects.length);
            
            // تحميل قوائم الفلترة
            this.loadFilterOptions(data);
            
            // عرض المشاريع وتهيئة البحث
            this.renderProjects();
            this.initializeSearch();
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
        }
    }

    loadFilterOptions(data) {
        // تحميل خيارات المحافظات
        if (this.locationFilter) {
            data.locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                this.locationFilter.appendChild(option);
            });
        }

        // تحميل خيارات الحالة
        if (this.statusFilter) {
            data.statuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status;
                this.statusFilter.appendChild(option);
            });
        }
    }

    handleFilterClick(e) {
        console.log('النقر على زر الفلترة');
        
        // التأكد من النقر على الزر نفسه أو أي عنصر داخله
        const button = e.target.closest('.filter-btn');
        if (!button) return;
        
        // إزالة الفئة النشطة من جميع الأزرار
        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        
        // إضافة الفئة النشطة للزر المحدد
        button.classList.add('active');
        
        console.log('تم تحديد الفئة: ', button.getAttribute('data-category'));
        this.applyFilters();
    }

    // تهيئة وظيفة البحث - مطابقة لـ initializeSearch في news.js
    initializeSearch() {
        if (!this.searchInput) {
            console.error('عنصر البحث غير موجود!');
            return;
        }

        console.log('تهيئة وظيفة البحث');
        
        // إزالة أي مستمعي أحداث سابقة
        this.searchInput.removeEventListener('input', this._handleSearchEvent);
        
        // حفظ الإشارة إلى this للاستخدام في وظيفة المستمع
        const self = this;
        
        // تعريف وظيفة معالجة حدث البحث
        this._handleSearchEvent = function(e) {
            console.log('تم تنفيذ البحث: ', e.target.value);
            self.currentPage = 1;
            const searchTerm = normalizeText(e.target.value);
            
            self.filteredProjects = self.projects.filter(project => {
                // فحص القيم غير المعرفة
                if (!project.title && !project.description && !project.location) return false;
                
                const normalizedTitle = normalizeText(project.title || '');
                const normalizedDescription = normalizeText(project.description || '');
                const normalizedLocation = normalizeText(project.location || '');
                
                const matchesSearch = searchTerm === '' || 
                    normalizedTitle.includes(searchTerm) || 
                    normalizedDescription.includes(searchTerm) || 
                    normalizedLocation.includes(searchTerm);

                // فلترة حسب الفئة
                const activeButton = document.querySelector('.filter-btn.active');
                const selectedCategory = activeButton?.getAttribute('data-category');
                const matchesCategory = !selectedCategory || selectedCategory === 'all' || 
                                      (selectedCategory && project.category.some(cat => cat === selectedCategory));

                // فلترة حسب المحافظة
                const selectedLocation = self.locationFilter?.value;
                const matchesLocation = !selectedLocation || project.location === selectedLocation;

                // فلترة حسب الحالة
                const selectedStatus = self.statusFilter?.value;
                const matchesStatus = !selectedStatus || project.status === selectedStatus;
                
                return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
            });

            console.log('نتائج البحث: ', self.filteredProjects.length);
            self.renderProjects();
        };
        
        // إضافة مستمع الحدث
        this.searchInput.addEventListener('input', this._handleSearchEvent);
    }

    // دالة لتطبيق الفلاتر بدون البحث
    applyFilters() {
        console.log('تطبيق الفلاتر');
        this.currentPage = 1;
        
        // تحديث الفلاتر أولاً
        this.filteredProjects = [...this.projects];

        // فلترة حسب الفئة
        const activeButton = document.querySelector('.filter-btn.active');
        const selectedCategory = activeButton?.getAttribute('data-category');
        
        if (selectedCategory && selectedCategory !== 'all') {
            this.filteredProjects = this.filteredProjects.filter(project => 
                project.category.some(cat => cat === selectedCategory)
            );
        }

        // فلترة حسب المحافظة
        const selectedLocation = this.locationFilter?.value;
        if (selectedLocation) {
            this.filteredProjects = this.filteredProjects.filter(project => 
                project.location === selectedLocation
            );
        }

        // فلترة حسب الحالة
        const selectedStatus = this.statusFilter?.value;
        if (selectedStatus) {
            this.filteredProjects = this.filteredProjects.filter(project => 
                project.status === selectedStatus
            );
        }

        // تطبيق البحث الحالي إذا كان موجود
        if (this.searchInput) {
            const searchText = this.searchInput.value.trim();
            if (searchText) {
                console.log('تطبيق البحث: ', searchText);
                const normalizedSearchText = normalizeText(searchText);
                this.filteredProjects = this.filteredProjects.filter(project => {
                    // فحص القيم غير المعرفة
                    if (!project.title && !project.description && !project.location) return false;
                    
                    const normalizedTitle = normalizeText(project.title || '');
                    const normalizedDescription = normalizeText(project.description || '');
                    const normalizedLocation = normalizeText(project.location || '');
                    
                    return normalizedTitle.includes(normalizedSearchText) ||
                        normalizedDescription.includes(normalizedSearchText) ||
                        normalizedLocation.includes(normalizedSearchText);
                });
            }
        }

        console.log('نتائج الفلترة: ', this.filteredProjects.length);
        this.renderProjects();
    }

    renderProjects() {
        if (!this.projectsList) return;

        if (this.filteredProjects.length === 0) {
            this.projectsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>لم يتم العثور على نتائج</h3>
                    <p>لم نتمكن من العثور على أي مشروع يطابق بحثك</p>
                    <button class="reset-btn" onclick="projectsManager.resetFilters()">
                        <i class="fas fa-sync-alt"></i>
                        عرض كل المشروعات
                    </button>
                </div>
            `;
            
            // إخفاء أزرار تعدد الصفحات عند عدم وجود نتائج
            const paginationContainer = document.querySelector('.pagination');
            if (paginationContainer) {
                paginationContainer.style.display = 'none';
            }
            
            return;
        }

        // حساب المشاريع التي ستظهر في الصفحة الحالية
        const startIndex = (this.currentPage - 1) * this.ITEMS_PER_PAGE;
        const paginatedProjects = this.filteredProjects.slice(startIndex, startIndex + this.ITEMS_PER_PAGE);
        
        // عرض أزرار تعدد الصفحات
        const paginationContainer = document.querySelector('.pagination');
        if (paginationContainer) {
            paginationContainer.style.display = 'flex';
        }

        this.projectsList.innerHTML = paginatedProjects.map(project => {
            const status = this.getProjectStatus(project);
            return `
                <div class="project-card ${this.getStatusClass(status)}">
                    <div class="project-status status-${this.getStatusClass(status)}">
                        ${this.getStatusIcon(status)}
                        ${status}
                    </div>
                    <div class="project-image">
                        <img src="${project.image}" alt="${project.title}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.title}</h3>
                        <div class="project-meta">
                            <div class="meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${project.location}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-bolt"></i>
                                <span>${project.capacity}</span>
                            </div>
                            <div class="meta-item">
                                <i class="far fa-calendar-alt"></i>
                                <span>${project.date.start} - ${project.date.end}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-money-bill-wave"></i>
                                <span>${project.budget}</span>
                            </div>
                        </div>
                        <p class="project-description">${project.description}</p>
                        <button class="details-btn" onclick="projectsManager.showDetails('${project.id}')">
                            <i class="fas fa-external-link-alt"></i>
                            عرض التفاصيل
                            <span class="btn-shine"></span>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // إنشاء أو تحديث أزرار تعدد الصفحات
        this.displayPagination(this.filteredProjects.length);
    }

    showDetails(projectId) {
        window.location.href = `project-details.html?id=${projectId}`;
    }

    showError(message) {
        this.projectsList.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="window.projectsManager.loadProjects()" class="retry-btn">
                    <i class="fas fa-redo"></i>
                    إعادة المحاولة
                </button>
            </div>
        `;
    }

    // إضافة دالة جديدة لإعادة تعيين الفلاتر
    resetFilters() {
        console.log('إعادة تعيين الفلاتر');
        
        // إعادة تعيين حقل البحث
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        
        // إعادة تعيين أزرار الفلترة
        this.filterButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-category') === 'all') {
                btn.classList.add('active');
            }
        });
        
        // إعادة تعيين القوائم المنسدلة
        if (this.locationFilter) this.locationFilter.value = '';
        if (this.statusFilter) this.statusFilter.value = '';
        
        // إعادة تعيين رقم الصفحة الحالية
        this.currentPage = 1;
        
        // إعادة تحميل كل المشروعات
        this.filteredProjects = [...this.projects];
        
        console.log('تم إعادة تعيين الفلاتر: ', this.filteredProjects.length);
        this.renderProjects();
    }

    // دالة مساعدة لتحديد صنف حالة المشروع
    getStatusClass(status) {
        const statusMap = {
            'مكتمل': 'completed',
            'جاري التنفيذ': 'inprogress',
            'مخطط له': 'planned'
        };
        return statusMap[status] || 'planned';
    }

    // دالة مساعدة لتحديد أيقونة حالة المشروع
    getStatusIcon(status) {
        const iconMap = {
            'مكتمل': '<i class="fas fa-check-circle"></i>',
            'جاري التنفيذ': '<i class="fas fa-cog fa-spin"></i>',
            'مخطط له': '<i class="fas fa-calendar-plus"></i>'
        };
        return iconMap[status] || '<i class="fas fa-info-circle"></i>';
    }

    getProjectStatus(project) {
        const currentYear = new Date().getFullYear();
        const startYear = parseInt(project.date.start);
        const endYear = parseInt(project.date.end);

        if (currentYear > endYear) {
            return 'مكتمل';
        } else if (currentYear >= startYear && currentYear <= endYear) {
            return 'جاري التنفيذ';
        } else {
            return 'مخطط له';
        }
    }

    // إضافة دالة جديدة لإنشاء أزرار تعدد الصفحات
    displayPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.ITEMS_PER_PAGE);
        const paginationContainer = document.querySelector('.pagination') || this.createPaginationContainer();
        
        let paginationHTML = `
            <button class="page-btn first" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-angle-double-right"></i>
                الأول
            </button>
            <button class="page-btn prev" ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-angle-right"></i>
            </button>
            <div class="page-numbers">
        `;

        // عرض أرقام الصفحات مع مراعاة عدم عرض الكثير منها
        let startPage = Math.max(1, this.currentPage - 2);
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
                <button class="page-btn number ${this.currentPage === i ? 'active' : ''}" 
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
            <button class="page-btn next" ${this.currentPage === totalPages ? 'disabled' : ''}>
                <i class="fas fa-angle-left"></i>
            </button>
            <button class="page-btn last" ${this.currentPage === totalPages ? 'disabled' : ''}>
                الأخير
                <i class="fas fa-angle-double-left"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
        this.setupPaginationEvents(totalPages);
    }
    
    // إنشاء حاوية الترقيم
    createPaginationContainer() {
        const container = document.createElement('div');
        container.className = 'pagination';
        document.querySelector('.projects-grid').insertAdjacentElement('afterend', container);
        return container;
    }
    
    // إعداد أحداث الترقيم
    setupPaginationEvents(totalPages) {
        const pagination = document.querySelector('.pagination');
        
        pagination.addEventListener('click', (e) => {
            const target = e.target.closest('.page-btn');
            if (!target || target.disabled) return;

            if (target.classList.contains('first')) {
                this.currentPage = 1;
            } else if (target.classList.contains('last')) {
                this.currentPage = totalPages;
            } else if (target.classList.contains('prev')) {
                this.currentPage = Math.max(1, this.currentPage - 1);
            } else if (target.classList.contains('next')) {
                this.currentPage = Math.min(totalPages, this.currentPage + 1);
            } else if (target.classList.contains('number')) {
                this.currentPage = parseInt(target.dataset.page);
            }
            
            this.renderProjects();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// دالة لتنظيف النص للبحث - تطابق تماماً وظيفة news.js
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

// إنشاء نسخة من مدير المشروعات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.projectsManager = new ProjectsManager();
}); 