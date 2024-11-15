class PlannerManager {
    constructor() {
        this.currentTab = 'past';
        this.lifeEvents = [];
        this.initElements();
        this.initEventListeners();
        this.loadData();
    }

    initElements() {
        // 标签页切换按钮
        this.tabButtons = document.querySelectorAll('.tab-btn');
        this.sections = {
            past: document.querySelector('#pastTimeline'),
            present: document.querySelector('#presentStatus'),
            future: document.querySelector('#futurePlans')
        };
        
        // 图表相关元素
        this.skillsRadar = document.querySelector('#skillsRadar');
        this.balanceChart = document.querySelector('.balance-chart');

        // AI分析相关元素
        this.analysisBtn = document.querySelector('.analysis-btn');
        this.aiModal = document.querySelector('.ai-analysis-modal');
        this.closeBtn = document.querySelector('.closeBtn');

        // 添加新的元素引用
        this.addEventBtn = document.querySelector('.add-event-btn');
        this.timelineContent = document.querySelector('.timeline-content');
    }

    initEventListeners() {
        // 标签页切换
        if (this.tabButtons) {
            this.tabButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const tabName = e.target.dataset.tab;
                    this.switchTab(tabName);
                });
            });
        }

        // 添加经历按钮事件
        if (this.addEventBtn) {
            this.addEventBtn.addEventListener('click', () => this.showAddEventModal());
        }

        // AI分析按钮事件
        if (this.analysisBtn) {
            this.analysisBtn.addEventListener('click', () => this.performAIAnalysis());
        }

        // 关闭按钮事件
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => {
                this.aiModal.classList.add('hidden');
            });
        }

        // 点击弹窗外部关闭
        if (this.aiModal) {
            this.aiModal.addEventListener('click', (e) => {
                if (e.target === this.aiModal) {
                    this.hideAIAnalysis();
                }
            });

            // 阻止弹窗内容点击事件冒泡
            const modalContent = this.aiModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        }
    }

    switchTab(tabName) {
        // 更新标签页状态
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // 更新内容显示
        Object.entries(this.sections).forEach(([name, section]) => {
            if (section) {
                section.classList.toggle('hidden', name !== tabName);
            }
        });

        this.currentTab = tabName;

        // 如果切换到当前状态标签，初始化图表
        if (tabName === 'present' && window.chartManager) {
            window.chartManager.initCharts();
        }
    }

    loadData() {
        // 加载数据
        this.loadEvents();
        this.loadSkillsData();
        this.loadBalanceData();
    }

    loadEvents() {
        // 从本地存储或API加载事件数据
        const savedEvents = localStorage.getItem('lifeEvents');
        if (savedEvents) {
            const events = JSON.parse(savedEvents);
            this.renderEvents(events);
        }
    }

    loadSkillsData() {
        // 加载技能数据
        if (this.skillsRadar) {
            // 实现技能雷达图
        }
    }

    loadBalanceData() {
        // 加载生活平衡数据
        if (this.balanceChart) {
            // 实现生活平衡图表
        }
    }

    async showAIAnalysis() {
        if (this.aiModal) {
            this.aiModal.classList.add('show');  // 使用 show 类来显示
            
            try {
                const response = await fetch('/api/ai-analysis');
                const analysis = await response.json();
                this.updateAnalysisContent(analysis);
            } catch (error) {
                console.error('Failed to fetch AI analysis:', error);
            }
        }
    }

    hideAIAnalysis() {
        if (this.aiModal) {
            this.aiModal.classList.remove('show');  // 移除 show 类来隐藏
        }
    }

    showAddEventModal() {
        const modal = document.createElement('div');
        modal.className = 'ios-modal event-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <button class="cancel-btn">取消</button>
                    <h3>添加人生经历</h3>
                    <button class="save-btn">添加</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <input type="text" class="event-title-input ios-input" placeholder="事件标题">
                    </div>
                    <div class="form-group">
                        <div class="ios-select-group">
                            <label>事件类型</label>
                            <select class="event-type ios-select">
                                <option value="education">🎓 教育经历</option>
                                <option value="career">💼 职业发展</option>
                                <option value="life">🌟 生活事件</option>
                                <option value="achievement">🏆 个人成就</option>
                            </select>
                            <span class="select-arrow">›</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="ios-date-group">
                            <label>发生时间</label>
                            <input type="date" class="event-date ios-date">
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" class="event-location ios-input" placeholder="地点">
                    </div>
                    <div class="form-group">
                        <textarea class="event-description ios-textarea" 
                                placeholder="描述这段经历对你的影响..."
                                rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="ios-tags-group">
                            <label>情感标记</label>
                            <div class="emotion-tags">
                                <button class="emotion-tag" data-emotion="positive">😊 积极</button>
                                <button class="emotion-tag" data-emotion="neutral">😐 中性</button>
                                <button class="emotion-tag" data-emotion="negative">😔 消极</button>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <input type="text" class="event-tags ios-input" 
                               placeholder="添加标签（用逗号分隔）">
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 添加动画效果
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });

        // 绑定事件
        this.initModalEvents(modal);
    }

    initModalEvents(modal) {
        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');
        const emotionTags = modal.querySelectorAll('.emotion-tag');
        let selectedEmotion = null;

        // 情感标签选择
        emotionTags.forEach(tag => {
            tag.addEventListener('click', () => {
                emotionTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                selectedEmotion = tag.dataset.emotion;
            });
        });

        // 关闭模态框
        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(modal);
            }, 300);
        };

        cancelBtn.addEventListener('click', closeModal);

        // 保存事件
        saveBtn.addEventListener('click', () => {
            const eventData = {
                id: Date.now(),
                title: modal.querySelector('.event-title-input').value,
                type: modal.querySelector('.event-type').value,
                date: modal.querySelector('.event-date').value,
                location: modal.querySelector('.event-location').value,
                description: modal.querySelector('.event-description').value,
                emotion: selectedEmotion,
                tags: modal.querySelector('.event-tags').value.split(',').map(tag => tag.trim()),
                created_at: new Date().toISOString()
            };

            this.addLifeEvent(eventData);
            closeModal();
        });

        // 点击外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    async addLifeEvent(eventData) {
        try {
            const response = await fetch('/api/life-events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(eventData)
            });

            if (response.ok) {
                this.lifeEvents.push(eventData);
                this.renderLifeEvents();
                this.saveToLocalStorage();
            }
        } catch (error) {
            console.error('Failed to add life event:', error);
            // 离线模式下保存到本地
            this.lifeEvents.push(eventData);
            this.renderLifeEvents();
            this.saveToLocalStorage();
        }
    }

    async performAIAnalysis() {
        this.aiModal.classList.remove('hidden');
        
        const analysisPrompt = this.generateAnalysisPrompt();
        try {
            const response = await fetch('/api/ai-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: analysisPrompt,
                    lifeEvents: this.lifeEvents
                })
            });

            const analysis = await response.json();
            this.updateAnalysisUI(analysis);
        } catch (error) {
            console.error('AI Analysis failed:', error);
            // 显示错误信息
            this.updateAnalysisUI({
                summary: "暂时无法进行AI分析，请稍后再试...",
                suggestions: ["请检查网络连接", "确保已添加足够的人生经历"]
            });
        }
    }

    generateAnalysisPrompt() {
        return `
基于用户的人生经历数据，请进行以下分析：

1. 总体发展轨迹分析
- 识别关键转折点和重要决策
- 评估每个阶段的成长和进步

2. 能力倾向分析
- 根据经历识别核心能力和特长
- 发现潜在的发展方向

3. 机会与挑战分析
- 指出当前阶段的主要机会
- 预警可能的挑战和风险

4. 发展建议
- 提供3-5条具体的发展建议
- 建议应该切实可行且有针对性

请以温和鼓励的语气，突出用户的优势和潜力，同时务实地出需要改进的地方。
        `;
    }

    updateAnalysisUI(analysis) {
        const summaryText = this.aiModal.querySelector('.analysis-text');
        const suggestionsList = this.aiModal.querySelector('.suggestions-list');
        
        if (summaryText) {
            summaryText.textContent = analysis.summary;
        }
        
        if (suggestionsList && analysis.suggestions) {
            suggestionsList.innerHTML = analysis.suggestions
                .map(suggestion => `<li>${suggestion}</li>`)
                .join('');
        }
    }

    renderLifeEvents() {
        if (!this.timelineContent) return;
        
        this.timelineContent.innerHTML = '';
        const sortedEvents = [...this.lifeEvents].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );

        sortedEvents.forEach(event => {
            const eventElement = this.createEventElement(event);
            this.timelineContent.appendChild(eventElement);
        });
    }

    createEventElement(event) {
        const element = document.createElement('div');
        element.className = 'timeline-item';
        element.innerHTML = `
            <div class="timeline-date">${this.formatDate(event.date)}</div>
            <div class="timeline-card">
                <div class="card-header">
                    <h3>${event.title}</h3>
                    <span class="tag ${event.type}">${this.getEventTypeLabel(event.type)}</span>
                </div>
                <p class="card-description">${event.description}</p>
                <div class="card-footer">
                    <span class="location">📍 ${event.location}</span>
                    <div class="card-actions">
                        <button class="edit-btn" data-id="${event.id}">编辑</button>
                        <button class="delete-btn" data-id="${event.id}">删除</button>
                    </div>
                </div>
            </div>
        `;

        // 添加编辑和删除事件监听
        element.querySelector('.edit-btn').addEventListener('click', () => 
            this.editLifeEvent(event)
        );
        element.querySelector('.delete-btn').addEventListener('click', () => 
            this.deleteLifeEvent(event.id)
        );

        return element;
    }

    // ... 其他辅助方法 ...
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.plannerManager = new PlannerManager();
}); 