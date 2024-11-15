class GoalsManager {
    constructor() {
        this.goals = [];
        this.initElements();
        if (this.goalsTimeline) {
            this.initEventListeners();
            this.loadGoals();
        }
    }

    initElements() {
        this.goalsTimeline = document.querySelector('.goals-timeline');
        this.addGoalBtn = document.querySelector('.add-goal-btn');
    }

    initEventListeners() {
        if (this.addGoalBtn) {
            this.addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }
    }

    showAddGoalModal() {
        const modal = document.createElement('div');
        modal.className = 'goal-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>设定新目标</h3>
                <input type="text" class="goal-title-input" placeholder="目标名称">
                <textarea class="goal-description-input" placeholder="描述你的目标..."></textarea>
                <div class="goal-date-section">
                    <div class="date-field">
                        <label>开始日期</label>
                        <input type="date" class="goal-start-date">
                    </div>
                    <div class="date-field">
                        <label>目标日期</label>
                        <input type="date" class="goal-end-date">
                    </div>
                </div>
                <div class="goal-milestones">
                    <h4>里程碑</h4>
                    <div class="milestone-list"></div>
                    <button class="add-milestone-btn">+ 添加里程碑</button>
                </div>
                <div class="modal-buttons">
                    <button class="cancel-btn">取消</button>
                    <button class="save-btn">保存</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // 绑定事件
        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');
        const addMilestoneBtn = modal.querySelector('.add-milestone-btn');
        const milestoneList = modal.querySelector('.milestone-list');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        addMilestoneBtn.addEventListener('click', () => {
            const milestoneItem = document.createElement('div');
            milestoneItem.className = 'milestone-item';
            milestoneItem.innerHTML = `
                <input type="text" placeholder="里程碑描述">
                <input type="date" class="milestone-date">
                <button class="remove-milestone-btn">×</button>
            `;
            milestoneList.appendChild(milestoneItem);

            // 绑定删除里程碑按钮
            milestoneItem.querySelector('.remove-milestone-btn').addEventListener('click', () => {
                milestoneList.removeChild(milestoneItem);
            });
        });

        saveBtn.addEventListener('click', () => {
            const goal = {
                id: Date.now(),
                title: modal.querySelector('.goal-title-input').value,
                description: modal.querySelector('.goal-description-input').value,
                startDate: modal.querySelector('.goal-start-date').value,
                endDate: modal.querySelector('.goal-end-date').value,
                milestones: Array.from(modal.querySelectorAll('.milestone-item')).map(item => ({
                    description: item.querySelector('input[type="text"]').value,
                    date: item.querySelector('.milestone-date').value,
                    completed: false
                })),
                completed: false,
                progress: 0
            };

            this.addGoal(goal);
            document.body.removeChild(modal);
        });
    }

    async addGoal(goal) {
        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(goal)
            });
            const result = await response.json();
            goal.id = result.id;
            this.goals.push(goal);
            this.renderGoals();
        } catch (error) {
            console.error('Failed to add goal:', error);
            // 离线模式下仍然添加到本地
            this.goals.push(goal);
            this.saveGoals();
            this.renderGoals();
        }
    }

    renderGoals() {
        this.goalsTimeline.innerHTML = '';
        
        // 按日期排序目标
        const sortedGoals = [...this.goals].sort((a, b) => 
            new Date(a.startDate) - new Date(b.startDate)
        );

        sortedGoals.forEach(goal => {
            const goalElement = this.createGoalElement(goal);
            this.goalsTimeline.appendChild(goalElement);
        });
    }

    createGoalElement(goal) {
        const element = document.createElement('div');
        element.className = `goal-timeline-item ${goal.completed ? 'completed' : ''}`;
        
        const startDate = new Date(goal.startDate);
        const endDate = new Date(goal.endDate);
        const progress = this.calculateProgress(goal);

        element.innerHTML = `
            <div class="goal-timeline-date">
                ${startDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                - 
                ${endDate.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
            <div class="goal-timeline-content">
                <h3>${goal.title}</h3>
                <p>${goal.description}</p>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progress}%"></div>
                    </div>
                    <span class="progress-text">${progress}%</span>
                </div>
                <div class="goal-milestones">
                    ${goal.milestones.map(milestone => `
                        <div class="milestone ${milestone.completed ? 'completed' : ''}">
                            <input type="checkbox" ${milestone.completed ? 'checked' : ''}>
                            <span>${milestone.description}</span>
                            <span class="milestone-date">
                                ${new Date(milestone.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    `).join('')}
                </div>
                <div class="goal-actions">
                    <button class="edit-goal-btn">编辑</button>
                    <button class="delete-goal-btn">删除</button>
                </div>
            </div>
        `;

        // 绑定里程碑完成事件
        element.querySelectorAll('.milestone input[type="checkbox"]').forEach((checkbox, index) => {
            checkbox.addEventListener('change', () => {
                goal.milestones[index].completed = checkbox.checked;
                this.updateGoal(goal);
            });
        });

        // 绑定编辑和删除按钮事件
        element.querySelector('.edit-goal-btn').addEventListener('click', () => {
            this.showEditGoalModal(goal);
        });

        element.querySelector('.delete-goal-btn').addEventListener('click', () => {
            this.deleteGoal(goal.id);
        });

        return element;
    }

    calculateProgress(goal) {
        if (goal.milestones.length === 0) return 0;
        const completedMilestones = goal.milestones.filter(m => m.completed).length;
        return Math.round((completedMilestones / goal.milestones.length) * 100);
    }

    async updateGoal(goal) {
        try {
            await fetch(`/api/goals/${goal.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(goal)
            });
            
            const index = this.goals.findIndex(g => g.id === goal.id);
            if (index !== -1) {
                this.goals[index] = goal;
            }
            this.saveGoals();
            this.renderGoals();
        } catch (error) {
            console.error('Failed to update goal:', error);
            // 离线模式下仍然更新本地数据
            const index = this.goals.findIndex(g => g.id === goal.id);
            if (index !== -1) {
                this.goals[index] = goal;
            }
            this.saveGoals();
            this.renderGoals();
        }
    }

    async deleteGoal(goalId) {
        if (!confirm('确定要删除这个目标吗？')) return;

        try {
            await fetch(`/api/goals/${goalId}`, {
                method: 'DELETE'
            });
            
            this.goals = this.goals.filter(goal => goal.id !== goalId);
            this.saveGoals();
            this.renderGoals();
        } catch (error) {
            console.error('Failed to delete goal:', error);
            // 离线模式下仍然删除本地数据
            this.goals = this.goals.filter(goal => goal.id !== goalId);
            this.saveGoals();
            this.renderGoals();
        }
    }

    saveGoals() {
        localStorage.setItem('motoGoals', JSON.stringify(this.goals));
    }

    loadGoals() {
        const savedGoals = localStorage.getItem('motoGoals');
        if (savedGoals) {
            this.goals = JSON.parse(savedGoals);
            this.renderGoals();
        }
        this.fetchGoalsFromServer();
    }

    async fetchGoalsFromServer() {
        try {
            const response = await fetch('/api/goals');
            const goals = await response.json();
            this.goals = goals;
            this.renderGoals();
        } catch (error) {
            console.error('Failed to fetch goals:', error);
        }
    }
}

// 等待 DOM 加载完成后再初始化
document.addEventListener('DOMContentLoaded', () => {
    window.goalsManager = new GoalsManager();
}); 