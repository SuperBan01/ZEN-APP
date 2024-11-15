class CultivationManager {
    constructor() {
        // 从localStorage加载数据，如果没有则使用默认值
        this.userData = this.loadUserData() || {
            level: 1,
            progress: 0,
            meditationCount: 0,
            streakDays: 0,
            chatCount: 0,
            lastMeditationDate: null,
            wisdomQuotes: [],
            journals: [],
            goals: [
                {
                    title: '初习坐禅',
                    target: 7,
                    progress: 0,
                    completed: false,
                    active: true
                },
                {
                    title: '达到一小时禅定',
                    target: 10,
                    progress: 0,
                    completed: false,
                    active: false
                }
            ]
        };
        
        this.initializeElements();
        this.bindEvents();
        this.updateUI();
        this.checkDailyStreak();
    }

    // 保存数据到localStorage
    saveUserData() {
        localStorage.setItem('zenUserData', JSON.stringify(this.userData));
    }

    // 从localStorage加载数据
    loadUserData() {
        const savedData = localStorage.getItem('zenUserData');
        return savedData ? JSON.parse(savedData) : null;
    }

    // 检查每日打卡
    checkDailyStreak() {
        const today = new Date().toDateString();
        const lastMeditation = this.userData.lastMeditationDate;

        if (!lastMeditation) return;

        const lastDate = new Date(lastMeditation).toDateString();
        const daysDiff = Math.floor((new Date(today) - new Date(lastDate)) / (1000 * 60 * 60 * 24));

        if (daysDiff > 1) {
            // 中断连续打卡
            this.userData.streakDays = 0;
            this.saveUserData();
        }
    }

    // 记录冥想
    async recordMeditation(duration) {
        const today = new Date().toDateString();
        const lastMeditation = this.userData.lastMeditationDate;

        // 更新冥想次数
        this.userData.meditationCount++;

        // 更新连续打卡天数
        if (!lastMeditation || new Date(lastMeditation).toDateString() !== today) {
            this.userData.streakDays++;
            this.userData.lastMeditationDate = new Date().toISOString();
        }

        // 更新等级和进度
        this.updateLevelAndProgress(duration);

        // 更新目标进度
        this.updateGoals();

        this.saveUserData();
        this.updateUI();
    }

    // 更新等级和进度
    updateLevelAndProgress(duration) {
        // 每10次冥想提升一个等级
        const newLevel = Math.floor(this.userData.meditationCount / 10) + 1;
        if (newLevel > this.userData.level) {
            this.userData.level = newLevel;
            // 显示升级提示
            this.showLevelUpNotification(newLevel);
        }

        // 计算当前等级的进度
        const progressInCurrentLevel = (this.userData.meditationCount % 10) * 10;
        this.userData.progress = progressInCurrentLevel;
    }

    // 显示升级提示
    showLevelUpNotification(level) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🎉 恭喜升级！</h3>
                <p>你已达到第 ${level} 层境界</p>
            </div>
        `;
        document.body.appendChild(notification);

        // 3秒后自动消失
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // 记录禅师对话
    recordChat(message, response) {
        this.userData.chatCount++;
        this.userData.wisdomQuotes.unshift({
            text: response,
            date: new Date().toLocaleDateString('zh-CN'),
            id: Date.now()
        });

        // 只保留最近的10条记录
        if (this.userData.wisdomQuotes.length > 10) {
            this.userData.wisdomQuotes.pop();
        }

        this.saveUserData();
        this.updateUI();
    }

    // 添加修行日志
    addJournal(content) {
        const journal = {
            content,
            date: new Date().toLocaleDateString('zh-CN'),
            id: Date.now()
        };
        this.userData.journals.unshift(journal);
        this.saveUserData();
        this.updateJournals();
    }

    // 更新目标进度
    updateGoals() {
        this.userData.goals.forEach(goal => {
            if (goal.active && !goal.completed) {
                goal.progress++;
                if (goal.progress >= goal.target) {
                    goal.completed = true;
                    goal.active = false;
                    // 激活下一个目标
                    const nextGoal = this.userData.goals.find(g => !g.completed && !g.active);
                    if (nextGoal) {
                        nextGoal.active = true;
                    }
                }
            }
        });
    }

    // ... 其他现有方法保持不变 ...
}

// 添加样式
const style = document.createElement('style');
style.textContent = `
    .level-up-notification {
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 242, 234, 0.95);
        padding: 1rem 2rem;
        border-radius: 12px;
        color: white;
        text-align: center;
        animation: slideDown 0.5s ease-out, fadeOut 0.5s ease-in 2.5s;
        z-index: 1000;
    }

    @keyframes slideDown {
        from { transform: translate(-50%, -100%); }
        to { transform: translate(-50%, 0); }
    }

    @keyframes fadeOut {
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// 导出实例以供其他模块使用
export const cultivationManager = new CultivationManager();