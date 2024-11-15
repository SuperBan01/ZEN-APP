class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'Today';
        
        this.initElements();
        this.initEventListeners();
        this.loadTasks();
    }

    initElements() {
        this.tasksList = document.querySelector('.tasks-list');
        this.addTaskBtn = document.querySelector('.add-task-btn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.searchInput = document.querySelector('.search-input');
    }

    initEventListeners() {
        // 添加任务按钮
        this.addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
        
        // 过滤器按钮
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.textContent;
                this.renderTasks();
            });
        });

        // 搜索功能
        this.searchInput.addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });
    }

    showAddTaskModal() {
        const modal = document.createElement('div');
        modal.className = 'task-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>添加任务</h3>
                <input type="text" class="task-title-input" placeholder="任务名称">
                <select class="task-priority-select">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                </select>
                <input type="date" class="task-date-input">
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
        const titleInput = modal.querySelector('.task-title-input');
        const prioritySelect = modal.querySelector('.task-priority-select');
        const dateInput = modal.querySelector('.task-date-input');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        saveBtn.addEventListener('click', () => {
            const task = {
                id: Date.now(),
                title: titleInput.value,
                priority: prioritySelect.value,
                date: dateInput.value || new Date().toISOString().split('T')[0],
                completed: false
            };

            this.addTask(task);
            document.body.removeChild(modal);
        });
    }

    async loadTasks() {
        try {
            let endpoint = '/api/tasks';
            if (this.currentFilter === 'Today') {
                endpoint = '/api/tasks/today';
            } else if (this.currentFilter === 'Upcoming') {
                endpoint = '/api/tasks/upcoming';
            }

            const response = await fetch(endpoint);
            const tasks = await response.json();
            this.tasks = tasks;
            this.renderTasks();
        } catch (error) {
            console.error('Failed to load tasks:', error);
            // 如果API调用失败，尝试从本地存储加载
            const savedTasks = localStorage.getItem('motoTasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
                this.renderTasks();
            }
        }
    }

    async addTask(task) {
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });
            const result = await response.json();
            task.id = result.id;
            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
        } catch (error) {
            console.error('Failed to add task:', error);
            // 如果API调用失败，仍然添加到本地
            this.tasks.push(task);
            this.saveTasks();
            this.renderTasks();
        }
    }

    async updateTaskStatus(taskId, completed) {
        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed })
            });
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    }

    async syncWithServer() {
        try {
            await fetch('/api/tasks/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.tasks)
            });
        } catch (error) {
            console.error('Failed to sync tasks:', error);
        }
    }

    saveTasks() {
        localStorage.setItem('motoTasks', JSON.stringify(this.tasks));
        this.syncWithServer().catch(console.error);
    }

    getFilteredTasks() {
        const today = new Date().toISOString().split('T')[0];
        
        switch (this.currentFilter) {
            case 'Today':
                return this.tasks.filter(task => task.date === today);
            case 'Upcoming':
                return this.tasks.filter(task => task.date > today);
            case 'All':
                return [...this.tasks].sort((a, b) => new Date(a.date) - new Date(b.date));
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        this.tasksList.innerHTML = '';
        const filteredTasks = this.getFilteredTasks();

        if (this.currentFilter === 'All') {
            // 分组显示任务
            const today = new Date().toISOString().split('T')[0];
            
            // 今天的任务
            const todayTasks = filteredTasks.filter(task => task.date === today);
            if (todayTasks.length > 0) {
                this.renderTaskGroup('Today', todayTasks);
            }

            // 即将到来的任务
            const upcomingTasks = filteredTasks.filter(task => task.date > today);
            if (upcomingTasks.length > 0) {
                this.renderTaskGroup('Upcoming', upcomingTasks);
            }

            // 过去的任务
            const pastTasks = filteredTasks.filter(task => task.date < today);
            if (pastTasks.length > 0) {
                this.renderTaskGroup('Past', pastTasks);
            }
        } else {
            // 按当前过滤器显示任务
            filteredTasks.forEach(task => {
                this.tasksList.appendChild(this.createTaskElement(task));
            });
        }

        // 如果没有任务，显示空状态
        if (this.tasksList.children.length === 0) {
            this.showEmptyState();
        }
    }

    renderTaskGroup(title, tasks) {
        const groupElement = document.createElement('div');
        groupElement.className = 'task-group';
        
        const titleElement = document.createElement('h3');
        titleElement.className = 'task-group-title';
        titleElement.textContent = title;
        groupElement.appendChild(titleElement);

        tasks.forEach(task => {
            groupElement.appendChild(this.createTaskElement(task));
        });

        this.tasksList.appendChild(groupElement);
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        
        const dateStr = this.formatDate(task.date);
        
        taskElement.innerHTML = `
            <div class="task-check ${task.completed ? 'completed' : ''}" data-id="${task.id}"></div>
            <div class="task-content">
                <div class="task-header">
                    <h3 class="${task.completed ? 'completed-text' : ''}">${task.title}</h3>
                    <span class="task-date">${dateStr}</span>
                </div>
                <div class="task-footer">
                    <span class="task-priority ${task.priority}">${task.priority}</span>
                    <div class="task-actions">
                        <button class="edit-btn">✎</button>
                        <button class="delete-btn">🗑</button>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件处理
        const checkBox = taskElement.querySelector('.task-check');
        const editBtn = taskElement.querySelector('.edit-btn');
        const deleteBtn = taskElement.querySelector('.delete-btn');

        checkBox.addEventListener('click', () => this.toggleTaskStatus(task));
        editBtn.addEventListener('click', () => this.showEditTaskModal(task));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        return taskElement;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (dateStr === today.toISOString().split('T')[0]) {
            return 'Today';
        } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    showEmptyState() {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <div class="empty-icon">📝</div>
            <h3>No tasks yet</h3>
            <p>Add your first task to get started!</p>
        `;
        this.tasksList.appendChild(emptyState);
    }

    showEditTaskModal(task) {
        const modal = document.createElement('div');
        modal.className = 'task-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Task</h3>
                <input type="text" class="task-title-input" value="${task.title}" placeholder="Task title">
                <select class="task-priority-select">
                    <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
                <input type="date" class="task-date-input" value="${task.date}">
                <div class="modal-buttons">
                    <button class="cancel-btn">Cancel</button>
                    <button class="save-btn">Save</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');
        const titleInput = modal.querySelector('.task-title-input');
        const prioritySelect = modal.querySelector('.task-priority-select');
        const dateInput = modal.querySelector('.task-date-input');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        saveBtn.addEventListener('click', () => {
            const updatedTask = {
                ...task,
                title: titleInput.value,
                priority: prioritySelect.value,
                date: dateInput.value
            };
            this.updateTask(updatedTask);
            document.body.removeChild(modal);
        });
    }

    async updateTask(task) {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task)
            });
            
            if (!response.ok) throw new Error('API call failed');
            
        } catch (error) {
            console.error('Failed to update task:', error);
        }
        
        const taskIndex = this.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = task;
        }
        this.saveTasks();
        this.renderTasks();
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('API call failed');
            
        } catch (error) {
            console.error('Failed to delete task:', error);
            // API调用失败时，继续执行本地删除操作
        }
        
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    async toggleTaskStatus(task) {
        task.completed = !task.completed;
        await this.updateTask(task);
    }

    searchTasks(query) {
        if (!query) {
            this.renderTasks();
            return;
        }

        const filteredTasks = this.tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase())
        );

        this.tasksList.innerHTML = '';
        filteredTasks.forEach(task => {
            this.tasksList.appendChild(this.createTaskElement(task));
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
}); 