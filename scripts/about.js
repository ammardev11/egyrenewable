// استدعاء البيانات من ملف content.json
async function loadAboutContent() {
    try {
        const response = await fetch('../data/content.json');
        const data = await response.json();
        const aboutData = data.about;

        // تحديث محتوى الرؤية
        document.querySelector('.vision p').textContent = aboutData.vision.description;
        document.querySelector('.vision h3').textContent = aboutData.vision.title;

        // تحديث محتوى الهدف
        document.querySelector('.mission p').textContent = aboutData.mission.description;
        document.querySelector('.mission h3').textContent = aboutData.mission.title;

        // تحديث معلومات المشروع
        document.querySelector('.project p').textContent = aboutData.project_info.description;
        document.querySelector('.project h3').textContent = aboutData.project_info.title;

        // تحديث معلومات الفريق
        document.querySelector('.team h3').textContent = aboutData.team.title;
        
        // إنشاء عناصر الفريق
        const teamMembersContainer = document.querySelector('.team-members');
        teamMembersContainer.innerHTML = aboutData.team.members
            .map(member => `
                <div class="team-member">
                    <div class="member-info">
                        <h4 class="member-name">${member.name}</h4>
                        <span class="member-role">${member.role}</span>
                    </div>
                    <a href="${member.github}" target="_blank" class="social-btn github">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            `).join('');

        // تحديث الروابط
        document.querySelector('.social-btn.facebook').href = aboutData.school.facebook;
        document.querySelector('.social-btn.maps').href = aboutData.school.location;
        document.querySelector('.social-btn.ide').href = aboutData.school.ide_link;
    } catch (error) {
        console.error('Error loading content:', error);
    }
}

// تحميل المحتوى عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', loadAboutContent); 