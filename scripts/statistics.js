document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('../data/statistics.json');
        const data = await response.json();
        
        // تحديث المخططات عند تغيير الوضع
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', () => {
            setTimeout(() => {
                renderAllCharts(data);
            }, 100);
        });
        
        // عرض جميع المخططات
        renderAllCharts(data);
        
        // إضافة الاستماع لتغيير حجم النافذة لإعادة رسم المخططات
        window.addEventListener('resize', () => {
            setTimeout(() => {
                renderAllCharts(data);
            }, 100);
        });
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
    }
});

function renderAllCharts(data) {
    renderOverview(data.overview);
    renderSourcesChart(data.energy_sources);
    renderMonthlyChart(data.energy_sources);
    renderProgressChart(data.yearly_progress);
    renderTargets(data.future_targets);
}

function renderOverview(overview) {
    const grid = document.querySelector('.overview-grid');
    grid.innerHTML = Object.entries(overview).map(([key, stat]) => `
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
    `).join('');
}

function getChartColors(isDarkMode) {
    return {
        solar: {
            color: '#FFA000',
            background:  'rgba(255, 160, 0, 0.8)'
        },
        wind: {
            color:  '#00796B',
            background:  'rgba(0, 121, 107, 0.8)'
        },
        hydro: {
            color: '#1976D2',
            background: 'rgba(25, 118, 210, 0.8)'
        },
        biomass: {
            color: '#43A047',
            background:  'rgba(67, 160, 71, 0.8)'
        }
    };
}

function getCommonChartOptions(isDarkMode) {
    const isMobile = window.innerWidth < 768;
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: isMobile ? 'bottom' : 'right',
                rtl: true,
                labels: {
                    font: {
                        family: 'Noto Kufi Arabic',
                        size: isMobile ? 10 : 14
                    },
                    color:  '#263238',
                    padding: isMobile ? 10 : 20,
                    boxWidth: isMobile ? 15 : 30
                }
            },
            tooltip: {
                titleFont: {
                    family: 'Noto Kufi Arabic',
                    size: isMobile ? 12 : 16
                },
                bodyFont: {
                    family: 'Noto Kufi Arabic',
                    size: isMobile ? 10 : 14
                },
                padding: isMobile ? 6 : 10,
                rtl: true,
                textDirection: 'rtl'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color:  'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    color:  '#263238',
                    font: {
                        family: 'Noto Kufi Arabic',
                        size: isMobile ? 10 : 12
                    },
                    maxRotation: 0,
                    padding: isMobile ? 5 : 10
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color:  '#263238',
                    font: {
                        family: 'Noto Kufi Arabic',
                        size: isMobile ? 10 : 12
                    },
                    maxRotation: isMobile ? 45 : 0,
                    padding: isMobile ? 5 : 10
                }
            }
        }
    };
}

function renderSourcesChart(sources) {
    const ctx = document.getElementById('sourcesChart').getContext('2d');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = getChartColors(isDarkMode);
    const isMobile = window.innerWidth < 768;

    // تدمير المخطط السابق إذا وجد
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['الطاقة الشمسية', 'طاقة الرياح', 'الطاقة المائية', 'الكتلة الحيوية'],
            datasets: [{
                data: Object.values(sources).map(source => source.capacity),
                backgroundColor: [
                    colors.solar.background,
                    colors.wind.background,
                    colors.hydro.background,
                    colors.biomass.background
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            ...getCommonChartOptions(isDarkMode),
            cutout: isMobile ? '50%' : '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Kufi Arabic',
                            size: isMobile ? 10 : 14
                        },
                        padding: isMobile ? 10 : 20,
                        color: '#263238',
                        boxWidth: isMobile ? 12 : 20
                    }
                }
            }
        }
    });

    // تفاصيل المصادر
    const details = document.querySelector('.sources-details');
    details.innerHTML = Object.entries(sources).map(([key, source]) => `
        <div class="source-detail">
            <h3>${getSourceName(key)}</h3>
            <ul>
                <li>القدرة: ${source.capacity} جيجاوات</li>
                <li>عدد المشروعات: ${source.projects}</li>
                <li>الكفاءة: ${source.efficiency}%</li>
                <li>المواقع: ${source.locations.join('، ')}</li>
            </ul>
        </div>
    `).join('');
}

function renderMonthlyChart(sources) {
    const ctx = document.getElementById('monthlyChart').getContext('2d');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = getChartColors(isDarkMode);
    const months = ['يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const isMobile = window.innerWidth < 768;

    // تدمير المخطط السابق إذا وجد
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: Object.entries(sources).map(([key, source]) => ({
                label: getSourceName(key),
                data: source.monthly_production,
                borderColor: colors[key].color,
                backgroundColor: colors[key].background,
                fill: false,
                tension: 0.4,
                borderWidth: isMobile ? 2 : 3,
                pointRadius: isMobile ? 2 : 4
            }))
        },
        options: {
            ...getCommonChartOptions(isDarkMode),
            aspectRatio: isMobile ? 1 : 2,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        boxWidth: isMobile ? 12 : 20
                    }
                }
            }
        }
    });
}

function renderProgressChart(progress) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const colors = getChartColors(isDarkMode);
    const isMobile = window.innerWidth < 768;

    // تدمير المخطط السابق إذا وجد
    const existingChart = Chart.getChart(ctx.canvas);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: progress.map(item => item.year),
            datasets: [{
                data: progress.map(item => item.total_capacity),
                backgroundColor: colors.wind.background,
                borderColor: colors.wind.color,
                borderWidth: 1
            }]
        },
        options: {
            ...getCommonChartOptions(isDarkMode),
            aspectRatio: isMobile ? 1 : 2,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ` القدرة: ${context.raw} جيجاوات`;
                        }
                    }
                }
            }
        }
    });

    // تحديث الجدول
    const table = document.querySelector('.progress-table');
    table.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>السنة</th>
                    <th>القدرة (جيجاوات)</th>
                    <th>الاستثمارات (مليار)</th>
                    <th>المشروعات</th>
                </tr>
            </thead>
            <tbody>
                ${progress.map(item => `
                    <tr>
                        <td>${item.year}</td>
                        <td>${item.total_capacity}</td>
                        <td>${item.investments}</td>
                        <td>${item.projects_count}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderTargets(targets) {
    const grid = document.querySelector('.targets-grid');
    grid.innerHTML = Object.entries(targets).map(([year, target]) => `
        <div class="target-card">
            <div class="target-year">${year}</div>
            <ul class="target-list">
                <li>نسبة الطاقة المتجددة: ${target.renewable_percentage}%</li>
                <li>القدرة المستهدفة: ${target.total_capacity} جيجاوات</li>
                <li>الاستثمارات المتوقعة: ${target.investments} مليار دولار</li>
            </ul>
        </div>
    `).join('');
}

function getSourceName(key) {
    const names = {
        solar: 'الطاقة الشمسية',
        wind: 'طاقة الرياح',
        hydro: 'الطاقة المائية',
        biomass: 'الكتلة الحيوية'
    };
    return names[key];
}

function getSourceColor(key) {
    const colors = {
        solar: '#FFA000',
        wind: '#00796B',
        hydro: '#1976D2',
        biomass: '#43A047'
    };
    return colors[key];
} 