/**
 * نظام إدارة موقع الطاقة المتجددة
 * لوحة التحكم الإدارية
 * تم التحديث: 02/03/2025
 * ملاحظة: يرجى التأكد من وجود جميع العناصر المطلوبة في صفحة admin.html
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل نظام لوحة التحكم الإدارية');
    
    // تهيئة النظام
    const AdminPanel = {
        // حالة النظام
        state: {
            isLoggedIn: false,
            currentUser: null,
            currentSection: 'dashboard',
            isLoading: false,
            currentFile: null,
            jsonEditor: null,
            selectedItem: null,
            confirmCallback: null,
            projectDetailsEditor: null
        },
        
        // العناصر المرجعية
        elements: {
            loginScreen: document.getElementById('loginScreen'),
            adminDashboard: document.getElementById('adminDashboard'),
            loginForm: document.getElementById('loginForm'),
            loginError: document.getElementById('loginError'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            togglePassword: document.getElementById('togglePassword'),
            logoutBtn: document.getElementById('logoutBtn'),
            adminUsername: document.getElementById('adminUsername'),
            navItems: document.querySelectorAll('.nav-item'),
            adminSections: document.querySelectorAll('.admin-section'),
            notification: document.getElementById('notification'),
            notificationMessage: document.getElementById('notificationMessage'),
            notificationIcon: document.getElementById('notificationIcon'),
            
            // لوحة المعلومات
            projectCount: document.getElementById('projectCount'),
            newsCount: document.getElementById('newsCount'),
            articlesCount: document.getElementById('articlesCount'),
            totalCapacity: document.getElementById('totalCapacity'),
            updatesList: document.getElementById('updatesList'),
            
            // محرر JSON
            fileSelect: document.getElementById('fileSelect'),
            jsonEditor: document.getElementById('jsonEditor'),
            validateBtn: document.getElementById('validateBtn'),
            saveFileBtn: document.getElementById('saveFileBtn'),
            editorStatus: document.getElementById('editorStatus')
        },
        
        // تهيئة النظام
        init: function() {
            console.log('بدء تهيئة نظام لوحة التحكم');
            
            // التحقق من وجود العناصر المطلوبة
            if (!this.elements.loginScreen || !this.elements.adminDashboard) {
                console.error('عناصر HTML الأساسية غير موجودة! يرجى التحقق من صفحة admin.html');
                alert('حدث خطأ في تحميل نظام لوحة التحكم. يرجى الاتصال بمسؤول النظام.');
                return;
            }
            
            this.setupEventListeners();
            this.checkLoginStatus();
            
            // تهيئة محرر JSON إذا كان متاحاً
            if (typeof CodeMirror !== 'undefined') {
                this.initJsonEditor();
            }
            
            console.log('تم تهيئة نظام لوحة التحكم بنجاح');
        },
        
        // إعداد مستمعات الأحداث
        setupEventListeners: function() {
            // نموذج تسجيل الدخول
            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.elements.togglePassword.addEventListener('click', this.togglePasswordVisibility.bind(this));
            
            // زر تسجيل الخروج
            this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
            
            // أزرار التنقل
            this.elements.navItems.forEach(item => {
                item.addEventListener('click', this.switchSection.bind(this));
            });
            
            // إغلاق الإشعارات
            const closeNotification = document.querySelector('.close-notification');
            if (closeNotification) {
                closeNotification.addEventListener('click', () => {
                    this.elements.notification.classList.remove('show');
                });
            }
            
            // إغلاق النوافذ المنبثقة
            document.querySelectorAll('.close-modal, [data-dismiss]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const modalId = btn.dataset.modal || btn.dataset.dismiss;
                    this.closeModal(modalId);
                });
            });
            
            // محرر JSON
            if (this.elements.fileSelect && this.elements.validateBtn && this.elements.saveFileBtn) {
                this.elements.fileSelect.addEventListener('change', this.loadJsonFile.bind(this));
                this.elements.validateBtn.addEventListener('click', this.validateJson.bind(this));
                this.elements.saveFileBtn.addEventListener('click', this.saveJsonFile.bind(this));
            }
        },
        
        // التحقق من حالة تسجيل الدخول
        checkLoginStatus: function() {
            // للتأكد من تنظيف أي بيانات سابقة قد تسبب مشاكل
            // localStorage.removeItem('admin_user'); // أزل التعليق إذا كنت تريد إعادة ضبط حالة تسجيل الدخول
            
            // في بيئة إنتاجية حقيقية، يجب التحقق من API أو خادم
            const user = localStorage.getItem('admin_user');
            
            if (user) {
                try {
                    this.state.currentUser = JSON.parse(user);
                    this.state.isLoggedIn = true;
                    this.showDashboard();
                } catch (e) {
                    console.error('خطأ في تحليل بيانات المستخدم', e);
                    this.state.isLoggedIn = false;
                    this.showLoginScreen();
                }
            } else {
                this.showLoginScreen();
            }
        },
        
        // معالجة تسجيل الدخول
        handleLogin: function(e) {
            e.preventDefault();
            
            const username = this.elements.username.value.trim();
            const password = this.elements.password.value.trim();
            
            if (!username || !password) {
                this.showLoginError('الرجاء إدخال اسم المستخدم وكلمة المرور');
                return;
            }
            
            // في بيئة إنتاجية حقيقية، يجب التحقق من بيانات الاعتماد مع الخادم
            // هذا للعرض فقط
            if (username === 'admin' && password === 'admin123') {
                const user = {
                    username: 'admin',
                    displayName: 'المدير',
                    role: 'administrator'
                };
                
                localStorage.setItem('admin_user', JSON.stringify(user));
                this.state.currentUser = user;
                this.state.isLoggedIn = true;
                this.elements.adminUsername.textContent = user.displayName;
                this.showDashboard();
                this.showNotification('تم تسجيل الدخول بنجاح', 'success');
                this.loadDashboardData();
            } else {
                this.showLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
            }
        },
        
        // معالجة تسجيل الخروج
        handleLogout: function() {
            localStorage.removeItem('admin_user');
            this.state.currentUser = null;
            this.state.isLoggedIn = false;
            this.showLoginScreen();
        },
        
        // إظهار رسالة خطأ في شاشة تسجيل الدخول
        showLoginError: function(message) {
            this.elements.loginError.textContent = message;
            this.elements.loginError.style.display = 'block';
            
            setTimeout(() => {
                this.elements.loginError.style.display = 'none';
            }, 3000);
        },
        
        // تبديل رؤية كلمة المرور
        togglePasswordVisibility: function() {
            const passwordInput = this.elements.password;
            const icon = this.elements.togglePassword.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        },
        
        // إظهار شاشة تسجيل الدخول
        showLoginScreen: function() {
            this.elements.loginScreen.style.display = 'flex';
            this.elements.adminDashboard.style.display = 'none';
            // إعادة تعيين نموذج تسجيل الدخول
            this.elements.loginForm.reset();
        },
        
        // إظهار لوحة التحكم
        showDashboard: function() {
            this.elements.loginScreen.style.display = 'none';
            this.elements.adminDashboard.style.display = 'block';
        },
        
        // التبديل بين أقسام لوحة التحكم
        switchSection: function(e) {
            const sectionName = e.currentTarget.dataset.section;
            
            if (sectionName && sectionName !== this.state.currentSection) {
                // تغيير القسم النشط في القائمة
                this.elements.navItems.forEach(item => {
                    if (item.dataset.section === sectionName) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
                
                // تحديث القسم النشط
                this.elements.adminSections.forEach(section => {
                    if (section.id === `${sectionName}-section`) {
                        section.classList.add('active');
                    } else {
                        section.classList.remove('active');
                    }
                });
                
                this.state.currentSection = sectionName;
                
                // تحميل البيانات للقسم الجديد
                this.loadSectionData(sectionName);
            }
        },
        
        // تحميل البيانات للقسم المحدد
        loadSectionData: function(sectionName) {
            switch (sectionName) {
                case 'dashboard':
                    this.loadDashboardData();
                    break;
                case 'json-editor':
                    this.loadJsonEditorData();
                    break;
                case 'projects':
                    this.loadProjectsData();
                    break;
                case 'news':
                    this.loadNewsData();
                    break;
                case 'articles':
                    this.loadArticlesData();
                    break;
            }
        },
        
        // تحميل بيانات لوحة المعلومات
        loadDashboardData: function() {
            this.state.isLoading = true;
            console.log('جاري تحميل بيانات لوحة المعلومات...');
            
            // تحميل بيانات المشاريع
            fetch('../data/projects.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ملف projects.json: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('تم استلام بيانات المشاريع:', data);
                    
                    // التحقق من شكل البيانات وتصحيح طريقة الوصول إليها
                    const projects = data.projects || (Array.isArray(data) ? data : []);
                    console.log('عدد المشاريع:', projects.length);
                    
                    if (this.elements.projectCount) {
                        this.elements.projectCount.textContent = projects.length || 0;
                    }
                    
                    // تحديث إجمالي الطاقة
                    if (this.elements.totalCapacity) {
                        let totalCapacity = 0;
                        projects.forEach(project => {
                            // استخراج الرقم من السلسلة النصية مثال: "500 ميجاوات"
                            const capacityMatch = String(project.capacity).match(/(\d+)/);
                            if (capacityMatch && capacityMatch[1]) {
                                totalCapacity += parseInt(capacityMatch[1], 10);
                            }
                        });
                        
                        this.elements.totalCapacity.textContent = `${totalCapacity} ميجاوات`;
                    }
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات المشاريع:', error);
                    this.showNotification('حدث خطأ أثناء تحميل بيانات المشاريع', 'error');
                });
            
            // تحميل بيانات الأخبار
            fetch('../data/news.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ملف news.json: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('تم استلام بيانات الأخبار:', data);
                    
                    // التحقق من شكل البيانات وتصحيح طريقة الوصول إليها
                    const news = data.news || (Array.isArray(data) ? data : []);
                    console.log('عدد الأخبار:', news.length);
                    
                    if (this.elements.newsCount) {
                        this.elements.newsCount.textContent = news.length || 0;
                    }
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات الأخبار:', error);
                    this.showNotification('حدث خطأ أثناء تحميل بيانات الأخبار', 'error');
                });
            
            // تحميل بيانات المقالات (نفترض أن لدينا ملف articles.json)
            fetch('../data/content.json')
                .then(response => response.json())
                .then(data => {
                    if (this.elements.articlesCount && data.articles) {
                        this.elements.articlesCount.textContent = data.articles.length || 0;
                    }
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات المقالات:', error);
                    this.showNotification('حدث خطأ أثناء تحميل بيانات المقالات', 'error');
                });
            
            // تحميل آخر التحديثات
            this.loadRecentUpdates();
            
            this.state.isLoading = false;
        },
        
        // تحميل آخر التحديثات
        loadRecentUpdates: function() {
            // في بيئة حقيقية، يجب تحميل هذه البيانات من سجلات النظام على الخادم
            // هذه بيانات افتراضية للعرض فقط
            const recentUpdates = [
                {
                    message: 'تم تحديث بيانات المشروع "محطة الطاقة الشمسية في نيوم"',
                    time: 'منذ 10 دقائق',
                    icon: 'fa-project-diagram'
                },
                {
                    message: 'تمت إضافة خبر جديد حول تقنيات تخزين الطاقة',
                    time: 'منذ 45 دقيقة',
                    icon: 'fa-newspaper'
                },
                {
                    message: 'تم تحديث إحصائيات الإنتاج لشهر يوليو 2023',
                    time: 'منذ 2 ساعة',
                    icon: 'fa-chart-bar'
                },
                {
                    message: 'تمت إضافة مشروع جديد "محطة طاقة الرياح في تبوك"',
                    time: 'منذ 1 يوم',
                    icon: 'fa-project-diagram'
                },
                {
                    message: 'تم تغيير حالة مشروع "محطة الطاقة المائية" إلى "مكتمل"',
                    time: 'منذ 2 يوم',
                    icon: 'fa-check-circle'
                }
            ];
            
            if (this.elements.updatesList) {
                this.elements.updatesList.innerHTML = '';
                
                recentUpdates.forEach(update => {
                    const updateItem = document.createElement('div');
                    updateItem.className = 'update-item';
                    
                    updateItem.innerHTML = `
                        <div class="update-icon">
                            <i class="fas ${update.icon}"></i>
                        </div>
                        <div class="update-content">
                            <p class="update-message">${update.message}</p>
                            <p class="update-time">${update.time}</p>
                        </div>
                    `;
                    
                    this.elements.updatesList.appendChild(updateItem);
                });
            }
        },
        
        // تهيئة محرر JSON
        initJsonEditor: function() {
            if (this.elements.jsonEditor) {
                this.state.jsonEditor = CodeMirror(this.elements.jsonEditor, {
                    lineNumbers: true,
                    mode: { name: "javascript", json: true },
                    theme: "monokai",
                    lineWrapping: true,
                    matchBrackets: true,
                    autoCloseBrackets: true,
                    gutters: ["CodeMirror-lint-markers"],
                    lint: true,
                    extraKeys: {
                        "Ctrl-Space": "autocomplete",
                        "F11": function(cm) {
                            cm.setOption("fullScreen", !cm.getOption("fullScreen"));
                        },
                        "Esc": function(cm) {
                            if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
                        }
                    }
                });
            }
            
            // تحميل الملف الأول افتراضياً
            if (this.elements.fileSelect && this.elements.fileSelect.value) {
                this.loadJsonFile({ target: this.elements.fileSelect });
            }
        },
        
        // تحميل بيانات محرر JSON
        loadJsonEditorData: function() {
            // لا شيء للقيام به هنا حيث يتم التحميل عند تغيير الملف المحدد
            if (this.elements.fileSelect && this.state.jsonEditor && !this.state.currentFile) {
                this.loadJsonFile({ target: this.elements.fileSelect });
            }
        },
        
        // تحميل ملف JSON إلى المحرر
        loadJsonFile: function(e) {
            const fileName = e.target.value;
            
            if (!fileName) return;
            
            this.state.isLoading = true;
            
            fetch(`../data/${fileName}`)
                .then(response => response.json())
                .then(data => {
                    if (this.state.jsonEditor) {
                        this.state.jsonEditor.setValue(JSON.stringify(data, null, 2));
                        this.state.currentFile = fileName;
                        this.updateEditorStatus(`تم تحميل "${fileName}" بنجاح`);
                    }
                })
                .catch(error => {
                    console.error('خطأ في تحميل ملف JSON:', error);
                    this.updateEditorStatus(`فشل تحميل "${fileName}": ${error.message}`, 'error');
                })
                .finally(() => {
                    this.state.isLoading = false;
                });
        },
        
        // التحقق من صحة JSON
        validateJson: function() {
            if (!this.state.jsonEditor) return;
            
            const content = this.state.jsonEditor.getValue();
            
            try {
                JSON.parse(content);
                this.updateEditorStatus('تم التحقق من البيانات بنجاح. التنسيق صحيح.', 'success');
            } catch (error) {
                this.updateEditorStatus(`خطأ في تنسيق JSON: ${error.message}`, 'error');
            }
        },
        
        // حفظ ملف JSON
        saveJsonFile: function() {
            if (!this.state.jsonEditor || !this.state.currentFile) return;
            
            const content = this.state.jsonEditor.getValue();
            
            try {
                // التحقق من صحة JSON قبل الحفظ
                JSON.parse(content);
                
                // في بيئة حقيقية، يجب إرسال البيانات إلى API/خادم لحفظها
                // هذا للعرض فقط - سنتظاهر بأن الحفظ تم بنجاح
                this.updateEditorStatus(`تم حفظ "${this.state.currentFile}" بنجاح`, 'success');
                this.showNotification(`تم حفظ ملف البيانات "${this.state.currentFile}" بنجاح`, 'success');
                
                // إضافة تحديث لسجل التحديثات
                if (this.elements.updatesList) {
                    const updateItem = document.createElement('div');
                    updateItem.className = 'update-item';
                    
                    updateItem.innerHTML = `
                        <div class="update-icon">
                            <i class="fas fa-save"></i>
                        </div>
                        <div class="update-content">
                            <p class="update-message">تم تحديث ملف "${this.state.currentFile}"</p>
                            <p class="update-time">الآن</p>
                        </div>
                    `;
                    
                    if (this.elements.updatesList.firstChild) {
                        this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                    } else {
                        this.elements.updatesList.appendChild(updateItem);
                    }
                }
            } catch (error) {
                this.updateEditorStatus(`فشل الحفظ: خطأ في تنسيق JSON: ${error.message}`, 'error');
                this.showNotification('فشل حفظ الملف. تأكد من صحة تنسيق البيانات.', 'error');
            }
        },
        
        // تحديث حالة المحرر
        updateEditorStatus: function(message, type = 'info') {
            if (!this.elements.editorStatus) return;
            
            this.elements.editorStatus.textContent = message;
            this.elements.editorStatus.className = 'editor-status';
            
            switch (type) {
                case 'success':
                    this.elements.editorStatus.classList.add('success');
                    break;
                case 'error':
                    this.elements.editorStatus.classList.add('error');
                    break;
                case 'info':
                default:
                    this.elements.editorStatus.classList.add('info');
                    break;
            }
        },
        
        // عرض إشعار للمستخدم
        showNotification: function(message, type = 'info') {
            this.elements.notificationMessage.textContent = message;
            
            // تعيين الأيقونة حسب نوع الإشعار
            this.elements.notificationIcon.className = 'fas';
            
            switch (type) {
                case 'success':
                    this.elements.notificationIcon.classList.add('fa-check-circle');
                    break;
                case 'error':
                    this.elements.notificationIcon.classList.add('fa-exclamation-circle');
                    break;
                case 'info':
                default:
                    this.elements.notificationIcon.classList.add('fa-info-circle');
                    break;
            }
            
            // إظهار الإشعار
            this.elements.notification.classList.add('show');
            
            // إخفاء الإشعار بعد 3 ثوان
            setTimeout(() => {
                this.elements.notification.classList.remove('show');
            }, 3000);
        },
        
        // فتح نافذة منبثقة
        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        },
        
        // إغلاق نافذة منبثقة
        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'none';
                
                // إعادة تعيين النموذج إذا كان موجوداً
                const form = modal.querySelector('form');
                if (form) {
                    form.reset();
                }
            }
        },
        
        // تأكيد إجراء
        confirmAction: function(title, message, callback) {
            const confirmModal = document.getElementById('confirmModal');
            const confirmTitle = document.getElementById('confirmTitle');
            const confirmMessage = document.getElementById('confirmMessage');
            const confirmBtn = document.getElementById('confirmAction');
            const cancelBtn = document.getElementById('cancelConfirm');
            
            if (confirmModal && confirmTitle && confirmMessage && confirmBtn) {
                // تعيين العنوان والرسالة
                confirmTitle.textContent = title;
                confirmMessage.textContent = message;
                
                // تعيين وظيفة التأكيد
                this.state.confirmCallback = callback;
                
                // تعيين مستمع الأحداث لزر التأكيد وزر الإلغاء
                confirmBtn.onclick = () => {
                    if (typeof this.state.confirmCallback === 'function') {
                        this.state.confirmCallback();
                    }
                    this.closeModal('confirmModal');
                };
                
                cancelBtn.onclick = () => {
                    this.closeModal('confirmModal');
                };
                
                // فتح النافذة المنبثقة
                this.openModal('confirmModal');
            }
        },
        
        // تحميل بيانات المشاريع
        loadProjectsData: function() {
            const projectsTable = document.getElementById('projectsTable');
            const tbody = projectsTable ? projectsTable.querySelector('tbody') : null;
            
            if (!tbody) {
                console.error('لم يتم العثور على جدول المشاريع!');
                return;
            }
            
            this.state.isLoading = true;
            console.log('جاري تحميل بيانات المشاريع للجدول...');
            tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">جاري تحميل البيانات...</td></tr>';
            
            fetch('../data/projects.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ملف projects.json: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('تم استلام بيانات المشاريع للجدول:', data);
                    
                    // التحقق من شكل البيانات وتصحيح طريقة الوصول إليها
                    const projects = data.projects || (Array.isArray(data) ? data : []);
                    console.log('عدد المشاريع للجدول:', projects.length);
                    
                    tbody.innerHTML = '';
                    
                    if (projects.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">لا توجد مشاريع حالياً</td></tr>';
                        return;
                    }
                    
                    projects.forEach(project => {
                        const row = document.createElement('tr');
                        
                        // تحديد لون خلفية الحالة
                        let statusClass = '';
                        switch (project.status) {
                            case 'مكتمل':
                                statusClass = 'status-completed';
                                break;
                            case 'جاري التنفيذ':
                                statusClass = 'status-in-progress';
                                break;
                            case 'مخطط له':
                                statusClass = 'status-planned';
                                break;
                        }
                        
                        row.innerHTML = `
                            <td>${project.id}</td>
                            <td>${project.title}</td>
                            <td>${Array.isArray(project.category) ? project.category.join(', ') : project.category}</td>
                            <td>${project.location}</td>
                            <td><span class="status-badge ${statusClass}">${project.status}</span></td>
                            <td class="table-actions">
                                <button class="edit" data-id="${project.id}" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete" data-id="${project.id}" title="حذف">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                    
                    // إضافة مستمعات الأحداث لأزرار التعديل والحذف
                    this.setupProjectActions();
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات المشاريع للجدول:', error);
                    tbody.innerHTML = '<tr><td colspan="6" class="error-cell">حدث خطأ أثناء تحميل البيانات</td></tr>';
                    this.showNotification('حدث خطأ أثناء تحميل بيانات المشاريع', 'error');
                })
                .finally(() => {
                    this.state.isLoading = false;
                });
                
            // إعداد زر إضافة مشروع جديد
            const addProjectBtn = document.getElementById('addProjectBtn');
            if (addProjectBtn) {
                addProjectBtn.addEventListener('click', this.showAddProjectForm.bind(this));
            }
        },
        
        // إعداد أزرار المشاريع
        setupProjectActions: function() {
            // أزرار التعديل
            document.querySelectorAll('#projectsTable .edit').forEach(btn => {
                btn.addEventListener('click', e => {
                    const projectId = e.currentTarget.dataset.id;
                    this.loadProjectForEdit(projectId);
                });
            });
            
            // أزرار الحذف
            document.querySelectorAll('#projectsTable .delete').forEach(btn => {
                btn.addEventListener('click', e => {
                    const projectId = e.currentTarget.dataset.id;
                    this.confirmAction(
                        'تأكيد الحذف',
                        `هل أنت متأكد من رغبتك في حذف المشروع رقم ${projectId}؟`,
                        () => this.deleteProject(projectId)
                    );
                });
            });
        },
        
        // عرض نموذج إضافة مشروع جديد
        showAddProjectForm: function() {
            // إعادة تعيين النموذج وتغيير عنوان النافذة
            document.getElementById('projectModalTitle').textContent = 'إضافة مشروع جديد';
            document.getElementById('projectForm').reset();
            
            // توليد معرف جديد للمشروع
            const newId = 'P' + Date.now().toString().slice(-6);
            document.getElementById('projectId').value = newId;
            
            // إعداد التعامل مع النموذج
            const projectForm = document.getElementById('projectForm');
            if (projectForm) {
                projectForm.removeEventListener('submit', this.handleEditProject);
                projectForm.addEventListener('submit', this.handleAddProject.bind(this));
            }
            
            // عرض شريط التقدم
            const progressRange = document.getElementById('projectProgress');
            const progressValue = document.getElementById('progressValue');
            if (progressRange && progressValue) {
                progressRange.value = 0;
                progressValue.textContent = '0';
                
                progressRange.addEventListener('input', function() {
                    progressValue.textContent = this.value;
                });
            }
            
            // تهيئة محرر تفاصيل المشروع
            this.initProjectDetailsEditor();
            
            // فتح النافذة المنبثقة
            this.openModal('projectModal');
        },
        
        // تهيئة محرر تفاصيل المشروع
        initProjectDetailsEditor: function(details = {}) {
            const container = document.getElementById('projectDetailsEditor');
            if (!container) return;
            
            // إنشاء محرر JSON بسيط للتفاصيل
            if (typeof CodeMirror !== 'undefined') {
                // إذا كان المحرر موجوداً بالفعل، نقوم بتدميره
                if (this.state.projectDetailsEditor) {
                    container.innerHTML = '';
                }
                
                this.state.projectDetailsEditor = CodeMirror(container, {
                    lineNumbers: true,
                    mode: { name: "javascript", json: true },
                    theme: "monokai",
                    lineWrapping: true,
                    matchBrackets: true,
                    autoCloseBrackets: true
                });
                
                this.state.projectDetailsEditor.setValue(JSON.stringify(details, null, 2));
            } else {
                // استخدام textarea إذا لم يكن CodeMirror متاحاً
                container.innerHTML = `
                    <textarea id="projectDetailsTextarea" rows="6">${JSON.stringify(details, null, 2)}</textarea>
                `;
            }
        },
        
        // تحميل مشروع للتعديل
        loadProjectForEdit: function(projectId) {
            fetch('../data/projects.json')
                .then(response => response.json())
                .then(data => {
                    const projects = data.projects || [];
                    const project = projects.find(p => p.id === projectId);
                    
                    if (!project) {
                        this.showNotification('لم يتم العثور على المشروع المحدد', 'error');
                        return;
                    }
                    
                    // تعيين عنوان النافذة
                    document.getElementById('projectModalTitle').textContent = 'تعديل المشروع';
                    
                    // ملء النموذج ببيانات المشروع
                    const form = document.getElementById('projectForm');
                    form.querySelector('#projectId').value = project.id;
                    form.querySelector('#projectTitle').value = project.title;
                    
                    // تعيين الفئات
                    const categorySelect = form.querySelector('#projectCategory');
                    if (categorySelect) {
                        Array.from(categorySelect.options).forEach(option => {
                            if (Array.isArray(project.category)) {
                                option.selected = project.category.includes(option.value);
                            } else {
                                option.selected = project.category === option.value;
                            }
                        });
                    }
                    
                    form.querySelector('#projectLocation').value = project.location;
                    form.querySelector('#projectStatus').value = project.status;
                    form.querySelector('#projectBudget').value = project.budget;
                    
                    // التعامل مع dates/date (قد يكون الاسم مختلفًا في الملف)
                    if (project.dates) {
                        form.querySelector('#projectStartDate').value = project.dates.start;
                        form.querySelector('#projectEndDate').value = project.dates.end;
                    } else if (project.date) {
                        form.querySelector('#projectStartDate').value = project.date.start;
                        form.querySelector('#projectEndDate').value = project.date.end;
                    }
                    
                    form.querySelector('#projectCapacity').value = project.capacity;
                    form.querySelector('#projectImage').value = project.image;
                    form.querySelector('#projectDescription').value = project.description;
                    
                    // تعيين نسبة التقدم
                    const progressRange = document.getElementById('projectProgress');
                    const progressValue = document.getElementById('progressValue');
                    if (progressRange && progressValue) {
                        progressRange.value = project.progress || 0;
                        progressValue.textContent = project.progress || 0;
                        
                        progressRange.addEventListener('input', function() {
                            progressValue.textContent = this.value;
                        });
                    }
                    
                    // تهيئة محرر تفاصيل المشروع
                    this.initProjectDetailsEditor(project.details || {});
                    
                    // إعداد التعامل مع النموذج
                    if (form) {
                        form.removeEventListener('submit', this.handleAddProject);
                        form.addEventListener('submit', this.handleEditProject.bind(this));
                    }
                    
                    // فتح النافذة المنبثقة
                    this.openModal('projectModal');
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات المشروع:', error);
                    this.showNotification('حدث خطأ أثناء تحميل بيانات المشروع', 'error');
                });
        },
        
        // معالجة إضافة مشروع جديد
        handleAddProject: function(e) {
            e.preventDefault();
            
            const form = e.target;
            const projectData = this.getProjectFormData(form);
            
            // في بيئة حقيقية، يجب إرسال البيانات إلى API/خادم لحفظها
            // هذا للعرض فقط - سنتظاهر بأن الإضافة تمت بنجاح
            this.showNotification(`تم إضافة المشروع "${projectData.title}" بنجاح`, 'success');
            this.closeModal('projectModal');
            
            // تحديث جدول المشاريع
            this.loadProjectsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تمت إضافة مشروع جديد "${projectData.title}"</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // معالجة تعديل مشروع
        handleEditProject: function(e) {
            e.preventDefault();
            
            const form = e.target;
            const projectData = this.getProjectFormData(form);
            
            // في بيئة حقيقية، يجب إرسال البيانات إلى API/خادم لحفظها
            // هذا للعرض فقط - سنتظاهر بأن التعديل تم بنجاح
            this.showNotification(`تم تحديث المشروع "${projectData.title}" بنجاح`, 'success');
            this.closeModal('projectModal');
            
            // تحديث جدول المشاريع
            this.loadProjectsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تم تحديث بيانات المشروع "${projectData.title}"</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // الحصول على بيانات نموذج المشروع
        getProjectFormData: function(form) {
            // تجميع الفئات المحددة
            const categorySelect = form.querySelector('#projectCategory');
            const selectedCategories = Array.from(categorySelect.selectedOptions).map(option => option.value);
            
            // الحصول على تفاصيل المشروع
            let details = {};
            if (this.state.projectDetailsEditor) {
                try {
                    details = JSON.parse(this.state.projectDetailsEditor.getValue());
                } catch (e) {
                    console.error('خطأ في تحليل تفاصيل المشروع:', e);
                    details = {};
                }
            } else {
                const textarea = document.getElementById('projectDetailsTextarea');
                if (textarea) {
                    try {
                        details = JSON.parse(textarea.value);
                    } catch (e) {
                        console.error('خطأ في تحليل تفاصيل المشروع من النص:', e);
                        details = {};
                    }
                }
            }
            
            // تجميع بيانات المشروع مع ضمان التوافق مع هيكل البيانات المتوقع
            return {
                id: form.querySelector('#projectId').value,
                title: form.querySelector('#projectTitle').value,
                category: selectedCategories,
                location: form.querySelector('#projectLocation').value,
                status: form.querySelector('#projectStatus').value,
                budget: form.querySelector('#projectBudget').value,
                date: {
                    start: form.querySelector('#projectStartDate').value,
                    end: form.querySelector('#projectEndDate').value
                },
                // للتوافق مع الهيكل القديم والجديد
                dates: {
                    start: form.querySelector('#projectStartDate').value,
                    end: form.querySelector('#projectEndDate').value
                },
                capacity: form.querySelector('#projectCapacity').value,
                image: form.querySelector('#projectImage').value,
                description: form.querySelector('#projectDescription').value,
                progress: parseInt(form.querySelector('#projectProgress').value, 10),
                details: details
            };
        },
        
        // حذف مشروع
        deleteProject: function(projectId) {
            // في بيئة حقيقية، يجب إرسال طلب الحذف إلى API/خادم
            // هذا للعرض فقط - سنتظاهر بأن الحذف تم بنجاح
            this.showNotification(`تم حذف المشروع رقم ${projectId} بنجاح`, 'success');
            
            // تحديث جدول المشاريع
            this.loadProjectsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تم حذف المشروع رقم ${projectId}</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // تحميل بيانات الأخبار
        loadNewsData: function() {
            const newsTable = document.getElementById('newsTable');
            const tbody = newsTable ? newsTable.querySelector('tbody') : null;
            
            if (!tbody) {
                console.error('لم يتم العثور على جدول الأخبار!');
                return;
            }
            
            this.state.isLoading = true;
            console.log('جاري تحميل بيانات الأخبار للجدول...');
            tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">جاري تحميل البيانات...</td></tr>';
            
            fetch('../data/news.json')
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`فشل تحميل ملف news.json: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('تم استلام بيانات الأخبار للجدول:', data);
                    
                    // التحقق من شكل البيانات وتصحيح طريقة الوصول إليها
                    const news = data.news || (Array.isArray(data) ? data : []);
                    console.log('عدد الأخبار للجدول:', news.length);
                    
                    tbody.innerHTML = '';
                    
                    if (news.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="5" class="empty-cell">لا توجد أخبار حالياً</td></tr>';
                        return;
                    }
                    
                    news.forEach(item => {
                        const row = document.createElement('tr');
                        
                        row.innerHTML = `
                            <td>${item.id}</td>
                            <td>${item.title}</td>
                            <td>${item.date}</td>
                            <td>${Array.isArray(item.categories) ? item.categories.join(', ') : item.categories || ''}</td>
                            <td class="table-actions">
                                <button class="edit" data-id="${item.id}" title="تعديل">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="delete" data-id="${item.id}" title="حذف">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </td>
                        `;
                        
                        tbody.appendChild(row);
                    });
                    
                    // إضافة مستمعات الأحداث لأزرار التعديل والحذف
                    this.setupNewsActions();
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات الأخبار للجدول:', error);
                    tbody.innerHTML = '<tr><td colspan="5" class="error-cell">حدث خطأ أثناء تحميل البيانات</td></tr>';
                    this.showNotification('حدث خطأ أثناء تحميل بيانات الأخبار', 'error');
                })
                .finally(() => {
                    this.state.isLoading = false;
                });
                
            // إعداد زر إضافة خبر جديد
            const addNewsBtn = document.getElementById('addNewsBtn');
            if (addNewsBtn) {
                addNewsBtn.addEventListener('click', this.showAddNewsForm.bind(this));
            }
        },
        
        // إعداد أزرار الأخبار
        setupNewsActions: function() {
            // أزرار التعديل
            document.querySelectorAll('#newsTable .edit').forEach(btn => {
                btn.addEventListener('click', e => {
                    const newsId = e.currentTarget.dataset.id;
                    this.loadNewsForEdit(newsId);
                });
            });
            
            // أزرار الحذف
            document.querySelectorAll('#newsTable .delete').forEach(btn => {
                btn.addEventListener('click', e => {
                    const newsId = e.currentTarget.dataset.id;
                    this.confirmAction(
                        'تأكيد الحذف',
                        `هل أنت متأكد من رغبتك في حذف الخبر رقم ${newsId}؟`,
                        () => this.deleteNews(newsId)
                    );
                });
            });
        },
        
        // عرض نموذج إضافة خبر جديد
        showAddNewsForm: function() {
            // إعادة تعيين النموذج وتغيير عنوان النافذة
            document.getElementById('newsModalTitle').textContent = 'إضافة خبر جديد';
            document.getElementById('newsForm').reset();
            
            // توليد معرف جديد للخبر
            const newId = 'N' + Date.now().toString().slice(-6);
            document.getElementById('newsId').value = newId;
            
            // تعيين تاريخ اليوم
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('newsDate').value = today;
            
            // إعداد التعامل مع النموذج
            const newsForm = document.getElementById('newsForm');
            if (newsForm) {
                newsForm.removeEventListener('submit', this.handleEditNews);
                newsForm.addEventListener('submit', this.handleAddNews.bind(this));
            }
            
            // فتح النافذة المنبثقة
            this.openModal('newsModal');
        },
        
        // تحميل خبر للتعديل
        loadNewsForEdit: function(newsId) {
            fetch('../data/news.json')
                .then(response => response.json())
                .then(data => {
                    const news = data.news || [];
                    const newsItem = news.find(n => n.id === newsId);
                    
                    if (!newsItem) {
                        this.showNotification('لم يتم العثور على الخبر المحدد', 'error');
                        return;
                    }
                    
                    // تعيين عنوان النافذة
                    document.getElementById('newsModalTitle').textContent = 'تعديل الخبر';
                    
                    // ملء النموذج ببيانات الخبر
                    const form = document.getElementById('newsForm');
                    form.querySelector('#newsId').value = newsItem.id;
                    form.querySelector('#newsTitle').value = newsItem.title;
                    form.querySelector('#newsDate').value = newsItem.date;
                    
                    // تعيين التصنيفات
                    const categoriesSelect = form.querySelector('#newsCategories');
                    if (categoriesSelect) {
                        Array.from(categoriesSelect.options).forEach(option => {
                            if (Array.isArray(newsItem.categories)) {
                                option.selected = newsItem.categories.includes(option.value);
                            } else if (typeof newsItem.categories === 'string') {
                                option.selected = newsItem.categories === option.value;
                            }
                        });
                    }
                    
                    form.querySelector('#newsImage').value = newsItem.image;
                    form.querySelector('#newsExcerpt').value = newsItem.excerpt;
                    form.querySelector('#newsContent').value = newsItem.content;
                    
                    // إعداد التعامل مع النموذج
                    if (form) {
                        form.removeEventListener('submit', this.handleAddNews);
                        form.addEventListener('submit', this.handleEditNews.bind(this));
                    }
                    
                    // فتح النافذة المنبثقة
                    this.openModal('newsModal');
                })
                .catch(error => {
                    console.error('خطأ في تحميل بيانات الخبر:', error);
                    this.showNotification('حدث خطأ أثناء تحميل بيانات الخبر', 'error');
                });
        },
        
        // معالجة إضافة خبر جديد
        handleAddNews: function(e) {
            e.preventDefault();
            
            const form = e.target;
            const newsData = this.getNewsFormData(form);
            
            // في بيئة حقيقية، يجب إرسال البيانات إلى API/خادم لحفظها
            // هذا للعرض فقط - سنتظاهر بأن الإضافة تمت بنجاح
            this.showNotification(`تم إضافة الخبر "${newsData.title}" بنجاح`, 'success');
            this.closeModal('newsModal');
            
            // تحديث جدول الأخبار
            this.loadNewsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-plus-circle"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تمت إضافة خبر جديد "${newsData.title}"</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // معالجة تعديل خبر
        handleEditNews: function(e) {
            e.preventDefault();
            
            const form = e.target;
            const newsData = this.getNewsFormData(form);
            
            // في بيئة حقيقية، يجب إرسال البيانات إلى API/خادم لحفظها
            // هذا للعرض فقط - سنتظاهر بأن التعديل تم بنجاح
            this.showNotification(`تم تحديث الخبر "${newsData.title}" بنجاح`, 'success');
            this.closeModal('newsModal');
            
            // تحديث جدول الأخبار
            this.loadNewsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تم تحديث بيانات الخبر "${newsData.title}"</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // الحصول على بيانات نموذج الخبر
        getNewsFormData: function(form) {
            // تجميع التصنيفات المحددة
            const categoriesSelect = form.querySelector('#newsCategories');
            const selectedCategories = Array.from(categoriesSelect.selectedOptions).map(option => option.value);
            
            // تجميع بيانات الخبر
            return {
                id: form.querySelector('#newsId').value,
                title: form.querySelector('#newsTitle').value,
                date: form.querySelector('#newsDate').value,
                categories: selectedCategories,
                image: form.querySelector('#newsImage').value,
                excerpt: form.querySelector('#newsExcerpt').value,
                content: form.querySelector('#newsContent').value
            };
        },
        
        // حذف خبر
        deleteNews: function(newsId) {
            // في بيئة حقيقية، يجب إرسال طلب الحذف إلى API/خادم
            // هذا للعرض فقط - سنتظاهر بأن الحذف تم بنجاح
            this.showNotification(`تم حذف الخبر رقم ${newsId} بنجاح`, 'success');
            
            // تحديث جدول الأخبار
            this.loadNewsData();
            
            // إضافة تحديث لسجل التحديثات
            if (this.elements.updatesList) {
                const updateItem = document.createElement('div');
                updateItem.className = 'update-item';
                
                updateItem.innerHTML = `
                    <div class="update-icon">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                    <div class="update-content">
                        <p class="update-message">تم حذف الخبر رقم ${newsId}</p>
                        <p class="update-time">الآن</p>
                    </div>
                `;
                
                if (this.elements.updatesList.firstChild) {
                    this.elements.updatesList.insertBefore(updateItem, this.elements.updatesList.firstChild);
                } else {
                    this.elements.updatesList.appendChild(updateItem);
                }
            }
        },
        
        // تحميل بيانات المقالات - يمكنك إضافة هذه الوظيفة لاحقاً
        loadArticlesData: function() {
            // ستتم إضافة هذه الوظيفة في المستقبل
            this.showNotification('وظيفة إدارة المقالات قيد التطوير', 'info');
        }
    };
    
    // بدء تشغيل النظام
    try {
        AdminPanel.init();
    } catch (error) {
        console.error('حدث خطأ أثناء تهيئة نظام لوحة التحكم:', error);
        alert('حدث خطأ في تشغيل نظام لوحة التحكم. يرجى الاتصال بمسؤول النظام.');
    }
}); 