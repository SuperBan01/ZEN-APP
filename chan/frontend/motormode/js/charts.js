class ChartManager {
    constructor() {
        this.initCharts();
    }

    initCharts() {
        this.initSkillsRadar();
        this.initBalanceChart();
    }

    initSkillsRadar() {
        const ctx = document.getElementById('skillsRadar');
        if (!ctx) return;

        // 设置画布大小以适应手机屏幕
        ctx.style.width = '100%';
        ctx.style.maxWidth = '300px';  // 限制最大宽度
        ctx.style.height = 'auto';
        ctx.style.aspectRatio = '1';   // 保持正方形比例

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: [
                    '技术能力',
                    '沟通能力',
                    '领导力',
                    '创新思维',
                    '项目管理',
                    '学习能力'
                ],
                datasets: [{
                    label: '当前水平',
                    data: [85, 70, 60, 75, 65, 80],
                    fill: true,
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    borderColor: 'rgb(255, 107, 107)',
                    pointBackgroundColor: 'rgb(255, 107, 107)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 107, 107)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        borderWidth: 2
                    }
                },
                scales: {
                    r: {
                        angleLines: {
                            display: true
                        },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: {
                            font: {
                                size: 10  // 减小字体大小
                            }
                        },
                        pointLabels: {
                            font: {
                                size: 11  // 减小标签字体大小
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false  // 隐藏图例
                    }
                }
            }
        });
    }

    initBalanceChart() {
        const ctx = document.querySelector('.balance-chart');
        if (!ctx) return;

        // 创建生活平衡图表的容器
        const canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.maxWidth = '280px';  // 限制最大宽度
        canvas.style.height = 'auto';
        canvas.style.aspectRatio = '1';   // 保持正方形比例
        ctx.appendChild(canvas);

        new Chart(canvas, {
            type: 'polarArea',
            data: {
                labels: [
                    '工作',
                    '家庭',
                    '健康',
                    '学习',
                    '娱乐',
                    '社交'
                ],
                datasets: [{
                    data: [8, 7, 6, 8, 5, 6],
                    backgroundColor: [
                        'rgba(255, 107, 107, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(255, 206, 86, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                        'rgba(255, 159, 64, 0.5)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        min: 0,
                        max: 10,
                        ticks: {
                            stepSize: 2,
                            font: {
                                size: 10  // 减小刻度字体大小
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',  // 将图例移到底部
                        labels: {
                            boxWidth: 10,    // 减小图例标记大小
                            padding: 10,     // 减小图例间距
                            font: {
                                size: 11    // 减小图例字体大小
                            }
                        }
                    }
                }
            }
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
}); 